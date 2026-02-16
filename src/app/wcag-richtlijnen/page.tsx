import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScanWidget } from "@/components/scan/scan-widget";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  Hand,
  Brain,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "WCAG 2.1 Richtlijnen Uitgelegd — In begrijpelijk Nederlands",
  description:
    "Alle WCAG 2.1 richtlijnen uitgelegd in begrijpelijk Nederlands. Leer wat de succescriteria betekenen en hoe je eraan voldoet.",
  openGraph: {
    title: "WCAG 2.1 Richtlijnen Uitgelegd — SiteProof",
    description:
      "WCAG 2.1 succescriteria uitgelegd in begrijpelijk Nederlands. Van niveau A tot AAA.",
  },
};

const principles = [
  {
    icon: Eye,
    number: "1",
    title: "Waarneembaar",
    subtitle: "Informatie moet presenteerbaar zijn voor alle gebruikers",
    guidelines: [
      {
        id: "1.1",
        title: "Tekstalternatieven",
        description: "Bied tekstalternatieven voor alle niet-tekstuele content.",
        criteria: [
          { id: "1.1.1", title: "Niet-tekstuele content", level: "A", description: "Alle afbeeldingen, iconen en visuele elementen hebben een tekstalternatief (alt-tekst) dat hetzelfde doel dient." },
        ],
      },
      {
        id: "1.2",
        title: "Op tijd gebaseerde media",
        description: "Bied alternatieven voor op tijd gebaseerde media.",
        criteria: [
          { id: "1.2.1", title: "Alleen audio en alleen video", level: "A", description: "Bied een transcript of alternatief voor audio- en video-only content." },
          { id: "1.2.2", title: "Ondertiteling", level: "A", description: "Alle vooraf opgenomen video's hebben ondertiteling." },
          { id: "1.2.3", title: "Audiodescriptie", level: "A", description: "Bied audiodescriptie of een tekstalternatief voor video." },
          { id: "1.2.5", title: "Audiodescriptie (vooraf opgenomen)", level: "AA", description: "Bied audiodescriptie voor alle vooraf opgenomen video-content." },
        ],
      },
      {
        id: "1.3",
        title: "Aanpasbaar",
        description: "Maak content zo dat deze op verschillende manieren gepresenteerd kan worden.",
        criteria: [
          { id: "1.3.1", title: "Info en relaties", level: "A", description: "Informatie en relaties die visueel worden overgebracht zijn ook programmatisch beschikbaar (bijv. correcte HTML-structuur)." },
          { id: "1.3.2", title: "Betekenisvolle volgorde", level: "A", description: "De leesvolgorde van de content is logisch en programmatisch bepaalbaar." },
          { id: "1.3.3", title: "Zintuiglijke eigenschappen", level: "A", description: "Instructies zijn niet alleen afhankelijk van zintuiglijke eigenschappen zoals vorm, kleur of positie." },
          { id: "1.3.4", title: "Oriëntatie", level: "AA", description: "Content is niet beperkt tot één schermoriëntatie (landscape of portrait)." },
          { id: "1.3.5", title: "Identificeer invoerdoel", level: "AA", description: "Formuliervelden die persoonlijke informatie verzamelen hebben een autocomplete-attribuut." },
        ],
      },
      {
        id: "1.4",
        title: "Onderscheidbaar",
        description: "Maak het makkelijker voor gebruikers om content te zien en te horen.",
        criteria: [
          { id: "1.4.1", title: "Gebruik van kleur", level: "A", description: "Kleur wordt niet als enige visuele manier gebruikt om informatie over te brengen." },
          { id: "1.4.2", title: "Geluidsbediening", level: "A", description: "Als audio automatisch afspeelt, kan de gebruiker het pauzeren, stoppen of het volume aanpassen." },
          { id: "1.4.3", title: "Contrast (minimum)", level: "AA", description: "Tekst heeft een contrastverhouding van minimaal 4.5:1 (3:1 voor grote tekst)." },
          { id: "1.4.4", title: "Herschalen van tekst", level: "AA", description: "Tekst kan zonder hulptechnologie tot 200% worden vergroot zonder verlies van content of functionaliteit." },
          { id: "1.4.5", title: "Afbeeldingen van tekst", level: "AA", description: "Gebruik echte tekst in plaats van afbeeldingen van tekst waar mogelijk." },
          { id: "1.4.10", title: "Reflow", level: "AA", description: "Content past zich aan bij 320px breedte zonder horizontaal scrollen." },
          { id: "1.4.11", title: "Contrast niet-tekstueel", level: "AA", description: "Interface-componenten en grafische objecten hebben een contrastverhouding van minimaal 3:1." },
          { id: "1.4.12", title: "Tekstafstand", level: "AA", description: "Content blijft leesbaar als gebruikers de regelafstand, woordafstand en letterafstand aanpassen." },
          { id: "1.4.13", title: "Content bij hover of focus", level: "AA", description: "Extra content die verschijnt bij hover of focus kan gesloten worden en verdwijnt niet onverwacht." },
        ],
      },
    ],
  },
  {
    icon: Hand,
    number: "2",
    title: "Bedienbaar",
    subtitle: "Interface-componenten en navigatie moeten bedienbaar zijn",
    guidelines: [
      {
        id: "2.1",
        title: "Toetsenbord",
        description: "Alle functionaliteit is bereikbaar via het toetsenbord.",
        criteria: [
          { id: "2.1.1", title: "Toetsenbord", level: "A", description: "Alle functionaliteit is bereikbaar via het toetsenbord, zonder specifieke timing vereisten." },
          { id: "2.1.2", title: "Geen toetsenbordfuik", level: "A", description: "Toetsenbordfocus kan altijd weg bewogen worden van een component." },
          { id: "2.1.4", title: "Sneltoetsen", level: "A", description: "Als er sneltoetsen van één karakter zijn, kunnen deze uitgeschakeld of opnieuw toegewezen worden." },
        ],
      },
      {
        id: "2.4",
        title: "Navigeerbaar",
        description: "Help gebruikers navigeren en content vinden.",
        criteria: [
          { id: "2.4.1", title: "Blokken omzeilen", level: "A", description: "Bied een mechanisme om herhalende blokken content over te slaan (bijv. skip-links)." },
          { id: "2.4.2", title: "Paginatitel", level: "A", description: "Elke pagina heeft een beschrijvende titel." },
          { id: "2.4.3", title: "Focusvolgorde", level: "A", description: "Interactieve elementen krijgen focus in een logische volgorde." },
          { id: "2.4.4", title: "Linkdoel (in context)", level: "A", description: "Het doel van elke link is duidelijk uit de linktekst of de context." },
          { id: "2.4.5", title: "Meerdere manieren", level: "AA", description: "Er zijn meerdere manieren om een pagina te vinden (bijv. menu + zoekfunctie + sitemap)." },
          { id: "2.4.6", title: "Koppen en labels", level: "AA", description: "Koppen en labels beschrijven het onderwerp of doel." },
          { id: "2.4.7", title: "Focus zichtbaar", level: "AA", description: "De toetsenbordfocus is altijd visueel zichtbaar." },
        ],
      },
      {
        id: "2.5",
        title: "Invoermodaliteiten",
        description: "Maak functionaliteit bruikbaar met verschillende invoermethoden.",
        criteria: [
          { id: "2.5.1", title: "Aanwijzergebaren", level: "A", description: "Functionaliteit die meerpunts-gebaren gebruikt, is ook beschikbaar met een eenvoudige aanwijzer." },
          { id: "2.5.2", title: "Aanwijzerannulering", level: "A", description: "Functionaliteit die met een aanwijzer wordt bediend, kan geannuleerd worden." },
          { id: "2.5.3", title: "Label in naam", level: "A", description: "De zichtbare tekst van een component is onderdeel van de toegankelijke naam." },
          { id: "2.5.4", title: "Bewegingsactivering", level: "A", description: "Functionaliteit die door apparaatbeweging wordt geactiveerd, kan ook via interface-elementen bediend worden." },
        ],
      },
    ],
  },
  {
    icon: Brain,
    number: "3",
    title: "Begrijpelijk",
    subtitle: "Informatie en bediening moeten begrijpelijk zijn",
    guidelines: [
      {
        id: "3.1",
        title: "Leesbaar",
        description: "Maak tekst leesbaar en begrijpelijk.",
        criteria: [
          { id: "3.1.1", title: "Taal van de pagina", level: "A", description: "De taal van de pagina is programmatisch vastgesteld (bijv. lang=\"nl\")." },
          { id: "3.1.2", title: "Taal van onderdelen", level: "AA", description: "De taal van passages in een andere taal is programmatisch vastgesteld." },
        ],
      },
      {
        id: "3.2",
        title: "Voorspelbaar",
        description: "Webpagina's verschijnen en werken op een voorspelbare manier.",
        criteria: [
          { id: "3.2.1", title: "Bij focus", level: "A", description: "Het ontvangen van focus leidt niet tot onverwachte contextwisselingen." },
          { id: "3.2.2", title: "Bij invoer", level: "A", description: "Het wijzigen van een instelling leidt niet tot onverwachte contextwisselingen, tenzij de gebruiker van tevoren geïnformeerd is." },
          { id: "3.2.3", title: "Consistente navigatie", level: "AA", description: "Navigatiemechanismen verschijnen in dezelfde volgorde op meerdere pagina's." },
          { id: "3.2.4", title: "Consistente identificatie", level: "AA", description: "Componenten met dezelfde functionaliteit worden consistent geïdentificeerd." },
        ],
      },
      {
        id: "3.3",
        title: "Hulp bij invoer",
        description: "Help gebruikers fouten te voorkomen en te corrigeren.",
        criteria: [
          { id: "3.3.1", title: "Foutidentificatie", level: "A", description: "Invoerfouten worden automatisch gedetecteerd en beschreven aan de gebruiker in tekst." },
          { id: "3.3.2", title: "Labels of instructies", level: "A", description: "Labels of instructies worden geboden wanneer content invoer van de gebruiker vereist." },
          { id: "3.3.3", title: "Foutsuggestie", level: "AA", description: "Als een invoerfout automatisch wordt gedetecteerd, worden suggesties geboden om de fout te corrigeren." },
          { id: "3.3.4", title: "Foutpreventie (juridisch, financieel)", level: "AA", description: "Bij pagina's met juridische of financiële gevolgen kunnen acties ongedaan gemaakt, gecontroleerd of bevestigd worden." },
        ],
      },
    ],
  },
  {
    icon: Cpu,
    number: "4",
    title: "Robuust",
    subtitle: "Content moet betrouwbaar interpreteerbaar zijn door hulptechnologieën",
    guidelines: [
      {
        id: "4.1",
        title: "Compatibel",
        description: "Maximaliseer compatibiliteit met huidige en toekomstige hulptechnologieën.",
        criteria: [
          { id: "4.1.2", title: "Naam, rol, waarde", level: "A", description: "Alle interface-componenten hebben een naam en rol die programmatisch vastgesteld kunnen worden. Staten en waarden zijn instelbaar." },
          { id: "4.1.3", title: "Statusberichten", level: "AA", description: "Statusberichten (zoals succesboodschappen) worden programmatisch aangeboden aan hulptechnologieën zonder dat ze de focus krijgen." },
        ],
      },
    ],
  },
];

