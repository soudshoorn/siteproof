import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase/auth";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [
    quickScansByDay,
    signupsByDay,
    paidConversions,
    cancelledOrgs,
    topPosts,
    mrrHistory,
    eventFunnel,
  ] = await Promise.all([
    // Quick scans per day (scans without a startedById = anonymous quick scans)
    prisma.scan.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: startDate },
        startedById: null,
      },
      _count: true,
    }).then((results) => aggregateByDay(results, days)),

    // Signups per day
    prisma.user.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: startDate } },
      _count: true,
    }).then((results) => aggregateByDay(results, days)),

    // Conversion: orgs that upgraded from FREE
    prisma.organization.count({
      where: {
        planType: { not: "FREE" },
        createdAt: { gte: startDate },
      },
    }),

    // Churn: orgs with expired subscriptions
    prisma.organization.count({
      where: {
        mollieCurrentPeriodEnd: { lt: new Date() },
        planType: { not: "FREE" },
      },
    }),

    // Top blog posts by views
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { viewCount: "desc" },
      take: 10,
      select: { id: true, title: true, slug: true, viewCount: true, publishedAt: true },
    }),

    // MRR by counting paid orgs
    prisma.organization.findMany({
      where: { planType: { not: "FREE" } },
      select: { planType: true, createdAt: true },
    }),

    // Event-based conversion funnel
    Promise.all([
      prisma.analyticsEvent.count({ where: { event: "quick_scan_started", createdAt: { gte: startDate } } }),
      prisma.analyticsEvent.count({ where: { event: "quick_scan_completed", createdAt: { gte: startDate } } }),
      prisma.analyticsEvent.count({ where: { event: "signup_from_scan", createdAt: { gte: startDate } } }),
      prisma.analyticsEvent.count({ where: { event: "upgrade_clicked", createdAt: { gte: startDate } } }),
      prisma.analyticsEvent.count({ where: { event: "checkout_started", createdAt: { gte: startDate } } }),
      prisma.analyticsEvent.count({ where: { event: "checkout_completed", createdAt: { gte: startDate } } }),
      prisma.analyticsEvent.count({ where: { event: "scan_limit_hit", createdAt: { gte: startDate } } }),
    ]).then(([scansStarted, scansCompleted, signupsFromScan, upgradeClicked, checkoutStarted, checkoutCompleted, scanLimitHit]) => ({
      scansStarted,
      scansCompleted,
      signupsFromScan,
      upgradeClicked,
      checkoutStarted,
      checkoutCompleted,
      scanLimitHit,
    })),
  ]);

  // Calculate total active users
  const totalUsers = await prisma.user.count();
  const totalPaidOrgs = await prisma.organization.count({
    where: { planType: { not: "FREE" } },
  });

  // Funnel
  const totalQuickScans = await prisma.scan.count({
    where: { startedById: null },
  });

  const funnel = {
    quickScans: totalQuickScans,
    registrations: totalUsers,
    paidConversions,
    conversionRate: totalUsers > 0 ? ((paidConversions / totalUsers) * 100).toFixed(1) : "0",
  };

  return NextResponse.json({
    quickScansByDay,
    signupsByDay,
    funnel,
    eventFunnel,
    cancelledOrgs,
    topPosts,
    totalUsers,
    totalPaidOrgs,
  });
}

function aggregateByDay(
  results: Array<{ createdAt: Date; _count: number }>,
  days: number
): Array<{ date: string; count: number }> {
  const map = new Map<string, number>();

  // Initialize all days with 0
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    map.set(key, 0);
  }

  // Fill in actual counts
  for (const r of results) {
    const key = new Date(r.createdAt).toISOString().split("T")[0];
    map.set(key, (map.get(key) ?? 0) + r._count);
  }

  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}
