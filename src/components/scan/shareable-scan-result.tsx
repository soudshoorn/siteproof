"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreCircle } from "@/components/scan/score-circle";
import { nl } from "@/lib/i18n/nl";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  Share2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
} from "lucide-react";

interface FullIssue {
  description: string;
  severity: "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR";
  wcagCriteria: string[];
  fixSuggestion: string;
  helpText?: string;
  htmlElement?: string;
  elementCount?: number;
}

interface LimitedIssue {
  description: string;
  severity: "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR";
  wcagCriteria: string[];
  elementCount?: number;
}

interface EaaDisplayData {
  percentage: number;
  status: "compliant" | "partially_compliant" | "non_compliant";
  label: string;
  passedCount: number;
  failedCount: number;
  totalRequired: number;
}

interface ShareableScanResultProps {
  id: string;
  url: string;
  status: string;
  score: number | null;
  results: Record<string, unknown> | null;
  createdAt: Date;
  isInProgress: boolean;
  eaaData?: EaaDisplayData;
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

const eaaStatusConfig = {
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

export function ShareableScanResult({
  id,
  url: initialUrl,
  status: initialStatus,
  score: initialScore,
  results: initialResults,
  createdAt,
  isInProgress: initialIsInProgress,
  eaaData,
}: ShareableScanResultProps) {
  const [status, setStatus] = useState(initialStatus);
  const [score, setScore] = useState(initialScore);
  const [results, setResults] = useState(initialResults);
  const [isInProgress, setIsInProgress] = useState(initialIsInProgress);
  const [copied, setCopied] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Poll while in progress
  useEffect(() => {
    if (!isInProgress) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/quick/${id}`);
        const data = await res.json();
        if (!data.success) return;

        const scan = data.data;
        setStatus(scan.status);

        if (scan.status === "COMPLETED") {
          setScore(scan.score);
          setResults(scan.results);
          setIsInProgress(false);
          stopPolling();
        } else if (scan.status === "FAILED") {
          setResults(scan.results);
          setIsInProgress(false);
          stopPolling();
        }
      } catch {
        // Keep polling
      }
    }, 2000);

    return () => stopPolling();
  }, [id, isInProgress, stopPolling]);

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/scan/resultaat/${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/scan/resultaat/${id}`;
    const hostname = (() => {
      try { return new URL(initialUrl).hostname; } catch { return initialUrl; }
    })();
    const text = `${hostname} scoort ${Math.round(score ?? 0)}/100 op website-toegankelijkheid. Test jouw website gratis op SiteProof!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: text, url: shareUrl });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  function toggleIssue(index: number) {
    setExpandedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  // Extract gated data
  const topIssues = (results?.topIssues as FullIssue[] | undefined) ?? [];
  const remainingIssues = (results?.remainingIssues as LimitedIssue[] | undefined) ?? [];
  const blurredCount = (results?.blurredCount as number) ?? 0;
  const estimatedPages = (results?.estimatedPages as number | null) ?? null;

  // Legacy support: if old format with "issues" array
  const legacyIssues = (results?.issues as FullIssue[] | undefined) ?? [];
  const hasLegacyFormat = legacyIssues.length > 0 && topIssues.length === 0;
  const displayTopIssues = hasLegacyFormat ? legacyIssues.slice(0, 3) : topIssues;
  const displayRemainingIssues = hasLegacyFormat
    ? legacyIssues.slice(3).map((i) => ({
        description: i.description,
        severity: i.severity,
        wcagCriteria: i.wcagCriteria,
        elementCount: i.elementCount,
      }))
    : remainingIssues;
  const displayBlurredCount = hasLegacyFormat ? displayRemainingIssues.length : blurredCount;

  const totalIssues = (results?.totalIssues as number) ?? 0;
  const criticalIssues = (results?.criticalIssues as number) ?? 0;
  const seriousIssues = (results?.seriousIssues as number) ?? 0;
  const moderateIssues = (results?.moderateIssues as number) ?? 0;
  const minorIssues = (results?.minorIssues as number) ?? 0;
  const pageTitle = results?.pageTitle as string | undefined;

  let hostname = initialUrl;
  try {
    hostname = new URL(initialUrl).hostname;
  } catch {
    // fallback
  }

  // In progress
  if (isInProgress) {
    return (
      <div className="flex flex-col items-center gap-8 py-16 text-center">
        <div className="relative size-24">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="absolute inset-2 animate-pulse rounded-full bg-primary/10" />
          <div className="relative flex size-24 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/5">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold sm:text-3xl">Website wordt gescand</h1>
          <p className="text-lg text-muted-foreground">
            {hostname}
          </p>
        </div>
        <div className="mx-auto max-w-sm space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pagina laden & analyseren...</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full animate-pulse rounded-full bg-primary/60" style={{ width: "65%" }} />
            </div>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              Verbinding gemaakt
            </li>
            <li className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              WCAG 2.1 AA controle uitvoeren...
            </li>
            <li className="flex items-center gap-2 opacity-40">
              <Info className="size-4" />
              Resultaten verwerken
            </li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground/60">
          Dit duurt meestal 10-20 seconden
        </p>
      </div>
    );
  }

  // Failed
  if (status === "FAILED") {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <AlertCircle className="size-12 text-destructive" />
        <div>
          <h1 className="text-2xl font-bold">Scan mislukt</h1>
          <p className="mt-2 text-muted-foreground">
            {(results?.error as string) || nl.scan.scanFailed}
          </p>
        </div>
        <Button asChild>
          <a href="/scan">
            Probeer opnieuw
            <ArrowRight className="ml-1 size-4" />
          </a>
        </Button>
      </div>
    );
  }

  // Completed
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Scan resultaat &middot; {formatDate(createdAt)}
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          Toegankelijkheidsscore voor {hostname}
        </h1>
        <a
          href={initialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          {initialUrl}
          <ExternalLink className="size-3" />
        </a>
      </div>

      {/* Score card */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-6 p-8 sm:flex-row">
          <ScoreCircle score={score ?? 0} size="lg" />
          <div className="flex-1 text-center sm:text-left">
            {pageTitle && (
              <p className="text-lg font-semibold">{pageTitle}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {totalIssues === 0
                ? nl.scan.noIssuesMessage
                : `${totalIssues} ${nl.scan.issuesFound}`}
            </p>

            {/* Issue count badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              {criticalIssues > 0 && (
                <Badge
                  variant="outline"
                  className="border-severity-critical/30 text-severity-critical"
                >
                  <AlertCircle className="mr-1 size-3" />
                  {criticalIssues} {nl.severity.critical}
                </Badge>
              )}
              {seriousIssues > 0 && (
                <Badge
                  variant="outline"
                  className="border-severity-serious/30 text-severity-serious"
                >
                  <AlertTriangle className="mr-1 size-3" />
                  {seriousIssues} {nl.severity.serious}
                </Badge>
              )}
              {moderateIssues > 0 && (
                <Badge
                  variant="outline"
                  className="border-severity-moderate/30 text-severity-moderate"
                >
                  <Info className="mr-1 size-3" />
                  {moderateIssues} {nl.severity.moderate}
                </Badge>
              )}
              {minorIssues > 0 && (
                <Badge
                  variant="outline"
                  className="border-severity-minor/30 text-severity-minor"
                >
                  <Info className="mr-1 size-3" />
                  {minorIssues} {nl.severity.minor}
                </Badge>
              )}
              {totalIssues === 0 && (
                <Badge
                  variant="outline"
                  className="border-score-good/30 text-score-good"
                >
                  <CheckCircle2 className="mr-1 size-3" />
                  Geen issues gevonden
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top issues — full details (FREE value) */}
      {displayTopIssues.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            {nl.scan.topIssues}
          </h2>
          <ul className="space-y-3">
            {displayTopIssues.map((issue, i) => {
              const config = severityConfig[issue.severity];
              const Icon = config.icon;
              const expanded = expandedIssues.has(i);

              return (
                <li key={i}>
                  <button
                    onClick={() => toggleIssue(i)}
                    className={cn(
                      "w-full rounded-lg border p-4 text-left transition-colors",
                      config.border,
                      expanded ? config.bg : "hover:bg-muted/30"
                    )}
                    aria-expanded={expanded}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={cn("mt-0.5 size-4 shrink-0", config.color)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn("text-xs font-medium", config.color)}
                          >
                            {config.label}
                          </span>
                          {issue.wcagCriteria.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              WCAG {issue.wcagCriteria.join(", ")}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-medium">
                          {issue.description}
                        </p>
                      </div>
                      {expanded ? (
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {expanded && (
                    <div
                      className={cn(
                        "mt-1 space-y-3 rounded-b-lg border border-t-0 p-4",
                        config.border,
                        config.bg
                      )}
                    >
                      {issue.helpText && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {nl.scan.whyImportant}
                          </p>
                          <p className="mt-1 text-sm">{issue.helpText}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {nl.scan.howToFix}
                        </p>
                        <p className="mt-1 text-sm">{issue.fixSuggestion}</p>
                      </div>
                      {issue.htmlElement && (
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            HTML Element
                          </p>
                          <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                            {issue.htmlElement}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Remaining issues — blurred/gated */}
      {displayRemainingIssues.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            Overige problemen
          </h2>
          <div className="relative">
            <ul className="space-y-3">
              {displayRemainingIssues.slice(0, 5).map((issue, i) => {
                const config = severityConfig[issue.severity];
                const Icon = config.icon;

                return (
                  <li
                    key={i}
                    className={cn(
                      "rounded-lg border p-4 opacity-60",
                      config.border,
                      i >= 2 && "blur-[2px]"
                    )}
                    aria-hidden={i >= 2}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={cn("mt-0.5 size-4 shrink-0", config.color)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn("text-xs font-medium", config.color)}
                          >
                            {config.label}
                          </span>
                          {issue.wcagCriteria.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              WCAG {issue.wcagCriteria.join(", ")}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-medium">
                          {issue.description}
                        </p>
                      </div>
                      <Lock className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Gradient overlay for blur effect */}
            {displayRemainingIssues.length > 2 && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
            )}
          </div>

          {/* Unlock CTA */}
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
            <Lock className="mx-auto size-8 text-primary" />
            <h3 className="mt-3 text-lg font-semibold">
              Bekijk alle {displayBlurredCount} problemen met uitleg en oplossingen
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Maak een gratis account aan om alle issues te bekijken, inclusief
              uitleg waarom ze belangrijk zijn en hoe je ze kunt oplossen.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild>
                <a href="/auth/register?from=scan">
                  Gratis account aanmaken
                  <ArrowRight className="ml-1 size-4" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/pricing?from=scan">
                  Bekijk plannen
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EAA Compliance Status */}
      {eaaData && (
        <div
          className={cn(
            "rounded-xl border p-5",
            eaaStatusConfig[eaaData.status].border,
            eaaStatusConfig[eaaData.status].bg
          )}
        >
          <div className="flex items-start gap-3">
            {(() => {
              const EaaIcon = eaaStatusConfig[eaaData.status].icon;
              return (
                <EaaIcon
                  className={cn(
                    "mt-0.5 size-6 shrink-0",
                    eaaStatusConfig[eaaData.status].color
                  )}
                />
              );
            })()}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{nl.eaa.title}</h2>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold",
                    eaaStatusConfig[eaaData.status].color,
                    eaaStatusConfig[eaaData.status].border
                  )}
                >
                  {eaaData.label}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {eaaData.percentage}% compliance — {eaaData.passedCount}{" "}
                {nl.eaa.criteriaOf} {eaaData.totalRequired}{" "}
                {nl.eaa.criteriaStatus}
              </p>
              {eaaData.status === "non_compliant" && (
                <p className="mt-2 text-xs font-medium text-score-poor">
                  {nl.eaa.fineWarning}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {nl.eaa.requiredBy}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estimated pages nudge */}
      {estimatedPages && estimatedPages > 1 && (
        <div className="rounded-xl border border-border/50 bg-muted/30 p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Deze scan controleerde <strong>1 pagina</strong>. Je website heeft waarschijnlijk{" "}
            <strong>{estimatedPages}+ pagina&apos;s</strong> met problemen.{" "}
            <a href="/pricing" className="font-medium text-primary hover:underline">
              Upgrade om je hele website te scannen.
            </a>
          </p>
        </div>
      )}

      {/* Share + CTA */}
      <div className="space-y-4 rounded-xl border border-border/50 bg-card/50 p-6">
        {/* Share buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex-1"
          >
            <Share2 className="size-4" />
            {nl.scan.shareScore}
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="size-4" />
                {nl.scan.linkCopied}
              </>
            ) : (
              <>
                <Copy className="size-4" />
                {nl.scan.copyLink}
              </>
            )}
          </Button>
        </div>

        {/* CTA */}
        <div className="border-t border-border/40 pt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {nl.scan.fullScanCta}
          </p>
          <div className="mt-3 flex justify-center">
            <Button asChild>
              <a href="/auth/register?from=scan">
                Gratis account aanmaken
                <ArrowRight className="ml-1 size-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
