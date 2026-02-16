import { getMollieClient, isMollieConfigured } from "@/lib/mollie/client";
import {
  createSubscription,
  extendSubscriptionPeriod,
  handleFailedPayment,
  handleCancellation,
} from "@/lib/mollie/webhooks";
import type { PlanKey } from "@/lib/mollie/plans";

/**
 * POST /api/webhooks/mollie
 *
 * Mollie webhook handler. Mollie sends a POST with just the payment ID.
 * We must always fetch the full payment from the API to verify status.
 *
 * IMPORTANT: Never trust the webhook body alone.
 */
export async function POST(request: Request) {
  try {
    if (!isMollieConfigured()) {
      return new Response("Mollie niet geconfigureerd", { status: 503 });
    }

    const body = await request.formData();
    const paymentId = body.get("id") as string;

    if (!paymentId) {
      return new Response("Geen payment ID ontvangen", { status: 400 });
    }

    const mollieClient = getMollieClient();

    // Always fetch the payment to verify — never trust the webhook body
    const payment = await mollieClient.payments.get(paymentId);

    // Parse metadata (stored as JSON string)
    let metadata: {
      organizationId: string;
      planType: PlanKey;
      interval: "monthly" | "yearly";
    };

    try {
      metadata =
        typeof payment.metadata === "string"
          ? JSON.parse(payment.metadata)
          : payment.metadata;
    } catch {
      console.error("Invalid payment metadata:", payment.metadata);
      return new Response("Ongeldige metadata", { status: 400 });
    }

    if (!metadata?.organizationId) {
      // Payment without our metadata — might be a subscription payment
      // Check if it has subscriptionId
      console.warn("Payment without organizationId in metadata:", paymentId);
      return new Response("OK", { status: 200 });
    }

    switch (payment.status) {
      case "paid": {
        if (payment.sequenceType === "first") {
          // First payment successful → create subscription for recurring billing
          await createSubscription({
            customerId: payment.customerId as string,
            metadata,
          });
        } else {
          // Recurring payment successful → extend period
          await extendSubscriptionPeriod({
            organizationId: metadata.organizationId,
            interval: metadata.interval,
          });
        }
        break;
      }

      case "failed":
      case "expired": {
        // Payment failed — start grace period, send reminder
        await handleFailedPayment({
          organizationId: metadata.organizationId,
        });
        break;
      }

      case "canceled": {
        // Subscription cancelled
        await handleCancellation({
          organizationId: metadata.organizationId,
        });
        break;
      }

      default: {
        // open, pending, authorized — no action needed yet
        break;
      }
    }

    // Mollie expects a 200 response
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Mollie webhook error:", error);
    // Return 200 to prevent Mollie from retrying endlessly
    // The error is logged for investigation
    return new Response("Error verwerkt", { status: 200 });
  }
}
