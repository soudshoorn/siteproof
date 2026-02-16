import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth, getCurrentOrganization } from "@/lib/supabase/auth";
import { prisma } from "@/lib/db";
import { ScanResultsView } from "@/components/dashboard/scan-results-view";
import { calculateEaaCompliance, getEaaStatus } from "@/lib/eaa/mapping";
import { generateComplianceSummary } from "@/lib/eaa/statement";
import { PLANS } from "@/lib/mollie/plans";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Scan resultaten`,
    description: `Bekijk de scan resultaten voor scan ${id}`,
  };
}

export default async function ScanResultsPage({ params }: PageProps) {
  const { id } = await params;
  await requireAuth();
  const organization = await getCurrentOrganization();

  const scan = await prisma.scan.findUnique({
    where: { id },
    include: {
      website: {
        select: { id: true, name: true, url: true, organizationId: true },
      },
      pages: {
        orderBy: { score: "asc" },
        select: {
          id: true,
          url: true,
          title: true,
          score: true,
          issueCount: true,
          loadTime: true,
        },
      },
      issues: {
        orderBy: [{ severity: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          axeRuleId: true,
          severity: true,
          impact: true,
          wcagCriteria: true,
          wcagLevel: true,
          description: true,
          helpText: true,
          fixSuggestion: true,
          htmlElement: true,
          cssSelector: true,
          pageUrl: true,
          pageResultId: true,
        },
      },
      startedBy: {
        select: { fullName: true, email: true },
      },
    },
  });

  if (!scan || scan.website.organizationId !== organization?.id) {
    notFound();
  }

  // Calculate EAA compliance data
  let eaaData = undefined;
  if (scan.status === "COMPLETED") {
    const failedCriteria = [
      ...new Set(scan.issues.flatMap((i) => i.wcagCriteria)),
    ];
    const compliance = calculateEaaCompliance(failedCriteria);
    const status = getEaaStatus(compliance.percentage);
    const summary = generateComplianceSummary(failedCriteria);
    const plan = PLANS[organization?.planType ?? "FREE"];

    eaaData = {
      percentage: compliance.percentage,
      status: status.status,
      label: status.label,
      passedCount: compliance.passedCriteria.length,
      failedCount: compliance.failedCriteria.length,
      totalRequired: compliance.totalRequired,
      principleScores: summary.principleScores,
      canDownloadStatement: plan.features.eaaStatement,
    };
  }

  return <ScanResultsView scan={scan} eaaData={eaaData} />;
}
