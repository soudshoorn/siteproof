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
          ? "#94a3b8"
          : website.latestScore >= 80
            ? "#16a34a"
            : website.latestScore >= 50
              ? "#ca8a04"
              : "#dc2626";

      const trend =
        website.previousScore != null && website.latestScore != null
          ? website.latestScore > website.previousScore
            ? `<span style="color:#16a34a;">▲ +${Math.round(website.latestScore - website.previousScore)}</span>`
            : website.latestScore < website.previousScore
              ? `<span style="color:#dc2626;">▼ ${Math.round(website.latestScore - website.previousScore)}</span>`
              : `<span style="color:#94a3b8;">—</span>`
          : "";

      return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:60%;">
                <p style="margin:0 0 2px;font-size:14px;font-weight:600;">
                  <a href="${APP_URL}/dashboard/websites/${website.websiteId}" style="color:#0f172a;text-decoration:none;">${website.name}</a>
                </p>
                <p style="margin:0;font-size:12px;color:#94a3b8;">${website.totalIssues} issues${website.criticalIssues > 0 ? ` · <span style="color:#dc2626;">${website.criticalIssues} kritiek</span>` : ""}</p>
              </td>
              <td style="text-align:right;vertical-align:middle;">
                <span style="color:${scoreColor};font-size:22px;font-weight:700;">${website.latestScore != null ? Math.round(website.latestScore) : "—"}</span>
                <span style="color:#94a3b8;font-size:13px;">/100</span>
                ${trend ? `<br><span style="font-size:12px;">${trend}</span>` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    })
    .join("");

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Wekelijks rapport</h2>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
      Overzicht voor <strong style="color:#0f172a;">${data.organizationName}</strong><br>
      <span style="font-size:13px;">${data.weekStartDate} — ${data.weekEndDate}</span>
    </p>

    <!-- Summary stats -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px 0 0 8px;text-align:center;width:33%;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Gem. score</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${avgScore ?? "—"}</p>
        </td>
        <td style="padding:16px;background-color:#f8fafc;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;text-align:center;width:34%;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Totaal issues</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${totalIssues}</p>
        </td>
        <td style="padding:16px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:0 8px 8px 0;text-align:center;width:33%;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Kritiek</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:${totalCritical > 0 ? "#dc2626" : "#16a34a"};">${totalCritical}</p>
        </td>
      </tr>
    </table>

    ${
      avgScore != null
        ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;text-align:center;">
          ${scoreCircle(avgScore)}
          <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">Gemiddelde score</p>
        </td>
      </tr>
    </table>`
        : ""
    }

    <!-- Per-website breakdown -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Websites</p>
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
