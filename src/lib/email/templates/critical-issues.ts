import { baseEmailLayout, emailButton } from "./base";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

interface CriticalIssue {
  description: string;
  pageUrl: string;
  wcagCriteria: string[];
}

interface CriticalIssuesEmailData {
  userName: string;
  websiteName: string;
  websiteUrl: string;
  scanId: string;
  criticalCount: number;
  issues: CriticalIssue[];
}

export function criticalIssuesEmail(data: CriticalIssuesEmailData): {
  subject: string;
  html: string;
} {
  const issueRows = data.issues
    .slice(0, 5)
    .map(
      (issue) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0f172a;">
            ${issue.description}
          </p>
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            ${issue.wcagCriteria.map((c) => `WCAG ${c}`).join(", ")} · <a href="${issue.pageUrl}" style="color:#0d9488;text-decoration:none;">${truncateUrl(issue.pageUrl)}</a>
          </p>
        </td>
      </tr>`
    )
    .join("");

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Nieuwe kritieke issues</h2>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
      Er zijn <strong style="color:#dc2626;">${data.criticalCount} nieuwe kritieke toegankelijkheidsproblemen</strong> gevonden op <strong style="color:#0f172a;">${data.websiteName}</strong>.
    </p>

    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">
      Kritieke issues verhinderen dat bepaalde gebruikers je website kunnen gebruiken. Los deze zo snel mogelijk op.
    </p>

    <!-- Issues list -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#dc2626;">
            Kritieke issues
          </p>
        </td>
      </tr>
      ${issueRows}
    </table>

    ${
      data.criticalCount > 5
        ? `<p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">
        En ${data.criticalCount - 5} meer. Bekijk alle issues in het dashboard.
      </p>`
        : ""
    }

    ${emailButton("Bekijk alle issues", `${APP_URL}/dashboard/scans/${data.scanId}`)}
  `;

  return {
    subject: `${data.criticalCount} kritieke issues op ${data.websiteName}`,
    html: baseEmailLayout({
      title: `Kritieke issues — ${data.websiteName}`,
      preheader: `${data.criticalCount} nieuwe kritieke toegankelijkheidsproblemen gevonden op ${data.websiteName}. Directe actie vereist.`,
      content,
    }),
  };
}

function truncateUrl(url: string, maxLength = 50): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + "...";
}
