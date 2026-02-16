import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import puppeteer from "puppeteer";
import type { Browser } from "puppeteer";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { analyzePage, PageAnalysisError } from "../src/lib/scanner/analyzer";
import { crawlWebsite } from "../src/lib/scanner/crawler";
import { calculateOverallScore } from "../src/lib/scanner/score";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PORT = parseInt(process.env.PORT || "3001", 10);
const MAX_CONCURRENT_SCANS = parseInt(process.env.MAX_CONCURRENT_SCANS || "10", 10);
const SCANNER_SECRET = process.env.SCANNER_SECRET || "";

let browser: Browser | null = null;
let activeScanCount = 0;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.connected) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-default-apps",
        "--disable-translate",
        "--no-first-run",
      ],
    });
  }
  return browser;
}

const app = express();
app.use(express.json());

// Auth middleware — verify shared secret
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/health") return next();

  if (SCANNER_SECRET) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${SCANNER_SECRET}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }
  next();
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    browserConnected: browser?.connected ?? false,
    activeScanCount,
    maxConcurrentScans: MAX_CONCURRENT_SCANS,
  });
});

/**
 * POST /scan
 *
 * Quick scan: analyze a single page with Puppeteer + axe-core.
 * Returns results inline.
 */
app.post("/scan", async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "url is required" });
    return;
  }

  if (activeScanCount >= MAX_CONCURRENT_SCANS) {
    res.status(429).json({ error: "Te veel gelijktijdige scans. Probeer het later opnieuw." });
    return;
  }

  activeScanCount++;
  const startTime = Date.now();

  try {
    const activeBrowser = await getBrowser();
    const analysis = await analyzePage(activeBrowser, url);

    res.json({
      success: true,
      data: {
        url: analysis.url,
        title: analysis.title,
        score: analysis.score,
        loadTime: analysis.loadTime,
        issues: analysis.issues,
        totalIssues: analysis.issues.length,
        duration: Date.now() - startTime,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Scanner] Scan failed for ${url}:`, message);

    res.status(422).json({
      success: false,
      error: message,
    });
  } finally {
    activeScanCount--;
  }
});

/** How many pages to analyze simultaneously */
const SCAN_CONCURRENCY = 3;

/**
 * POST /scan/full
 *
 * Full scan: crawl a website and analyze all discovered pages.
 * Returns results for all pages inline.
 * Used for authenticated full scans.
 */
app.post("/scan/full", async (req: Request, res: Response) => {
  const { url, maxPages = 5 } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "url is required" });
    return;
  }

  if (activeScanCount >= MAX_CONCURRENT_SCANS) {
    res.status(429).json({ error: "Te veel gelijktijdige scans. Probeer het later opnieuw." });
    return;
  }

  activeScanCount++;
  const startTime = Date.now();

  try {
    const activeBrowser = await getBrowser();

    // Phase 1: Crawl
    const crawlResult = await crawlWebsite(activeBrowser, url, maxPages);
    const pagesToScan = crawlResult.urls;

    if (pagesToScan.length === 0) {
      res.status(422).json({
        success: false,
        error: `Geen pagina's gevonden op ${url}. Controleer of de website bereikbaar is.`,
      });
      return;
    }

    // Phase 2: Analyze pages concurrently (batches of SCAN_CONCURRENCY)
    const pageResults: Array<{
      url: string;
      title: string | null;
      score: number | null;
      loadTime: number | null;
      issueCount: number;
      issues: Array<unknown>;
      error?: string;
    }> = [];
    let totalCritical = 0;
    let totalSerious = 0;
    let totalModerate = 0;
    let totalMinor = 0;
    let totalIssues = 0;

    for (let i = 0; i < pagesToScan.length; i += SCAN_CONCURRENCY) {
      const batch = pagesToScan.slice(i, i + SCAN_CONCURRENCY);

      const results = await Promise.allSettled(
        batch.map(async (pageUrl) => {
          try {
            const analysis = await analyzePage(activeBrowser, pageUrl);
            return { success: true as const, analysis };
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`[Scanner] Page failed: ${pageUrl}: ${message}`);
            return { success: false as const, pageUrl, error: message };
          }
        })
      );

      for (const result of results) {
        if (result.status === "rejected") continue;

        const value = result.value;
        if (value.success) {
          const analysis = value.analysis;
          for (const issue of analysis.issues) {
            switch (issue.severity) {
              case "CRITICAL": totalCritical++; break;
              case "SERIOUS": totalSerious++; break;
              case "MODERATE": totalModerate++; break;
              case "MINOR": totalMinor++; break;
            }
          }
          totalIssues += analysis.issues.length;
          pageResults.push({
            url: analysis.url,
            title: analysis.title,
            score: analysis.score,
            loadTime: analysis.loadTime,
            issueCount: analysis.issues.length,
            issues: analysis.issues,
          });
        } else {
          pageResults.push({
            url: value.pageUrl,
            title: null,
            score: null,
            loadTime: null,
            issueCount: 0,
            issues: [],
            error: value.error,
          });
        }
      }
    }

    // Phase 3: Calculate overall score
    const scoredPages = pageResults.filter((p) => p.score !== null);
    const overallScore =
      scoredPages.length > 0
        ? calculateOverallScore(
            scoredPages.map((p) => ({
              score: p.score!,
              issueCount: p.issueCount,
            }))
          )
        : 0;

    const duration = Date.now() - startTime;
    const failedPages = pageResults.filter((p) => p.error).length;

    res.json({
      success: true,
      data: {
        url,
        score: overallScore,
        totalPages: pagesToScan.length,
        totalIssues,
        criticalIssues: totalCritical,
        seriousIssues: totalSerious,
        moderateIssues: totalModerate,
        minorIssues: totalMinor,
        duration,
        failedPages,
        crawlErrors: crawlResult.errors,
        pages: pageResults,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Scanner] Full scan failed for ${url}:`, message);

    res.status(422).json({
      success: false,
      error: message,
    });
  } finally {
    activeScanCount--;
  }
});

/**
 * POST /scan/async
 *
 * Async full scan: accepts a scanId, runs the scan in the background,
 * and updates the database directly with progress and results.
 * Returns immediately so the API route doesn't have to wait.
 */
app.post("/scan/async", async (req: Request, res: Response) => {
  const { scanId, url, maxPages = 5 } = req.body;

  if (!scanId || !url) {
    res.status(400).json({ error: "scanId and url are required" });
    return;
  }

  if (activeScanCount >= MAX_CONCURRENT_SCANS) {
    res.status(429).json({ error: "Te veel gelijktijdige scans." });
    return;
  }

  // Respond immediately — scan runs in the background
  res.json({ success: true, message: "Scan gestart" });

  // Run the scan async (not awaited)
  runAsyncScan(scanId, url, maxPages).catch((err) => {
    console.error(`[Scanner] Async scan ${scanId} crashed:`, err);
  });
});

async function runAsyncScan(scanId: string, url: string, maxPages: number): Promise<void> {
  activeScanCount++;
  const startTime = Date.now();

  try {
    // Phase 1: Crawl
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "CRAWLING" },
    });

    const activeBrowser = await getBrowser();
    const crawlResult = await crawlWebsite(activeBrowser, url, maxPages, async (_scanned, total) => {
      await prisma.scan.update({
        where: { id: scanId },
        data: { totalPages: total },
      }).catch(() => {});
    });

    const pagesToScan = crawlResult.urls;
    console.log(`[Scanner] Scan ${scanId}: found ${pagesToScan.length} pages for ${url}`);

    if (pagesToScan.length === 0) {
      throw new Error(`Geen pagina's gevonden op ${url}. Controleer of de website bereikbaar is.`);
    }

    // Phase 2: Analyze pages concurrently
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "SCANNING", totalPages: pagesToScan.length, scannedPages: 0 },
    });

    let totalCritical = 0;
    let totalSerious = 0;
    let totalModerate = 0;
    let totalMinor = 0;
    let totalIssues = 0;
    let pagesCompleted = 0;
    let failedPages = 0;
    const scoredPages: Array<{ score: number; issueCount: number }> = [];

    for (let i = 0; i < pagesToScan.length; i += SCAN_CONCURRENCY) {
      const batch = pagesToScan.slice(i, i + SCAN_CONCURRENCY);

      const results = await Promise.allSettled(
        batch.map(async (pageUrl) => {
          try {
            const analysis = await analyzePage(activeBrowser, pageUrl);

            // Save PageResult + issues to DB
            const pageResult = await prisma.pageResult.create({
              data: {
                scanId,
                url: analysis.url,
                title: analysis.title,
                score: analysis.score,
                issueCount: analysis.issues.length,
                loadTime: analysis.loadTime,
              },
            });

            if (analysis.issues.length > 0) {
              await prisma.issue.createMany({
                data: analysis.issues.map((issue) => ({
                  scanId,
                  pageResultId: pageResult.id,
                  axeRuleId: issue.axeRuleId,
                  severity: issue.severity,
                  impact: issue.impact,
                  wcagCriteria: issue.wcagCriteria,
                  wcagLevel: issue.wcagLevel,
                  description: issue.description,
                  helpText: issue.helpText,
                  fixSuggestion: issue.fixSuggestion,
                  htmlElement: issue.htmlElement,
                  cssSelector: issue.cssSelector,
                  pageUrl: issue.pageUrl,
                })),
              });
            }

            return analysis;
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const loadTime = error instanceof PageAnalysisError ? error.loadTime : null;
            console.warn(`[Scanner] Page failed: ${pageUrl}: ${message}`);

            // Save failed page result
            await prisma.pageResult.create({
              data: {
                scanId,
                url: pageUrl,
                title: null,
                score: null,
                issueCount: 0,
                loadTime: loadTime,
              },
            }).catch(() => {});

            return null;
          }
        })
      );

      // Tally results
      for (const result of results) {
        pagesCompleted++;
        if (result.status === "fulfilled" && result.value) {
          const analysis = result.value;
          for (const issue of analysis.issues) {
            switch (issue.severity) {
              case "CRITICAL": totalCritical++; break;
              case "SERIOUS": totalSerious++; break;
              case "MODERATE": totalModerate++; break;
              case "MINOR": totalMinor++; break;
            }
          }
          totalIssues += analysis.issues.length;
          scoredPages.push({ score: analysis.score, issueCount: analysis.issues.length });
        } else {
          failedPages++;
        }
      }

      // Update progress after each batch
      await prisma.scan.update({
        where: { id: scanId },
        data: { scannedPages: pagesCompleted },
      }).catch(() => {});
    }

    // Phase 3: Finalize
    const overallScore = scoredPages.length > 0
      ? calculateOverallScore(scoredPages)
      : 0;

    const duration = Math.round((Date.now() - startTime) / 1000);
    const errorMessage = failedPages > 0
      ? `${failedPages} van ${pagesToScan.length} pagina's konden niet worden gescand.`
      : null;

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: scoredPages.length > 0 ? "COMPLETED" : "FAILED",
        score: overallScore,
        totalPages: pagesToScan.length,
        scannedPages: pagesToScan.length,
        totalIssues,
        criticalIssues: totalCritical,
        seriousIssues: totalSerious,
        moderateIssues: totalModerate,
        minorIssues: totalMinor,
        duration,
        errorMessage,
        completedAt: new Date(),
      },
    });

    console.log(
      `[Scanner] Scan ${scanId} completed: score=${overallScore}, ` +
      `pages=${scoredPages.length}/${pagesToScan.length}, issues=${totalIssues}, duration=${duration}s`
    );
  } catch (error) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Scanner] Scan ${scanId} failed:`, errorMessage);

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "FAILED",
        errorMessage,
        duration,
        completedAt: new Date(),
      },
    });
  } finally {
    activeScanCount--;
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`[Scanner] Service running on port ${PORT}`);
  console.log(`[Scanner] Max concurrent scans: ${MAX_CONCURRENT_SCANS}`);

  // Pre-warm the browser
  getBrowser()
    .then(() => console.log("[Scanner] Browser ready"))
    .catch((err) => console.error("[Scanner] Browser warmup failed:", err));
});

// Graceful shutdown
async function shutdown() {
  console.log("[Scanner] Shutting down...");
  if (browser) await browser.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
