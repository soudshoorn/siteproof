import { prisma } from "@/lib/db";
import { authenticateApiKey, applyRateLimit, jsonSuccess, jsonError } from "@/lib/api/helpers";

/**
 * GET /api/v1/websites/:id/scans
 *
 * Get scan history for a website. Requires Bureau plan API key.
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

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "25", 10)));
    const offset = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      prisma.scan.findMany({
        where: { websiteId: id },
        select: {
          id: true,
          status: true,
          score: true,
          totalPages: true,
          scannedPages: true,
          totalIssues: true,
          criticalIssues: true,
          seriousIssues: true,
          moderateIssues: true,
          minorIssues: true,
          duration: true,
          createdAt: true,
          completedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.scan.count({ where: { websiteId: id } }),
    ]);

    return jsonSuccess({
      scans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API v1] List scans error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
