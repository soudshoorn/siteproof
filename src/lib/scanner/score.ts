import type { IssueSeverity } from "@prisma/client";

const SEVERITY_WEIGHTS: Record<IssueSeverity, number> = {
  CRITICAL: 10,
  SERIOUS: 5,
  MODERATE: 2,
  MINOR: 0.5,
};

export function calculateScore(issues: { severity: IssueSeverity }[]): number {
  const deductions = issues.reduce(
    (total, issue) => total + SEVERITY_WEIGHTS[issue.severity],
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
