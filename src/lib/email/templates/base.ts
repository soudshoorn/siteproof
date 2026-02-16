const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

/**
 * Base HTML email layout used by all SiteProof email templates.
 * Dark-themed, clean design consistent with the SiteProof brand.
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
  <style>
    body { margin: 0; padding: 0; width: 100%; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    .email-container { max-width: 600px; margin: 0 auto; }
    .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; font-size: 0; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .content-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a;">
  <span class="preheader">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="background-color: #121212; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #1e1e1e;" class="content-padding">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${APP_URL}" style="text-decoration: none; color: #14B8A6; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">SiteProof</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;" class="content-padding">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #1e1e1e;" class="content-padding">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #666; font-size: 12px; line-height: 1.6;">
                    <p style="margin: 0 0 8px;">SiteProof — Bewijs dat je website toegankelijk is.</p>
                    <p style="margin: 0 0 4px;">Een product van Webser | KvK: [KVK_NUMMER]</p>
                    <p style="margin: 0;">
                      <a href="${APP_URL}/privacy" style="color: #888; text-decoration: underline;">Privacyverklaring</a>
                      &nbsp;·&nbsp;
                      <a href="${APP_URL}/dashboard/settings" style="color: #888; text-decoration: underline;">E-mailvoorkeuren</a>
                    </p>
                  </td>
                </tr>
              </table>
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
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
  <tr>
    <td style="border-radius: 8px; background-color: #0D9488;">
      <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px;">
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
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
  <tr>
    <td style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid ${color}; text-align: center; vertical-align: middle;">
      <span style="font-size: 28px; font-weight: 700; color: ${color};">${Math.round(score)}</span>
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
  return `<td style="padding: 4px 12px; background-color: ${color}20; border-radius: 4px; margin-right: 8px;">
  <span style="color: ${color}; font-size: 13px; font-weight: 600;">${count} ${label}</span>
</td>`;
}
