"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScoreCircle } from "@/components/scan/score-circle";
import { nl } from "@/lib/i18n/nl";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ExternalLink,
  Share2,
} from "lucide-react";

type ScanStatus = "idle" | "scanning" | "completed" | "failed";

interface QuickScanIssue {
  description: string;
  severity: "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR";
  wcagCriteria: string[];
  fixSuggestion: string;
  htmlElement?: string;
}

interface QuickScanResult {
  id: string;
  url: string;
  status: string;
  score: number | null;
  results: {
    issues?: QuickScanIssue[];
    totalIssues?: number;
    criticalIssues?: number;
    seriousIssues?: number;
    moderateIssues?: number;
    minorIssues?: number;
    pageTitle?: string;
    error?: string;
  } | null;
}

const severityConfig = {
  CRITICAL: {
    icon: AlertCircle,
    color: "text-severity-critical",
    bg: "bg-severity-critical/10",
    border: "border-severity-critical/20",
    label: nl.severity.critical,
  },
  SERIOUS: {
    icon: AlertTriangle,
    color: "text-severity-serious",
    bg: "bg-severity-serious/10",
    border: "border-severity-serious/20",
    label: nl.severity.serious,
  },
  MODERATE: {
    icon: Info,
    color: "text-severity-moderate",
    bg: "bg-severity-moderate/10",
    border: "border-severity-moderate/20",
    label: nl.severity.moderate,
  },
  MINOR: {
    icon: Info,
    color: "text-severity-minor",
    bg: "bg-severity-minor/10",
    border: "border-severity-minor/20",
    label: nl.severity.minor,
  },
};

interface ScanWidgetProps {
  variant?: "hero" | "compact" | "full";
  className?: string;
}

export function ScanWidget({ variant = "hero", className }: ScanWidgetProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<QuickScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Normalize URL
    let scanUrl = url.trim();
    if (!scanUrl) return;
    if (!scanUrl.startsWith("http://") && !scanUrl.startsWith("https://")) {
      scanUrl = `https://${scanUrl}`;
    }

    setStatus("scanning");

    try {
      const res = await fetch("/api/scan/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scanUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg =
          res.status === 429
            ? nl.scan.rateLimit
            : data.error || nl.scan.scanFailed;
        setError(errorMsg);
        setStatus("failed");
        return;
      }

      setResult(data.data as QuickScanResult);
      setStatus("completed");
    } catch {
      setError(nl.scan.scanFailed);
      setStatus("failed");
    }
  };

  const isScanning = status === "scanning";

  const handleShare = async () => {
    if (!result) return;
    const shareUrl = `${window.location.origin}/scan/resultaat/${result.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback: just ignore
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex w-full gap-3",
          variant === "hero" ? "flex-col sm:flex-row" : "flex-row"
        )}
      >
        <div className="relative flex-1">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={nl.landing.ctaPlaceholder}
            disabled={isScanning}
            className={cn(
              "border-border/50 bg-card/50 backdrop-blur-sm",
              variant === "hero"
                ? "h-14 px-5 text-base rounded-xl"
                : "h-10"
            )}
            aria-label="Website URL"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isScanning || !url.trim()}
          size={variant === "hero" ? "lg" : "default"}
          className={cn(
            variant === "hero" &&
              "h-14 px-8 text-base rounded-xl font-semibold"
          )}
        >
          {isScanning ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {nl.scan.scanning}
            </>
          ) : (
            <>
              {nl.landing.ctaButton}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Error */}
      {error && status === "failed" && (
        <div
          className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Scanning progress */}
      {isScanning && (
        <div className="mt-6 flex flex-col items-center gap-3 py-8" aria-live="polite">
          <div className="relative size-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {nl.scan.scanning}
          </p>
        </div>
      )}

      {/* Results */}
      {status === "completed" && result?.results && (
        <div className="mt-6 space-y-6" aria-live="polite">
          {/* Score + Summary */}
          <div className="flex flex-col items-center gap-6 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm sm:flex-row sm:items-start">
            <ScoreCircle score={result.score ?? 0} size="lg" />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold">
                {nl.scan.scanComplete}
              </h3>
              {result.results.pageTitle && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.results.pageTitle}
                </p>
              )}
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {result.url}
                <ExternalLink className="size-3" />
              </a>

              {/* Issue counts */}
              <div className="mt-4 flex flex-wrap gap-2">
                {(result.results.criticalIssues ?? 0) > 0 && (
                  <Badge variant="outline" className="border-severity-critical/30 text-severity-critical">
                    <AlertCircle className="mr-1 size-3" />
                    {result.results.criticalIssues} {nl.scan.criticalIssues}
                  </Badge>
                )}
                {(result.results.seriousIssues ?? 0) > 0 && (
                  <Badge variant="outline" className="border-severity-serious/30 text-severity-serious">
                    <AlertTriangle className="mr-1 size-3" />
                    {result.results.seriousIssues} {nl.scan.seriousIssues}
                  </Badge>
                )}
                {(result.results.moderateIssues ?? 0) > 0 && (
                  <Badge variant="outline" className="border-severity-moderate/30 text-severity-moderate">
                    <Info className="mr-1 size-3" />
                    {result.results.moderateIssues} {nl.scan.moderateIssues}
                  </Badge>
                )}
                {(result.results.minorIssues ?? 0) > 0 && (
                  <Badge variant="outline" className="border-severity-minor/30 text-severity-minor">
                    <Info className="mr-1 size-3" />
                    {result.results.minorIssues} {nl.scan.minorIssues}
                  </Badge>
                )}
                {(result.results.totalIssues ?? 0) === 0 && (
                  <Badge variant="outline" className="border-score-good/30 text-score-good">
                    <CheckCircle2 className="mr-1 size-3" />
                    Geen issues gevonden
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Top issues */}
          {result.results.issues && result.results.issues.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {nl.scan.topIssues}
              </h4>
              <ul className="space-y-3">
                {result.results.issues.slice(0, 5).map((issue, i) => {
                  const config = severityConfig[issue.severity];
                  const Icon = config.icon;
                  return (
                    <li
                      key={i}
                      className={cn(
                        "rounded-lg border p-4",
                        config.border,
                        config.bg
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={cn("mt-0.5 size-4 shrink-0", config.color)} />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-medium", config.color)}>
                              {config.label}
                            </span>
                            {issue.wcagCriteria.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                WCAG {issue.wcagCriteria.join(", ")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium">{issue.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {issue.fixSuggestion}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <a href="/auth/register">
                {nl.scan.fullScanCta}
                <ArrowRight className="ml-1 size-4" />
              </a>
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="size-4" />
              {nl.scan.shareScore}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
