import { z } from "zod";
import { SequenceType } from "@mollie/api-client";
import { getMollieClient, isMollieConfigured } from "@/lib/mollie/client";
import { PLANS, type PlanKey } from "@/lib/mollie/plans";
import { formatMollieAmount } from "@/lib/mollie/webhooks";
import { authenticateRequest, jsonSuccess, jsonError } from "@/lib/api/helpers";
import { prisma } from "@/lib/db";
import { trackEvent } from "@/lib/analytics";

const checkoutSchema = z.object({
  planType: z.enum(["STARTER", "PROFESSIONAL", "BUREAU"]),
  interval: z.enum(["monthly", "yearly"]),
});

/**
 * POST /api/mollie/checkout
 *
 * Start a checkout flow to upgrade to a paid plan.
 * Creates a Mollie customer (or reuses existing) and initiates a first payment.
 *
 * Request body: { planType: "STARTER" | "PROFESSIONAL" | "BUREAU", interval: "monthly" | "yearly" }
 * Response: { success: true, data: { checkoutUrl: string } }
 */
export async function POST(request: Request) {
  try {
    if (!isMollieConfigured()) {
      return jsonError(
        "Betalingen zijn momenteel niet beschikbaar. Neem contact op met support.",
        503
      );
    }

    const [user, authError] = await authenticateRequest();
    if (authError) return authError;

    // Get user's organization
    const membership = user.memberships.find((m) => m.role === "OWNER");
    if (!membership) {
      return jsonError("Je moet eigenaar zijn van een organisatie om het plan te wijzigen.", 403);
    }
    const organization = membership.organization;

    // Parse body
    const body = await request.json().catch(() => null);
    if (!body) return jsonError("Ongeldige request body.", 400);

    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return jsonError("Ongeldig plan of interval.", 400);
    }

    const { planType, interval } = validation.data;
    const plan = PLANS[planType as PlanKey];

    if (!("monthlyPrice" in plan)) {
      return jsonError("Ongeldig plan.", 400);
    }

    const price = interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    const mollieClient = getMollieClient();

    // Create or reuse Mollie customer
    let customerId = organization.mollieCustomerId;

    if (!customerId) {
      const customer = await mollieClient.customers.create({
        name: organization.name,
        email: user.email,
        metadata: JSON.stringify({ organizationId: organization.id }),
      });
      customerId = customer.id;

      await prisma.organization.update({
        where: { id: organization.id },
        data: { mollieCustomerId: customerId },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

    // Create first payment (sequenceType: "first" creates a mandate for future recurring)
    const payment = await mollieClient.payments.create({
      amount: {
        currency: "EUR",
        value: formatMollieAmount(price),
      },
      customerId,
      description: `SiteProof ${plan.name} — ${interval === "yearly" ? "jaarlijks" : "maandelijks"} abonnement`,
      redirectUrl: `${appUrl}/dashboard/settings/billing?status=success&plan=${planType}`,
      webhookUrl: `${appUrl}/api/webhooks/mollie`,
      sequenceType: SequenceType.first,
      metadata: JSON.stringify({
        organizationId: organization.id,
        planType,
        interval,
      }),
    });

    const checkoutUrl = payment._links?.checkout?.href;

    if (!checkoutUrl) {
      return jsonError("Kon geen checkout URL aanmaken. Probeer het opnieuw.", 500);
    }

    await trackEvent("checkout_started", {
      planType,
      interval,
      organizationId: organization.id,
    }, user.id);

    return jsonSuccess({ checkoutUrl }, 201);
  } catch (error) {
    console.error("Mollie checkout error:", error);
    return jsonError("Er is een fout opgetreden bij het aanmaken van de betaling.", 500);
  }
}
