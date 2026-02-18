"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { nl } from "@/lib/i18n/nl";
import { cn } from "@/lib/utils";
import { trackEventFromClient } from "@/lib/analytics-client";
import { Check, X, Minus } from "lucide-react";

const tiers = [
  {
    key: "FREE",
    name: "Gratis",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect om te beginnen",
    popular: false,
    features: [
      { label: `1 ${nl.pricing.websites.toLowerCase()}`, included: true },
      { label: `5 ${nl.pricing.pagesPerScan.toLowerCase()}`, included: true },
      { label: "Handmatig scannen", included: true },
      { label: "Basis rapportage", included: true },
      { label: "3 fix-suggesties per scan", included: true },
      { label: nl.pricing.emailAlerts, included: false },
      { label: nl.pricing.trendAnalysis, included: false },
      { label: nl.pricing.pdfExport, included: false },
    ],
  },
  {
    key: "STARTER",
    name: "Starter",
    monthlyPrice: 49,
    yearlyPrice: 408,
    description: "Voor kleine websites",
    popular: false,
    features: [
      { label: `3 ${nl.pricing.websites.toLowerCase()}`, included: true },
      { label: `100 ${nl.pricing.pagesPerScan.toLowerCase()}`, included: true },
      { label: nl.pricing.weekly, included: true },
      { label: nl.pricing.pdfExport, included: true },
      { label: "Alle fix-suggesties", included: true },
      { label: nl.pricing.emailAlerts, included: true },
      { label: nl.pricing.trendAnalysis, included: true },
      { label: "EAA compliance %", included: true },
    ],
  },
  {
    key: "PROFESSIONAL",
    name: "Professional",
    monthlyPrice: 149,
    yearlyPrice: 1242,
    description: "Voor serieuze websites",
    popular: true,
    features: [
      { label: `10 ${nl.pricing.websites.toLowerCase()}`, included: true },
      { label: `500 ${nl.pricing.pagesPerScan.toLowerCase()}`, included: true },
      { label: nl.pricing.daily, included: true },
      { label: "PDF + white-label", included: true },
      { label: "Alle fix-suggesties", included: true },
      { label: nl.pricing.emailAlerts, included: true },
      { label: "EAA verklaring generator", included: true },
      { label: nl.pricing.prioritySupport, included: true },
    ],
  },
  {
    key: "BUREAU",
    name: "Bureau",
    monthlyPrice: 299,
    yearlyPrice: 2492,
    description: "Voor web-bureaus",
    popular: false,
    features: [
      { label: `50 ${nl.pricing.websites.toLowerCase()}`, included: true },
      { label: `500 ${nl.pricing.pagesPerScan.toLowerCase()}`, included: true },
      { label: nl.pricing.daily, included: true },
      { label: "PDF + white-label", included: true },
      { label: "Alle fix-suggesties", included: true },
      { label: `${nl.pricing.unlimited} teamleden`, included: true },
      { label: nl.pricing.apiAccess, included: true },
      { label: "Client dashboards", included: true },
    ],
  },
];

// Feature comparison table rows
const comparisonFeatures: {
  label: string;
  free: string | boolean;
  starter: string | boolean;
  professional: string | boolean;
  bureau: string | boolean;
}[] = [
  { label: "Websites", free: "1", starter: "3", professional: "10", bureau: "50" },
  { label: "Pagina's per scan", free: "5", starter: "100", professional: "500", bureau: "500" },
  { label: "Scan frequentie", free: "Handmatig", starter: "Wekelijks", professional: "Dagelijks", bureau: "Dagelijks" },
  { label: "Fix-suggesties", free: "3 per scan", starter: "Onbeperkt", professional: "Onbeperkt", bureau: "Onbeperkt" },
  { label: "Scan historie", free: "30 dagen", starter: "Onbeperkt", professional: "Onbeperkt", bureau: "Onbeperkt" },
  { label: "PDF rapport", free: false, starter: true, professional: true, bureau: true },
  { label: "White-label PDF", free: false, starter: false, professional: true, bureau: true },
  { label: "E-mail alerts", free: false, starter: true, professional: true, bureau: true },
  { label: "Trend analyse", free: false, starter: true, professional: true, bureau: true },
  { label: "EAA compliance %", free: false, starter: true, professional: true, bureau: true },
  { label: "EAA verklaring generator", free: false, starter: false, professional: true, bureau: true },
  { label: "Teamleden", free: "1", starter: "2", professional: "5", bureau: "Onbeperkt" },
  { label: "Priority support", free: false, starter: false, professional: true, bureau: true },
  { label: "API toegang", free: false, starter: false, professional: false, bureau: true },
];

