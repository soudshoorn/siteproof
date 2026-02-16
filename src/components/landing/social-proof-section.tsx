import { nl } from "@/lib/i18n/nl";
import { Shield, Code, Globe } from "lucide-react";

const qualities = [
  {
    icon: Shield,
    title: "Legitieme scanner",
    description: "Gebaseerd op axe-core, de industriestandaard. Geen overlay, geen quick-fix — echte problemen, echte oplossingen.",
  },
  {
    icon: Code,
    title: "Gebouwd voor Nederland",
    description: "Alle resultaten in begrijpelijk Nederlands. Geen vertaaltools, maar handgeschreven uitleg die iedereen begrijpt.",
  },
  {
    icon: Globe,
    title: "EAA-ready",
    description: "Direct inzicht in je compliance-status voor de European Accessibility Act. Inclusief verklaring generator.",
  },
];

export function SocialProofSection() {
  return (
    <section className="border-t border-border/40 bg-card/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {nl.landing.socialProofTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            {nl.landing.socialProofText}
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {qualities.map((q) => {
            const Icon = q.icon;
            return (
              <div key={q.title} className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold">{q.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {q.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
