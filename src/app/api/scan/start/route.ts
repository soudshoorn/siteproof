import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateRequest, jsonSuccess, jsonError, withErrorHandling } from "@/lib/api/helpers";
import { enforcePlanLimits } from "@/lib/plan-enforcement";
import { getMaxPagesPerScan } from "@/lib/mollie/plans";

const SCANNER_SERVICE_URL = process.env.SCANNER_SERVICE_URL;
const SCANNER_SECRET = process.env.SCANNER_SECRET || "";

const startScanSchema = z.object({
  websiteId: z.string().uuid(),
});

export const POST = withErrorHandling(async (request: Request) => {
  const [user, errorResponse] = await authenticateRequest();
  if (errorResponse) return errorResponse;

  if (!SCANNER_SERVICE_URL) {
    return jsonError("Scanner service is niet geconfigureerd. Stel SCANNER_SERVICE_URL in.", 503);
  }

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Ongeldige request body.", 400);

  const validation = startScanSchema.safeParse(body);
  if (!validation.success) return jsonError("Validatiefout.", 400);

  const { websiteId } = validation.data;

  // Get website and check access
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: { organization: true },
  });

  if (!website) return jsonError("Website niet gevonden.", 404);

  const membership = user.memberships.find(
    (m) => m.organizationId === website.organizationId
  );
  if (!membership) return jsonError("Geen toegang.", 403);

  // Check plan limits for concurrent scans
  await enforcePlanLimits(website.organizationId, "startScan");

  const maxPages = getMaxPagesPerScan(website.organization.planType);

  // Create scan record
  const scan = await prisma.scan.create({
    data: {
      websiteId,
      startedById: user.id,
      status: "QUEUED",
    },
  });

  // Fire-and-forget: tell the scanner service to run the scan async
  // The scanner service updates the DB directly with progress and results
  try {
    const scanResponse = await fetch(`${SCANNER_SERVICE_URL}/scan/async`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SCANNER_SECRET ? { Authorization: `Bearer ${SCANNER_SECRET}` } : {}),
      },
      body: JSON.stringify({
        scanId: scan.id,
        url: website.url,
        maxPages,
      }),
      signal: AbortSignal.timeout(10_000), // Just needs to accept the job
    });

    if (!scanResponse.ok) {
      const data = await scanResponse.json().catch(() => ({}));
      throw new Error(data.error || "Scanner service niet bereikbaar");
    }

    return jsonSuccess({
      id: scan.id,
      status: "QUEUED",
    }, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: "FAILED",
        errorMessage,
        completedAt: new Date(),
      },
    });

    return jsonError(`Scan kon niet gestart worden: ${errorMessage}`, 422);
  }
});
