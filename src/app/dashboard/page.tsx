import Link from "next/link";
import { requireAuth, getCurrentOrganization } from "@/lib/supabase/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCircle } from "@/components/scan/score-circle";
import { nl } from "@/lib/i18n/nl";
import { formatRelativeTime } from "@/lib/utils";
import {
  Globe,
  Plus,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();
  const organization = await getCurrentOrganization();

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold">Welkom bij SiteProof</h1>
        <p className="mt-2 text-muted-foreground">
          Er is geen organisatie gekoppeld aan je account.
        </p>
      </div>
    );
  }

  const websites = await prisma.website.findMany({
    where: { organizationId: organization.id, isActive: true },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          score: true,
          status: true,
          totalIssues: true,
          criticalIssues: true,
          seriousIssues: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const recentScans = await prisma.scan.findMany({
    where: {
      website: { organizationId: organization.id },
    },
    include: {
      website: { select: { name: true, url: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalIssues = websites.reduce(
    (sum, w) => sum + (w.scans[0]?.totalIssues ?? 0),
    0
  );
  const criticalIssues = websites.reduce(
    (sum, w) => sum + (w.scans[0]?.criticalIssues ?? 0),
    0
  );
  const avgScore =
    websites.length > 0
      ? Math.round(
          websites.reduce((sum, w) => sum + (w.scans[0]?.score ?? 0), 0) /
            websites.filter((w) => w.scans[0]?.score != null).length || 0
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {nl.dashboard.welcome}, {user.fullName?.split(" ")[0] || "daar"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Hier is een overzicht van je websites.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/websites?add=true">
            <Plus className="size-4" />
            {nl.dashboard.addWebsite}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Globe className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{websites.length}</p>
              <p className="text-xs text-muted-foreground">{nl.dashboard.websites}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgScore || "—"}</p>
              <p className="text-xs text-muted-foreground">Gem. score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertCircle className="size-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalIssues}</p>
              <p className="text-xs text-muted-foreground">{nl.dashboard.totalIssues}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-severity-critical/10">
              <ShieldCheck className="size-5 text-severity-critical" />
            </div>
            <div>
              <p className="text-2xl font-bold">{criticalIssues}</p>
              <p className="text-xs text-muted-foreground">Kritieke issues</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Websites */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">{nl.dashboard.websites}</h2>
        {websites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <Globe className="size-10 text-muted-foreground/50" />
              <div>
                <p className="font-medium">{nl.dashboard.noWebsites}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Voeg je eerste website toe om te beginnen met scannen.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/websites?add=true">
                  <Plus className="size-4" />
                  {nl.dashboard.addWebsite}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {websites.map((website) => {
              const lastScan = website.scans[0];
              return (
                <Link
                  key={website.id}
                  href={`/dashboard/websites/${website.id}`}
                  className="group"
                >
                  <Card className="transition-colors hover:border-primary/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="truncate text-base">
                            {website.name}
                          </CardTitle>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {website.url}
                          </p>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {lastScan && lastScan.score != null ? (
                        <div className="flex items-center gap-4">
                          <ScoreCircle
                            score={lastScan.score}
                            size="sm"
                            animated={false}
                          />
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1.5">
                              {lastScan.criticalIssues > 0 && (
                                <Badge variant="outline" className="border-severity-critical/30 text-severity-critical text-xs">
                                  {lastScan.criticalIssues} kritiek
                                </Badge>
                              )}
                              {lastScan.seriousIssues > 0 && (
                                <Badge variant="outline" className="border-severity-serious/30 text-severity-serious text-xs">
                                  {lastScan.seriousIssues} serieus
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeTime(lastScan.createdAt)}
                            </p>
                          </div>
                        </div>
                      ) : lastScan ? (
                        <p className="text-sm text-muted-foreground">
                          {lastScan.status === "FAILED"
                            ? "Scan mislukt"
                            : nl.dashboard.scanInProgress}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {nl.dashboard.noScans}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent activity */}
      {recentScans.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">{nl.dashboard.recentActivity}</h2>
          <Card>
            <CardContent className="divide-y divide-border/40 pt-6">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {scan.website.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(scan.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {scan.status === "COMPLETED" && scan.score != null ? (
                      <ScoreCircle score={scan.score} size="sm" animated={false} />
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {scan.status === "FAILED" ? "Mislukt" : "Bezig..."}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/scans/${scan.id}`}>Bekijk</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
