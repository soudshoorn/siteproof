import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateRequest, jsonSuccess, jsonError } from "@/lib/api/helpers";
import { PLANS } from "@/lib/mollie/plans";

const updateSchema = z.object({
  customLogoUrl: z.string().url().nullable().optional(),
  customPrimaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Ongeldige kleurcode. Gebruik hex formaat (bijv. #0D9488).")
    .nullable()
    .optional(),
  customDomain: z
    .string()
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
      "Ongeldig domein."
    )
    .nullable()
    .optional(),
});

/**
 * GET /api/white-label
 * Get current white-label settings.
 */
export async function GET() {
  try {
    const [user, authError] = await authenticateRequest();
    if (authError) return authError;

    const org = user.memberships[0]?.organization;
    if (!org) return jsonError("Geen organisatie gevonden.", 404);

    const plan = PLANS[org.planType];
    if (!plan.features.whiteLabel) {
      return jsonError("White-label is niet beschikbaar op je huidige plan.", 403);
    }

    return jsonSuccess({
      customLogoUrl: org.customLogoUrl,
      customPrimaryColor: org.customPrimaryColor,
      customDomain: org.customDomain,
    });
  } catch (error) {
    console.error("[White-label] Get error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}

/**
 * PUT /api/white-label
 * Update white-label settings.
 */
export async function PUT(request: Request) {
  try {
    const [user, authError] = await authenticateRequest();
    if (authError) return authError;

    const org = user.memberships[0]?.organization;
    if (!org) return jsonError("Geen organisatie gevonden.", 404);

    const plan = PLANS[org.planType];
    if (!plan.features.whiteLabel) {
      return jsonError("White-label is niet beschikbaar op je huidige plan.", 403);
    }

    const membership = user.memberships[0];
    if (membership.role === "MEMBER") {
      return jsonError("Alleen eigenaren en beheerders kunnen branding aanpassen.", 403);
    }

    const body = await request.json().catch(() => null);
    if (!body) return jsonError("Ongeldige request body.", 400);

    const validation = updateSchema.safeParse(body);
    if (!validation.success) {
      return jsonError(validation.error.issues[0].message, 400);
    }

    const data = validation.data;

    // Check custom domain uniqueness
    if (data.customDomain) {
      const existing = await prisma.organization.findFirst({
        where: {
          customDomain: data.customDomain,
          id: { not: org.id },
        },
      });
      if (existing) {
        return jsonError("Dit domein is al in gebruik door een andere organisatie.", 409);
      }
    }

    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: {
        ...(data.customLogoUrl !== undefined && { customLogoUrl: data.customLogoUrl }),
        ...(data.customPrimaryColor !== undefined && { customPrimaryColor: data.customPrimaryColor }),
        ...(data.customDomain !== undefined && { customDomain: data.customDomain }),
      },
      select: {
        customLogoUrl: true,
        customPrimaryColor: true,
        customDomain: true,
      },
    });

    return jsonSuccess(updated);
  } catch (error) {
    console.error("[White-label] Update error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
