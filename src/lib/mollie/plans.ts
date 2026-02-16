export const PLANS = {
  FREE: {
    name: "Gratis",
    price: 0,
    maxWebsites: 1,
    maxPagesPerScan: 5,
    scanFrequency: "MONTHLY" as const,
    features: {
      emailAlerts: false,
      pdfExport: false,
      eaaStatement: false,
      trendAnalysis: false,
      prioritySupport: false,
      apiAccess: false,
      whiteLabel: false,
      maxTeamMembers: 1,
    },
  },
  STARTER: {
    name: "Starter",
    monthlyPrice: 4900,
    yearlyPrice: 40800,
    maxWebsites: 3,
    maxPagesPerScan: 100,
    scanFrequency: "WEEKLY" as const,
    features: {
      emailAlerts: true,
      pdfExport: true,
      eaaStatement: true,
      trendAnalysis: true,
      prioritySupport: false,
      apiAccess: false,
      whiteLabel: false,
      maxTeamMembers: 2,
    },
  },
  PROFESSIONAL: {
    name: "Professional",
    monthlyPrice: 14900,
    yearlyPrice: 124200,
    maxWebsites: 10,
    maxPagesPerScan: 500,
    scanFrequency: "DAILY" as const,
    features: {
      emailAlerts: true,
      pdfExport: true,
      eaaStatement: true,
      trendAnalysis: true,
      prioritySupport: true,
      apiAccess: false,
      whiteLabel: true,
      maxTeamMembers: 5,
    },
  },
  BUREAU: {
    name: "Bureau",
    monthlyPrice: 29900,
    yearlyPrice: 249200,
    maxWebsites: 50,
    maxPagesPerScan: 500,
    scanFrequency: "DAILY" as const,
    features: {
      emailAlerts: true,
      pdfExport: true,
      eaaStatement: true,
      trendAnalysis: true,
      prioritySupport: true,
      apiAccess: true,
      whiteLabel: true,
      maxTeamMembers: 999,
    },
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanLimits(planType: PlanKey) {
  return PLANS[planType];
}

export function canAddWebsite(planType: PlanKey, currentWebsiteCount: number): boolean {
  return currentWebsiteCount < PLANS[planType].maxWebsites;
}

export function getMaxPagesPerScan(planType: PlanKey): number {
  return PLANS[planType].maxPagesPerScan;
}

export function hasFeature(planType: PlanKey, feature: keyof typeof PLANS.FREE.features): boolean {
  return PLANS[planType].features[feature] as boolean;
}

/**
 * Get the price for a plan in a given interval.
 * Returns 0 for the FREE plan.
 */
export function getPlanPrice(planType: PlanKey, interval: "monthly" | "yearly"): number {
  const plan = PLANS[planType];
  if (!("monthlyPrice" in plan)) return 0;
  return interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
}
