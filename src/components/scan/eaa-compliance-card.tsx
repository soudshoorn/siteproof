"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { nl } from "@/lib/i18n/nl";
import { cn } from "@/lib/utils";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ChevronDown,
  ChevronRight,
  FileDown,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface PrincipleScore {
  name: string;
  article: string;
  passed: number;
  total: number;
  percentage: number;
}

interface EaaComplianceData {
  percentage: number;
  status: "compliant" | "partially_compliant" | "non_compliant";
  label: string;
  passedCount: number;
  failedCount: number;
  totalRequired: number;
  principleScores: PrincipleScore[];
}

interface EaaComplianceCardProps {
  data: EaaComplianceData;
  scanId: string;
  /** Whether the user's plan supports statement download */
  canDownloadStatement?: boolean;
  /** Compact mode for quick scan / shareable results */
  compact?: boolean;
}

const statusConfig = {
  compliant: {
    icon: ShieldCheck,
    color: "text-score-good",
    bg: "bg-score-good/10",
    border: "border-score-good/20",
  },
  partially_compliant: {
    icon: ShieldAlert,
    color: "text-score-average",
    bg: "bg-score-average/10",
    border: "border-score-average/20",
  },
  non_compliant: {
    icon: ShieldX,
    color: "text-score-poor",
    bg: "bg-score-poor/10",
    border: "border-score-poor/20",
  },
};

function PrincipleBar({ principle }: { principle: PrincipleScore }) {
  const barColor =
    principle.percentage === 100
      ? "bg-score-good"
      : principle.percentage >= 75
        ? "bg-score-average"
        : "bg-score-poor";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{principle.name}</span>
        <span className="text-muted-foreground">
          {principle.passed}/{principle.total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${principle.percentage}%` }}
          role="progressbar"
          aria-valuenow={principle.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${principle.name}: ${principle.percentage}%`}
        />
      </div>
      <p className="text-xs text-muted-foreground">{principle.article}</p>
    </div>
  );
}

export function EaaComplianceCard({
  data,
  scanId,
  canDownloadStatement = false,
  compact = false,
}: EaaComplianceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const config = statusConfig[data.status];
  const Icon = config.icon;

  const t = nl.eaa;

  async function handleDownloadStatement() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/scan/${scanId}/statement`);
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        alert(json?.error || "Download mislukt.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || "toegankelijkheidsverklaring.md";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download mislukt. Probeer het later opnieuw.");
    } finally {
      setDownloading(false);
    }
  }

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-xl border p-4",
          config.border,
          config.bg
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("size-6 shrink-0", config.color)} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold", config.color)}>
                {data.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {data.percentage}% compliance
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {data.passedCount} {t.criteriaOf} {data.totalRequired}{" "}
              {t.criteriaStatus}
            </p>
          </div>
        </div>
        {data.status === "non_compliant" && (
          <p className="mt-2 text-xs font-medium text-score-poor">
            {t.fineWarning}
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden border pt-0 gap-0", config.border)}>
      <CardHeader className={cn("px-6 py-5", config.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                config.bg
              )}
            >
              <Shield className={cn("size-5", config.color)} />
            </div>
            <div>
              <CardTitle className="text-base">{t.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge
              variant="outline"
              className={cn("text-sm font-semibold", config.color, config.border)}
            >
              <Icon className="mr-1 size-3.5" />
              {data.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {/* Compliance percentage */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-end justify-between">
              <span className={cn("text-3xl font-bold", config.color)}>
                {data.percentage}%
              </span>
              <span className="text-sm text-muted-foreground">
                {data.passedCount} {t.criteriaOf} {data.totalRequired}{" "}
                {t.criteriaStatus}
              </span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  data.percentage === 100
                    ? "bg-score-good"
                    : data.percentage >= 75
                      ? "bg-score-average"
                      : "bg-score-poor"
                )}
                style={{ width: `${data.percentage}%` }}
                role="progressbar"
                aria-valuenow={data.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${t.compliancePercentage}: ${data.percentage}%`}
              />
            </div>
          </div>
        </div>

        {/* Fine warning for non-compliant */}
        {data.status === "non_compliant" && (
          <div className="rounded-lg border border-score-poor/20 bg-score-poor/5 p-3">
            <p className="text-sm font-medium text-score-poor">
              {t.fineWarning}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.requiredBy}
            </p>
          </div>
        )}

        {/* Principle scores - expandable */}
        {data.principleScores.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center gap-2 text-sm font-medium hover:text-primary"
              aria-expanded={expanded}
            >
              {expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
              {t.principleScores}
            </button>

            {expanded && (
              <div className="mt-4 space-y-4">
                {data.principleScores.map((principle) => (
                  <PrincipleBar key={principle.article} principle={principle} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-border/40 pt-4 sm:flex-row">
          {canDownloadStatement ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadStatement}
              disabled={downloading}
              className="flex-1"
            >
              {downloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileDown className="size-4" />
              )}
              {t.downloadStatement}
            </Button>
          ) : (
            <p className="flex-1 text-xs text-muted-foreground">
              {t.statementAvailable}{" "}
              <Link href="/pricing" className="text-primary hover:underline">
                {nl.common.upgrade}
              </Link>
            </p>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/eaa-compliance">
              {t.learnMoreEaa}
              <ExternalLink className="ml-1 size-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
