"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { type PlanType, getFeatureGates, getPlanDisplayName } from "@/lib/features";

interface SidebarPlanCardProps {
  planType: PlanType;
}

export function SidebarPlanCard({ planType }: SidebarPlanCardProps) {
  if (planType !== "FREE") return null;

  const gates = getFeatureGates(planType);

  return (
    <div className="mx-4 mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <span className="text-xs font-semibold">
          {getPlanDisplayName(planType)} plan
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {gates.maxWebsites} website, {gates.maxPagesPerScan} pagina&apos;s per scan
      </p>
      <Link
        href="/pricing"
        className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        Upgrade voor meer websites en dagelijkse scans
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
