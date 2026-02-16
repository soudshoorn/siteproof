import { JSDOM } from "jsdom";
import axe from "axe-core";
import type { IssueSeverity, IssueImpact } from "@prisma/client";
import { getTranslation } from "./translations/nl";
import { calculateScore, mapAxeSeverity } from "./score";

const USER_AGENT = "SiteProof/1.0 (Accessibility Scanner)";
const FETCH_TIMEOUT = 15_000;

export interface LitePageAnalysis {
  url: string;
  title: string | null;
  score: number;
  loadTime: number;
  issues: LiteAnalyzedIssue[];
}

export interface LiteAnalyzedIssue {
  axeRuleId: string;
  severity: IssueSeverity;
  impact: IssueImpact;
  wcagCriteria: string[];
  wcagLevel: string | null;
  description: string;
  helpText: string;
  fixSuggestion: string;
  htmlElement: string | null;
  cssSelector: string | null;
  pageUrl: string;
}

/**
 * Lightweight page analyzer that works on Vercel serverless.
 * Uses fetch + jsdom + axe-core instead of Puppeteer.
 *
 * Limitations vs full scanner:
 * - No JavaScript execution (SPA content won't be analyzed)
 * - No screenshots
 * - CSS-dependent issues may be missed
 *
 * Good enough for quick scans of server-rendered pages.
 */
export async function analyzePageLite(url: string): Promise<LitePageAnalysis> {
  const startTime = Date.now();

  // Fetch the HTML
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  let html: string;
  let finalUrl: string;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} bij laden van ${url}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new Error(`Geen HTML pagina (content-type: ${contentType})`);
    }

    html = await response.text();
    finalUrl = response.url;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Timeout: ${url} reageerde niet binnen ${FETCH_TIMEOUT / 1000} seconden`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  // Create a jsdom instance
  const dom = new JSDOM(html, {
    url: finalUrl,
    runScripts: "outside-only",
    pretendToBeVisual: true,
    resources: "usable",
  });

  const { document } = dom.window;
  const title = document.title || null;

  // Run axe-core on the jsdom document
  let axeResults;
  try {
    axeResults = await axe.run(document.documentElement as unknown as axe.ElementContext, {
      runOnly: {
        type: "tag",
        values: [
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22aa",
          "best-practice",
        ],
      },
      resultTypes: ["violations"],
    });
  } finally {
    dom.window.close();
  }

  const loadTime = Date.now() - startTime;

  // Map violations to our format with Dutch translations
  const issues: LiteAnalyzedIssue[] = [];

  for (const violation of axeResults.violations) {
    const translation = getTranslation(violation.id);
    const severity = mapAxeSeverity(violation.impact ?? undefined);
    const wcagCriteria = extractWcagCriteria(violation.tags);

    for (const node of violation.nodes) {
      issues.push({
        axeRuleId: violation.id,
        severity,
        impact: severity as unknown as IssueImpact,
        wcagCriteria: wcagCriteria.length > 0 ? wcagCriteria : translation.wcagCriteria,
        wcagLevel: translation.wcagLevel,
        description: translation.description,
        helpText: translation.helpText,
        fixSuggestion: translation.fixSuggestion,
        htmlElement: truncateHtml(node.html),
        cssSelector: node.target?.[0]?.toString() ?? null,
        pageUrl: finalUrl,
      });
    }
  }

  const score = calculateScore(issues);

  return {
    url: finalUrl,
    title,
    score,
    loadTime,
    issues,
  };
}

function extractWcagCriteria(tags: string[]): string[] {
  const criteria: string[] = [];
  const wcagPattern = /^wcag(\d)(\d)(\d+)$/;

  for (const tag of tags) {
    const match = tag.match(wcagPattern);
    if (match) {
      criteria.push(`${match[1]}.${match[2]}.${match[3]}`);
    }
  }

  return [...new Set(criteria)];
}

function truncateHtml(html: string, maxLength = 500): string {
  if (html.length <= maxLength) return html;
  return html.slice(0, maxLength) + "...";
}
