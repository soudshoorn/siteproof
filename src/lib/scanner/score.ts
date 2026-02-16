import type { IssueSeverity } from "@prisma/client";

const SEVERITY_WEIGHTS: Record<IssueSeverity, number> = {
  CRITICAL: 10,
  SERIOUS: 5,
  MODERATE: 2,
  MINOR: 0.5,
};

/**
 * Calculate the accessibility score for a set of issues.
 *
 * Deductions are based on **unique rule types** (axeRuleId), not individual
 * element instances.  A site with 50 color-contrast violations still only gets
 * one deduction for the color-contrast rule.  This prevents a single widespread
 * issue from tanking the score to 0.
 */
export function calculateScore(
  issues: { severity: IssueSeverity; axeRuleId: string }[]
): number {
  // Deduplicate by axeRuleId — keep the highest severity per rule
  const ruleMap = new Map<string, IssueSeverity>();
  for (const issue of issues) {
    const existing = ruleMap.get(issue.axeRuleId);
    if (!existing || SEVERITY_WEIGHTS[issue.severity] > SEVERITY_WEIGHTS[existing]) {
      ruleMap.set(issue.axeRuleId, issue.severity);
    }
  }

  const deductions = Array.from(ruleMap.values()).reduce(
    (total, severity) => total + SEVERITY_WEIGHTS[severity],
    0
  );

  return Math.max(0, Math.min(100, 100 - deductions));
}

export function calculateOverallScore(
  pageScores: { score: number; issueCount: number }[]
): number {
  if (pageScores.length === 0) return 100;

  const totalWeight = pageScores.reduce((sum, p) => sum + Math.max(1, p.issueCount), 0);

  const weightedSum = pageScores.reduce(
    (sum, p) => sum + p.score * Math.max(1, p.issueCount),
    0
  );

  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

export function mapAxeSeverity(impact: string | undefined): IssueSeverity {
  switch (impact) {
    case "critical":
      return "CRITICAL";
    case "serious":
      return "SERIOUS";
    case "moderate":
      return "MODERATE";
    case "minor":
    default:
      return "MINOR";
  }
}
