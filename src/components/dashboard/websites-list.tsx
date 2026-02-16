"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCircle } from "@/components/scan/score-circle";
import { AddWebsiteDialog } from "@/components/dashboard/add-website-dialog";
import { StartScanButton } from "@/components/dashboard/start-scan-button";
import { nl } from "@/lib/i18n/nl";
import { formatRelativeTime } from "@/lib/utils";
import { Plus, Globe, ExternalLink } from "lucide-react";

interface WebsiteScan {
  id: string;
  score: number | null;
  status: string;
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  scannedPages: number;
  createdAt: Date;
}

interface WebsiteItem {
  id: string;
  url: string;
  name: string;
  createdAt: Date;
  scans: WebsiteScan[];
}

interface WebsitesListProps {
  websites: WebsiteItem[];
  organizationId: string;
  planType: string;
  maxWebsites: number;
}

export function WebsitesList({
  websites,
  organizationId,
  planType,
  maxWebsites,
}: WebsitesListProps) {
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("add") === "true");

  const canAdd = websites.length < maxWebsites;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{nl.dashboard.websites}</h1>
          <p className="text-sm text-muted-foreground">
            {websites.length} van {maxWebsites} websites ({planType})
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} disabled={!canAdd}>
          <Plus className="size-4" />
          {nl.dashboard.addWebsite}
        </Button>
      </div>

      {!canAdd && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
          Je hebt het maximum aantal websites bereikt voor je{" "}
          <strong>{planType}</strong> plan.{" "}
          <Link href="/dashboard/settings/billing" className="font-medium text-primary hover:underline">
            Upgrade je plan
          </Link>{" "}
          om meer websites toe te voegen.
        </div>
      )}

      {websites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Globe className="size-12 text-muted-foreground/30" />
            <div>
              <p className="text-lg font-medium">{nl.dashboard.noWebsites}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Voeg je eerste website toe om te beginnen.
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              {nl.dashboard.addWebsite}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {websites.map((website) => {
            const lastScan = website.scans[0];
            return (
              <Card key={website.id} className="transition-colors hover:border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Link href={`/dashboard/websites/${website.id}`}>
                        <CardTitle className="text-lg hover:text-primary">
                          {website.name}
                        </CardTitle>
                      </Link>
                      <a
                        href={website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        {website.url}
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <StartScanButton websiteId={website.id} variant="outline" size="sm" />
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/websites/${website.id}`}>Bekijk</Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {lastScan && lastScan.score != null ? (
                    <div className="flex items-center gap-6">
                      <ScoreCircle score={lastScan.score} size="sm" animated={false} />
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Problemen</p>
                          <p className="font-medium">{lastScan.totalIssues}</p>
                        </div>
                        {lastScan.criticalIssues > 0 && (
                          <div>
                            <p className="text-muted-foreground">Kritiek</p>
                            <p className="font-medium text-severity-critical">
                              {lastScan.criticalIssues}
                            </p>
                          </div>
                        )}
                        {lastScan.seriousIssues > 0 && (
                          <div>
                            <p className="text-muted-foreground">Serieus</p>
                            <p className="font-medium text-severity-serious">
                              {lastScan.seriousIssues}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Pagina&apos;s</p>
                          <p className="font-medium">{lastScan.scannedPages}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{nl.dashboard.lastScan}</p>
                          <p className="font-medium">{formatRelativeTime(lastScan.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ) : lastScan ? (
                    <Badge variant="secondary">
                      {lastScan.status === "FAILED" ? "Laatste scan mislukt" : nl.dashboard.scanInProgress}
                    </Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">{nl.dashboard.noScans}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddWebsiteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        organizationId={organizationId}
      />
    </div>
  );
}
