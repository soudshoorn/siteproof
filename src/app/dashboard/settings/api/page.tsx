import type { Metadata } from "next";
import { requireAuth } from "@/lib/supabase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key } from "lucide-react";

export const metadata: Metadata = {
  title: "API Instellingen",
  description: "Beheer je API keys voor programmatic toegang tot SiteProof.",
};

export default async function ApiSettingsPage() {
  await requireAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">API Instellingen</h1>
        <p className="text-sm text-muted-foreground">
          Beheer je API keys voor programmatic toegang tot SiteProof.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Key className="size-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-semibold">API toegang</p>
              <Badge variant="secondary">Binnenkort</Badge>
            </div>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Binnenkort kun je via de SiteProof API programmatic scans starten, resultaten ophalen en websites beheren.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
