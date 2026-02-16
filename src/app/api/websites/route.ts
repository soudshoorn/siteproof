import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateRequest, jsonSuccess, jsonError, withErrorHandling } from "@/lib/api/helpers";
import { enforcePlanLimits } from "@/lib/plan-enforcement";

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

const createWebsiteSchema = z.object({
  url: z
    .string()
    .min(1, "Voer een URL of domeinnaam in.")
    .transform(normalizeUrl)
    .pipe(
      z.string().url("Voer een geldige URL of domeinnaam in (bijv. jouwwebsite.nl)")
    ),
  name: z.string().min(1, "Naam is verplicht.").max(100),
  organizationId: z.string().uuid(),
});

export const GET = withErrorHandling(async () => {
  const [user, errorResponse] = await authenticateRequest();
  if (errorResponse) return errorResponse;

  const orgMembership = user.memberships[0];
  if (!orgMembership) return jsonError("Geen organisatie gevonden.", 404);

  const websites = await prisma.website.findMany({
    where: { organizationId: orgMembership.organizationId, isActive: true },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, score: true, status: true, totalIssues: true, criticalIssues: true, seriousIssues: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonSuccess(websites);
});

export const POST = withErrorHandling(async (request: Request) => {
  const [user, errorResponse] = await authenticateRequest();
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Ongeldige request body.", 400);

  const validation = createWebsiteSchema.safeParse(body);
  if (!validation.success) {
    const firstError = validation.error.issues?.[0]?.message || "Validatiefout.";
    return jsonError(firstError, 400);
  }

  const { url, name, organizationId } = validation.data;

  // Check membership
  const membership = user.memberships.find((m) => m.organizationId === organizationId);
  if (!membership) return jsonError("Geen toegang tot deze organisatie.", 403);

  // Check plan limits
  await enforcePlanLimits(organizationId, "addWebsite");

  // Normalize URL
  const normalizedUrl = new URL(url).origin;

  // Check if already exists
  const existing = await prisma.website.findFirst({
    where: { url: normalizedUrl, organizationId },
  });
  if (existing) {
    return jsonError("Deze website is al toegevoegd aan je organisatie.", 409);
  }

  const website = await prisma.website.create({
    data: { url: normalizedUrl, name, organizationId },
  });

  return jsonSuccess(website, 201);
});
