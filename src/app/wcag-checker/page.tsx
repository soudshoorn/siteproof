import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScanWidget } from "@/components/scan/scan-widget";
import {
  CheckCircle2,
  FileText,
  Globe,
  Shield,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Gratis WCAG Checker — Test je website op toegankelijkheid",
  description:
    "Scan je website gratis op WCAG 2.1 AA compliance. Ontvang direct een rapport met concrete verbeterpunten in begrijpelijk Nederlands. Geen account nodig.",
  openGraph: {
    title: "Gratis WCAG Checker — SiteProof",
    description:
      "Test je website op WCAG 2.1 AA compliance en ontvang een helder rapport in het Nederlands.",
  },
};

const features = [
  {
    icon: Shield,
    title: "WCAG 2.1 AA & 2.2 AA",
    description:
      "Onze scanner controleert op alle WCAG 2.1 AA en 2.2 AA succescriteria — de standaard die de European Accessibility Act (EAA) vereist.",
  },
  {
    icon: Globe,
    title: "Resultaten in begrijpelijk Nederlands",
    description:
      "Geen technisch jargon. Elke gevonden issue wordt uitgelegd in taal die iedereen begrijpt, met concrete stappen om het op te lossen.",
  },
  {
    icon: FileText,
    title: "Gedetailleerd rapport",
    description:
      "Ontvang een score per pagina, een overzicht van alle issues gesorteerd op ernst, en een EAA compliance status.",
  },
  {
    icon: CheckCircle2,
    title: "Gebouwd op axe-core",
    description:
      "Dezelfde betrouwbare engine die gebruikt wordt door Microsoft, Google en overheden wereldwijd. Geen overlay, geen quick-fix — echte tests.",
  },
];

const wcagPrinciples = [
  {
    title: "Waarneembaar",
    description:
      "Informatie en interface-componenten moeten presenteerbaar zijn op manieren die gebruikers kunnen waarnemen. Denk aan alt-teksten bij afbeeldingen, ondertiteling bij video's en voldoende kleurcontrast.",
    criteria: ["1.1 Tekst alternatieven", "1.2 Op tijd gebaseerde media", "1.3 Aanpasbaar", "1.4 Onderscheidbaar"],
  },
  {
    title: "Bedienbaar",
    description:
      "Interface-componenten en navigatie moeten bedienbaar zijn. Alle functionaliteit moet bereikbaar zijn via het toetsenbord, gebruikers moeten genoeg tijd krijgen, en navigatie moet logisch zijn.",
    criteria: ["2.1 Toetsenbord", "2.2 Genoeg tijd", "2.3 Epilepsie", "2.4 Navigeerbaar", "2.5 Invoermodaliteiten"],
  },
  {
    title: "Begrijpelijk",
    description:
      "Informatie en bediening van de interface moeten begrijpelijk zijn. Tekst moet leesbaar zijn, pagina's moeten voorspelbaar werken en gebruikers moeten geholpen worden bij het voorkomen van fouten.",
    criteria: ["3.1 Leesbaar", "3.2 Voorspelbaar", "3.3 Hulp bij invoer"],
  },
  {
    title: "Robuust",
    description:
      "Content moet robuust genoeg zijn om betrouwbaar geïnterpreteerd te worden door een breed scala aan user agents, inclusief hulptechnologieën zoals screenreaders.",
    criteria: ["4.1 Compatibel"],
  },
];

export default function WcagCheckerPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "WCAG Checker", href: "/wcag-checker" }]} />
      <WebPageJsonLd title="Gratis WCAG Checker" description="Scan je website gratis op WCAG 2.1 AA compliance." url="/wcag-checker" />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="border-b border-border/40 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Gratis WCAG Checker
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Test je website op WCAG 2.1 AA compliance en ontvang direct een
                rapport met concrete verbeterpunten — in begrijpelijk
                Nederlands. Geen account nodig.
              </p>
              <div className="mt-10">
                <ScanWidget variant="hero" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Maximaal 3 gratis scans per dag. Geen account nodig.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Wat controleert onze WCAG checker?
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border/50 bg-card/50 p-6"
                >
                  <feature.icon className="size-8 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WCAG Principles */}
        <section className="border-t border-border/40 bg-card/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                De 4 principes van WCAG
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                WCAG is opgebouwd rond vier principes. Onze scanner controleert
                criteria uit alle vier de categorieën.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {wcagPrinciples.map((principle, i) => (
                <div
                  key={principle.title}
                  className="rounded-xl border border-border/50 bg-card/50 p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <h3 className="text-lg font-semibold">{principle.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>
                  <ul className="mt-4 space-y-1">
                    {principle.criteria.map((c) => (
                      <li
                        key={c}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Difference with overlays */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-start gap-4 rounded-xl border border-severity-serious/20 bg-severity-serious/5 p-6">
                <AlertTriangle className="mt-1 size-6 shrink-0 text-severity-serious" />
                <div>
                  <h2 className="text-lg font-semibold">
                    Waarom geen overlay-tool?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Overlay-tools (zoals accessiBe of UserWay) beloven
                    automatische WCAG-compliance, maar werken niet. De FTC heeft
                    accessiBe beboet voor misleidende claims, en de
                    blindengemeenschap wijst ze actief af. Overlays verbergen
                    problemen in plaats van ze op te lossen.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    SiteProof gebruikt axe-core — dezelfde engine die Microsoft
                    en Google gebruiken — om echte problemen te vinden. Wij
                    helpen je ze te begrijpen en op te lossen, niet te verbergen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/40 bg-card/30 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Klaar om je hele website te scannen?
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              De gratis checker scant 1 pagina. Met een account scan je tot 500
              pagina&apos;s, stel je automatische monitoring in en ontvang je
              professionele PDF-rapporten.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  Gratis account aanmaken
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">Bekijk prijzen</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
