import {
  calculateEaaCompliance,
  getEaaStatus,
  eaaRequirements,
  requiredWcagCriteria,
} from "./mapping";
import { wcagCriteriaNL } from "../scanner/translations/nl";

export interface StatementData {
  websiteName: string;
  websiteUrl: string;
  organizationName: string;
  scanDate: Date;
  score: number;
  failedWcagCriteria: string[];
}

/**
 * Generate a Dutch accessibility statement (toegankelijkheidsverklaring)
 * based on scan results.
 */
export function generateAccessibilityStatement(data: StatementData): string {
  const compliance = calculateEaaCompliance(data.failedWcagCriteria);
  const status = getEaaStatus(compliance.percentage);
  const date = data.scanDate.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statusText =
    status.status === "compliant"
      ? "voldoet"
      : status.status === "partially_compliant"
        ? "voldoet gedeeltelijk"
        : "voldoet niet";

  let statement = `# Toegankelijkheidsverklaring

## ${data.organizationName}

**Website:** ${data.websiteUrl}
**Datum:** ${date}
**Status:** Deze website ${statusText} aan de Web Content Accessibility Guidelines (WCAG) 2.1 niveau AA.

---

## Over deze verklaring

${data.organizationName} streeft ernaar om de website ${data.websiteName} toegankelijk te maken voor iedereen, in overeenstemming met de European Accessibility Act (EAA / Richtlijn (EU) 2019/882) en de Nederlandse implementatie daarvan.

Deze toegankelijkheidsverklaring is opgesteld op basis van een geautomatiseerde scan uitgevoerd door SiteProof op ${date}.

---

## Nalevingsstatus

Deze website ${statusText} aan WCAG 2.1 niveau AA.

- **Compliance-percentage:** ${compliance.percentage}%
- **Toegankelijkheidsscore:** ${data.score}/100
- **Voldoende criteria:** ${compliance.passedCriteria.length} van ${compliance.totalRequired}
- **Niet-voldoende criteria:** ${compliance.failedCriteria.length} van ${compliance.totalRequired}

`;

  // List failed criteria with descriptions
  if (compliance.failedCriteria.length > 0) {
    statement += `## Niet-toegankelijke onderdelen

De volgende WCAG-criteria worden op dit moment niet (volledig) nageleefd:

`;

    for (const criterion of compliance.failedCriteria) {
      const info = wcagCriteriaNL[criterion];
      if (info) {
        statement += `### WCAG ${criterion}: ${info.title}\n\n`;
        statement += `${info.description}\n\n`;
      } else {
        statement += `### WCAG ${criterion}\n\n`;
        statement += `Dit criterium wordt niet volledig nageleefd.\n\n`;
      }
    }
  }

  statement += `## Maatregelen

${data.organizationName} neemt de volgende maatregelen om de toegankelijkheid te waarborgen:

- Regelmatige geautomatiseerde toegankelijkheidsscans
- Aandacht voor toegankelijkheid bij het ontwikkelen van nieuwe functionaliteit
- Training van medewerkers op het gebied van digitale toegankelijkheid

---

## Feedback en contactgegevens

Ervaart u een toegankelijkheidsprobleem op onze website? Neem dan contact met ons op:

- **Organisatie:** ${data.organizationName}
- **Website:** ${data.websiteUrl}

Wij streven ernaar om binnen 2 weken te reageren op uw melding.

---

## Handhaving

Als u niet tevreden bent met de manier waarop wij omgaan met uw melding, kunt u contact opnemen met de Autoriteit Consument & Markt (ACM):

- Website: [www.acm.nl](https://www.acm.nl)
- Telefoon: 070 722 2000

---

## Technische specificaties

De toegankelijkheid van ${data.websiteName} is afhankelijk van de volgende technologieën:

- HTML
- CSS
- JavaScript

Deze verklaring is opgesteld met behulp van SiteProof (siteproof.nl).

---

*Deze verklaring is voor het laatst bijgewerkt op ${date}.*
`;

  return statement;
}

/**
 * Generate a summary version for display in the dashboard.
 */
export function generateComplianceSummary(
  failedWcagCriteria: string[]
): {
  percentage: number;
  status: ReturnType<typeof getEaaStatus>;
  principleScores: Array<{
    name: string;
    article: string;
    passed: number;
    total: number;
    percentage: number;
  }>;
} {
  const compliance = calculateEaaCompliance(failedWcagCriteria);
  const status = getEaaStatus(compliance.percentage);

  const principleScores = eaaRequirements
    .filter((req) => req.wcagCriteria.length > 0)
    .map((req) => {
      const total = req.wcagCriteria.length;
      const failed = req.wcagCriteria.filter((c) =>
        failedWcagCriteria.includes(c)
      ).length;
      const passed = total - failed;

      return {
        name: req.title,
        article: req.article,
        passed,
        total,
        percentage: total > 0 ? Math.round((passed / total) * 100) : 100,
      };
    });

  return {
    percentage: compliance.percentage,
    status,
    principleScores,
  };
}
