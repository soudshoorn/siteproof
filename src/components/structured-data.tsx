const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

interface JsonLdProps {
  data: Record<string, unknown>;
}

function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "SiteProof",
        url: BASE_URL,
        logo: `${BASE_URL}/logo.png`,
        description:
          "De Nederlandse #1 geautomatiseerde WCAG-accessibility audit tool. Scan je website en voldoe aan de European Accessibility Act.",
        foundingDate: "2025",
        founder: {
          "@type": "Person",
          name: "Senna Oudshoorn",
        },
        parentOrganization: {
          "@type": "Organization",
          name: "Webser",
          url: "https://webser.nl",
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: "info@siteproof.nl",
          contactType: "customer service",
          availableLanguage: "Dutch",
        },
        sameAs: [],
      }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "SiteProof",
        applicationCategory: "WebApplication",
        operatingSystem: "Web",
        url: BASE_URL,
        description:
          "Geautomatiseerde WCAG-accessibility audit tool. Scan je website op WCAG 2.1 AA compliance en ontvang resultaten in begrijpelijk Nederlands.",
        offers: [
          {
            "@type": "Offer",
            name: "Gratis",
            price: "0",
            priceCurrency: "EUR",
            description: "1 website, 5 pagina's per scan, maandelijkse scan",
          },
          {
            "@type": "Offer",
            name: "Starter",
            price: "49",
            priceCurrency: "EUR",
            billingIncrement: "P1M",
            description:
              "3 websites, 100 pagina's per scan, wekelijkse scan, PDF export",
          },
          {
            "@type": "Offer",
            name: "Professional",
            price: "149",
            priceCurrency: "EUR",
            billingIncrement: "P1M",
            description:
              "10 websites, 500 pagina's per scan, dagelijkse scan, white-label",
          },
          {
            "@type": "Offer",
            name: "Bureau",
            price: "299",
            priceCurrency: "EUR",
            billingIncrement: "P1M",
            description:
              "50 websites, 500 pagina's per scan, dagelijkse scan, API toegang",
          },
        ],
        featureList: [
          "WCAG 2.1 AA compliance scanning",
          "Resultaten in begrijpelijk Nederlands",
          "EAA compliance check",
          "Automatische monitoring",
          "PDF rapportage",
          "Toegankelijkheidsverklaring generator",
        ],
        screenshot: `${BASE_URL}/og-image.png`,
        inLanguage: "nl",
      }}
    />
  );
}

export function FaqJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${BASE_URL}${item.href}`,
        })),
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  authorName,
  image,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  image?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url: `${BASE_URL}${url}`,
        datePublished,
        dateModified: dateModified || datePublished,
        author: {
          "@type": "Person",
          name: authorName,
        },
        publisher: {
          "@type": "Organization",
          name: "SiteProof",
          url: BASE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/logo.png`,
          },
        },
        ...(image
          ? {
              image: {
                "@type": "ImageObject",
                url: image,
              },
            }
          : {}),
        inLanguage: "nl",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${BASE_URL}${url}`,
        },
      }}
    />
  );
}

export function WebPageJsonLd({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url: `${BASE_URL}${url}`,
        isPartOf: {
          "@type": "WebSite",
          name: "SiteProof",
          url: BASE_URL,
        },
        inLanguage: "nl",
      }}
    />
  );
}
