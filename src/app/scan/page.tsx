import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScanWidget } from "@/components/scan/scan-widget";
import { nl } from "@/lib/i18n/nl";
import { Shield, CheckCircle2, FileText, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Gratis WCAG Scan",
  description:
    "Scan je website gratis op WCAG 2.1 AA toegankelijkheid. Ontvang direct een rapport met score en concrete verbeterpunten in begrijpelijk Nederlands.",
  openGraph: {
    title: "Gratis WCAG Scan | SiteProof",
    description:
      "Test je website gratis op toegankelijkheid. Resultaten in begrijpelijk Nederlands.",
  },
};

const benefits = [
  {
    icon: Shield,
    title: "WCAG 2.1 AA",
    description: "Getest volgens de officiële richtlijnen die de EAA vereist.",
  },
  {
    icon: CheckCircle2,
    title: "Direct resultaat",
    description: "Binnen enkele seconden weet je hoe je website scoort.",
  },
  {
    icon: FileText,
    title: "Begrijpelijk Nederlands",
    description: "Geen technisch jargon — elke issue helder uitgelegd.",
  },
  {
    icon: TrendingUp,
    title: "Concrete fix-suggesties",
    description: "Weet precies wat je moet aanpassen en waarom.",
  },
];

export default function ScanPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        {/* Hero section */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {nl.scan.title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              {nl.scan.subtitle}
            </p>

            <div className="mt-10">
              <ScanWidget variant="hero" />
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Geen account nodig. Maximaal 3 gratis scans per dag.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="sr-only">Voordelen van de gratis scan</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <benefit.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA for full scan */}
        <section className="border-t border-border/40 bg-card/50 py-16">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">
              Wil je je hele website scannen?
            </h2>
            <p className="mt-3 text-muted-foreground">
              De gratis scan controleert 1 pagina. Met een account scan je tot
              500 pagina&apos;s, ontvang je monitoring, rapporten en voldoe je
              aan de EAA.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="/auth/register"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Gratis account aanmaken
              </a>
              <a
                href="/pricing"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 font-semibold transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Bekijk prijzen
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
