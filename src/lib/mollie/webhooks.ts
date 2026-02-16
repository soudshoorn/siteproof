import { getMollieClient } from "./client";
import { PLANS, type PlanKey } from "./plans";
import { prisma } from "@/lib/db";

/**
 * After a successful "first" payment, create a Mollie subscription
 * for recurring billing.
 */
export async function createSubscription(payment: {
  customerId: string;
  metadata: { organizationId: string; planType: PlanKey; interval: "monthly" | "yearly" };
}) {
  const mollieClient = getMollieClient();
  const { organizationId, planType, interval } = payment.metadata;
  const plan = PLANS[planType];

  if (!("monthlyPrice" in plan)) {
    throw new Error(`Plan ${planType} heeft geen prijs — kan geen subscription aanmaken.`);
  }

  const price = interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const mollieInterval = interval === "yearly" ? "12 months" : "1 months";
  const priceFormatted = (price / 100).toFixed(2);

  const subscription = await mollieClient.customerSubscriptions.create({
    customerId: payment.customerId,
    amount: { currency: "EUR", value: priceFormatted },
    interval: mollieInterval,
    description: `SiteProof ${plan.name} abonnement (${interval === "yearly" ? "jaarlijks" : "maandelijks"})`,
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mollie`,
    metadata: JSON.stringify({ organizationId, planType }),
  });

  // Calculate period end
  const periodEnd = new Date();
  if (interval === "yearly") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      planType,
      mollieCustomerId: payment.customerId,
      mollieSubscriptionId: subscription.id,
      mollieCurrentPeriodEnd: periodEnd,
      maxWebsites: plan.maxWebsites,
      maxPagesPerScan: plan.maxPagesPerScan,
    },
  });

  return subscription;
}

/**
 * Extend the subscription period after a successful recurring payment.
 */
export async function extendSubscriptionPeriod(metadata: {
  organizationId: string;
  interval: "monthly" | "yearly";
}) {
  const { organizationId, interval } = metadata;

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { mollieCurrentPeriodEnd: true },
  });

  const currentEnd = org?.mollieCurrentPeriodEnd ?? new Date();
  const newEnd = new Date(currentEnd);

  if (interval === "yearly") {
    newEnd.setFullYear(newEnd.getFullYear() + 1);
  } else {
    newEnd.setMonth(newEnd.getMonth() + 1);
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: { mollieCurrentPeriodEnd: newEnd },
  });
}

/**
 * Handle a failed payment. Don't downgrade immediately — give a grace period.
 */
export async function handleFailedPayment(metadata: {
  organizationId: string;
}) {
  // TODO: Send reminder email via Resend
  // Grace period: 7 days after mollieCurrentPeriodEnd before downgrade
  // This is handled by the cron job that checks expired subscriptions
  console.error(
    `Payment failed for organization ${metadata.organizationId}. Grace period started.`
  );
}

/**
 * Handle subscription cancellation. Schedule downgrade to FREE at period end.
 */
export async function handleCancellation(metadata: {
  organizationId: string;
}) {
  // Mark the subscription as cancelled but don't downgrade yet.
  // The plan stays active until mollieCurrentPeriodEnd.
  // The cron job handles the actual downgrade.
  await prisma.organization.update({
    where: { id: metadata.organizationId },
    data: {
      mollieSubscriptionId: null,
    },
  });
}

/**
 * Downgrade an organization to the FREE plan.
 * Called by cron when the paid period has ended.
 */
export async function downgradeToFree(organizationId: string) {
  const freePlan = PLANS.FREE;

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      planType: "FREE",
      mollieSubscriptionId: null,
      molliePlanId: null,
      mollieCurrentPeriodEnd: null,
      maxWebsites: freePlan.maxWebsites,
      maxPagesPerScan: freePlan.maxPagesPerScan,
    },
  });
}

/**
 * Format cents to Mollie-compatible price string (e.g., 4900 → "49.00")
 */
export function formatMollieAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}