const levelInfo = [
  {
    level: "A",
    title: "Niveau A — Basis",
    description: "Het minimale niveau van toegankelijkheid. Zonder niveau A is een website voor veel gebruikers met een beperking onbruikbaar.",
  },
  {
    level: "AA",
    title: "Niveau AA — Standaard (EAA-vereiste)",
    description: "Het niveau dat de EAA vereist. Omvat niveau A plus aanvullende criteria voor contrast, navigatie en invoerhulp.",
  },
  {
    level: "AAA",
    title: "Niveau AAA — Uitgebreid",
    description: "Het hoogste niveau. Niet vereist door de EAA, maar aanbevolen waar mogelijk. SiteProof zelf streeft naar AAA.",
  },
];

export default function WcagRichtlijnenPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "WCAG Richtlijnen", href: "/wcag-richtlijnen" }]} />
      <WebPageJsonLd title="WCAG 2.1 Richtlijnen Uitgelegd" description="Alle WCAG 2.1 richtlijnen uitgelegd in begrijpelijk Nederlands." url="/wcag-richtlijnen" />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="border-b border-border/40 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                WCAG 2.1 Richtlijnen
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Alle WCAG 2.1 succescriteria tot en met niveau AA uitgelegd in
                begrijpelijk Nederlands. Dit zijn de criteria die de European
                Accessibility Act vereist.
              </p>
            </div>
          </div>
        </section>

        {/* Conformance levels */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Conformiteitsniveaus
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {levelInfo.map((info) => (
                <div
                  key={info.level}
                  className="rounded-xl border border-border/50 bg-card/50 p-6"
                >
                  <Badge
                    variant={info.level === "AA" ? "default" : "outline"}
                    className="mb-3"
                  >
                    Niveau {info.level}
                  </Badge>
                  <h3 className="font-semibold">{info.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {info.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All criteria */}
        <section className="border-t border-border/40 bg-card/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Alle succescriteria
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base text-muted-foreground">
              WCAG 2.1 is opgebouwd rond 4 principes, 13 richtlijnen en 50
              succescriteria op niveau A en AA.
            </p>

            <div className="mt-12 space-y-16">
              {principles.map((principle) => (
                <div key={principle.number}>
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <principle.icon className="size-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {principle.number}. {principle.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {principle.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-8">
                    {principle.guidelines.map((guideline) => (
                      <div key={guideline.id}>
                        <h4 className="text-lg font-semibold">
                          {guideline.id} {guideline.title}
                        </h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {guideline.description}
                        </p>
                        <ul className="mt-4 space-y-3">
                          {guideline.criteria.map((criterion) => (
                            <li
                              key={criterion.id}
                              className="rounded-lg border border-border/50 bg-card/50 p-4"
                            >
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                <span className="font-medium">
                                  {criterion.id} {criterion.title}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {criterion.level}
                                </Badge>
                              </div>
                              <p className="mt-2 pl-6 text-sm leading-relaxed text-muted-foreground">
                                {criterion.description}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Test je website op WCAG 2.1 AA
            </h2>
            <p className="mt-4 text-center text-base text-muted-foreground">
              Onze scanner controleert automatisch op alle bovenstaande criteria
              en geeft concrete verbeterpunten — in begrijpelijk Nederlands.
            </p>
            <div className="mt-8">
              <ScanWidget variant="hero" />
            </div>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/eaa-compliance">
                  Over de EAA
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/toegankelijkheidsverklaring">
                  Verklaring generator
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
