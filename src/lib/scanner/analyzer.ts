import type { Browser, Page } from "puppeteer";
import type { IssueSeverity, IssueImpact } from "@prisma/client";
import { getTranslation } from "./translations/nl";
import { calculateScore, mapAxeSeverity } from "./score";

const USER_AGENT = "SiteProof/1.0 (Accessibility Scanner)";
const PAGE_TIMEOUT = 15_000; // 15s — if a page hasn't loaded by now, skip it

export interface PageAnalysis {
  url: string;
  title: string | null;
  score: number;
  loadTime: number;
  issues: AnalyzedIssue[];
}

export interface AnalyzedIssue {
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

// Axe-core result types (subset of what axe returns)
interface AxeViolation {
  id: string;
  impact?: string;
  tags: string[];
  nodes: AxeNode[];
}

interface AxeNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

interface AxeResults {
  violations: AxeViolation[];
}

/**
 * Analyze a single page for accessibility issues using axe-core.
 * Opens the page in Puppeteer, injects axe-core, runs the analysis,
 * and maps results to Dutch translations.
 */
export async function analyzePage(
  browser: Browser,
  url: string
): Promise<PageAnalysis> {
  let page: Page | null = null;
  const startTime = Date.now();

  try {
    page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1280, height: 720 });

    // Block unnecessary resources to speed up loading
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const type = request.resourceType();
      if (["image", "font", "media"].includes(type)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Navigate to the page — use domcontentloaded + manual wait for speed
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_TIMEOUT,
    });

    if (!response) {
      throw new Error(`Geen response ontvangen van ${url}`);
    }

    const statusCode = response.status();
    if (statusCode >= 400) {
      throw new Error(`HTTP ${statusCode} bij laden van ${url}`);
    }

    // Wait for DOM stability (important for SPAs)
    await waitForDomStability(page);

    const loadTime = Date.now() - startTime;

    // Get page title
    const title = await page.title();

    // Inject and run axe-core
    const axeResults = await runAxeCore(page);

    // Map violations to our issue format with Dutch translations
    const issues = mapViolationsToIssues(axeResults.violations, url);

    // Calculate score
    const score = calculateScore(issues);

    return {
      url,
      title: title || null,
      score,
      loadTime,
      issues,
    };
  } catch (error) {
    const loadTime = Date.now() - startTime;
    throw new PageAnalysisError(
      url,
      error instanceof Error ? error.message : String(error),
      loadTime
    );
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {
        // Page might already be closed
      }
    }
  }
}

/**
 * Wait for the DOM to stabilize (no more mutations for 500ms).
 * Important for SPAs that render after initial load.
 */
async function waitForDomStability(page: Page, timeout = 3000): Promise<void> {
  try {
    await page.evaluate((timeoutMs: number) => {
      return new Promise<void>((resolve) => {
        let timer: ReturnType<typeof setTimeout>;
        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            observer.disconnect();
            resolve();
          }, 500);
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
        });

        // Start the initial timer
        timer = setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 500);

        // Max timeout
        setTimeout(() => {
          observer.disconnect();
          resolve();
        }, timeoutMs);
      });
    }, timeout);
  } catch {
    // If the evaluation fails, the page is likely stable enough
  }
}

/**
 * Inject axe-core into the page and run the accessibility analysis.
 */
async function runAxeCore(page: Page): Promise<AxeResults> {
  // Read axe-core source and inject it
  const axeCorePath = require.resolve("axe-core");
  const fs = await import("fs");
  const axeSource = fs.readFileSync(axeCorePath, "utf-8");

  await page.evaluate(axeSource);

  // Run axe-core with WCAG 2.1 AA + 2.2 AA tags
  const results = await page.evaluate(() => {
    return new Promise<AxeResults>((resolve, reject) => {
      // @ts-expect-error axe is injected globally
      if (typeof axe === "undefined") {
        reject(new Error("axe-core failed to load"));
        return;
      }

      // @ts-expect-error axe is injected globally
      axe
        .run(document, {
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
        })
        .then((r: AxeResults) => resolve(r))
        .catch((e: Error) => reject(e));
    });
  });

  return results;
}

/**
 * Map axe-core violations to our issue format with Dutch translations.
 */
function mapViolationsToIssues(
  violations: AxeViolation[],
  pageUrl: string
): AnalyzedIssue[] {
  const issues: AnalyzedIssue[] = [];

  for (const violation of violations) {
    const translation = getTranslation(violation.id);
    const severity = mapAxeSeverity(violation.impact);
    const wcagCriteria = extractWcagCriteria(violation.tags);

    // Create one issue per affected node (element on the page)
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
        cssSelector: node.target?.[0] ?? null,
        pageUrl,
      });
    }
  }

  return issues;
}

/**
 * Extract WCAG criteria numbers from axe-core tags.
 * Tags look like: ["wcag2a", "wcag111", "cat.text-alternatives"]
 * We want to extract "1.1.1" from "wcag111".
 */
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

/**
 * Truncate HTML snippet to prevent storing huge DOM fragments.
 */
function truncateHtml(html: string, maxLength = 500): string {
  if (html.length <= maxLength) return html;
  return html.slice(0, maxLength) + "...";
}

/**
 * Custom error for page analysis failures — preserves URL and load time.
 */
export class PageAnalysisError extends Error {
  public readonly url: string;
  public readonly loadTime: number;

  constructor(url: string, message: string, loadTime: number) {
    super(message);
    this.name = "PageAnalysisError";
    this.url = url;
    this.loadTime = loadTime;
  }
}
