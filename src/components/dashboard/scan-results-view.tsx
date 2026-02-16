"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreCircle } from "@/components/scan/score-circle";
import { nl } from "@/lib/i18n/nl";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { EaaComplianceCard } from "@/components/scan/eaa-compliance-card";
import {
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  Info,
  Search,
  ChevronDown,
  ChevronRight,
  Code,
  FileDown,
  Clock,
  User,
  Loader2,
} from "lucide-react";

type Severity = "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR";

interface ScanIssue {
  id: string;
  axeRuleId: string;
  severity: Severity;
  impact: string;
  wcagCriteria: string[];
  wcagLevel: string | null;
  description: string;
  helpText: string;
  fixSuggestion: string;
  htmlElement: string | null;
  cssSelector: string | null;
  pageUrl: string;
  pageResultId: string | null;
}

interface ScanPage {
  id: string;
  url: string;
  title: string | null;
  score: number | null;
  issueCount: number;
  loadTime: number | null;
}

interface EaaData {
  percentage: number;
  status: "compliant" | "partially_compliant" | "non_compliant";
  label: string;
  passedCount: number;
  failedCount: number;
  totalRequired: number;
  principleScores: Array<{
    name: string;
    article: string;
    passed: number;
    total: number;
    percentage: number;
  }>;
  canDownloadStatement: boolean;
}

interface ScanData {
  id: string;
  status: string;
  score: number | null;
  totalPages: number;
  scannedPages: number;
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  duration: number | null;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
  website: { id: string; name: string; url: string };
  pages: ScanPage[];
  issues: ScanIssue[];
  startedBy: { fullName: string | null; email: string } | null;
}

const severityConfig: Record<
  Severity,
  { icon: typeof AlertCircle; color: string; bg: string; border: string; label: string }
