import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ShareableScanResult } from "@/components/scan/shareable-scan-result";
import { getScoreLabel } from "@/lib/utils";
import { calculateEaaCompliance, getEaaStatus } from "@/lib/eaa/mapping";

/**
 * Normalize DB result format to UI format.
 * Maintains the gated structure: topIssues (full) + remainingIssues (limited)
 */
function normalizeResults(raw: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!raw) return null;

  const topIssues = (raw.topIssues as unknown[]) ?? [];
  const remainingIssues = (raw.remainingIssues as unknown[]) ?? [];
  const blurredCount = (raw.blurredCount as number) ?? 0;
  const estimatedPages = (raw.estimatedPages as number | null) ?? null;
  const issueCounts = (raw.issueCounts as Record<string, number>) ?? {};

  // Legacy format compatibility: if no remainingIssues, treat as old format
  if (!("remainingIssues" in raw) && "issues" in raw) {
    return {
      pageTitle: raw.title ?? null,
      issues: raw.issues,
      topIssues: [],
      remainingIssues: [],
      blurredCount: 0,
      estimatedPages: null,
      totalIssues: (raw.totalIssues as number) ?? 0,
      criticalIssues: (raw.criticalIssues as number) ?? 0,
      seriousIssues: (raw.seriousIssues as number) ?? 0,
      moderateIssues: (raw.moderateIssues as number) ?? 0,
      minorIssues: (raw.minorIssues as number) ?? 0,
      uniqueRules: (raw.uniqueRules as number) ?? 0,
      loadTime: raw.loadTime ?? null,
      failedWcagCriteria: raw.failedWcagCriteria ?? [],
    };
  }

  return {
    pageTitle: raw.title ?? null,
    topIssues,
    remainingIssues,
    blurredCount,
    estimatedPages,
    totalIssues: issueCounts.total ?? 0,
    criticalIssues: issueCounts.critical ?? 0,
    seriousIssues: issueCounts.serious ?? 0,
    moderateIssues: issueCounts.moderate ?? 0,
    minorIssues: issueCounts.minor ?? 0,
    uniqueRules: issueCounts.uniqueRules ?? 0,
    loadTime: raw.loadTime ?? null,
    failedWcagCriteria: raw.failedWcagCriteria ?? [],
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const quickScan = await prisma.quickScan.findUnique({
    where: { id },
  });

  if (!quickScan || quickScan.status !== "COMPLETED") {
    return { title: "Scan niet gevonden" };
  }

  const score = Math.round(quickScan.score ?? 0);
  const label = getScoreLabel(score);
  let hostname = "website";
  try {
    hostname = new URL(quickScan.url).hostname;
  } catch {
    // fallback
  }

  const title = `${hostname} scoort ${score}/100 op toegankelijkheid`;
  const description = `${hostname} heeft een toegankelijkheidsscore van ${score}/100 (${label}). Scan jouw website gratis op WCAG 2.1 AA compliance met SiteProof.`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | SiteProof`,
      description,
      images: [
        {
          url: `${appUrl}/api/og/scan/${id}`,
          width: 1200,
          height: 630,
          alt: `SiteProof score: ${score}/100 voor ${hostname}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | SiteProof`,
      description,
      images: [`${appUrl}/api/og/scan/${id}`],
    },
  };
}

export default async function ShareableScanResultPage({ params }: PageProps) {
  const { id } = await params;

  const quickScan = await prisma.quickScan.findUnique({
    where: { id },
  });

  if (!quickScan) {
    notFound();
  }

  // If still in progress, show a loading state
  const isInProgress =
    quickScan.status !== "COMPLETED" && quickScan.status !== "FAILED";

  // Normalize DB results to UI format
  const rawResults = quickScan.results as Record<string, unknown> | null;
  const normalizedResults = normalizeResults(rawResults);

  // Calculate EAA compliance from quick scan results
  let eaaData = undefined;
  if (quickScan.status === "COMPLETED" && normalizedResults) {
    const issues = (normalizedResults.issues as Array<{ wcagCriteria?: string[] }>) ?? [];
    const failedWcag = (normalizedResults.failedWcagCriteria as string[]) ?? [];
    const failedCriteria = failedWcag.length > 0
      ? failedWcag
      : [...new Set(issues.flatMap((i) => i.wcagCriteria ?? []))];
    const compliance = calculateEaaCompliance(failedCriteria);
    const status = getEaaStatus(compliance.percentage);

    eaaData = {
      percentage: compliance.percentage,
      status: status.status,
      label: status.label,
      passedCount: compliance.passedCriteria.length,
      failedCount: compliance.failedCriteria.length,
      totalRequired: compliance.totalRequired,
    };
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <ShareableScanResult
            id={quickScan.id}
            url={quickScan.url}
            status={quickScan.status}
            score={quickScan.score}
            results={normalizedResults}
            createdAt={quickScan.createdAt}
            isInProgress={isInProgress}
            eaaData={eaaData}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
