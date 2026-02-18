import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth, getCurrentOrganization } from "@/lib/supabase/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCircle } from "@/components/scan/score-circle";
import { StartScanButton } from "@/components/dashboard/start-scan-button";
import { TrendPlaceholder } from "@/components/dashboard/trend-placeholder";
import { getFeatureGates, type PlanType } from "@/lib/features";
import { nl } from "@/lib/i18n/nl";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  Settings,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

export default async function WebsiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAuth();
  const organization = await getCurrentOrganization();

  const website = await prisma.website.findUnique({
    where: { id },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          score: true,
          status: true,
          totalIssues: true,
          criticalIssues: true,
          seriousIssues: true,
          moderateIssues: true,
          minorIssues: true,
          scannedPages: true,
          totalPages: true,
          duration: true,
          createdAt: true,
          completedAt: true,
          errorMessage: true,
        },
      },
      schedules: true,
    },
  });

  if (!website || website.organizationId !== organization?.id) {
    notFound();
  }

  const lastCompletedScan = website.scans.find(
    (s) => s.status === "COMPLETED" && s.score != null
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/websites"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          {nl.dashboard.websites}
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{website.name}</h1>
            <a
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {website.url}
              <ExternalLink className="size-3" />
            </a>
          </div>
          <div className="flex gap-2">
            <StartScanButton websiteId={website.id} />
            <Button variant="outline" asChild>
              <Link href={`/dashboard/websites/${website.id}/settings`}>
                <Settings className="size-4" />
                {nl.dashboard.settings}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Current score */}
      {lastCompletedScan && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardContent className="flex flex-col items-center gap-2 pt-6">
              <ScoreCircle score={lastCompletedScan.score!} size="lg" />
              <p className="text-sm text-muted-foreground">Huidige score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-5 text-severity-critical" />
                <div>
                  <p className="text-2xl font-bold">{lastCompletedScan.criticalIssues}</p>
                  <p className="text-xs text-muted-foreground">Kritieke issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-5 text-severity-serious" />
                <div>
                  <p className="text-2xl font-bold">{lastCompletedScan.seriousIssues}</p>
                  <p className="text-xs text-muted-foreground">Serieuze issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Info className="size-5 text-severity-moderate" />
                <div>
                  <p className="text-2xl font-bold">
                    {lastCompletedScan.moderateIssues + lastCompletedScan.minorIssues}
                  </p>
                  <p className="text-xs text-muted-foreground">Overige issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend chart — gated for FREE */}
      {lastCompletedScan && (() => {
        const planType = (organization?.planType ?? "FREE") as PlanType;
        const gates = getFeatureGates(planType);

        if (!gates.trendHistory) {
          return <TrendPlaceholder />;
        }

        // TODO: Real trend chart for paid plans
        return null;
      })()}

      {/* Pages scanned nudge for FREE users */}
      {lastCompletedScan && (() => {
        const planType = (organization?.planType ?? "FREE") as PlanType;
        const gates = getFeatureGates(planType);

        if (planType === "FREE" && lastCompletedScan.scannedPages > 0) {
          return (
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              Je hebt <strong>{lastCompletedScan.scannedPages} van {gates.maxPagesPerScan} pagina&apos;s</strong> gescand.
              Je website heeft waarschijnlijk meer pagina&apos;s met problemen.{" "}
              <Link href="/pricing" className="font-medium text-primary hover:underline">
                Upgrade om alles te scannen.
              </Link>
            </div>
          );
        }
        return null;
      })()}

      {/* Scan history */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">{nl.dashboard.scanHistory}</h2>
        {website.scans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{nl.dashboard.noScans}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start je eerste scan om resultaten te zien.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Datum</th>
                      <th className="pb-3 font-medium">Score</th>
                      <th className="pb-3 font-medium">Issues</th>
                      <th className="pb-3 font-medium">Pagina&apos;s</th>
                      <th className="pb-3 font-medium">Duur</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {website.scans.map((scan) => (
                      <tr key={scan.id} className="hover:bg-muted/30">
                        <td className="py-3">
                          <span className="font-medium">
                            {formatDate(scan.createdAt)}
                          </span>
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(scan.createdAt)}
                          </span>
                        </td>
                        <td className="py-3">
                          {scan.score != null ? (
                            <ScoreCircle score={scan.score} size="sm" animated={false} />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3">
                          {scan.status === "COMPLETED" ? (
                            <div className="flex gap-1.5">
                              {scan.criticalIssues > 0 && (
                                <Badge variant="outline" className="border-severity-critical/30 text-severity-critical text-xs">
                                  {scan.criticalIssues}
                                </Badge>
                              )}
                              {scan.seriousIssues > 0 && (
                                <Badge variant="outline" className="border-severity-serious/30 text-severity-serious text-xs">
                                  {scan.seriousIssues}
                                </Badge>
                              )}
                              {scan.moderateIssues > 0 && (
                                <Badge variant="outline" className="border-severity-moderate/30 text-severity-moderate text-xs">
                                  {scan.moderateIssues}
                                </Badge>
                              )}
                              {scan.totalIssues === 0 && (
                                <span className="text-xs text-score-good">Geen issues</span>
                              )}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3">{scan.scannedPages || "—"}</td>
                        <td className="py-3">
                          {scan.duration ? `${scan.duration}s` : "—"}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={
                              scan.status === "COMPLETED"
                                ? "secondary"
                                : scan.status === "FAILED"
                                  ? "destructive"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {scan.status === "COMPLETED"
                              ? "Voltooid"
                              : scan.status === "FAILED"
                                ? "Mislukt"
                                : "Bezig..."}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          {scan.status === "COMPLETED" && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/scans/${scan.id}`}>
                                Bekijk
                              </Link>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
