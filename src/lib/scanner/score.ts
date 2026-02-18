import type { IssueSeverity } from "@prisma/client";

/** Base deduction per unique rule violation */
const SEVERITY_WEIGHTS: Record<IssueSeverity, number> = {
  CRITICAL: 15,
  SERIOUS: 8,
  MODERATE: 3,
  MINOR: 1,
};

/**
 * Extra deduction per additional element instance of the same rule.
 * Capped so a single widespread rule can't push the score to 0 alone,
 * but multiple instances DO hurt more than a single one.
 */
const INSTANCE_PENALTY: Record<IssueSeverity, number> = {
  CRITICAL: 2,
  SERIOUS: 1,
  MODERATE: 0.5,
  MINOR: 0.1,
};

/** Max extra deduction from instances per rule (prevents one rule from tanking everything) */
const MAX_INSTANCE_PENALTY_PER_RULE = 15;

/**
 * Calculate the accessibility score for a set of issues.
 *
 * Each unique rule gets a base deduction based on severity, plus a smaller
 * penalty for each additional element instance. This means a site with
 * 50 color-contrast failures scores worse than one with 2, but the penalty
 * is capped per rule to keep it fair.
 */
export function calculateScore(
  issues: { severity: IssueSeverity; axeRuleId: string }[]
): number {
  // Group by rule: track severity (highest) and instance count
  const ruleMap = new Map<string, { severity: IssueSeverity; count: number }>();
  for (const issue of issues) {
    const existing = ruleMap.get(issue.axeRuleId);
    if (!existing) {
      ruleMap.set(issue.axeRuleId, { severity: issue.severity, count: 1 });
    } else {
      existing.count++;
      if (SEVERITY_WEIGHTS[issue.severity] > SEVERITY_WEIGHTS[existing.severity]) {
        existing.severity = issue.severity;
      }
    }
  }

  let totalDeduction = 0;
  for (const { severity, count } of ruleMap.values()) {
    // Base deduction for the rule existing at all
    const base = SEVERITY_WEIGHTS[severity];
    // Extra penalty for multiple instances (count - 1 because first is covered by base)
    const instancePenalty = Math.min(
      (count - 1) * INSTANCE_PENALTY[severity],
      MAX_INSTANCE_PENALTY_PER_RULE
    );
    totalDeduction += base + instancePenalty;
  }

  return Math.max(0, Math.min(100, Math.round(100 - totalDeduction)));
}

/**
 * Calculate the overall score across all pages.
 *
 * Uses a simple average of per-page scores. Each page is equally important
 * regardless of how many individual element violations it has (those are
 * already accounted for in the per-page deduplication by rule type).
 */
export function calculateOverallScore(
  pageScores: { score: number; issueCount: number }[]
): number {
  if (pageScores.length === 0) return 100;

  const total = pageScores.reduce((sum, p) => sum + p.score, 0);
  return Math.round((total / pageScores.length) * 10) / 10;
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
