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
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Abonnement bevestigd</h2>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
      Bedankt${data.userName ? `, ${data.userName}` : ""}! Je bent geüpgraded naar het <strong style="color:#0d9488;">${data.planName}</strong> plan.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Plan</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">${data.planName}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Prijs</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">${data.price} (${data.interval})</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Volgende factuurdatum</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">${data.nextBillingDate}</p>
        </td>
      </tr>
    </table>

    ${emailButton("Ga naar je dashboard", `${APP_URL}/dashboard`)}

    <p style="margin:0;font-size:13px;line-height:1.6;color:#94a3b8;">
      Je kunt je abonnement beheren via <a href="${APP_URL}/dashboard/settings/billing" style="color:#0d9488;text-decoration:none;">je facturatie-instellingen</a>.
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
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Abonnement opgezegd</h2>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
      Je <strong style="color:#0f172a;">${data.planName}</strong> abonnement is opgezegd. Je kunt alle features blijven gebruiken tot <strong style="color:#0f172a;">${data.activeUntil}</strong>.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">
            Na <strong style="color:#0f172a;">${data.activeUntil}</strong> wordt je account automatisch overgezet naar het gratis plan. Je scan-data blijft behouden.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">
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
