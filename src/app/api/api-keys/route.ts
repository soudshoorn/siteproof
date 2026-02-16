import { z } from "zod";
import { authenticateRequest, jsonSuccess, jsonError } from "@/lib/api/helpers";
import { createApiKey, listApiKeys } from "@/lib/api-keys";
import { PLANS } from "@/lib/mollie/plans";

const createKeySchema = z.object({
  name: z
    .string()
    .min(1, "Naam is verplicht.")
    .max(100, "Naam mag maximaal 100 tekens bevatten."),
});

/**
 * GET /api/api-keys
 * List all API keys for the current organization.
 */
export async function GET() {
  try {
    const [user, authError] = await authenticateRequest();
    if (authError) return authError;

    const org = user.memberships[0]?.organization;
    if (!org) return jsonError("Geen organisatie gevonden.", 404);

    const plan = PLANS[org.planType];
    if (!plan.features.apiAccess) {
      return jsonError("API toegang is niet beschikbaar op je huidige plan.", 403);
    }

    const keys = await listApiKeys(org.id);
    return jsonSuccess(keys);
  } catch (error) {
    console.error("[API Keys] List error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}

/**
 * POST /api/api-keys
 * Create a new API key. Returns the full key (only shown once).
 */
export async function POST(request: Request) {
  try {
    const [user, authError] = await authenticateRequest();
    if (authError) return authError;

    const org = user.memberships[0]?.organization;
    if (!org) return jsonError("Geen organisatie gevonden.", 404);

    const plan = PLANS[org.planType];
    if (!plan.features.apiAccess) {
      return jsonError("API toegang is niet beschikbaar op je huidige plan.", 403);
    }

    // Check role (only OWNER/ADMIN can create keys)
    const membership = user.memberships[0];
    if (membership.role === "MEMBER") {
      return jsonError("Alleen eigenaren en beheerders kunnen API keys aanmaken.", 403);
    }

    const body = await request.json().catch(() => null);
    if (!body) return jsonError("Ongeldige request body.", 400);

    const validation = createKeySchema.safeParse(body);
    if (!validation.success) {
      return jsonError(validation.error.issues[0].message, 400);
    }

    const result = await createApiKey(org.id, validation.data.name);

    return jsonSuccess({
      id: result.id,
      name: result.name,
      key: result.fullKey, // Only returned on creation
      keyPrefix: result.keyPrefix,
      createdAt: result.createdAt,
    }, 201);
  } catch (error) {
    console.error("[API Keys] Create error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
