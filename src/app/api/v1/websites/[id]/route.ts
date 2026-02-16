import { prisma } from "@/lib/db";
import { authenticateApiKey, applyRateLimit, jsonSuccess, jsonError } from "@/lib/api/helpers";

/**
 * GET /api/v1/websites/:id
 *
 * Get website details. Requires Bureau plan API key.
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
      include: {
        scans: {
          select: {
            id: true,
            status: true,
            score: true,
            totalIssues: true,
            criticalIssues: true,
            seriousIssues: true,
            moderateIssues: true,
            minorIssues: true,
            scannedPages: true,
            duration: true,
            createdAt: true,
            completedAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        schedules: {
          select: {
            frequency: true,
            isActive: true,
            lastRunAt: true,
            nextRunAt: true,
          },
        },
      },
    });

    if (!website || website.organizationId !== organization.id) {
      return jsonError("Website niet gevonden.", 404);
    }

    return jsonSuccess({
      id: website.id,
      url: website.url,
      name: website.name,
      isActive: website.isActive,
      createdAt: website.createdAt,
      updatedAt: website.updatedAt,
      schedule: website.schedules[0] ?? null,
      recentScans: website.scans,
    });
  } catch (error) {
    console.error("[API v1] Get website error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
