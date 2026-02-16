"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanCompletedEmail = scanCompletedEmail;
const base_1 = require("./base");
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";
function scanCompletedEmail(data) {
    const scoreLabel = data.score >= 80 ? "Goed" : data.score >= 50 ? "Matig" : "Onvoldoende";
    const trendText = data.previousScore != null
        ? data.score > data.previousScore
            ? `<span style="color: #22c55e;">▲ +${Math.round(data.score - data.previousScore)} punten</span> ten opzichte van de vorige scan`
            : data.score < data.previousScore
                ? `<span style="color: #ef4444;">▼ ${Math.round(data.score - data.previousScore)} punten</span> ten opzichte van de vorige scan`
                : `<span style="color: #888;">Gelijk</span> aan de vorige scan`
        : "";
    const content = `
    <h1 style="color: #f5f5f5; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Scan voltooid</h1>
    <p style="color: #a3a3a3; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
      De scan van <strong style="color: #f5f5f5;">${data.websiteName}</strong> is afgerond.
    </p>

    <!-- Score -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 24px; text-align: center;">
          ${(0, base_1.scoreCircle)(data.score)}
          <p style="color: #a3a3a3; font-size: 14px; margin: 8px 0 0;">
            Toegankelijkheidsscore: <strong style="color: #f5f5f5;">${scoreLabel}</strong>
          </p>
          ${trendText ? `<p style="color: #a3a3a3; font-size: 13px; margin: 8px 0 0;">${trendText}</p>` : ""}
        </td>
      </tr>
    </table>

    <!-- Stats -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px; background-color: #1a1a1a; border-radius: 8px 0 0 8px; text-align: center; width: 33%;">
          <p style="color: #a3a3a3; font-size: 12px; margin: 0 0 4px;">Pagina's</p>
          <p style="color: #f5f5f5; font-size: 20px; font-weight: 700; margin: 0;">${data.pagesScanned}</p>
        </td>
        <td style="padding: 16px; background-color: #1a1a1a; text-align: center; width: 34%; border-left: 1px solid #2a2a2a; border-right: 1px solid #2a2a2a;">
          <p style="color: #a3a3a3; font-size: 12px; margin: 0 0 4px;">Issues</p>
          <p style="color: #f5f5f5; font-size: 20px; font-weight: 700; margin: 0;">${data.totalIssues}</p>
        </td>
        <td style="padding: 16px; background-color: #1a1a1a; border-radius: 0 8px 8px 0; text-align: center; width: 33%;">
          <p style="color: #a3a3a3; font-size: 12px; margin: 0 0 4px;">Duur</p>
          <p style="color: #f5f5f5; font-size: 20px; font-weight: 700; margin: 0;">${data.duration}s</p>
        </td>
      </tr>
    </table>

    <!-- Issue breakdown -->
    ${data.totalIssues > 0
        ? `
    <table role="presentation" cellpadding="0" cellspacing="8" style="margin-bottom: 24px;">
      <tr>
        ${(0, base_1.severityBadge)("Kritiek", data.criticalIssues, "#ef4444")}
        ${(0, base_1.severityBadge)("Serieus", data.seriousIssues, "#f97316")}
        ${(0, base_1.severityBadge)("Matig", data.moderateIssues, "#eab308")}
        ${(0, base_1.severityBadge)("Minor", data.minorIssues, "#3b82f6")}
      </tr>
    </table>`
        : `<p style="color: #22c55e; font-size: 14px; margin-bottom: 24px;">Geen issues gevonden. Uitstekend!</p>`}

    ${(0, base_1.emailButton)("Bekijk resultaten", `${APP_URL}/dashboard/scans/${data.scanId}`)}

    <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6;">
      Gescande website: <a href="${data.websiteUrl}" style="color: #14B8A6; text-decoration: none;">${data.websiteUrl}</a>
    </p>
  `;
    return {
        subject: `Scan voltooid: ${data.websiteName} scoort ${Math.round(data.score)}/100`,
        html: (0, base_1.baseEmailLayout)({
            title: `Scan voltooid — ${data.websiteName}`,
            preheader: `${data.websiteName} scoort ${Math.round(data.score)}/100 op toegankelijkheid. ${data.totalIssues} issues gevonden.`,
            content,
        }),
    };
}