const pricingFaqs = [
  {
    question: "Kan ik op elk moment opzeggen?",
    answer:
      "Ja, per direct. Je houdt toegang tot het einde van je betaalperiode. Er zijn geen opzegkosten.",
  },
  {
    question: "Wat als ik meer websites nodig heb?",
    answer:
      "Upgrade naar een hoger plan of neem contact op voor maatwerk. We denken graag mee.",
  },
  {
    question: "Is er een proefperiode?",
    answer:
      "Je kunt altijd gratis starten met 1 website en 5 pagina's. Upgrade wanneer je klaar bent — geen creditcard nodig.",
  },
  {
    question: "Hoe werkt de betaling?",
    answer:
      "Via iDEAL, creditcard of SEPA automatische incasso. Veilig via Mollie, de Nederlandse betaalstandaard.",
  },
  {
    question: "Voldoet SiteProof zelf aan de WCAG?",
    answer:
      "Ja, onze website is gebouwd conform WCAG 2.1 AAA. Wij geven het voorbeeld.",
  },
  {
    question: "Wat is het verschil met gratis tools zoals WAVE?",
    answer:
      "Gratis tools zijn technisch en scannen maar 1 pagina per keer. SiteProof crawlt je hele website, vertaalt alles naar begrijpelijk Nederlands, en monitort automatisch. Perfect voor ondernemers die geen developer zijn.",
  },
];

function getTierHref(tierKey: string, isLoggedIn: boolean, yearly: boolean): string {
  const planSlug = tierKey.toLowerCase();
  const intervalParam = yearly ? "&interval=yearly" : "";

  if (tierKey === "FREE") {
    return isLoggedIn ? "/dashboard" : "/auth/register";
  }

  if (isLoggedIn) {
    return `/dashboard/settings/billing?upgrade=${planSlug}${intervalParam}`;
  }

  return `/auth/register?plan=${planSlug}${yearly ? "&interval=yearly" : ""}`;
}

function getTierCta(tierKey: string, isLoggedIn: boolean): string {
  if (tierKey === "FREE") {
    return isLoggedIn ? "Huidig plan" : nl.common.startFreeTrial;
  }
  return nl.pricing.choosePlan;
}

function ComparisonCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto size-4 text-primary" />;
  if (value === false) return <Minus className="mx-auto size-4 text-muted-foreground/40" />;
  return <span className="text-sm">{value}</span>;
}

export function PricingSection({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [yearly, setYearly] = useState(true);

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

        {/* Pricing cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {tiers.map((tier) => {
            const price = yearly
              ? Math.round(tier.yearlyPrice / 12)
              : tier.monthlyPrice;
            const href = getTierHref(tier.key, isLoggedIn, yearly);
            const cta = getTierCta(tier.key, isLoggedIn);

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
                      <span className={cn(
                        feature.included ? "" : "text-muted-foreground/60"
                      )}>
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
                  <Link
                    href={href}
                    onClick={() => {
                      if (tier.key !== "FREE") {
                        trackEventFromClient("upgrade_clicked", {
                          plan: tier.key,
                          interval: yearly ? "yearly" : "monthly",
                        });
                      }
                    }}
                  >
                    {cta}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div className="mt-20">
          <h3 className="mb-8 text-center text-xl font-bold">
            Vergelijk alle functies
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="pb-4 pr-4 text-left font-medium text-muted-foreground">Functie</th>
                  <th className="pb-4 px-4 text-center font-medium">Gratis</th>
                  <th className="pb-4 px-4 text-center font-medium">Starter</th>
                  <th className="pb-4 px-4 text-center font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      Professional
                      <Badge className="px-1.5 py-0 text-[10px]">Populair</Badge>
                    </span>
                  </th>
                  <th className="pb-4 pl-4 text-center font-medium">Bureau</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {comparisonFeatures.map((row) => (
                  <tr key={row.label} className="hover:bg-muted/20">
                    <td className="py-3 pr-4 font-medium">{row.label}</td>
                    <td className="py-3 px-4 text-center">
                      <ComparisonCell value={row.free} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <ComparisonCell value={row.starter} />
                    </td>
                    <td className="py-3 px-4 text-center bg-primary/[0.02]">
                      <ComparisonCell value={row.professional} />
                    </td>
                    <td className="py-3 pl-4 text-center">
                      <ComparisonCell value={row.bureau} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing FAQ */}
        <div className="mx-auto mt-20 max-w-3xl">
          <h3 className="mb-8 text-center text-xl font-bold">
            Veelgestelde vragen over prijzen
          </h3>
          <Accordion type="single" collapsible>
            {pricingFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`pricing-faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
