import { prisma } from "@/lib/db";
import { authenticateApiKey, applyRateLimit, jsonSuccess, jsonError } from "@/lib/api/helpers";

/**
 * GET /api/v1/websites/:id/issues
 *
 * Get current issues for a website (from the latest completed scan).
 * Requires Bureau plan API key.
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

    const website = await prisma.website.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!website || website.organizationId !== organization.id) {
      return jsonError("Website niet gevonden.", 404);
    }

    // Find the latest completed scan
    const latestScan = await prisma.scan.findFirst({
      where: { websiteId: id, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      select: { id: true, score: true, completedAt: true },
    });

    if (!latestScan) {
      return jsonSuccess({
        scanId: null,
        score: null,
        scanDate: null,
        issues: [],
        pagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
      });
    }

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "25", 10)));
    const severity = url.searchParams.get("severity")?.toUpperCase();
    const offset = (page - 1) * limit;

    const where = {
      scanId: latestScan.id,
      ...(severity && ["CRITICAL", "SERIOUS", "MODERATE", "MINOR"].includes(severity)
        ? { severity: severity as "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR" }
        : {}),
    };

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
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
        skip: offset,
        take: limit,
      }),
      prisma.issue.count({ where }),
    ]);

    return jsonSuccess({
      scanId: latestScan.id,
      score: latestScan.score,
      scanDate: latestScan.completedAt,
      issues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API v1] List issues error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
