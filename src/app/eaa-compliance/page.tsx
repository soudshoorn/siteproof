import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScanWidget } from "@/components/scan/scan-widget";
import {
  Scale,
  AlertTriangle,
  Building2,
  CalendarCheck,
  Euro,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "European Accessibility Act (EAA) — Voldoet jouw bedrijf?",
  description:
    "De European Accessibility Act is sinds 28 juni 2025 van kracht. Controleer of jouw website voldoet aan de EAA en WCAG 2.1 AA. Boetes tot €900.000 via de ACM.",
  openGraph: {
    title: "EAA Compliance Check — SiteProof",
    description:
      "De EAA is van kracht. Scan je website op compliance en voorkom boetes tot €900.000.",
  },
};

const timeline = [
  {
    date: "23 september 2020",
    title: "Richtlijn omgezet in Nederlandse wet",
    description:
      "De Europese richtlijn (EU) 2019/882 is omgezet in het Besluit digitale toegankelijkheid.",
  },
  {
    date: "28 juni 2025",
    title: "EAA treedt in werking",
    description:
      "Alle niet-micro-ondernemingen moeten hun digitale diensten toegankelijk maken conform WCAG 2.1 AA (via EN 301 549).",
  },
  {
    date: "Na inwerkingtreding",
    title: "ACM handhaaft",
    description:
      "De Autoriteit Consument & Markt (ACM) houdt toezicht en kan boetes opleggen tot €900.000 per overtreding.",
  },
];

const mustComply = [
  "Webshops en e-commerce platforms",
  "Bankieren en financiële dienstverlening",
  "Telecommunicatie en telecomdiensten",
  "E-boeken en e-readers",
  "Vervoersdiensten (vlieg-, trein-, bus- en boottickets)",
  "Digitale overheidsdiensten",
];

const exempt = [
  "Micro-ondernemingen (< 10 werknemers én < €2 miljoen omzet)",
  "Content van derden waar je geen controle over hebt",
  "Gearchiveerde content (gepubliceerd vóór 28 juni 2025, niet meer bijgewerkt)",
];

export default function EaaCompliancePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "EAA Compliance", href: "/eaa-compliance" }]} />
      <WebPageJsonLd title="European Accessibility Act (EAA)" description="De EAA verplicht alle niet-micro-ondernemingen hun digitale diensten toegankelijk te maken. Controleer of jouw website voldoet." url="/eaa-compliance" />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="border-b border-border/40 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-severity-serious/30 bg-severity-serious/10 px-4 py-1.5 text-sm font-medium text-severity-serious">
                <Scale className="size-4" />
                Wetgeving van kracht sinds 28 juni 2025
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                European Accessibility Act
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                De EAA verplicht alle niet-micro-ondernemingen hun digitale
                diensten toegankelijk te maken conform WCAG 2.1 AA. De ACM kan
                boetes opleggen tot{" "}
                <strong className="text-foreground">€900.000</strong>.
              </p>
              <div className="mt-10">
                <ScanWidget variant="hero" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Controleer gratis of jouw website voldoet aan de EAA.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Tijdlijn van de EAA
            </h2>
            <div className="mt-12 mx-auto max-w-2xl space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/10">
                      <CalendarCheck className="size-5 text-primary" />
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="mt-2 h-full w-px bg-border" />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className="text-sm font-medium text-primary">
                      {item.date}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who must comply */}
        <section className="border-t border-border/40 bg-card/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Voor wie geldt de EAA?
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {/* Must comply */}
              <div className="rounded-xl border border-border/50 bg-card/50 p-6">
                <div className="flex items-center gap-3">
                  <Building2 className="size-6 text-primary" />
                  <h3 className="text-lg font-semibold">Moet voldoen</h3>
                </div>
                <ul className="mt-4 space-y-3">
                  {mustComply.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exempt */}
              <div className="rounded-xl border border-border/50 bg-card/50 p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="size-6 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Uitgezonderd</h3>
                </div>
                <ul className="mt-4 space-y-3">
                  {exempt.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Consequences */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-xl border border-severity-critical/20 bg-severity-critical/5 p-6">
                <div className="flex items-start gap-4">
                  <Euro className="mt-1 size-6 shrink-0 text-severity-critical" />
                  <div>
                    <h2 className="text-lg font-semibold">
                      Wat zijn de gevolgen van niet-naleving?
                    </h2>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-severity-critical" />
                        Boetes tot €900.000 per overtreding via de ACM
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-severity-critical" />
                        Last onder dwangsom om aanpassingen af te dwingen
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-severity-critical" />
                        Reputatieschade en verlies van klantvertrouwen
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-severity-critical" />
                        Discriminatieklachten via het College voor de Rechten van de Mens
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WCAG connection */}
        <section className="border-t border-border/40 bg-card/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                EAA, EN 301 549 en WCAG — hoe zit dat?
              </h2>
              <div className="mt-8 space-y-4 text-left text-sm leading-relaxed text-muted-foreground">
                <p>
                  De <strong className="text-foreground">European Accessibility Act (EAA)</strong> is
                  de Europese richtlijn die lidstaten verplicht toegankelijkheidsregels
                  op te stellen. In Nederland is deze omgezet in het Besluit
                  digitale toegankelijkheid.
                </p>
                <p>
                  De technische standaard die de EAA hanteert is{" "}
                  <strong className="text-foreground">EN 301 549</strong>, de
                  Europese norm voor ICT-toegankelijkheid. Deze norm verwijst op
                  zijn beurt naar{" "}
                  <strong className="text-foreground">WCAG 2.1 AA</strong> als
                  de standaard voor webtoegankelijkheid.
                </p>
                <p>
                  Kort gezegd: als je website voldoet aan{" "}
                  <strong className="text-foreground">WCAG 2.1 niveau AA</strong>,
                  voldoe je aan de technische eisen van de EAA. Dat is precies
                  wat SiteProof voor je controleert.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Controleer je EAA compliance
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Scan je website gratis en ontdek of je voldoet aan de EAA. Ontvang
              een helder rapport met concrete verbeterpunten in begrijpelijk
              Nederlands.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/scan">
                  Gratis EAA check
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/wcag-checker">WCAG Checker</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
