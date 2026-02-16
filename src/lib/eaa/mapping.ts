/**
 * European Accessibility Act (EAA) — WCAG 2.1 AA mapping.
 *
 * The EAA (Richtlijn (EU) 2019/882) requires digital services to comply
 * with EN 301 549, which references WCAG 2.1 Level AA.
 *
 * This mapping links each relevant WCAG criterion to the corresponding
 * EAA requirement, providing Dutch descriptions for end users.
 */

export interface EaaRequirement {
  /** EAA article/section reference */
  article: string;
  /** Dutch title of the requirement */
  title: string;
  /** Dutch description of what it means for the business */
  description: string;
  /** WCAG criteria that map to this requirement */
  wcagCriteria: string[];
}

export const eaaRequirements: EaaRequirement[] = [
  {
    article: "Art. 4 lid 1a",
    title: "Waarneembaarheid",
    description:
      "Informatie en interface-componenten moeten op een manier worden gepresenteerd die gebruikers kunnen waarnemen. Dit omvat tekstalternatieven, ondertiteling, en voldoende kleurcontrast.",
    wcagCriteria: [
      "1.1.1", "1.2.1", "1.2.2", "1.2.3", "1.2.5",
      "1.3.1", "1.3.2", "1.3.3", "1.3.4", "1.3.5",
      "1.4.1", "1.4.2", "1.4.3", "1.4.4", "1.4.5",
      "1.4.10", "1.4.11", "1.4.12", "1.4.13",
    ],
  },
  {
    article: "Art. 4 lid 1b",
    title: "Bedienbaar",
    description:
      "Interface-componenten en navigatie moeten bedienbaar zijn. Alle functionaliteit moet beschikbaar zijn via het toetsenbord, en gebruikers moeten genoeg tijd krijgen om inhoud te lezen.",
    wcagCriteria: [
      "2.1.1", "2.1.2", "2.1.4",
      "2.2.1", "2.2.2",
      "2.3.1",
      "2.4.1", "2.4.2", "2.4.3", "2.4.4", "2.4.5", "2.4.6", "2.4.7",
      "2.5.1", "2.5.2", "2.5.3", "2.5.4",
    ],
  },
  {
    article: "Art. 4 lid 1c",
    title: "Begrijpelijk",
    description:
      "Informatie en de werking van de interface moeten begrijpelijk zijn. Tekst moet leesbaar zijn, pagina's moeten voorspelbaar werken, en gebruikers moeten hulp krijgen bij fouten.",
    wcagCriteria: [
      "3.1.1", "3.1.2",
      "3.2.1", "3.2.2", "3.2.3", "3.2.4",
      "3.3.1", "3.3.2", "3.3.3", "3.3.4",
    ],
  },
  {
    article: "Art. 4 lid 1d",
    title: "Robuust",
    description:
      "Inhoud moet robuust genoeg zijn om betrouwbaar geïnterpreteerd te worden door diverse gebruikersprogramma's, waaronder hulptechnologieën zoals screenreaders.",
    wcagCriteria: ["4.1.1", "4.1.2", "4.1.3"],
  },
  {
    article: "Art. 13 lid 1",
    title: "Toegankelijkheidsverklaring",
    description:
      "Dienstverleners moeten een toegankelijkheidsverklaring publiceren die beschrijft hoe de dienst voldoet aan de toegankelijkheidseisen en informatie geeft over niet-toegankelijke onderdelen.",
    wcagCriteria: [],
  },
  {
    article: "Art. 13 lid 2",
    title: "Feedbackmechanisme",
    description:
      "Er moet een toegankelijk feedbackmechanisme zijn waarmee gebruikers problemen kunnen melden en informatie kunnen opvragen over toegankelijkheid.",
    wcagCriteria: [],
  },
];

/**
 * All WCAG 2.1 AA criteria that the EAA requires via EN 301 549.
 */
export const requiredWcagCriteria = [
  // Principle 1: Perceivable
  "1.1.1", "1.2.1", "1.2.2", "1.2.3", "1.2.5",
  "1.3.1", "1.3.2", "1.3.3", "1.3.4", "1.3.5",
  "1.4.1", "1.4.2", "1.4.3", "1.4.4", "1.4.5",
  "1.4.10", "1.4.11", "1.4.12", "1.4.13",
  // Principle 2: Operable
  "2.1.1", "2.1.2", "2.1.4",
  "2.2.1", "2.2.2",
  "2.3.1",
  "2.4.1", "2.4.2", "2.4.3", "2.4.4", "2.4.5", "2.4.6", "2.4.7",
  "2.5.1", "2.5.2", "2.5.3", "2.5.4",
  // Principle 3: Understandable
  "3.1.1", "3.1.2",
  "3.2.1", "3.2.2", "3.2.3", "3.2.4",
  "3.3.1", "3.3.2", "3.3.3", "3.3.4",
  // Principle 4: Robust
  "4.1.1", "4.1.2", "4.1.3",
];

/**
 * Calculate EAA compliance percentage based on scan issues.
 * Returns a number 0-100 representing how many required WCAG criteria are met.
 */
export function calculateEaaCompliance(
  failedWcagCriteria: string[]
): {
  percentage: number;
  passedCriteria: string[];
  failedCriteria: string[];
  totalRequired: number;
} {
  const failedSet = new Set(failedWcagCriteria);

  const passedCriteria = requiredWcagCriteria.filter(
    (c) => !failedSet.has(c)
  );
  const failedCriteria = requiredWcagCriteria.filter((c) => failedSet.has(c));

  const percentage = Math.round(
    (passedCriteria.length / requiredWcagCriteria.length) * 100
  );

  return {
    percentage,
    passedCriteria,
    failedCriteria,
    totalRequired: requiredWcagCriteria.length,
  };
}

/**
 * Get the EAA requirement(s) that a specific WCAG criterion falls under.
 */
export function getEaaRequirementForCriterion(
  wcagCriterion: string
): EaaRequirement[] {
  return eaaRequirements.filter((req) =>
    req.wcagCriteria.includes(wcagCriterion)
  );
}

/**
 * Determine the overall EAA compliance status.
 */
export function getEaaStatus(percentage: number): {
  status: "compliant" | "partially_compliant" | "non_compliant";
  label: string;
  description: string;
  color: string;
} {
  if (percentage === 100) {
    return {
      status: "compliant",
      label: "Voldoet",
      description:
        "Je website voldoet aan alle WCAG 2.1 AA criteria die de European Accessibility Act vereist.",
      color: "green",
    };
  }

  if (percentage >= 75) {
    return {
      status: "partially_compliant",
      label: "Gedeeltelijk",
      description:
        "Je website voldoet aan het merendeel van de vereiste criteria, maar er zijn nog verbeterpunten nodig voor volledige EAA-compliance.",
      color: "yellow",
    };
  }

  return {
    status: "non_compliant",
    label: "Voldoet niet",
    description:
      "Je website voldoet niet aan de vereisten van de European Accessibility Act. Er zijn aanzienlijke verbeteringen nodig. Boetes kunnen oplopen tot €900.000.",
    color: "red",
  };
}
