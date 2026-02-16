import { prisma } from "@/lib/db";
import { authenticateApiKey, applyRateLimit, jsonSuccess, jsonError } from "@/lib/api/helpers";

/**
 * GET /api/v1/websites
 *
 * List all websites for the authenticated organization. Requires Bureau plan API key.
 */
export async function GET(request: Request) {
  try {
    const [organization, authError] = await authenticateApiKey(request);
    if (authError) return authError;

    const rateLimitResponse = await applyRateLimit("publicApi", organization.id);
    if (rateLimitResponse) return rateLimitResponse;

    const websites = await prisma.website.findMany({
      where: { organizationId: organization.id },
      select: {
        id: true,
        url: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        scans: {
          select: {
            id: true,
            score: true,
            status: true,
            totalIssues: true,
            createdAt: true,
            completedAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = websites.map((w) => ({
      id: w.id,
      url: w.url,
      name: w.name,
      isActive: w.isActive,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      lastScan: w.scans[0] ?? null,
    }));

    return jsonSuccess(data);
  } catch (error) {
    console.error("[API v1] List websites error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
