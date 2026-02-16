import { getMollieClient, isMollieConfigured } from "@/lib/mollie/client";
import { authenticateRequest, jsonSuccess, jsonError } from "@/lib/api/helpers";
import { prisma } from "@/lib/db";

/**
 * GET /api/mollie/subscription
 *
 * Get current subscription details and payment history.
 */
export async function GET() {
  try {
    const [user, authError] = await authenticateRequest();
    if (authError) return authError;

    const membership = user.memberships.find((m) => m.role === "OWNER");
    if (!membership) {
      return jsonError("Geen organisatie gevonden.", 404);
    }

    const organization = membership.organization;

    if (!isMollieConfigured() || !organization.mollieCustomerId) {
      return jsonSuccess({
        subscription: null,
        payments: [],
        paymentMethod: null,
      });
    }

    const mollieClient = getMollieClient();

    // Get payment history
    let payments: Array<{
      id: string;
      amount: string;
      status: string;
      description: string;
      createdAt: string;
      method: string | null;
    }> = [];

    try {
      const molliePayments = await mollieClient.customerPayments.page({
        customerId: organization.mollieCustomerId,
        limit: 25,
      });

      payments = Array.from(molliePayments).map((p) => ({
        id: p.id,
        amount: `€${p.amount.value}`,
        status: p.status,
        description: p.description,
        createdAt: p.createdAt,
        method: p.method as string | null,
      }));
    } catch {
      // Customer might not exist yet in Mollie
    }

    // Get active subscription
    let subscription: {
      id: string;
      status: string;
      amount: string;
      interval: string;
      nextPaymentDate: string | null;
    } | null = null;

    if (organization.mollieSubscriptionId) {
      try {
        const sub = await mollieClient.customerSubscriptions.get(
          organization.mollieSubscriptionId,
          { customerId: organization.mollieCustomerId }
        );

        subscription = {
          id: sub.id,
          status: sub.status,
          amount: `€${sub.amount.value}`,
          interval: sub.interval,
          nextPaymentDate: sub.nextPaymentDate ?? null,
        };
      } catch {
        // Subscription might have been cancelled externally
      }
    }

    // Get payment method from last successful payment
    let paymentMethod: string | null = null;
    const paidPayment = payments.find((p) => p.status === "paid");
    if (paidPayment) {
      paymentMethod = paidPayment.method;
    }

    return jsonSuccess({
      subscription,
      payments,
      paymentMethod,
      periodEnd: organization.mollieCurrentPeriodEnd,
    });
  } catch (error) {
    console.error("Subscription info error:", error);
    return jsonError("Kon abonnementsinformatie niet ophalen.", 500);
  }
}

/**
 * DELETE /api/mollie/subscription
 *
 * Cancel the current subscription. Plan stays active until period end.
 */
export async function DELETE() {
  try {
    if (!isMollieConfigured()) {
      return jsonError("Betalingen zijn niet geconfigureerd.", 503);
    }

    const [user, authError] = await authenticateRequest();
    if (authError) return authError;

    const membership = user.memberships.find((m) => m.role === "OWNER");
    if (!membership) {
      return jsonError("Je moet eigenaar zijn om het abonnement op te zeggen.", 403);
    }

    const organization = membership.organization;

    if (!organization.mollieCustomerId || !organization.mollieSubscriptionId) {
      return jsonError("Geen actief abonnement gevonden.", 404);
    }

    const mollieClient = getMollieClient();

    // Cancel subscription in Mollie
    await mollieClient.customerSubscriptions.cancel(
      organization.mollieSubscriptionId,
      { customerId: organization.mollieCustomerId }
    );

    // Remove subscription ID but keep period end — plan stays active until then
    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        mollieSubscriptionId: null,
      },
    });

    return jsonSuccess({
      message: "Abonnement opgezegd. Je plan blijft actief tot het einde van de huidige periode.",
      periodEnd: organization.mollieCurrentPeriodEnd,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return jsonError("Kon het abonnement niet opzeggen.", 500);
  }
}
