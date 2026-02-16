import { getMollieClient, isMollieConfigured } from "@/lib/mollie/client";
import { prisma } from "@/lib/db";
import {
  createSubscription,
  extendSubscriptionPeriod,
  handleFailedPayment,
  handleCancellation,
} from "@/lib/mollie/webhooks";
import type { PlanKey } from "@/lib/mollie/plans";

interface PaymentMetadata {
  organizationId: string;
  planType: PlanKey;
  interval: "monthly" | "yearly";
  isMethodUpdate?: boolean;
}

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

    // Parse metadata (stored as JSON string on the payment)
    let metadata: PaymentMetadata | null = null;

    try {
      const raw =
        typeof payment.metadata === "string"
          ? JSON.parse(payment.metadata)
          : payment.metadata;
      if (raw?.organizationId) {
        metadata = raw as PaymentMetadata;
      }
    } catch {
      // Metadata parsing failed — fall through to subscription lookup
    }

    // If no metadata with organizationId, this might be a recurring
    // subscription payment where Mollie doesn't carry our metadata.
    // Look up the organization via customerId instead.
    if (!metadata?.organizationId && payment.subscriptionId && payment.customerId) {
      try {
        const org = await prisma.organization.findFirst({
          where: { mollieCustomerId: payment.customerId as string },
          select: { id: true, planType: true },
        });

        if (org) {
          // Determine interval from the subscription object
          const subscription = await mollieClient.customerSubscriptions.get(
            payment.subscriptionId,
            { customerId: payment.customerId as string }
          );
          const interval =
            subscription.interval === "12 months" ? "yearly" as const : "monthly" as const;

          metadata = {
            organizationId: org.id,
            planType: org.planType as PlanKey,
            interval,
          };
        }
      } catch (err) {
        console.error("Failed to look up subscription payment:", err);
      }
    }

    if (!metadata?.organizationId) {
      console.warn("Payment without organizationId — cannot process:", paymentId);
      return new Response("OK", { status: 200 });
    }

    switch (payment.status) {
      case "paid": {
        // Payment method updates: just acknowledge, don't create/modify subscription
        if (metadata.isMethodUpdate) {
          break;
        }

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
        if (!metadata.isMethodUpdate) {
          await handleFailedPayment({
            organizationId: metadata.organizationId,
          });
        }
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
