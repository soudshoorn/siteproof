import { prisma } from "@/lib/db";
import { PLANS, type PlanKey } from "@/lib/mollie/plans";

export class PlanLimitError extends Error {
  public readonly code = "PLAN_LIMIT_EXCEEDED";
  public readonly planType: PlanKey;
  public readonly limit: number;

  constructor(message: string, planType: PlanKey, limit: number) {
    super(message);
    this.name = "PlanLimitError";
    this.planType = planType;
    this.limit = limit;
  }
}

/**
 * Enforce plan limits before allowing an action.
 * Throws PlanLimitError with a Dutch message if the limit is exceeded.
 */
export async function enforcePlanLimits(
  organizationId: string,
  action: "addWebsite" | "startScan" | "addMember"
) {
  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
    include: {
      websites: { select: { id: true } },
      members: { select: { id: true } },
    },
  });

  const planType = org.planType as PlanKey;
  const plan = PLANS[planType];

  switch (action) {
    case "addWebsite": {
      if (org.websites.length >= plan.maxWebsites) {
        throw new PlanLimitError(
          `Je huidige plan (${plan.name}) staat maximaal ${plan.maxWebsites} website${plan.maxWebsites === 1 ? "" : "s"} toe. Upgrade je plan om meer websites toe te voegen.`,
          planType,
          plan.maxWebsites
        );
      }
      break;
    }

    case "startScan": {
      // Check concurrent scan limit based on plan
      const concurrentLimits: Record<PlanKey, number> = {
        FREE: 1,
        STARTER: 2,
        PROFESSIONAL: 5,
        BUREAU: 10,
      };

      const activeScanCount = await prisma.scan.count({
        where: {
          website: { organizationId },
          status: { in: ["QUEUED", "CRAWLING", "SCANNING", "ANALYZING"] },
        },
      });

      const maxConcurrent = concurrentLimits[planType];
      if (activeScanCount >= maxConcurrent) {
        throw new PlanLimitError(
          `Je huidige plan (${plan.name}) staat maximaal ${maxConcurrent} gelijktijdige scan${maxConcurrent === 1 ? "" : "s"} toe. Wacht tot de huidige scan is voltooid of upgrade je plan.`,
          planType,
          maxConcurrent
        );
      }
      break;
    }

    case "addMember": {
      const maxMembers = plan.features.maxTeamMembers;
      if (org.members.length >= maxMembers) {
        throw new PlanLimitError(
          `Je huidige plan (${plan.name}) staat maximaal ${maxMembers === 999 ? "onbeperkt" : maxMembers} teamle${maxMembers === 1 ? "d" : "den"} toe. Upgrade je plan om meer teamleden uit te nodigen.`,
          planType,
          maxMembers
        );
      }
      break;
    }
  }
}

/**
 * Check if a feature is available for the organization's plan.
 */
export async function checkFeatureAccess(
  organizationId: string,
  feature: keyof (typeof PLANS)["FREE"]["features"]
): Promise<boolean> {
  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { planType: true },
  });

  return PLANS[org.planType as PlanKey].features[feature] as boolean;
}

/**
 * Get the max pages per scan for the organization's plan.
 */
export async function getOrgMaxPages(organizationId: string): Promise<number> {
  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { planType: true },
  });

  return PLANS[org.planType as PlanKey].maxPagesPerScan;
}
