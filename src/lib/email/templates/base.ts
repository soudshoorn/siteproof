const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

/**
 * Base HTML email layout used by all SiteProof email templates.
 * Light-themed, matching the Supabase confirmation email design.
 */
export function baseEmailLayout({
  title,
  preheader,
  content,
}: {
  title: string;
  preheader: string;
  content: string;
}): string {
  return `<!DOCTYPE html>
<html lang="nl" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:0;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;padding:32px 40px;text-align:center;">
              <a href="${APP_URL}" style="text-decoration:none;">
                <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Site<span style="color:#14b8a6;">Proof</span></h1>
              </a>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">
                SiteProof — Bewijs dat je website toegankelijk is.
              </p>
              <p style="margin:0 0 8px;font-size:12px;color:#cbd5e1;">
                Webser · KvK 93875568 · siteproof.nl
              </p>
              <p style="margin:0;font-size:12px;">
                <a href="${APP_URL}/privacy" style="color:#94a3b8;text-decoration:underline;">Privacyverklaring</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/dashboard/settings" style="color:#94a3b8;text-decoration:underline;">E-mailvoorkeuren</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Styled primary CTA button for emails.
 */
export function emailButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="border-radius:8px;background-color:#0d9488;">
      <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

/**
 * Score badge with color based on score value.
 */
export function scoreCircle(score: number): string {
  const color = score >= 80 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#dc2626";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px auto;">
  <tr>
    <td style="width:80px;height:80px;border-radius:50%;border:4px solid ${color};text-align:center;vertical-align:middle;">
      <span style="font-size:28px;font-weight:700;color:${color};">${Math.round(score)}</span>
    </td>
  </tr>
</table>`;
}

/**
 * Severity badge for issue counts.
 */
export function severityBadge(
  label: string,
  count: number,
  color: string
): string {
  if (count === 0) return "";
  return `<td style="padding:4px 12px;background-color:${color}15;border-radius:4px;margin-right:8px;">
  <span style="color:${color};font-size:13px;font-weight:600;">${count} ${label}</span>
</td>`;
}
