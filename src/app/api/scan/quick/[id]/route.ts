import { prisma } from "@/lib/db";
import { jsonSuccess, jsonError } from "@/lib/api/helpers";

/**
 * Normalize DB result format to UI format.
 * DB stores: { topIssues, issueCounts, title, loadTime, failedWcagCriteria }
 * UI expects: { issues, totalIssues, criticalIssues, ..., pageTitle }
 */
function normalizeResults(raw: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!raw) return null;

  // Already in UI format (direct API response, not from DB)
  if ("issues" in raw) return raw;

  const topIssues = (raw.topIssues as unknown[]) ?? [];
  const issueCounts = (raw.issueCounts as Record<string, number>) ?? {};

  return {
    pageTitle: raw.title ?? null,
    issues: topIssues,
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

/**
 * GET /api/scan/quick/[id]
 *
 * Poll for quick scan results. No auth required.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const quickScan = await prisma.quickScan.findUnique({
      where: { id },
    });

    if (!quickScan) {
      return jsonError("Scan niet gevonden.", 404);
    }

    const isInProgress =
      quickScan.status === "QUEUED" ||
      quickScan.status === "CRAWLING" ||
      quickScan.status === "SCANNING" ||
      quickScan.status === "ANALYZING";

    if (isInProgress) {
      return jsonSuccess({
        id: quickScan.id,
        url: quickScan.url,
        status: quickScan.status,
        score: null,
        results: null,
      });
    }

    return jsonSuccess({
      id: quickScan.id,
      url: quickScan.url,
      status: quickScan.status,
      score: quickScan.status === "COMPLETED" ? quickScan.score : null,
      results: normalizeResults(quickScan.results as Record<string, unknown> | null),
      createdAt: quickScan.createdAt,
    });
  } catch (error) {
    console.error("Quick scan poll error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
