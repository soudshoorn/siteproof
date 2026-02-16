import { baseEmailLayout, emailButton, scoreCircle } from "./base";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

interface ScoreDropEmailData {
  userName: string;
  websiteName: string;
  websiteUrl: string;
  scanId: string;
  currentScore: number;
  previousScore: number;
  newCriticalIssues: number;
  newSeriousIssues: number;
}

export function scoreDropEmail(data: ScoreDropEmailData): {
  subject: string;
  html: string;
} {
  const drop = Math.round(data.previousScore - data.currentScore);

  const content = `
    <h1 style="color: #f5f5f5; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Score gedaald</h1>
    <p style="color: #a3a3a3; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
      De toegankelijkheidsscore van <strong style="color: #f5f5f5;">${data.websiteName}</strong> is met <strong style="color: #ef4444;">${drop} punten</strong> gedaald.
    </p>

    <!-- Score comparison -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 24px; text-align: center; width: 45%;">
          <p style="color: #a3a3a3; font-size: 13px; margin: 0 0 8px;">Vorige score</p>
          ${scoreCircle(data.previousScore)}
        </td>
        <td style="text-align: center; width: 10%; vertical-align: middle;">
          <span style="color: #ef4444; font-size: 24px;">→</span>
        </td>
        <td style="padding: 24px; text-align: center; width: 45%;">
          <p style="color: #a3a3a3; font-size: 13px; margin: 0 0 8px;">Huidige score</p>
          ${scoreCircle(data.currentScore)}
        </td>
      </tr>
    </table>

    ${
      data.newCriticalIssues > 0 || data.newSeriousIssues > 0
        ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 24px;">
          <p style="color: #a3a3a3; font-size: 14px; margin: 0; line-height: 1.8;">
            ${data.newCriticalIssues > 0 ? `<strong style="color: #ef4444;">${data.newCriticalIssues} nieuwe kritieke issues</strong><br>` : ""}
            ${data.newSeriousIssues > 0 ? `<strong style="color: #f97316;">${data.newSeriousIssues} nieuwe serieuze issues</strong>` : ""}
          </p>
        </td>
      </tr>
    </table>`
        : ""
    }

    <p style="color: #a3a3a3; font-size: 14px; margin: 0 0 8px; line-height: 1.6;">
      We raden aan om de nieuwe issues zo snel mogelijk te bekijken en op te lossen om je WCAG-compliance te herstellen.
    </p>

    ${emailButton("Bekijk issues", `${APP_URL}/dashboard/scans/${data.scanId}`)}

    <p style="color: #666; font-size: 13px; margin: 0;">
      Website: <a href="${data.websiteUrl}" style="color: #14B8A6; text-decoration: none;">${data.websiteUrl}</a>
    </p>
  `;

  return {
    subject: `⚠ Score gedaald: ${data.websiteName} van ${Math.round(data.previousScore)} naar ${Math.round(data.currentScore)}`,
    html: baseEmailLayout({
      title: `Score gedaald — ${data.websiteName}`,
      preheader: `De score van ${data.websiteName} is gedaald van ${Math.round(data.previousScore)} naar ${Math.round(data.currentScore)}. Bekijk de nieuwe issues.`,
      content,
    }),
  };
}
