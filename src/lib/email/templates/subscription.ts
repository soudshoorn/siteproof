import { baseEmailLayout, emailButton } from "./base";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

interface SubscriptionConfirmEmailData {
  userName: string;
  planName: string;
  price: string;
  interval: "maandelijks" | "jaarlijks";
  nextBillingDate: string;
}

export function subscriptionConfirmEmail(
  data: SubscriptionConfirmEmailData
): { subject: string; html: string } {
  const content = `
    <h1 style="color: #f5f5f5; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Abonnement bevestigd</h1>
    <p style="color: #a3a3a3; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
      Bedankt${data.userName ? `, ${data.userName}` : ""}! Je bent geüpgraded naar het <strong style="color: #14B8A6;">${data.planName}</strong> plan.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px 24px; border-bottom: 1px solid #2a2a2a;">
          <p style="color: #a3a3a3; font-size: 12px; margin: 0 0 4px;">Plan</p>
          <p style="color: #f5f5f5; font-size: 16px; font-weight: 600; margin: 0;">${data.planName}</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px 24px; border-bottom: 1px solid #2a2a2a;">
          <p style="color: #a3a3a3; font-size: 12px; margin: 0 0 4px;">Prijs</p>
          <p style="color: #f5f5f5; font-size: 16px; font-weight: 600; margin: 0;">${data.price} (${data.interval})</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px 24px;">
          <p style="color: #a3a3a3; font-size: 12px; margin: 0 0 4px;">Volgende factuurdatum</p>
          <p style="color: #f5f5f5; font-size: 16px; font-weight: 600; margin: 0;">${data.nextBillingDate}</p>
        </td>
      </tr>
    </table>

    ${emailButton("Ga naar je dashboard", `${APP_URL}/dashboard`)}

    <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6;">
      Je kunt je abonnement beheren via <a href="${APP_URL}/dashboard/settings/billing" style="color: #14B8A6; text-decoration: none;">je facturatie-instellingen</a>.
    </p>
  `;

  return {
    subject: `Abonnement bevestigd: SiteProof ${data.planName}`,
    html: baseEmailLayout({
      title: `Abonnement bevestigd — ${data.planName}`,
      preheader: `Je SiteProof ${data.planName} abonnement is actief. Volgende betaling: ${data.nextBillingDate}.`,
      content,
    }),
  };
}

interface SubscriptionCancelledEmailData {
  userName: string;
  planName: string;
  activeUntil: string;
}

export function subscriptionCancelledEmail(
  data: SubscriptionCancelledEmailData
): { subject: string; html: string } {
  const content = `
    <h1 style="color: #f5f5f5; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Abonnement opgezegd</h1>
    <p style="color: #a3a3a3; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
      Je <strong style="color: #f5f5f5;">${data.planName}</strong> abonnement is opgezegd. Je kunt alle features blijven gebruiken tot <strong style="color: #f5f5f5;">${data.activeUntil}</strong>.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px 24px;">
          <p style="color: #a3a3a3; font-size: 14px; margin: 0; line-height: 1.6;">
            Na <strong style="color: #f5f5f5;">${data.activeUntil}</strong> wordt je account automatisch overgezet naar het gratis plan. Je scan-data blijft behouden.
          </p>
        </td>
      </tr>
    </table>

    <p style="color: #a3a3a3; font-size: 14px; margin: 0 0 16px; line-height: 1.6;">
      Bedenk je je? Je kunt je abonnement op elk moment opnieuw activeren.
    </p>

    ${emailButton("Abonnement herstellen", `${APP_URL}/dashboard/settings/billing`)}
  `;

  return {
    subject: `Abonnement opgezegd — actief tot ${data.activeUntil}`,
    html: baseEmailLayout({
      title: "Abonnement opgezegd",
      preheader: `Je ${data.planName} abonnement is opgezegd. Actief tot ${data.activeUntil}.`,
      content,
    }),
  };
}
