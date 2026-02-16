import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScanWidget } from "@/components/scan/scan-widget";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Info,
  Scale,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Toegankelijkheidsverklaring Generator — Voldoe aan de EAA",
  description:
    "Genereer een toegankelijkheidsverklaring voor je website op basis van je WCAG scan resultaten. Verplicht onder de European Accessibility Act.",
  openGraph: {
    title: "Toegankelijkheidsverklaring Generator — SiteProof",
    description:
      "Genereer automatisch een toegankelijkheidsverklaring op basis van je scan resultaten.",
  },
};

const requiredSections = [
  {
    title: "Nalevingsstatus",
    description:
      "Of je website volledig, gedeeltelijk of niet voldoet aan WCAG 2.1 AA. Dit wordt automatisch bepaald op basis van je scan resultaten.",
  },
  {
    title: "Niet-toegankelijke content",
    description:
      "Een overzicht van bekende toegankelijkheidsproblemen, gegroepeerd per WCAG-criterium, met een toelichting waarom ze (nog) bestaan.",
  },
  {
    title: "Feedback en contactgegevens",
    description:
      "Hoe gebruikers problemen kunnen melden en hoe je binnen een redelijke termijn reageert op meldingen.",
  },
  {
    title: "Handhavingsprocedure",
    description:
      "Informatie over hoe gebruikers een klacht kunnen indienen bij de toezichthouder als je niet adequaat reageert.",
  },
  {
    title: "Datum van beoordeling",
    description:
      "Wanneer de verklaring voor het laatst is bijgewerkt en op basis van welke evaluatie (handmatig, geautomatiseerd of combinatie).",
  },
];

const steps = [
  {
    step: "1",
    title: "Scan je website",
    description:
      "Start een WCAG scan van je website. SiteProof controleert automatisch alle pagina's op meer dan 90 toegankelijkheidscriteria.",
  },
  {
    step: "2",
    title: "Bekijk je resultaten",
    description:
      "Ontvang een gedetailleerd rapport met je score, gevonden issues per WCAG-criterium en concrete verbeterpunten.",
  },
  {
    step: "3",
    title: "Genereer je verklaring",
    description:
      "Op basis van je scan resultaten genereert SiteProof automatisch een concept-toegankelijkheidsverklaring die je kunt aanpassen en publiceren.",
  },
  {
    step: "4",
    title: "Publiceer en monitor",
    description:
      "Publiceer de verklaring op je website en stel automatische scans in om je verklaring actueel te houden.",
  },
];

export default function ToegankelijkheidsverklaringPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Toegankelijkheidsverklaring", href: "/toegankelijkheidsverklaring" }]} />
      <WebPageJsonLd title="Toegankelijkheidsverklaring Generator" description="Genereer een toegankelijkheidsverklaring voor je website op basis van je WCAG scan resultaten." url="/toegankelijkheidsverklaring" />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="border-b border-border/40 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Toegankelijkheidsverklaring Generator
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Een toegankelijkheidsverklaring is verplicht onder de European
                Accessibility Act. SiteProof genereert er automatisch een op
                basis van je scan resultaten.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    Start met scannen
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/eaa-compliance">Over de EAA</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* What is it */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/50 p-6">
                <Info className="mt-1 size-6 shrink-0 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">
                    Wat is een toegankelijkheidsverklaring?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Een toegankelijkheidsverklaring is een publiek document op je
                    website waarin je beschrijft in hoeverre je website voldoet
                    aan de WCAG-richtlijnen. Het is vergelijkbaar met een
                    privacyverklaring, maar dan voor toegankelijkheid. Onder de
                    EAA is het verplicht voor alle organisaties die aan de wet
                    moeten voldoen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Required sections */}
        <section className="border-t border-border/40 bg-card/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Wat moet erin staan?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base text-muted-foreground">
              Een toegankelijkheidsverklaring moet minimaal de volgende
              onderdelen bevatten:
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {requiredSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-xl border border-border/50 bg-card/50 p-6"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-primary" />
                    <h3 className="font-semibold">{section.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Hoe werkt de generator?
            </h2>
            <div className="mt-12 mx-auto max-w-2xl space-y-8">
              {steps.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/40 bg-card/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Beschikbaar vanaf het Starter plan
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                De toegankelijkheidsverklaring generator is beschikbaar voor
                alle betaalde plannen. Het genereert een concept op basis van je
                laatste scan resultaten.
              </p>
              <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
                <div className="rounded-xl border border-border/50 bg-card/50 p-5">
                  <FileText className="size-6 text-primary" />
                  <h3 className="mt-3 font-semibold">Automatisch gegenereerd</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Op basis van je scan resultaten, altijd actueel.
                  </p>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-5">
                  <Scale className="size-6 text-primary" />
                  <h3 className="mt-3 font-semibold">EAA-conform</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bevat alle verplichte onderdelen conform de EAA.
                  </p>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-5">
                  <Shield className="size-6 text-primary" />
                  <h3 className="mt-3 font-semibold">Aanpasbaar</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pas de verklaring aan met je eigen contactgegevens en
                    toelichting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick scan CTA */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Begin met een gratis scan
            </h2>
            <p className="mt-4 text-center text-base text-muted-foreground">
              Ontdek hoe je website scoort op toegankelijkheid. Een gratis scan
              is de eerste stap naar een complete toegankelijkheidsverklaring.
            </p>
            <div className="mt-8">
              <ScanWidget variant="hero" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
