import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { UrgencySection } from "@/components/landing/urgency-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection, faqs } from "@/components/landing/faq-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { CtaSection } from "@/components/landing/cta-section";
import {
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
  FaqJsonLd,
} from "@/components/structured-data";

export default function Home() {
  return (
    <>
      <OrganizationJsonLd />
      <SoftwareApplicationJsonLd />
      <FaqJsonLd questions={faqs} />
      <Header />
      <main id="main-content">
        <HeroSection />
        <UrgencySection />
        <FeaturesSection />
        <PricingSection />
        <SocialProofSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
