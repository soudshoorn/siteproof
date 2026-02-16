import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth, getCurrentOrganization } from "@/lib/supabase/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { nl } from "@/lib/i18n/nl";
import { PLANS } from "@/lib/mollie/plans";
import { formatDate } from "@/lib/utils";
import { FileText, Download, Lock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Rapporten — SiteProof",
  description: "Download PDF rapporten van je accessibility scans.",
};

export default async function ReportsPage() {
  await requireAuth();
  const organization = await getCurrentOrganization();

  if (!organization) {
    return <p className="text-muted-foreground">Geen organisatie gevonden.</p>;
  }

  const plan = PLANS[organization.planType];
  const canExportPdf = plan.features.pdfExport;

  // Fetch completed scans for this organization's websites
  const scans = await prisma.scan.findMany({
    where: {
      status: "COMPLETED",
      website: { organizationId: organization.id },
    },
    orderBy: { completedAt: "desc" },
    take: 25,
    select: {
      id: true,
      score: true,
      totalIssues: true,
      criticalIssues: true,
      scannedPages: true,
      completedAt: true,
      website: {
        select: { name: true, url: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{nl.dashboard.reports}</h1>
        <p className="text-sm text-muted-foreground">
          Download PDF rapporten van je voltooide scans.
        </p>
      </div>

      {!canExportPdf && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-6">
            <Lock className="size-8 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                PDF rapporten zijn beschikbaar vanaf het Starter plan
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upgrade je plan om professionele PDF rapporten te downloaden met
                scores, issues, fix-suggesties en EAA compliance status.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/pricing">
                {nl.common.upgrade}
                <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {scans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">
              {nl.dashboard.noScans}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start een scan om je eerste rapport te genereren.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/dashboard/websites">{nl.dashboard.startScan}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Voltooide scans ({scans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/40">
              {scans.map((scan) => {
                const scoreColor =
                  scan.score != null && scan.score >= 80
                    ? "text-green-500"
                    : scan.score != null && scan.score >= 50
                      ? "text-yellow-500"
                      : "text-red-500";

                return (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`text-2xl font-bold tabular-nums ${scoreColor}`}
                      >
                        {scan.score != null ? Math.round(scan.score) : "—"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          <Link
                            href={`/dashboard/scans/${scan.id}`}
                            className="hover:underline"
                          >
                            {scan.website.name}
                          </Link>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {scan.completedAt
                            ? formatDate(scan.completedAt)
                            : "—"}{" "}
                          · {scan.scannedPages} pagina's · {scan.totalIssues}{" "}
                          issues
                          {scan.criticalIssues > 0 && (
                            <Badge
                              variant="destructive"
                              className="ml-2 text-[10px] px-1.5 py-0"
                            >
                              {scan.criticalIssues} kritiek
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/scans/${scan.id}`}>
                          Bekijken
                        </Link>
                      </Button>
                      {canExportPdf ? (
                        <Button asChild variant="outline" size="sm">
                          <a href={`/api/scan/${scan.id}/pdf`} download>
                            <Download className="mr-1 size-3" />
                            PDF
                          </a>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="opacity-50"
                        >
                          <Lock className="mr-1 size-3" />
                          PDF
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
