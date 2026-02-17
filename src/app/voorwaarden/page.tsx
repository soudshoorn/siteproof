import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Algemene Voorwaarden",
  description: "De algemene voorwaarden van SiteProof voor het gebruik van onze WCAG audit dienst.",
};

const fallbackContent = `
# Algemene Voorwaarden SiteProof

*Laatst bijgewerkt: februari 2026*

## Artikel 1 — Definities

1. **SiteProof:** de online dienst voor geautomatiseerde WCAG-toegankelijkheidsaudits, aangeboden door Webser, gevestigd in Nederland, KvK-nummer 93875568.
2. **Klant:** de natuurlijke persoon of rechtspersoon die een account aanmaakt en/of een abonnement afsluit bij SiteProof.
3. **Dienst:** het scannen van websites op WCAG 2.1 AA compliance, het genereren van rapporten, en alle bijbehorende functionaliteiten.
4. **Account:** de persoonlijke omgeving van de Klant op het SiteProof platform.
5. **Abonnement:** de overeenkomst tussen SiteProof en de Klant voor het gebruik van betaalde functionaliteiten.

## Artikel 2 — Toepasselijkheid

1. Deze voorwaarden zijn van toepassing op elk gebruik van de SiteProof dienst.
2. Afwijkingen van deze voorwaarden zijn alleen geldig als ze schriftelijk zijn overeengekomen.
3. De toepasselijkheid van eventuele voorwaarden van de Klant wordt uitdrukkelijk uitgesloten.

## Artikel 3 — De dienst

1. SiteProof biedt een geautomatiseerde WCAG-scanner die websites controleert op toegankelijkheidsproblemen.
2. De scan resultaten zijn gebaseerd op geautomatiseerde controles (axe-core) en vormen **geen** volledige handmatige audit.
3. SiteProof garandeert niet dat een website die scoort op 100/100 volledig WCAG-compliant is. Geautomatiseerde tools kunnen circa 30-50% van de WCAG-criteria controleren.
4. SiteProof is een hulpmiddel en vervangt geen professioneel toegankelijkheidsadvies.

## Artikel 4 — Account en registratie

1. Om gebruik te maken van betaalde functies is een account vereist.
2. De Klant is verantwoordelijk voor het vertrouwelijk houden van inloggegevens.
3. De Klant garandeert dat de verstrekte gegevens correct en actueel zijn.
4. SiteProof behoudt zich het recht voor om accounts te weigeren of te beëindigen bij misbruik.

## Artikel 5 — Abonnementen en betaling

1. Abonnementen worden maandelijks of jaarlijks afgesloten via Mollie.
2. Prijzen zijn exclusief BTW, tenzij anders vermeld.
3. Betalingen worden automatisch geïncasseerd via iDEAL, creditcard of SEPA incasso.
4. Bij niet-betaling wordt na een herinneringsperiode van 7 dagen het abonnement opgeschort.
5. Restitutie is mogelijk binnen 14 dagen na de eerste betaling (herroepingsrecht), tenzij de dienst al substantieel is gebruikt.

## Artikel 6 — Opzegging

1. De Klant kan het abonnement op elk moment opzeggen via het dashboard.
2. Na opzegging blijft het abonnement actief tot het einde van de betaalde periode.
3. Na afloop van de betaalde periode wordt het account automatisch teruggezet naar het gratis plan.
4. Scan resultaten en rapporten blijven beschikbaar zolang het account bestaat.

## Artikel 7 — Beschikbaarheid en onderhoud

1. SiteProof streeft naar een beschikbaarheid van 99,5% op jaarbasis.
2. Gepland onderhoud wordt minimaal 24 uur van tevoren aangekondigd via e-mail.
3. SiteProof is niet aansprakelijk voor schade als gevolg van onbeschikbaarheid.

## Artikel 8 — Intellectueel eigendom

1. Alle rechten op de SiteProof software, het ontwerp en de documentatie berusten bij Webser.
2. De Klant krijgt een niet-exclusief, niet-overdraagbaar gebruiksrecht voor de duur van het abonnement.
3. Scan resultaten en rapporten gegenereerd voor de Klant zijn eigendom van de Klant.

## Artikel 9 — Privacy en gegevensverwerking

1. SiteProof verwerkt persoonsgegevens conform de AVG. Zie onze [Privacyverklaring](/privacy) voor details.
2. De Klant is zelf verantwoordelijk voor de inhoud van de websites die worden gescand.
3. SiteProof scant alleen publiek toegankelijke pagina's, tenzij de Klant inloggegevens verstrekt.

## Artikel 10 — Aansprakelijkheid

1. SiteProof is niet aansprakelijk voor indirecte schade, waaronder gevolgschade, gederfde winst of gemiste besparingen.
2. De totale aansprakelijkheid van SiteProof is beperkt tot het bedrag dat de Klant in de 12 maanden voorafgaand aan de schadeveroorzakende gebeurtenis aan SiteProof heeft betaald.
3. SiteProof is niet aansprakelijk voor boetes opgelegd aan de Klant door de ACM of andere toezichthouders als gevolg van niet-naleving van de EAA of WCAG-richtlijnen.

## Artikel 11 — Overmacht

1. In geval van overmacht is SiteProof niet gehouden tot het nakomen van verplichtingen.
2. Onder overmacht wordt verstaan: storingen bij hosting providers, internetproviders, energievoorziening, DDoS-aanvallen, en andere omstandigheden buiten de macht van SiteProof.

## Artikel 12 — Wijzigingen

1. SiteProof behoudt zich het recht voor deze voorwaarden te wijzigen.
2. Wijzigingen worden minimaal 30 dagen van tevoren per e-mail aangekondigd.
3. Bij substantiële wijzigingen heeft de Klant het recht om het abonnement kosteloos te beëindigen.

## Artikel 13 — Toepasselijk recht en geschillen

1. Op deze voorwaarden is Nederlands recht van toepassing.
2. Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement waar Webser is gevestigd.

## Contact

Vragen over deze voorwaarden? Neem contact op via info@siteproof.nl.
`;

export default async function VoorwaardenPage() {
  let content = fallbackContent;

  try {
    const page = await prisma.seoPage.findUnique({
      where: { slug: "voorwaarden" },
    });
    if (page?.content) {
      content = page.content;
    }
  } catch {
    // Database not available — use fallback
  }

  return <LegalPage title="Algemene Voorwaarden" content={content} />;
}
