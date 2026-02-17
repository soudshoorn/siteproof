import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description: "Lees hoe SiteProof omgaat met je persoonsgegevens conform de AVG.",
};

const fallbackContent = `
# Privacyverklaring

*Laatst bijgewerkt: februari 2026*

## 1. Wie zijn wij?

SiteProof is een product van Webser, gevestigd in Nederland.

- **Bedrijfsnaam:** Webser
- **KvK-nummer:** 93875568
- **Contactpersoon:** Senna Oudshoorn
- **E-mail:** privacy@siteproof.nl

## 2. Welke gegevens verwerken wij?

Wij verwerken de volgende persoonsgegevens:

### Bij registratie:
- E-mailadres
- Volledige naam (optioneel)
- Wachtwoord (versleuteld opgeslagen, nooit leesbaar)

### Bij gebruik van de dienst:
- Website-URL's die je invoert voor scanning
- Scan resultaten en toegankelijkheidsrapporten
- Factuurgegevens en betalingshistorie (via Mollie)

### Automatisch verzamelde gegevens:
- IP-adres (voor rate limiting en beveiliging)
- Browsertype en besturingssysteem (voor compatibiliteit)

## 3. Waarvoor gebruiken wij je gegevens?

Wij verwerken je gegevens voor de volgende doeleinden:

| Doel | Grondslag (AVG) |
|------|----------------|
| Uitvoeren van scans en leveren van rapporten | Uitvoering overeenkomst (art. 6.1b) |
| Accountbeheer en authenticatie | Uitvoering overeenkomst (art. 6.1b) |
| Facturatie en betalingsverwerking | Uitvoering overeenkomst (art. 6.1b) |
| E-mail notificaties over scan resultaten | Gerechtvaardigd belang (art. 6.1f) |
| Verbetering van onze dienst | Gerechtvaardigd belang (art. 6.1f) |
| Naleving van wettelijke verplichtingen | Wettelijke verplichting (art. 6.1c) |

## 4. Hoe lang bewaren wij je gegevens?

- **Accountgegevens:** Zolang je account actief is, plus 30 dagen na verwijdering
- **Scan resultaten:** Zolang je account actief is
- **Factuurgegevens:** 7 jaar (wettelijke bewaarplicht)
- **IP-adressen (rate limiting):** Maximaal 24 uur

## 5. Met wie delen wij je gegevens?

Wij delen je gegevens alleen met de volgende verwerkers:

| Verwerker | Doel | Locatie |
|-----------|------|---------|
| Supabase | Database en authenticatie | EU (Frankfurt) |
| Mollie | Betalingsverwerking | Nederland |
| Resend | E-mail verzending | VS (met EU Standard Contractual Clauses) |
| Vercel | Hosting van de applicatie | EU (Frankfurt) |
| Railway | Hosting van de scanner | EU |

Wij verkopen je gegevens **nooit** aan derden.

## 6. Jouw rechten

Op grond van de AVG heb je de volgende rechten:

- **Recht op inzage:** Je kunt opvragen welke gegevens wij van je hebben.
- **Recht op rectificatie:** Je kunt onjuiste gegevens laten corrigeren.
- **Recht op vergetelheid:** Je kunt je account en alle gegevens laten verwijderen via je dashboard (Instellingen > Account verwijderen).
- **Recht op dataportabiliteit:** Je kunt al je gegevens exporteren als JSON via je dashboard (Instellingen > Data exporteren).
- **Recht op beperking:** Je kunt verzoeken dat wij de verwerking tijdelijk stoppen.
- **Recht van bezwaar:** Je kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang.

Om gebruik te maken van je rechten, neem contact op via **privacy@siteproof.nl** of gebruik de knoppen in je dashboard.

## 7. Beveiliging

Wij nemen passende technische en organisatorische maatregelen om je gegevens te beschermen:

- Alle verbindingen zijn versleuteld via TLS/SSL (HTTPS)
- Wachtwoorden worden gehasht met bcrypt
- Toegang tot productiedata is beperkt tot geautoriseerd personeel
- Regelmatige security audits

## 8. Cookies

Zie onze [Cookieverklaring](/cookies) voor informatie over welke cookies wij plaatsen.

## 9. Wijzigingen

Wij kunnen deze privacyverklaring wijzigen. Bij substantiële wijzigingen informeren wij je per e-mail. De meest recente versie is altijd beschikbaar op deze pagina.

## 10. Klachten

Heb je een klacht over hoe wij met je gegevens omgaan? Neem dan contact met ons op via privacy@siteproof.nl. Je hebt ook het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).
`;

export default async function PrivacyPage() {
  let content = fallbackContent;

  try {
    const page = await prisma.seoPage.findUnique({
      where: { slug: "privacy" },
    });
    if (page?.content) {
      content = page.content;
    }
  } catch {
    // Database not available — use fallback
  }

  return <LegalPage title="Privacyverklaring" content={content} />;
}
