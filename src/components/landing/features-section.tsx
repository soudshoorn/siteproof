import { nl } from "@/lib/i18n/nl";
import {
  Search,
  Languages,
  Bell,
  ShieldCheck,
  FileText,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: nl.landing.featureScanner,
    description: nl.landing.featureScannerDesc,
  },
  {
    icon: Languages,
    title: nl.landing.featureDutch,
    description: nl.landing.featureDutchDesc,
  },
  {
    icon: Bell,
    title: nl.landing.featureMonitoring,
    description: nl.landing.featureMonitoringDesc,
  },
  {
    icon: ShieldCheck,
    title: nl.landing.featureEaa,
    description: nl.landing.featureEaaDesc,
  },
  {
    icon: FileText,
    title: nl.landing.featureReports,
    description: nl.landing.featureReportsDesc,
  },
  {
    icon: TrendingUp,
    title: nl.landing.featureTrends,
    description: nl.landing.featureTrendsDesc,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {nl.landing.featuresTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Van scan tot fix, alles wat je nodig hebt om je website toegankelijk te maken en te houden.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-border/50 bg-card/30 p-6 transition-colors hover:border-primary/30 hover:bg-card/60"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
