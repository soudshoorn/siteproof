import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { nl } from "@/lib/i18n/nl";
import { formatCurrency, formatRelativeTime, formatDate } from "@/lib/utils";
import {
  DollarSign,
  Users,
  Activity,
  UserPlus,
  ArrowRight,
  FileText,
  Globe,
  TrendingUp,
} from "lucide-react";

async function getAdminStats() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    totalOrgs,
    paidOrgs,
    scansToday,
    newSignupsWeek,
    recentScans,
    recentSignups,
    recentPosts,
    planCounts,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.findMany({
      where: { planType: { not: "FREE" } },
      select: { planType: true },
    }),
    prisma.scan.count({
      where: { createdAt: { gte: startOfDay } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: startOfWeek } },
    }),
    prisma.scan.findMany({
      include: {
        website: { select: { name: true, url: true, organization: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, fullName: true, email: true, createdAt: true },
    }),
    prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, publishedAt: true, viewCount: true },
    }),
    prisma.organization.groupBy({
      by: ["planType"],
      _count: true,
    }),
  ]);

  // Calculate MRR from paid orgs
  const planPrices: Record<string, number> = {
    STARTER: 4900,
    PROFESSIONAL: 14900,
    BUREAU: 29900,
  };

  const mrr = paidOrgs.reduce((sum, org) => sum + (planPrices[org.planType] ?? 0), 0);

  return {
    mrr,
    totalOrgs,
    scansToday,
    newSignupsWeek,
    recentScans,
    recentSignups,
    recentPosts,
    planCounts,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const planCountsMap = Object.fromEntries(
    stats.planCounts.map((p) => [p.planType, p._count])
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{nl.admin.dashboard}</h1>
          <p className="text-sm text-muted-foreground">
            Overzicht van het platform.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/admin/blog/new">
              <FileText className="size-4" />
              {nl.admin.newPost}
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
              <DollarSign className="size-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.mrr)}</p>
              <p className="text-xs text-muted-foreground">{nl.admin.mrr}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalOrgs}</p>
              <p className="text-xs text-muted-foreground">{nl.admin.totalCustomers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Activity className="size-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.scansToday}</p>
              <p className="text-xs text-muted-foreground">{nl.admin.activeScansToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
              <UserPlus className="size-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.newSignupsWeek}</p>
              <p className="text-xs text-muted-foreground">{nl.admin.newSignupsWeek}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan verdeling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {(["FREE", "STARTER", "PROFESSIONAL", "BUREAU"] as const).map((plan) => (
              <div key={plan} className="flex items-center gap-2 rounded-lg border border-border/40 px-3 py-2">
                <span className="text-sm font-medium">{plan}</span>
                <Badge variant="secondary">{planCountsMap[plan] ?? 0}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent scans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recente scans</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/scans">
                Bekijk alles <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border/40">
            {stats.recentScans.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Geen scans.</p>
            ) : (
              stats.recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{scan.website.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {scan.website.organization?.name} &middot; {formatRelativeTime(scan.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {scan.status === "COMPLETED" && scan.score != null ? (
                      <Badge variant={scan.score >= 80 ? "default" : scan.score >= 50 ? "secondary" : "destructive"}>
                        {Math.round(scan.score)}
                      </Badge>
                    ) : (
                      <Badge variant={scan.status === "FAILED" ? "destructive" : "secondary"} className="text-xs">
                        {scan.status === "FAILED" ? "Mislukt" : scan.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent signups + posts */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Nieuwe signups</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/customers">
                  Bekijk alles <ArrowRight className="size-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-border/40">
              {stats.recentSignups.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Geen nieuwe signups.</p>
              ) : (
                stats.recentSignups.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{user.fullName || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(user.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Blog posts</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/blog">
                  Bekijk alles <ArrowRight className="size-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-border/40">
              {stats.recentPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Geen posts.</p>
              ) : (
                stats.recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{post.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {post.viewCount} views
                      </p>
                    </div>
                    <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"} className="text-xs">
                      {post.status === "PUBLISHED" ? nl.admin.published : post.status === "SCHEDULED" ? nl.admin.scheduled : nl.admin.draft}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
