import { nl } from "@/lib/i18n/nl";
import { AlertTriangle, Scale, Euro } from "lucide-react";

const stats = [
  {
    icon: Scale,
    value: "28 juni 2025",
    label: "EAA van kracht",
    description: "Alle digitale diensten moeten toegankelijk zijn",
  },
  {
    icon: AlertTriangle,
    value: "WCAG 2.1 AA",
    label: "Verplichte standaard",
    description: "Via de Europese norm EN 301 549",
  },
  {
    icon: Euro,
    value: "€900.000",
    label: "Maximale boete",
    description: "Opgelegd door de ACM bij niet-naleving",
  },
];

export function UrgencySection() {
  return (
    <section className="border-y border-border/40 bg-card/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {nl.landing.urgencyTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            {nl.landing.urgencyText}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm"
              >
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-primary">{stat.label}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
