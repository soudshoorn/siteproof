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
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Score gedaald</h2>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
      De toegankelijkheidsscore van <strong style="color:#0f172a;">${data.websiteName}</strong> is met <strong style="color:#dc2626;">${drop} punten</strong> gedaald.
    </p>

    <!-- Score comparison -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;text-align:center;width:45%;">
          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">Vorige score</p>
          ${scoreCircle(data.previousScore)}
        </td>
        <td style="text-align:center;width:10%;vertical-align:middle;">
          <span style="color:#dc2626;font-size:24px;">→</span>
        </td>
        <td style="padding:24px;text-align:center;width:45%;">
          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">Huidige score</p>
          ${scoreCircle(data.currentScore)}
        </td>
      </tr>
    </table>

    ${
      data.newCriticalIssues > 0 || data.newSeriousIssues > 0
        ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 24px;">
          <p style="margin:0;font-size:14px;color:#475569;line-height:1.8;">
            ${data.newCriticalIssues > 0 ? `<strong style="color:#dc2626;">${data.newCriticalIssues} nieuwe kritieke issues</strong><br>` : ""}
            ${data.newSeriousIssues > 0 ? `<strong style="color:#ea580c;">${data.newSeriousIssues} nieuwe serieuze issues</strong>` : ""}
          </p>
        </td>
      </tr>
    </table>`
        : ""
    }

    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">
      We raden aan om de nieuwe issues zo snel mogelijk te bekijken en op te lossen om je WCAG-compliance te herstellen.
    </p>

    ${emailButton("Bekijk issues", `${APP_URL}/dashboard/scans/${data.scanId}`)}

    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Website: <a href="${data.websiteUrl}" style="color:#0d9488;text-decoration:none;">${data.websiteUrl}</a>
    </p>
  `;

  return {
    subject: `Score gedaald: ${data.websiteName} van ${Math.round(data.previousScore)} naar ${Math.round(data.currentScore)}`,
    html: baseEmailLayout({
      title: `Score gedaald — ${data.websiteName}`,
      preheader: `De score van ${data.websiteName} is gedaald van ${Math.round(data.previousScore)} naar ${Math.round(data.currentScore)}. Bekijk de nieuwe issues.`,
      content,
    }),
  };
}
