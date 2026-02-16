import { baseEmailLayout, emailButton } from "./base";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

interface WelcomeEmailData {
  userName: string;
  email: string;
}

export function welcomeEmail(data: WelcomeEmailData): {
  subject: string;
  html: string;
} {
  const content = `
    <h1 style="color: #f5f5f5; font-size: 22px; font-weight: 700; margin: 0 0 8px;">
      Welkom bij SiteProof${data.userName ? `, ${data.userName}` : ""}!
    </h1>
    <p style="color: #a3a3a3; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
      Goed dat je er bent. Met SiteProof scan je je website op toegankelijkheid en voldoe je aan de European Accessibility Act.
    </p>

    <!-- Steps -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 24px;">
          <p style="color: #14B8A6; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">
            Aan de slag in 3 stappen
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; vertical-align: top; width: 32px;">
                <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; background-color: #0D9488; color: #fff; font-size: 13px; font-weight: 700; text-align: center; line-height: 24px;">1</span>
              </td>
              <td style="padding: 8px 0 8px 12px;">
                <p style="color: #f5f5f5; font-size: 14px; font-weight: 600; margin: 0 0 2px;">Website toevoegen</p>
                <p style="color: #a3a3a3; font-size: 13px; margin: 0;">Voeg de URL toe van de website die je wilt scannen.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; vertical-align: top; width: 32px;">
                <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; background-color: #0D9488; color: #fff; font-size: 13px; font-weight: 700; text-align: center; line-height: 24px;">2</span>
              </td>
              <td style="padding: 8px 0 8px 12px;">
                <p style="color: #f5f5f5; font-size: 14px; font-weight: 600; margin: 0 0 2px;">Scan starten</p>
                <p style="color: #a3a3a3; font-size: 13px; margin: 0;">Start een scan en wij checken je website op WCAG 2.1 AA.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; vertical-align: top; width: 32px;">
                <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; background-color: #0D9488; color: #fff; font-size: 13px; font-weight: 700; text-align: center; line-height: 24px;">3</span>
              </td>
              <td style="padding: 8px 0 8px 12px;">
                <p style="color: #f5f5f5; font-size: 14px; font-weight: 600; margin: 0 0 2px;">Issues oplossen</p>
                <p style="color: #a3a3a3; font-size: 13px; margin: 0;">Ontvang concrete fix-suggesties in begrijpelijk Nederlands.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- EAA reminder -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D94881a; border: 1px solid #0D948840; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 24px;">
          <p style="color: #14B8A6; font-size: 14px; font-weight: 600; margin: 0 0 4px;">European Accessibility Act</p>
          <p style="color: #a3a3a3; font-size: 13px; margin: 0; line-height: 1.6;">
            De EAA is sinds 28 juni 2025 van kracht. Alle niet-micro-ondernemingen moeten hun digitale diensten toegankelijk maken. Met SiteProof weet je precies waar je staat.
          </p>
        </td>
      </tr>
    </table>

    ${emailButton("Ga naar je dashboard", `${APP_URL}/dashboard`)}

    <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6;">
      Vragen? Stuur een e-mail naar <a href="mailto:support@siteproof.nl" style="color: #14B8A6; text-decoration: none;">support@siteproof.nl</a>
    </p>
  `;

  return {
    subject: "Welkom bij SiteProof — Bewijs dat je website toegankelijk is",
    html: baseEmailLayout({
      title: "Welkom bij SiteProof",
      preheader:
        "Je account is aangemaakt. Start je eerste scan en ontdek hoe toegankelijk je website is.",
      content,
    }),
  };
}
