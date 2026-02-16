import { baseEmailLayout, emailButton, scoreCircle } from "./base";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

interface WebsiteSummary {
  name: string;
  url: string;
  websiteId: string;
  latestScore: number | null;
  previousScore: number | null;
  totalIssues: number;
  criticalIssues: number;
}

interface WeeklyReportEmailData {
  userName: string;
  organizationName: string;
  websites: WebsiteSummary[];
  weekStartDate: string;
  weekEndDate: string;
}

export function weeklyReportEmail(data: WeeklyReportEmailData): {
  subject: string;
  html: string;
} {
  const avgScore =
    data.websites.filter((w) => w.latestScore != null).length > 0
      ? Math.round(
          data.websites
            .filter((w) => w.latestScore != null)
            .reduce((sum, w) => sum + (w.latestScore ?? 0), 0) /
            data.websites.filter((w) => w.latestScore != null).length
        )
      : null;

  const totalIssues = data.websites.reduce((sum, w) => sum + w.totalIssues, 0);
  const totalCritical = data.websites.reduce(
    (sum, w) => sum + w.criticalIssues,
    0
  );

  const websiteRows = data.websites
    .map((website) => {
      const scoreColor =
        website.latestScore == null
          ? "#666"
          : website.latestScore >= 80
            ? "#22c55e"
            : website.latestScore >= 50
              ? "#eab308"
              : "#ef4444";

      const trend =
        website.previousScore != null && website.latestScore != null
          ? website.latestScore > website.previousScore
            ? `<span style="color: #22c55e;">▲ +${Math.round(website.latestScore - website.previousScore)}</span>`
            : website.latestScore < website.previousScore
              ? `<span style="color: #ef4444;">▼ ${Math.round(website.latestScore - website.previousScore)}</span>`
              : `<span style="color: #666;">—</span>`
          : "";

      return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #2a2a2a;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width: 60%;">
                <p style="color: #f5f5f5; font-size: 14px; font-weight: 600; margin: 0 0 2px;">
                  <a href="${APP_URL}/dashboard/websites/${website.websiteId}" style="color: #f5f5f5; text-decoration: none;">${website.name}</a>
                </p>
                <p style="color: #666; font-size: 12px; margin: 0;">${website.totalIssues} issues${website.criticalIssues > 0 ? ` · <span style="color: #ef4444;">${website.criticalIssues} kritiek</span>` : ""}</p>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <span style="color: ${scoreColor}; font-size: 22px; font-weight: 700;">${website.latestScore != null ? Math.round(website.latestScore) : "—"}</span>
                <span style="color: #666; font-size: 13px;">/100</span>
                ${trend ? `<br><span style="font-size: 12px;">${trend}</span>` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    })
    .join("");

  const content = `
    <h1 style="color: #f5f5f5; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Wekelijks rapport</h1>
    <p style="color: #a3a3a3; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
      Overzicht voor <strong style="color: #f5f5f5;">${data.organizationName}</strong><br>
      <span style="font-size: 13px;">${data.weekStartDate} — ${data.weekEndDate}</span>
    </p>

    <!-- Summary stats -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px; background-color: #1a1a1a; border-radius: 8px 0 0 8px; text-align: center; width: 33%;">
          <p style="color: #a3a3a3; font-size: 12px; margin: 0 0 4px;">Gem. score</p>
          <p style="color: #f5f5f5; font-size: 20px; font-weight: 700; margin: 0;">${avgScore ?? "—"}</p>
        </td>
        <td style="padding: 16px; background-color: #1a1a1a; text-align: center; width: 34%; border-left: 1px solid #2a2a2a; border-right: 1px solid #2a2a2a;">
          <p style="color: #a3a3a3; font-size: 12px; margin: 0 0 4px;">Totaal issues</p>
          <p style="color: #f5f5f5; font-size: 20px; font-weight: 700; margin: 0;">${totalIssues}</p>
        </td>
        <td style="padding: 16px; background-color: #1a1a1a; border-radius: 0 8px 8px 0; text-align: center; width: 33%;">
          <p style="color: #a3a3a3; font-size: 12px; margin: 0 0 4px;">Kritiek</p>
          <p style="color: ${totalCritical > 0 ? "#ef4444" : "#22c55e"}; font-size: 20px; font-weight: 700; margin: 0;">${totalCritical}</p>
        </td>
      </tr>
    </table>

    ${
      avgScore != null
        ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 24px; text-align: center;">
          ${scoreCircle(avgScore)}
          <p style="color: #a3a3a3; font-size: 13px; margin: 4px 0 0;">Gemiddelde score</p>
        </td>
      </tr>
    </table>`
        : ""
    }

    <!-- Per-website breakdown -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #2a2a2a;">
          <p style="color: #a3a3a3; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Websites</p>
        </td>
      </tr>
      ${websiteRows}
    </table>

    ${emailButton("Bekijk dashboard", `${APP_URL}/dashboard`)}
  `;

  return {
    subject: `Wekelijks rapport: ${data.organizationName} — ${avgScore != null ? `score ${avgScore}/100` : "geen scans"}`,
    html: baseEmailLayout({
      title: `Wekelijks rapport — ${data.organizationName}`,
      preheader: `${data.websites.length} websites, ${totalIssues} issues, gemiddelde score: ${avgScore ?? "—"}/100`,
      content,
    }),
  };
}
