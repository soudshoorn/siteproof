import { prisma } from "@/lib/db";
import { authenticateApiKey, applyRateLimit, jsonSuccess, jsonError } from "@/lib/api/helpers";

/**
 * GET /api/v1/scan/:id
 *
 * Get scan status and results. Requires Bureau plan API key.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [organization, authError] = await authenticateApiKey(request);
    if (authError) return authError;

    const rateLimitResponse = await applyRateLimit("publicApi", organization.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const scan = await prisma.scan.findUnique({
      where: { id },
      include: {
        website: {
          select: { id: true, name: true, url: true, organizationId: true },
        },
        pages: {
          select: {
            id: true,
            url: true,
            title: true,
            score: true,
            issueCount: true,
            loadTime: true,
          },
          orderBy: { score: "asc" },
        },
        issues: {
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
          },
          orderBy: [{ severity: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!scan || scan.website.organizationId !== organization.id) {
      return jsonError("Scan niet gevonden.", 404);
    }

    return jsonSuccess({
      id: scan.id,
      websiteId: scan.websiteId,
      status: scan.status,
      score: scan.score,
      totalPages: scan.totalPages,
      scannedPages: scan.scannedPages,
      totalIssues: scan.totalIssues,
      criticalIssues: scan.criticalIssues,
      seriousIssues: scan.seriousIssues,
      moderateIssues: scan.moderateIssues,
      minorIssues: scan.minorIssues,
      duration: scan.duration,
      errorMessage: scan.errorMessage,
      createdAt: scan.createdAt,
      completedAt: scan.completedAt,
      website: {
        id: scan.website.id,
        name: scan.website.name,
        url: scan.website.url,
      },
      pages: scan.pages,
      issues: scan.issues,
    });
  } catch (error) {
    console.error("[API v1] Get scan error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
