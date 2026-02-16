"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { nl } from "@/lib/i18n/nl";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

const tiers = [
  {
    key: "FREE",
    name: "Gratis",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect om te beginnen",
    cta: nl.common.startFreeTrial,
    href: "/auth/register",
    popular: false,
    features: [
      { label: `1 ${nl.pricing.websites.toLowerCase()}`, included: true },
      { label: `5 ${nl.pricing.pagesPerScan.toLowerCase()}`, included: true },
      { label: nl.pricing.monthlyFreq, included: true },
      { label: nl.pricing.basic + " rapportage", included: true },
      { label: nl.pricing.emailAlerts, included: false },
      { label: nl.pricing.eaaStatement, included: false },
      { label: nl.pricing.trendAnalysis, included: false },
    ],
  },
  {
    key: "STARTER",
    name: "Starter",
    monthlyPrice: 49,
    yearlyPrice: 408,
    description: "Voor kleine websites",
    cta: nl.pricing.choosePlan,
    href: "/auth/register?plan=starter",
    popular: false,
    features: [
      { label: `3 ${nl.pricing.websites.toLowerCase()}`, included: true },
      { label: `100 ${nl.pricing.pagesPerScan.toLowerCase()}`, included: true },
      { label: nl.pricing.weekly, included: true },
      { label: nl.pricing.pdfExport, included: true },
      { label: nl.pricing.emailAlerts, included: true },
      { label: nl.pricing.eaaStatement, included: true },
      { label: nl.pricing.trendAnalysis, included: true },
    ],
  },
  {
    key: "PROFESSIONAL",
    name: "Professional",
    monthlyPrice: 149,
    yearlyPrice: 1242,
    description: "Voor serieuze websites",
    cta: nl.pricing.choosePlan,
    href: "/auth/register?plan=professional",
    popular: true,
    features: [
      { label: `10 ${nl.pricing.websites.toLowerCase()}`, included: true },
      { label: `500 ${nl.pricing.pagesPerScan.toLowerCase()}`, included: true },
      { label: nl.pricing.daily, included: true },
      { label: nl.pricing.pdfWhiteLabel, included: true },
      { label: nl.pricing.emailAlerts, included: true },
      { label: nl.pricing.eaaStatement, included: true },
      { label: nl.pricing.prioritySupport, included: true },
    ],
  },
  {
    key: "BUREAU",
    name: "Bureau",
    monthlyPrice: 299,
    yearlyPrice: 2492,
    description: "Voor web-bureaus",
    cta: nl.pricing.choosePlan,
    href: "/auth/register?plan=bureau",
    popular: false,
    features: [
      { label: `50 ${nl.pricing.websites.toLowerCase()}`, included: true },
      { label: `500 ${nl.pricing.pagesPerScan.toLowerCase()}`, included: true },
      { label: nl.pricing.daily, included: true },
      { label: nl.pricing.pdfWhiteLabelApi, included: true },
      { label: nl.pricing.emailAlerts, included: true },
      { label: nl.pricing.apiAccess, included: true },
      { label: `${nl.pricing.unlimited} teamleden`, included: true },
    ],
  },
];

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="border-t border-border/40 bg-card/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {nl.landing.pricingTitle}
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            {nl.landing.pricingSubtitle}
          </p>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={cn("text-sm", !yearly ? "font-medium" : "text-muted-foreground")}>
              {nl.pricing.monthly}
            </span>
            <Switch
              checked={yearly}
              onCheckedChange={setYearly}
              aria-label="Schakel tussen maandelijks en jaarlijks"
            />
            <span className={cn("text-sm", yearly ? "font-medium" : "text-muted-foreground")}>
              {nl.pricing.yearly}
            </span>
            {yearly && (
              <Badge variant="secondary" className="text-xs">
                {nl.pricing.yearlyDiscount}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {tiers.map((tier) => {
            const price = yearly
              ? Math.round(tier.yearlyPrice / 12)
              : tier.monthlyPrice;

            return (
              <div
                key={tier.key}
                className={cn(
                  "relative flex flex-col rounded-xl border p-6",
                  tier.popular
                    ? "border-primary bg-card shadow-lg shadow-primary/5"
                    : "border-border/50 bg-card/50"
                )}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3">
                    {nl.common.popular}
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    {price === 0 ? (
                      <span className="text-3xl font-bold">{nl.common.free}</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">&euro;{price}</span>
                        <span className="text-sm text-muted-foreground">
                          {nl.common.perMonth}
                        </span>
                      </>
                    )}
                  </div>
                  {yearly && price > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      &euro;{tier.yearlyPrice}{nl.common.perYear} gefactureerd
                    </p>
                  )}
                </div>

                <ul className="mb-6 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-2.5 text-sm">
                      {feature.included ? (
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      ) : (
                        <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground/60"}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.popular ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