> = {
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

const severityOrder: Severity[] = ["CRITICAL", "SERIOUS", "MODERATE", "MINOR"];

export function ScanResultsView({ scan, eaaData }: { scan: ScanData; eaaData?: EaaData }) {
  const [severityFilter, setSeverityFilter] = useState<Severity | "ALL">("ALL");
  const [wcagFilter, setWcagFilter] = useState<string>("ALL");
  const [pageFilter, setPageFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [exportingPdf, setExportingPdf] = useState(false);

  const filteredIssues = useMemo(() => {
    return scan.issues.filter((issue) => {
      if (severityFilter !== "ALL" && issue.severity !== severityFilter) return false;
      if (wcagFilter !== "ALL" && !issue.wcagCriteria.includes(wcagFilter)) return false;
      if (pageFilter !== "ALL" && issue.pageUrl !== pageFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          issue.description.toLowerCase().includes(q) ||
          issue.fixSuggestion.toLowerCase().includes(q) ||
          issue.axeRuleId.toLowerCase().includes(q) ||
          issue.wcagCriteria.some((c) => c.includes(q))
        );
      }
      return true;
    });
  }, [scan.issues, severityFilter, wcagFilter, pageFilter, searchQuery]);

  const uniquePages = useMemo(() => {
    const pages = new Set(scan.issues.map((i) => i.pageUrl));
    return Array.from(pages);
  }, [scan.issues]);

  const uniqueWcagCriteria = useMemo(() => {
    const criteria = new Set<string>();
    scan.issues.forEach((i) => i.wcagCriteria.forEach((c) => criteria.add(c)));
    return Array.from(criteria).sort();
  }, [scan.issues]);

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      const res = await fetch(`/api/scan/${scan.id}/pdf`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.error || "PDF generatie mislukt";
        alert(msg);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `siteproof-scan-${scan.website.name}-${new Date(scan.createdAt).toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF generatie mislukt. Probeer het later opnieuw.");
    } finally {
      setExportingPdf(false);
    }
  }

  function toggleIssue(id: string) {
    setExpandedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isInProgress =
    scan.status !== "COMPLETED" && scan.status !== "FAILED";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/websites/${scan.website.id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          {scan.website.name}
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{nl.dashboard.scanDetails}</h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(scan.createdAt)} &middot;{" "}
              {formatRelativeTime(scan.createdAt)}
            </p>
          </div>
          {scan.status === "COMPLETED" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportPdf}
                disabled={exportingPdf}
              >
                {exportingPdf ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                {nl.dashboard.exportPdf}
              </Button>
              <Button variant="outline" asChild>
                <a href={scan.website.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  Website bekijken
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Status: in progress */}
      {isInProgress && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="relative size-16">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Search className="size-6 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium">{nl.dashboard.scanInProgress}</p>
              <p className="text-sm text-muted-foreground">
                {scan.scannedPages} van {scan.totalPages || "?"}{" "}
                {nl.dashboard.pagesScanned}
              </p>
            </div>
            <Badge variant="secondary">{scan.status}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Failed */}
      {scan.status === "FAILED" && (
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <p className="mt-3 font-medium">Scan mislukt</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {scan.errorMessage || nl.scan.scanFailed}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Completed: Scan meta */}
      {scan.status === "COMPLETED" && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {scan.duration != null && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {scan.duration} {nl.dashboard.seconds}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            {scan.scannedPages} {nl.dashboard.pagesScanned}
          </span>
          {scan.startedBy && (
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5" />
              {scan.startedBy.fullName || scan.startedBy.email}
            </span>
          )}
        </div>
      )}

      {/* Completed: Score overview */}
      {scan.status === "COMPLETED" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardContent className="flex flex-col items-center gap-2 pt-6">
                <ScoreCircle score={scan.score ?? 0} size="lg" />
                <p className="text-sm text-muted-foreground">Overall score</p>
              </CardContent>
            </Card>
            {severityOrder.map((sev) => {
              const config = severityConfig[sev];
              const Icon = config.icon;
              const count =
                sev === "CRITICAL"
                  ? scan.criticalIssues
                  : sev === "SERIOUS"
                    ? scan.seriousIssues
                    : sev === "MODERATE"
                      ? scan.moderateIssues
                      : scan.minorIssues;
              return (
                <Card key={sev}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Icon className={cn("size-5", config.color)} />
                      <div>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs text-muted-foreground">{config.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* EAA Compliance */}
          {eaaData && (
            <EaaComplianceCard
              data={eaaData}
              scanId={scan.id}
              canDownloadStatement={eaaData.canDownloadStatement}
            />
          )}

          {/* Tabs: Issues / Pages */}
          <Tabs defaultValue="issues" className="space-y-4">
            <TabsList>
              <TabsTrigger value="issues">
                Issues ({scan.totalIssues})
              </TabsTrigger>
              <TabsTrigger value="pages">
                Pagina&apos;s ({scan.scannedPages})
              </TabsTrigger>
            </TabsList>

            {/* Issues tab */}
            <TabsContent value="issues" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Zoek in issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as Severity | "ALL")}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    aria-label={nl.dashboard.filterBySeverity}
                  >
                    <option value="ALL">Alle niveaus</option>
                    {severityOrder.map((s) => (
                      <option key={s} value={s}>
                        {severityConfig[s].label}
                      </option>
                    ))}
                  </select>
                  {uniqueWcagCriteria.length > 0 && (
                    <select
                      value={wcagFilter}
                      onChange={(e) => setWcagFilter(e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      aria-label={nl.dashboard.filterByWcag}
                    >
                      <option value="ALL">Alle WCAG criteria</option>
                      {uniqueWcagCriteria.map((c) => (
                        <option key={c} value={c}>
                          WCAG {c}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    value={pageFilter}
                    onChange={(e) => setPageFilter(e.target.value)}
                    className="h-9 w-full truncate rounded-md border border-input bg-background px-3 text-sm sm:max-w-[200px]"
                    aria-label={nl.dashboard.filterByPage}
                  >
                    <option value="ALL">Alle pagina&apos;s</option>
                    {uniquePages.map((url) => (
                      <option key={url} value={url}>
                        {new URL(url).pathname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Issues list */}
              {filteredIssues.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    {scan.totalIssues === 0
                      ? "Geen issues gevonden! Je website scoort uitstekend."
                      : nl.common.noResults}
                  </CardContent>
                </Card>
              ) : (
                <ul className="space-y-3">
                  {filteredIssues.map((issue) => {
                    const config = severityConfig[issue.severity];
                    const Icon = config.icon;
                    const expanded = expandedIssues.has(issue.id);

                    return (
                      <li key={issue.id}>
                        <button
                          onClick={() => toggleIssue(issue.id)}
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
                                  className={cn(
                                    "text-xs font-medium",
                                    config.color
                                  )}
                                >
                                  {config.label}
                                </span>
                                {issue.wcagCriteria.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    WCAG {issue.wcagCriteria.join(", ")}
                                  </span>
                                )}
                                {issue.wcagLevel && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                                    {issue.wcagLevel}
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 text-sm font-medium">
                                {issue.description}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {new URL(issue.pageUrl).pathname}
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
                              "mt-1 rounded-b-lg border border-t-0 p-4 space-y-3",
                              config.border,
                              config.bg
                            )}
                          >
                            {/* Why it matters */}
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Waarom is dit belangrijk?
                              </p>
                              <p className="mt-1 text-sm">{issue.helpText}</p>
                            </div>

                            {/* Fix suggestion */}
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Hoe op te lossen
                              </p>
                              <p className="mt-1 text-sm">{issue.fixSuggestion}</p>
                            </div>

                            {/* HTML element */}
                            {issue.htmlElement && (
                              <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  <Code className="mr-1 inline size-3" />
                                  HTML Element
                                </p>
                                <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                                  {issue.htmlElement}
                                </pre>
                              </div>
                            )}

                            {/* CSS Selector */}
                            {issue.cssSelector && (
                              <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  CSS Selector
                                </p>
                                <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                                  {issue.cssSelector}
                                </code>
                              </div>
                            )}

                            {/* Page URL */}
                            <div>
                              <a
                                href={issue.pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                {issue.pageUrl}
                                <ExternalLink className="size-3" />
                              </a>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </TabsContent>

            {/* Pages tab */}
            <TabsContent value="pages">
              <Card>
                <CardContent className="pt-6">
                  {scan.pages.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      Geen pagina-resultaten beschikbaar.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/40 text-left text-muted-foreground">
                            <th className="pb-3 font-medium">Pagina</th>
                            <th className="pb-3 font-medium">Score</th>
                            <th className="pb-3 font-medium">Issues</th>
                            <th className="pb-3 font-medium">Laadtijd</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {scan.pages.map((page) => (
                            <tr key={page.id} className="hover:bg-muted/30">
                              <td className="max-w-xs truncate py-3">
                                <a
                                  href={page.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-primary"
                                >
                                  {page.title || new URL(page.url).pathname}
                                </a>
                                <br />
                                <span className="text-xs text-muted-foreground">
                                  {new URL(page.url).pathname}
                                </span>
                              </td>
                              <td className="py-3">
                                {page.score != null ? (
                                  <ScoreCircle
                                    score={page.score}
                                    size="sm"
                                    animated={false}
                                  />
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="py-3">{page.issueCount}</td>
                              <td className="py-3">
                                {page.loadTime ? `${page.loadTime}ms` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
