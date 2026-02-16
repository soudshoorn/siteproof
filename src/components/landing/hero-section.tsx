import { ScanWidget } from "@/components/scan/scan-widget";
import { nl } from "@/lib/i18n/nl";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 size-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 top-1/3 size-[400px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
        <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-xs font-medium">
          <Shield className="size-3 text-primary" />
          WCAG 2.1 AA &middot; European Accessibility Act
        </Badge>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          {nl.landing.heroTitle}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {nl.landing.heroSubtitle}
        </p>

        <div className="mx-auto mt-10 max-w-xl">
          <ScanWidget variant="hero" />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Geen account nodig &middot; Resultaat binnen 30 seconden &middot; 3 gratis scans per dag
        </p>
      </div>
    </section>
  );
}
