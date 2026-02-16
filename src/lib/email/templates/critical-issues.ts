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
        <td style="padding: 12px 16px; border-bottom: 1px solid #2a2a2a;">
          <p style="color: #f5f5f5; font-size: 14px; font-weight: 600; margin: 0 0 4px;">
            ${issue.description}
          </p>
          <p style="color: #666; font-size: 12px; margin: 0;">
            ${issue.wcagCriteria.map((c) => `WCAG ${c}`).join(", ")} · <a href="${issue.pageUrl}" style="color: #14B8A6; text-decoration: none;">${truncateUrl(issue.pageUrl)}</a>
          </p>
        </td>
      </tr>`
    )
    .join("");

  const content = `
    <h1 style="color: #f5f5f5; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Nieuwe kritieke issues</h1>
    <p style="color: #a3a3a3; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
      Er zijn <strong style="color: #ef4444;">${data.criticalCount} nieuwe kritieke toegankelijkheidsproblemen</strong> gevonden op <strong style="color: #f5f5f5;">${data.websiteName}</strong>.
    </p>

    <p style="color: #a3a3a3; font-size: 14px; margin: 0 0 16px; line-height: 1.6;">
      Kritieke issues verhinderen dat bepaalde gebruikers je website kunnen gebruiken. Los deze zo snel mogelijk op.
    </p>

    <!-- Issues list -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; margin-bottom: 8px;">
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #2a2a2a;">
          <p style="color: #ef4444; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
            Kritieke issues
          </p>
        </td>
      </tr>
      ${issueRows}
    </table>

    ${
      data.criticalCount > 5
        ? `<p style="color: #666; font-size: 13px; margin: 0 0 16px;">
        En ${data.criticalCount - 5} meer. Bekijk alle issues in het dashboard.
      </p>`
        : ""
    }

    ${emailButton("Bekijk alle issues", `${APP_URL}/dashboard/scans/${data.scanId}`)}
  `;

  return {
    subject: `🚨 ${data.criticalCount} kritieke issues op ${data.websiteName}`,
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
