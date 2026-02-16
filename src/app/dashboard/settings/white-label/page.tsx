import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth, getCurrentOrganization } from "@/lib/supabase/auth";
import { PLANS } from "@/lib/mollie/plans";
import { WhiteLabelSettings } from "@/components/dashboard/white-label-settings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "White-label Instellingen",
  description: "Pas de branding aan van je SiteProof dashboard en rapporten.",
};

export default async function WhiteLabelSettingsPage() {
  await requireAuth();
  const organization = await getCurrentOrganization();

  if (!organization) {
    return <p className="text-muted-foreground">Geen organisatie gevonden.</p>;
  }

  const plan = PLANS[organization.planType];
  const hasWhiteLabel = plan.features.whiteLabel;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">White-label</h1>
        <p className="text-sm text-muted-foreground">
          Pas de branding aan van je dashboard en PDF-rapporten.
        </p>
      </div>

      {hasWhiteLabel ? (
        <WhiteLabelSettings />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Palette className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">White-label branding</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Gebruik je eigen logo, kleuren en domein. Je klanten zien jouw merk in het dashboard en op PDF-rapporten.
                White-label is beschikbaar vanaf het Professional plan.
              </p>
            </div>
            <Button asChild>
              <Link href="/pricing">
                Bekijk plannen
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
