import type { Metadata } from "next";
import { requireAuth, getCurrentOrganization } from "@/lib/supabase/auth";
import { PLANS, type PlanKey } from "@/lib/mollie/plans";
import { BillingClient } from "@/components/dashboard/billing-client";

export const metadata: Metadata = {
  title: "Abonnement",
};

export default async function BillingPage() {
  await requireAuth();
  const organization = await getCurrentOrganization();

  if (!organization) {
    return <p className="text-muted-foreground">Geen organisatie gevonden.</p>;
  }

  const planKey = organization.planType as PlanKey;
  const plan = PLANS[planKey];
  const isPaid = planKey !== "FREE";

  return (
    <BillingClient
      organizationId={organization.id}
      planType={planKey}
      planName={plan.name}
      isPaid={isPaid}
      monthlyPrice={"monthlyPrice" in plan ? (plan.monthlyPrice as number) : 0}
      maxWebsites={plan.maxWebsites}
      maxPagesPerScan={plan.maxPagesPerScan}
      periodEnd={organization.mollieCurrentPeriodEnd?.toISOString() ?? null}
      hasSubscription={!!organization.mollieSubscriptionId}
    />
  );
}
