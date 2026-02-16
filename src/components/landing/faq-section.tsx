import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { nl } from "@/lib/i18n/nl";

export const faqs = [
  {
    question: "Wat is de European Accessibility Act (EAA)?",
    answer:
      "De European Accessibility Act (EAA) is een Europese richtlijn die sinds 28 juni 2025 van kracht is. De wet verplicht alle niet-micro-ondernemingen om hun digitale diensten — waaronder websites en apps — toegankelijk te maken voor mensen met een beperking. In Nederland wordt de wet gehandhaafd door de Autoriteit Consument & Markt (ACM), met boetes tot €900.000.",
  },
  {
    question: "Wat is het verschil tussen WCAG en de EAA?",
    answer:
      "WCAG (Web Content Accessibility Guidelines) zijn de technische richtlijnen voor toegankelijkheid. De EAA verwijst via de Europese norm EN 301 549 naar WCAG 2.1 niveau AA als de standaard waaraan websites moeten voldoen. SiteProof toetst op WCAG 2.1 AA en vertaalt dit naar EAA-compliance.",
  },
  {
    question: "Hoe werkt de scanner?",
    answer:
      "SiteProof crawlt je website met een headless browser (net als Google) en analyseert elke pagina met axe-core, de industriestandaard voor geautomatiseerde toegankelijkheidstests. Resultaten worden vertaald naar begrijpelijk Nederlands met concrete fix-suggesties. Het hele proces is geautomatiseerd — je hoeft alleen een URL in te voeren.",
  },
  {
    question: "Wat is het verschil met overlay-tools zoals accessiBe?",
    answer:
      "Overlay-tools voegen een JavaScript-widget toe aan je website die de onderliggende problemen niet oplost. De FTC heeft accessiBe beboet voor misleidende claims, en de blindengemeenschap wijst overlay-tools af. SiteProof is geen overlay — wij identificeren de problemen in je code zodat je ze écht kunt oplossen.",
  },
  {
    question: "Kan SiteProof alle toegankelijkheidsproblemen vinden?",
    answer:
      "Geautomatiseerde tools kunnen circa 30-40% van alle WCAG-criteria testen. Problemen zoals slechte alt-teksten, onduidelijke formulierlabels en ontbrekende skiplinks worden betrouwbaar gedetecteerd. Voor een volledige audit raden we aan ook handmatig te testen met screenreaders. SiteProof geeft je een sterke basis en continue monitoring.",
  },
  {
    question: "Moet mijn bedrijf voldoen aan de EAA?",
    answer:
      "Als je bedrijf geen micro-onderneming is (meer dan 10 werknemers of meer dan €2 miljoen omzet) en digitale diensten aanbiedt aan consumenten, dan moet je voldoen. Dit geldt voor webshops, SaaS-platforms, banken, verzekeraars, mediabedrijven en meer. Twijfel je? Scan je website gratis en zie waar je staat.",
  },
  {
    question: "Hoe vaak moet ik mijn website scannen?",
    answer:
      "We raden aan om minimaal wekelijks te scannen, en na elke significante wijziging aan je website. Nieuwe content, design-updates of functionaliteitswijzigingen kunnen nieuwe toegankelijkheidsproblemen introduceren. Met SiteProof kun je automatische scans instellen zodat je altijd op de hoogte bent.",
  },
];

export function FaqSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {nl.landing.faqTitle}
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
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
    </section>
  );
}
