export type PlanType = "FREE" | "STARTER" | "PROFESSIONAL" | "BUREAU";

export interface FeatureGates {
  maxWebsites: number;
  maxPagesPerScan: number;
  showAllFixSuggestions: boolean;
  maxFreeFixSuggestions: number;
  pdfExport: boolean;
  whitelabelPdf: boolean;
  trendHistory: boolean;
  scanHistoryDays: number;
  emailAlerts: boolean;
  scheduledScans: boolean;
  scanFrequency: "manual" | "weekly" | "daily";
  eaaStatement: boolean;
  eaaCompliancePercent: boolean;
  benchmarkComparison: boolean;
  whitelabel: boolean;
  apiAccess: boolean;
  clientDashboard: boolean;
  maxTeamMembers: number;
  priorityScan: boolean;
}

const FEATURE_GATES: Record<PlanType, FeatureGates> = {
  FREE: {
    maxWebsites: 1,
    maxPagesPerScan: 5,
    showAllFixSuggestions: false,
    maxFreeFixSuggestions: 3,
    pdfExport: false,
    whitelabelPdf: false,
    trendHistory: false,
    scanHistoryDays: 30,
    emailAlerts: false,
    scheduledScans: false,
    scanFrequency: "manual",
    eaaStatement: false,
    eaaCompliancePercent: false,
    benchmarkComparison: false,
    whitelabel: false,
    apiAccess: false,
    clientDashboard: false,
    maxTeamMembers: 1,
    priorityScan: false,
  },
  STARTER: {
    maxWebsites: 3,
    maxPagesPerScan: 100,
    showAllFixSuggestions: true,
    maxFreeFixSuggestions: 999,
    pdfExport: true,
    whitelabelPdf: false,
    trendHistory: true,
    scanHistoryDays: -1,
    emailAlerts: true,
    scheduledScans: true,
    scanFrequency: "weekly",
    eaaStatement: false,
    eaaCompliancePercent: true,
    benchmarkComparison: false,
    whitelabel: false,
    apiAccess: false,
    clientDashboard: false,
    maxTeamMembers: 2,
    priorityScan: false,
  },
  PROFESSIONAL: {
    maxWebsites: 10,
    maxPagesPerScan: 500,
    showAllFixSuggestions: true,
    maxFreeFixSuggestions: 999,
    pdfExport: true,
    whitelabelPdf: true,
    trendHistory: true,
    scanHistoryDays: -1,
    emailAlerts: true,
    scheduledScans: true,
    scanFrequency: "daily",
    eaaStatement: true,
    eaaCompliancePercent: true,
    benchmarkComparison: true,
    whitelabel: false,
    apiAccess: false,
    clientDashboard: false,
    maxTeamMembers: 5,
    priorityScan: true,
  },
  BUREAU: {
    maxWebsites: 50,
    maxPagesPerScan: 500,
    showAllFixSuggestions: true,
    maxFreeFixSuggestions: 999,
    pdfExport: true,
    whitelabelPdf: true,
    trendHistory: true,
    scanHistoryDays: -1,
    emailAlerts: true,
    scheduledScans: true,
    scanFrequency: "daily",
    eaaStatement: true,
    eaaCompliancePercent: true,
    benchmarkComparison: true,
    whitelabel: true,
    apiAccess: true,
    clientDashboard: true,
    maxTeamMembers: 999,
    priorityScan: true,
  },
};

export function getFeatureGates(plan: PlanType): FeatureGates {
  return FEATURE_GATES[plan];
}

export function isFeatureEnabled(plan: PlanType, feature: keyof FeatureGates): boolean {
  const gates = FEATURE_GATES[plan];
  const value = gates[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return value !== "manual";
}

export function getMinimumPlanForFeature(feature: keyof FeatureGates): PlanType {
  const order: PlanType[] = ["FREE", "STARTER", "PROFESSIONAL", "BUREAU"];
  for (const plan of order) {
    if (isFeatureEnabled(plan, feature)) return plan;
  }
  return "BUREAU";
}

export function getPlanDisplayName(plan: PlanType): string {
  const names: Record<PlanType, string> = {
    FREE: "Gratis",
    STARTER: "Starter",
    PROFESSIONAL: "Professional",
    BUREAU: "Bureau",
  };
  return names[plan];
}

export function getPlanMonthlyPrice(plan: PlanType): number {
  const prices: Record<PlanType, number> = {
    FREE: 0,
    STARTER: 49,
    PROFESSIONAL: 149,
    BUREAU: 299,
  };
  return prices[plan];
}
