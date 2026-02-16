import { getMollieClient } from "./client";
import { PLANS, type PlanKey } from "./plans";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { baseEmailLayout, emailButton } from "@/lib/email/templates/base";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

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
    webhookUrl: `${APP_URL}/api/webhooks/mollie`,
    metadata: JSON.stringify({ organizationId, planType, interval }),
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

  // Send confirmation email (non-blocking)
  sendSubscriptionEmail(organizationId, plan.name, priceFormatted, interval, periodEnd).catch(
    (err) => console.error("[Webhook] Failed to send subscription confirmation:", err)
  );

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
 * The cron job checks for expired periods and downgrades after 7 days.
 */
export async function handleFailedPayment(metadata: {
  organizationId: string;
}) {
  const org = await prisma.organization.findUnique({
    where: { id: metadata.organizationId },
    include: {
      members: {
        where: { role: "OWNER" },
        include: { user: { select: { email: true, fullName: true } } },
      },
    },
  });

  if (!org) return;

  const owner = org.members[0]?.user;
  if (!owner) return;

  const periodEnd = org.mollieCurrentPeriodEnd
    ? org.mollieCurrentPeriodEnd.toLocaleDateString("nl-NL")
    : "binnenkort";

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Betaling mislukt</h2>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
      De automatische betaling voor je <strong style="color:#0f172a;">${org.planType}</strong> abonnement is mislukt.
      Je plan blijft actief tot <strong style="color:#0f172a;">${periodEnd}</strong>.
    </p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">
      Controleer of je betaalmethode nog geldig is en probeer het opnieuw via je facturatie-instellingen.
      Als de betaling niet lukt, wordt je account na de huidige periode overgezet naar het gratis plan.
    </p>
    ${emailButton("Betaalmethode bijwerken", `${APP_URL}/dashboard/settings/billing`)}
  `;

  await sendEmail({
    to: owner.email,
    subject: "Betaling mislukt — actie vereist",
    html: baseEmailLayout({
      title: "Betaling mislukt",
      preheader: "Je automatische betaling is mislukt. Werk je betaalmethode bij.",
      content,
    }),
  }).catch((err) =>
    console.error("[Webhook] Failed to send payment failed email:", err)
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

// -------------------------------------------------------------------
// Email helpers
// -------------------------------------------------------------------

async function sendSubscriptionEmail(
  organizationId: string,
  planName: string,
  price: string,
  interval: "monthly" | "yearly",
  periodEnd: Date
) {
  const members = await prisma.organizationMember.findMany({
    where: { organizationId },
    include: { user: { select: { email: true, fullName: true } } },
  });

  const intervalLabel = interval === "yearly" ? "jaarlijks" : "maandelijks";
  const nextDate = periodEnd.toLocaleDateString("nl-NL");

  for (const member of members) {
    const content = `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Abonnement bevestigd</h2>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
        Bedankt${member.user.fullName ? `, ${member.user.fullName}` : ""}! Je bent geüpgraded naar het <strong style="color:#0d9488;">${planName}</strong> plan.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
        <tr><td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Plan</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">${planName}</p>
        </td></tr>
        <tr><td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Prijs</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">€${price} (${intervalLabel})</p>
        </td></tr>
        <tr><td style="padding:16px 24px;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Volgende factuurdatum</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">${nextDate}</p>
        </td></tr>
      </table>
      ${emailButton("Ga naar je dashboard", `${APP_URL}/dashboard`)}
    `;

    await sendEmail({
      to: member.user.email,
      subject: `Abonnement bevestigd: SiteProof ${planName}`,
      html: baseEmailLayout({
        title: `Abonnement bevestigd — ${planName}`,
        preheader: `Je SiteProof ${planName} abonnement is actief.`,
        content,
      }),
    });
  }
}
