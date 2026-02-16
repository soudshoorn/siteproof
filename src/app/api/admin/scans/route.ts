import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase/auth";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "25", 10);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status && ["QUEUED", "CRAWLING", "SCANNING", "ANALYZING", "COMPLETED", "FAILED"].includes(status)) {
    where.status = status;
  }

  const [scans, total, statusCounts] = await Promise.all([
    prisma.scan.findMany({
      where,
      include: {
        website: {
          select: {
            name: true,
            url: true,
            organization: { select: { name: true } },
          },
        },
        startedBy: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.scan.count({ where }),
    prisma.scan.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const counts = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count])
  );

  return NextResponse.json({ scans, total, page, limit, statusCounts: counts });
}
