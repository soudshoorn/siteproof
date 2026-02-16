import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth, getCurrentOrganization } from "@/lib/supabase/auth";
import { PLANS } from "@/lib/mollie/plans";
import { ApiKeyManager } from "@/components/dashboard/api-key-manager";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "API Instellingen",
  description: "Beheer je API keys voor programmatic toegang tot SiteProof.",
};

export default async function ApiSettingsPage() {
  await requireAuth();
  const organization = await getCurrentOrganization();

  if (!organization) {
    return <p className="text-muted-foreground">Geen organisatie gevonden.</p>;
  }

  const plan = PLANS[organization.planType];
  const hasApiAccess = plan.features.apiAccess;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">API Instellingen</h1>
        <p className="text-sm text-muted-foreground">
          Beheer je API keys voor programmatic toegang tot SiteProof.
        </p>
      </div>

      {hasApiAccess ? (
        <ApiKeyManager />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Key className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">API toegang</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                De SiteProof API geeft je programmatic toegang om scans te starten, resultaten op te halen en websites te beheren.
                API toegang is beschikbaar op het Bureau plan.
              </p>
            </div>
            <Button asChild>
              <Link href="/pricing">
                Bekijk Bureau plan
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
