"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, TrendingUp, FileDown, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEventFromClient } from "@/lib/analytics-client";

interface UpgradeBannerProps {
  feature: "fixSuggestions" | "pdf" | "trend" | "eaa" | "scheduledScans" | "generic";
  plan?: string;
  count?: number;
  className?: string;
  inline?: boolean;
}

const featureConfig = {
  fixSuggestions: {
    icon: Sparkles,
    title: "Fix-suggesties voor alle issues",
    description: "Upgrade naar Starter om de fix-suggestie voor alle issues te zien.",
    cta: "Bekijk Starter plan",
  },
  pdf: {
    icon: FileDown,
    title: "PDF export",
    description: "Exporteer je scanresultaten als professioneel PDF-rapport.",
    cta: "Beschikbaar vanaf Starter",
  },
  trend: {
    icon: TrendingUp,
    title: "Volg je score over tijd",
    description: "Bekijk hoe je toegankelijkheidsscore zich ontwikkelt.",
    cta: "Beschikbaar vanaf Starter",
  },
  eaa: {
    icon: ShieldCheck,
    title: "EAA Toegankelijkheidsverklaring",
    description: "Genereer een officiële toegankelijkheidsverklaring voor je website.",
    cta: "Beschikbaar vanaf Professional",
  },
  scheduledScans: {
    icon: Sparkles,
    title: "Automatische scans",
    description: "Laat je website automatisch scannen op een vast schema.",
    cta: "Beschikbaar vanaf Starter",
  },
  generic: {
    icon: Lock,
    title: "Upgrade je plan",
    description: "Ontgrendel meer functies met een betaald plan.",
    cta: "Bekijk plannen",
  },
};

export function UpgradeBanner({ feature, plan, count, className, inline = false }: UpgradeBannerProps) {
  const config = featureConfig[feature];
  const Icon = config.icon;

  if (inline) {
    return (
      <div className={cn(
        "flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3",
        className
      )}>
        <Sparkles className="size-4 shrink-0 text-primary" />
        <p className="flex-1 text-sm text-muted-foreground">
          {count != null ? (
            <>De overige <strong>{count}</strong> fix-suggesties zijn beschikbaar in het <strong>Starter</strong> plan.</>
          ) : (
            <>{config.description}</>
          )}
        </p>
        <Button variant="link" size="sm" className="shrink-0 px-0 text-primary" asChild>
          <Link href="/pricing" onClick={() => trackEventFromClient("upgrade_clicked", { feature, source: "inline_banner" })}>
            {plan ? `Upgrade naar ${plan}` : "Upgrade"}
            <ArrowRight className="ml-1 size-3" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-6 text-center",
      className
    )}>
      <Icon className="mx-auto size-8 text-primary" />
      <h3 className="mt-3 text-base font-semibold">{config.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
      <Button size="sm" className="mt-4" asChild>
        <Link href="/pricing" onClick={() => trackEventFromClient("upgrade_clicked", { feature, source: "banner" })}>
          {config.cta}
          <ArrowRight className="ml-1 size-3" />
        </Link>
      </Button>
    </div>
  );
}

export function UpgradeInlineHint({
  text,
  plan = "Starter",
  className,
}: {
  text: string;
  plan?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-md border border-primary/15 bg-primary/5 px-3 py-2 text-sm",
      className
    )}>
      <Lock className="size-3.5 shrink-0 text-primary" />
      <span className="text-muted-foreground">{text}</span>
      <Link
        href="/pricing"
        className="ml-auto shrink-0 text-xs font-medium text-primary hover:underline"
        onClick={() => trackEventFromClient("upgrade_clicked", { source: "inline_hint" })}
      >
        Upgrade naar {plan}
      </Link>
    </div>
  );
}
