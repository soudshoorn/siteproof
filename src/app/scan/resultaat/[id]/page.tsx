import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ShareableScanResult } from "@/components/scan/shareable-scan-result";
import { getScoreLabel } from "@/lib/utils";
import { calculateEaaCompliance, getEaaStatus } from "@/lib/eaa/mapping";

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

  // Calculate EAA compliance from quick scan results
  let eaaData = undefined;
  if (quickScan.status === "COMPLETED" && quickScan.results) {
    const results = quickScan.results as Record<string, unknown>;
    const issues = (results.issues as Array<{ wcagCriteria?: string[] }>) ?? [];
    const failedCriteria = [
      ...new Set(issues.flatMap((i) => i.wcagCriteria ?? [])),
    ];
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
            results={quickScan.results as Record<string, unknown> | null}
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
