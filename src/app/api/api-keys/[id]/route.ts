import { authenticateRequest, jsonSuccess, jsonError } from "@/lib/api/helpers";
import { revokeApiKey } from "@/lib/api-keys";
import { PLANS } from "@/lib/mollie/plans";

/**
 * DELETE /api/api-keys/:id
 * Revoke an API key.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, authError] = await authenticateRequest();
    if (authError) return authError;

    const org = user.memberships[0]?.organization;
    if (!org) return jsonError("Geen organisatie gevonden.", 404);

    const plan = PLANS[org.planType];
    if (!plan.features.apiAccess) {
      return jsonError("API toegang is niet beschikbaar op je huidige plan.", 403);
    }

    const membership = user.memberships[0];
    if (membership.role === "MEMBER") {
      return jsonError("Alleen eigenaren en beheerders kunnen API keys intrekken.", 403);
    }

    const { id } = await params;

    try {
      await revokeApiKey(id, org.id);
    } catch {
      return jsonError("API key niet gevonden.", 404);
    }

    return jsonSuccess({ revoked: true });
  } catch (error) {
    console.error("[API Keys] Revoke error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
