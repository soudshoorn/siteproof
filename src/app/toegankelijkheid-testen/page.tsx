import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScanWidget } from "@/components/scan/scan-widget";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  Keyboard,
  MousePointerClick,
  MonitorSmartphone,
  Palette,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Website Toegankelijkheid Testen — Gratis WCAG Scan",
  description:
    "Test de toegankelijkheid van je website met onze gratis WCAG scanner. Ontdek problemen met contrast, toetsenbordnavigatie, alt-teksten en meer.",
  openGraph: {
    title: "Website Toegankelijkheid Testen — SiteProof",
    description:
      "Gratis toegankelijkheidstest voor je website. Resultaten in begrijpelijk Nederlands.",
  },
};

const testCategories = [
  {
    icon: Eye,
    title: "Visuele toegankelijkheid",
    description:
      "Kleurcontrast, tekstgrootte, focus-indicators en zichtbaarheid van interactieve elementen.",
    checks: [
      "Kleurcontrast minimaal 4.5:1 voor tekst",
      "Tekst schaalbaar tot 200% zonder informatieverlies",
      "Focus-indicator zichtbaar bij toetsenbordnavigatie",
      "Informatie niet alleen via kleur overgebracht",
    ],
  },
  {
    icon: Keyboard,
    title: "Toetsenbord navigatie",
    description:
      "Alle functionaliteit bereikbaar via het toetsenbord, logische tabvolgorde en geen toetsenbordfuiken.",
    checks: [
      "Alle knoppen en links bereikbaar met Tab",
      "Geen toetsenbordfuiken (keyboard traps)",
      "Logische tabvolgorde door de pagina",
      "Skip-links naar hoofdcontent",
    ],
  },
  {
    icon: Type,
    title: "Tekst en taal",
    description:
      "Correcte taalinstelling, leesbare koppen-hiërarchie en duidelijke linkteksten.",
    checks: [
      "HTML lang-attribuut ingesteld (bijv. lang=\"nl\")",
      "Logische koppen-hiërarchie (h1, h2, h3...)",
      "Beschrijvende linkteksten (niet \"klik hier\")",
      "Foutmeldingen bij formulieren",
    ],
  },
  {
    icon: MousePointerClick,
    title: "Interactieve elementen",
    description:
      "Formulieren met labels, knoppen met namen en correcte ARIA-attributen.",
    checks: [
      "Alle formuliervelden hebben een label",
      "Knoppen hebben een toegankelijke naam",
      "ARIA-attributen correct gebruikt",
      "Foutmeldingen gekoppeld aan het juiste veld",
    ],
  },
  {
    icon: Palette,
    title: "Afbeeldingen en media",
    description:
      "Alt-teksten bij afbeeldingen, ondertiteling bij video's en beschrijvingen van complexe visuele content.",
    checks: [
      "Alle informatieve afbeeldingen hebben een alt-tekst",
      "Decoratieve afbeeldingen hebben een lege alt (alt=\"\")",
      "Video's hebben ondertiteling",
      "Complexe diagrammen hebben een tekstalternatief",
    ],
  },
  {
    icon: MonitorSmartphone,
    title: "Responsief ontwerp",
    description:
      "Content werkt op alle schermformaten, zonder horizontaal scrollen en met aanpasbare tekstgrootte.",
    checks: [
      "Content leesbaar bij 320px breedte",
      "Geen horizontaal scrollen nodig",
      "Touch targets minimaal 44x44 pixels",
      "Oriëntatie niet beperkt tot landscape of portrait",
    ],
  },
];

export default function ToegankelijkheidTestenPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Toegankelijkheid Testen", href: "/toegankelijkheid-testen" }]} />
      <WebPageJsonLd title="Website Toegankelijkheid Testen" description="Test de toegankelijkheid van je website met onze gratis WCAG scanner." url="/toegankelijkheid-testen" />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="border-b border-border/40 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Website Toegankelijkheid Testen
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Test of je website bruikbaar is voor iedereen — inclusief mensen
                met een visuele, motorische of cognitieve beperking. Onze
                scanner controleert meer dan 90 WCAG-criteria automatisch.
              </p>
              <div className="mt-10">
                <ScanWidget variant="hero" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Gratis scan van 1 pagina. Geen account nodig.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What we test */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Wat testen wij?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base text-muted-foreground">
              Onze scanner controleert je website op 6 categorieën van
              toegankelijkheid, gebaseerd op WCAG 2.1 AA.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testCategories.map((cat) => (
                <div
                  key={cat.title}
                  className="rounded-xl border border-border/50 bg-card/50 p-6"
                >
                  <cat.icon className="size-7 text-primary" />
                  <h3 className="mt-3 text-lg font-semibold">{cat.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {cat.checks.map((check) => (
                      <li
                        key={check}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        {check}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why accessibility */}
        <section className="border-t border-border/40 bg-card/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
                Waarom is toegankelijkheid belangrijk?
              </h2>
              <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
                <p>
                  In Nederland hebben meer dan{" "}
                  <strong className="text-foreground">2 miljoen mensen</strong>{" "}
                  een functiebeperking die hun gebruik van websites beïnvloedt.
                  Denk aan slechtziendheid, kleurenblindheid, motorische
                  beperkingen, dyslexie of cognitieve aandoeningen.
                </p>
                <p>
                  Een toegankelijke website is niet alleen een wettelijke
                  verplichting (via de EAA), maar ook goed voor je bedrijf. Het
                  vergroot je bereik, verbetert je SEO, en zorgt voor een betere
                  gebruikservaring voor{" "}
                  <strong className="text-foreground">iedereen</strong>.
                </p>
                <p>
                  Bovendien worden veel toegankelijkheidsproblemen ook ervaren
                  door mensen zonder beperking: slechte leesbaarheid op mobiel,
                  onduidelijke formulieren, of content die niet werkt met
                  toetsenbordnavigatie.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Start je toegankelijkheidstest
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Voer je URL in en ontvang binnen enkele seconden een rapport met
              een score, gevonden problemen en concrete verbeterpunten.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/scan">
                  Gratis testen
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/eaa-compliance">Over de EAA</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
