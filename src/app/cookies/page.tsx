import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Cookieverklaring",
  description: "Welke cookies SiteProof plaatst, waarvoor, en hoe je ze kunt beheren.",
};

const fallbackContent = `
# Cookieverklaring

*Laatst bijgewerkt: februari 2026*

## Wat zijn cookies?

Cookies zijn kleine tekstbestanden die op je apparaat worden opgeslagen wanneer je een website bezoekt. Ze worden gebruikt om de website goed te laten functioneren, om je voorkeuren te onthouden en om inzicht te krijgen in hoe de website wordt gebruikt.

## Welke cookies plaatsen wij?

### Noodzakelijke cookies

Deze cookies zijn essentieel voor het functioneren van de website. Ze kunnen niet worden uitgeschakeld.

| Cookie | Doel | Bewaartermijn |
|--------|------|---------------|
| \`sb-access-token\` | Supabase authenticatie sessie | Sessie |
| \`sb-refresh-token\` | Supabase sessie vernieuwing | 7 dagen |
| \`siteproof-cookie-consent\` | Opslaan van je cookievoorkeuren | 1 jaar |
| \`__Host-next-auth\` | Next.js sessiebeheer | Sessie |

### Analytische cookies (opt-in)

Deze cookies helpen ons te begrijpen hoe bezoekers de website gebruiken. Ze worden **alleen** geplaatst als je hiervoor toestemming geeft.

Op dit moment plaatst SiteProof geen analytische cookies van derden. Als wij in de toekomst analytics toevoegen (bijv. Plausible of Simple Analytics), wordt deze verklaring bijgewerkt.

### Marketing cookies (opt-in)

Op dit moment plaatst SiteProof **geen** marketing cookies. Wij tonen geen advertenties en volgen je niet over andere websites.

## Cookies van derden

### Mollie (betalingsverwerking)

Wanneer je een betaling doet, word je doorgestuurd naar Mollie. Mollie plaatst eigen cookies voor de betalingsverwerking. Zie de [privacyverklaring van Mollie](https://www.mollie.com/nl/privacy) voor meer informatie.

### Supabase (authenticatie)

Supabase plaatst cookies voor authenticatie. Deze zijn noodzakelijk voor het inloggen op je account. Zie de [privacyverklaring van Supabase](https://supabase.com/privacy) voor meer informatie.

## Hoe beheer je cookies?

### Via SiteProof

Bij je eerste bezoek aan SiteProof tonen wij een cookiebanner. Hierin kun je:
- **Alles accepteren** — alle cookies worden geplaatst
- **Alleen noodzakelijk** — alleen essentiële cookies worden geplaatst
- **Voorkeuren aanpassen** — kies per categorie welke cookies je accepteert

Je kunt je voorkeuren op elk moment wijzigen door je cookies te verwijderen (zie hieronder) en de website opnieuw te bezoeken.

### Via je browser

Je kunt cookies ook beheren via je browserinstellingen:
- **Chrome:** Instellingen > Privacy en beveiliging > Cookies en andere sitegegevens
- **Firefox:** Instellingen > Privacy & Beveiliging > Cookies en sitegegevens
- **Safari:** Voorkeuren > Privacy > Cookies en websitegegevens
- **Edge:** Instellingen > Cookies en sitetoestemmingen

Let op: het blokkeren van noodzakelijke cookies kan ervoor zorgen dat SiteProof niet goed werkt.

## Telecommunicatiewet

Deze cookieverklaring voldoet aan artikel 11.7a van de Telecommunicatiewet. Wij plaatsen geen cookies vóór je toestemming hebt gegeven, behalve cookies die strikt noodzakelijk zijn voor het functioneren van de dienst.

## Wijzigingen

Wij kunnen deze cookieverklaring wijzigen wanneer wij andere cookies gaan gebruiken. Controleer deze pagina regelmatig voor de meest recente informatie.

## Contact

Vragen over ons cookiebeleid? Neem contact op via privacy@siteproof.nl.
`;

export default async function CookiesPage() {
  let content = fallbackContent;

  try {
    const page = await prisma.seoPage.findUnique({
      where: { slug: "cookies" },
    });
    if (page?.content) {
      content = page.content;
    }
  } catch {
    // Database not available — use fallback
  }

  return <LegalPage title="Cookieverklaring" content={content} />;
}
