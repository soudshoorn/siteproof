import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateApiKey, applyRateLimit, jsonSuccess, jsonError } from "@/lib/api/helpers";
import { addScanJob } from "@/lib/scanner/queue";

const startScanSchema = z.object({
  websiteId: z.string().uuid("Ongeldig website ID."),
});

/**
 * POST /api/v1/scan
 *
 * Start a new scan for a website. Requires Bureau plan API key.
 */
export async function POST(request: Request) {
  try {
    const [organization, authError] = await authenticateApiKey(request);
    if (authError) return authError;

    const rateLimitResponse = await applyRateLimit("publicApi", organization.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json().catch(() => null);
    if (!body) return jsonError("Ongeldige request body.", 400);

    const validation = startScanSchema.safeParse(body);
    if (!validation.success) {
      return jsonError(validation.error.issues[0].message, 400);
    }

    const website = await prisma.website.findUnique({
      where: { id: validation.data.websiteId },
    });

    if (!website || website.organizationId !== organization.id) {
      return jsonError("Website niet gevonden.", 404);
    }

    const scan = await prisma.scan.create({
      data: {
        websiteId: website.id,
        status: "QUEUED",
      },
    });

    try {
      await addScanJob({
        scanId: scan.id,
        websiteId: website.id,
        url: website.url,
        maxPages: organization.maxPagesPerScan,
      });
    } catch {
      await prisma.scan.update({
        where: { id: scan.id },
        data: { status: "FAILED", errorMessage: "Scanner niet beschikbaar." },
      });
      return jsonError("Scanner is momenteel niet beschikbaar.", 503);
    }

    return jsonSuccess({
      id: scan.id,
      websiteId: scan.websiteId,
      status: scan.status,
      createdAt: scan.createdAt,
    }, 201);
  } catch (error) {
    console.error("[API v1] Start scan error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
