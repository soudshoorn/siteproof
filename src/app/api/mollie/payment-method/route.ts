import { SequenceType } from "@mollie/api-client";
import { getMollieClient, isMollieConfigured } from "@/lib/mollie/client";
import { authenticateRequest, jsonSuccess, jsonError } from "@/lib/api/helpers";

/**
 * POST /api/mollie/payment-method
 *
 * Start a €0.01 payment to create a new mandate (change payment method).
 * Mollie requires at least €0.01 to create a new mandate.
 */
export async function POST() {
  try {
    if (!isMollieConfigured()) {
      return jsonError("Betalingen zijn niet geconfigureerd.", 503);
    }

    const [user, authError] = await authenticateRequest();
    if (authError) return authError;

    const membership = user.memberships.find((m) => m.role === "OWNER");
    if (!membership) {
      return jsonError("Je moet eigenaar zijn om de betaalmethode te wijzigen.", 403);
    }

    const organization = membership.organization;

    if (!organization.mollieCustomerId) {
      return jsonError("Geen klantprofiel gevonden. Start eerst een abonnement.", 404);
    }

    const mollieClient = getMollieClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

    const payment = await mollieClient.payments.create({
      amount: { currency: "EUR", value: "0.01" },
      customerId: organization.mollieCustomerId,
      description: "SiteProof — Betaalmethode bijwerken",
      redirectUrl: `${appUrl}/dashboard/settings/billing?status=method-updated`,
      webhookUrl: `${appUrl}/api/webhooks/mollie`,
      sequenceType: SequenceType.first,
      metadata: JSON.stringify({
        organizationId: organization.id,
        planType: organization.planType,
        interval: "monthly",
        isMethodUpdate: true,
      }),
    });

    const checkoutUrl = payment._links?.checkout?.href;

    if (!checkoutUrl) {
      return jsonError("Kon geen betaallink aanmaken.", 500);
    }

    return jsonSuccess({ checkoutUrl });
  } catch (error) {
    console.error("Payment method update error:", error);
    return jsonError("Kon de betaalmethode niet bijwerken.", 500);
  }
}
