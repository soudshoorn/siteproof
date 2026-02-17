import type { Metadata } from "next";
import { requireAuth } from "@/lib/supabase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette } from "lucide-react";

export const metadata: Metadata = {
  title: "White-label Instellingen",
  description: "Pas de branding aan van je SiteProof dashboard en rapporten.",
};

export default async function WhiteLabelSettingsPage() {
  await requireAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">White-label</h1>
        <p className="text-sm text-muted-foreground">
          Pas de branding aan van je dashboard en PDF-rapporten.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Palette className="size-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-semibold">White-label branding</p>
              <Badge variant="secondary">Binnenkort</Badge>
            </div>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Binnenkort kun je je eigen logo, kleuren en domein instellen.
              Je klanten zien dan jouw merk in het dashboard en op PDF-rapporten.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
