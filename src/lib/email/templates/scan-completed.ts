import { baseEmailLayout, emailButton, scoreCircle, severityBadge } from "./base";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

interface ScanCompletedEmailData {
  userName: string;
  websiteName: string;
  websiteUrl: string;
  scanId: string;
  score: number;
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  pagesScanned: number;
  duration: number;
  previousScore?: number | null;
}

export function scanCompletedEmail(data: ScanCompletedEmailData): {
  subject: string;
  html: string;
} {
  const scoreLabel =
    data.score >= 80 ? "Goed" : data.score >= 50 ? "Matig" : "Onvoldoende";

  const trendText =
    data.previousScore != null
      ? data.score > data.previousScore
        ? `<span style="color:#16a34a;">▲ +${Math.round(data.score - data.previousScore)} punten</span> ten opzichte van de vorige scan`
        : data.score < data.previousScore
          ? `<span style="color:#dc2626;">▼ ${Math.round(data.score - data.previousScore)} punten</span> ten opzichte van de vorige scan`
          : `<span style="color:#94a3b8;">Gelijk</span> aan de vorige scan`
      : "";

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Scan voltooid</h2>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
      De scan van <strong style="color:#0f172a;">${data.websiteName}</strong> is afgerond.
    </p>

    <!-- Score -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;text-align:center;">
          ${scoreCircle(data.score)}
          <p style="margin:8px 0 0;font-size:14px;color:#475569;">
            Toegankelijkheidsscore: <strong style="color:#0f172a;">${scoreLabel}</strong>
          </p>
          ${trendText ? `<p style="margin:8px 0 0;font-size:13px;color:#475569;">${trendText}</p>` : ""}
        </td>
      </tr>
    </table>

    <!-- Stats -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px 0 0 8px;text-align:center;width:33%;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Pagina's</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${data.pagesScanned}</p>
        </td>
        <td style="padding:16px;background-color:#f8fafc;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;text-align:center;width:34%;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Issues</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${data.totalIssues}</p>
        </td>
        <td style="padding:16px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:0 8px 8px 0;text-align:center;width:33%;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Duur</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${data.duration}s</p>
        </td>
      </tr>
    </table>

    <!-- Issue breakdown -->
    ${
      data.totalIssues > 0
        ? `
    <table role="presentation" cellpadding="0" cellspacing="8" style="margin-bottom:24px;">
      <tr>
        ${severityBadge("Kritiek", data.criticalIssues, "#dc2626")}
        ${severityBadge("Serieus", data.seriousIssues, "#ea580c")}
        ${severityBadge("Matig", data.moderateIssues, "#ca8a04")}
        ${severityBadge("Minor", data.minorIssues, "#2563eb")}
      </tr>
    </table>`
        : `<p style="margin-bottom:24px;font-size:14px;color:#16a34a;">Geen issues gevonden. Uitstekend!</p>`
    }

    ${emailButton("Bekijk resultaten", `${APP_URL}/dashboard/scans/${data.scanId}`)}

    <p style="margin:0;font-size:13px;line-height:1.6;color:#94a3b8;">
      Gescande website: <a href="${data.websiteUrl}" style="color:#0d9488;text-decoration:none;">${data.websiteUrl}</a>
    </p>
  `;

  return {
    subject: `Scan voltooid: ${data.websiteName} scoort ${Math.round(data.score)}/100`,
    html: baseEmailLayout({
      title: `Scan voltooid — ${data.websiteName}`,
      preheader: `${data.websiteName} scoort ${Math.round(data.score)}/100 op toegankelijkheid. ${data.totalIssues} issues gevonden.`,
      content,
    }),
  };
}
