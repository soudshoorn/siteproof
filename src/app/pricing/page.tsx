import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FaqSection, faqs } from "@/components/landing/faq-section";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Prijzen — Kies het plan dat bij je past",
  description:
    "Start gratis met 1 website en 5 pagina's. Upgrade naar Starter (€49/mo), Professional (€149/mo) of Bureau (€299/mo) voor meer websites, dagelijkse scans en PDF rapporten.",
  openGraph: {
    title: "SiteProof Prijzen — Toegankelijkheidscans vanaf €0",
    description:
      "Betaalbare WCAG-scans voor het Nederlandse MKB. Start gratis, upgrade wanneer je klaar bent.",
  },
};

export default function PricingPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Prijzen", href: "/pricing" }]} />
      <FaqJsonLd questions={faqs} />
      <Header />
      <main id="main-content">
        <div className="pt-8 sm:pt-12">
          <PricingSection />
        </div>
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
