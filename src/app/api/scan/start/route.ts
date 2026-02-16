import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateRequest, jsonSuccess, jsonError, withErrorHandling } from "@/lib/api/helpers";
import { enforcePlanLimits } from "@/lib/plan-enforcement";
import { addScanJob } from "@/lib/scanner/queue";
import { getMaxPagesPerScan } from "@/lib/mollie/plans";

const startScanSchema = z.object({
  websiteId: z.string().uuid(),
});

export const POST = withErrorHandling(async (request: Request) => {
  const [user, errorResponse] = await authenticateRequest();
  if (errorResponse) return errorResponse;

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

  // Queue the job
  try {
    await addScanJob({
      scanId: scan.id,
      websiteId,
      url: website.url,
      maxPages,
      startedById: user.id,
    });
  } catch {
    // Redis not available
    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: "FAILED",
        errorMessage: "Scanner is momenteel niet beschikbaar. Probeer het later opnieuw.",
      },
    });
    return jsonError("Scanner is momenteel niet beschikbaar.", 503);
  }

  return jsonSuccess({ id: scan.id, status: "QUEUED" }, 201);
});
