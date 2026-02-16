import "dotenv/config";
import { Worker } from "bullmq";
import puppeteer from "puppeteer";
import type { Browser } from "puppeteer";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { crawlWebsite } from "../src/lib/scanner/crawler";
import { analyzePage, PageAnalysisError } from "../src/lib/scanner/analyzer";
import { calculateOverallScore } from "../src/lib/scanner/score";
import { notifyScanCompleted } from "../src/lib/email/notifications";
import type { ScanJobData, QuickScanJobData } from "../src/lib/scanner/queue";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

let browser: Browser | null = null;

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

/** How many pages to analyze simultaneously */
const CONCURRENCY = 3;

/**
 * Process a scan job: crawl the website, analyze each page, save results.
 */
async function processScanJob(data: ScanJobData): Promise<void> {
  const { scanId, url, maxPages } = data;
  const startTime = Date.now();

  console.log(`[Scanner] Starting scan ${scanId} for ${url} (max ${maxPages} pages)`);

  try {
    // Update scan status to CRAWLING
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "CRAWLING" },
    });

    const activeBrowser = await getBrowser();

    // Phase 1: Crawl and discover pages
    const crawlResult = await crawlWebsite(
      activeBrowser,
      url,
      maxPages,
      async (_scanned, total) => {
        await prisma.scan.update({
          where: { id: scanId },
          data: { totalPages: total, scannedPages: 0 },
        }).catch(() => {});
      }
    );

    const pagesToScan = crawlResult.urls;
    console.log(`[Scanner] Found ${pagesToScan.length} pages to scan for ${scanId}`);

    if (pagesToScan.length === 0) {
      throw new Error(`Geen pagina's gevonden op ${url}. Controleer of de website bereikbaar is.`);
    }

    // Update scan status to SCANNING
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "SCANNING",
        totalPages: pagesToScan.length,
      },
    });

    // Phase 2: Analyze pages concurrently (batches of CONCURRENCY)
    const pageResults: Array<{
      url: string;
      title: string | null;
      score: number;
      issueCount: number;
      loadTime: number;
    }> = [];

    let totalCritical = 0;
    let totalSerious = 0;
    let totalModerate = 0;
    let totalMinor = 0;
    let totalIssues = 0;
    let pagesCompleted = 0;
    let failedPages = 0;

    // Process pages in concurrent batches
    for (let i = 0; i < pagesToScan.length; i += CONCURRENCY) {
      const batch = pagesToScan.slice(i, i + CONCURRENCY);

      const results = await Promise.allSettled(
        batch.map(async (pageUrl) => {
          console.log(`[Scanner] Analyzing: ${pageUrl}`);

          try {
            const analysis = await analyzePage(activeBrowser, pageUrl);

            // Save PageResult
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

            // Save issues in batches
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
            if (error instanceof PageAnalysisError) {
              console.warn(`[Scanner] Page failed: ${pageUrl}: ${error.message}`);

              // Save a PageResult with no score to indicate failure
              await prisma.pageResult.create({
                data: {
                  scanId,
                  url: pageUrl,
                  title: null,
                  score: null,
                  issueCount: 0,
                  loadTime: error.loadTime,
                },
              });
            } else {
              console.error(`[Scanner] Unexpected error for ${pageUrl}:`, error);

              // Still save a failed page result
              await prisma.pageResult.create({
                data: {
                  scanId,
                  url: pageUrl,
                  title: null,
                  score: null,
                  issueCount: 0,
                  loadTime: null,
                },
              }).catch(() => {});
            }

            return null; // Mark as failed
          }
        })
      );

      // Process results from this batch
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

          pageResults.push({
            url: analysis.url,
            title: analysis.title,
            score: analysis.score,
            issueCount: analysis.issues.length,
            loadTime: analysis.loadTime,
          });
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

    // Phase 3: Calculate overall score and finalize
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "ANALYZING" },
    });

    const scoredPages = pageResults.filter((p) => p.score !== null);
    const overallScore =
      scoredPages.length > 0
        ? calculateOverallScore(
            scoredPages.map((p) => ({ score: p.score, issueCount: p.issueCount }))
          )
        : 0;

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Build error message if some pages failed
    const errorMessage = failedPages > 0
      ? `${failedPages} van ${pagesToScan.length} pagina's konden niet worden gescand (timeout of niet bereikbaar).`
      : null;

    // Finalize scan — COMPLETED even if some pages failed (partial results are still useful)
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
        `pages=${scoredPages.length}/${pagesToScan.length} (${failedPages} failed), ` +
        `issues=${totalIssues}, duration=${duration}s`
    );

    // Send email notifications (scan completed, score drop, critical issues)
    if (scoredPages.length > 0) {
      try {
        await notifyScanCompleted(prisma, scanId);
      } catch (emailError) {
        console.error(`[Scanner] Failed to send notifications for scan ${scanId}:`, emailError);
      }
    }
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

    throw error; // Re-throw for BullMQ retry logic
  }
}

/**
 * Process a quick scan job: analyze a single page, save results to QuickScan.
 */
async function processQuickScanJob(data: QuickScanJobData): Promise<void> {
  const { quickScanId, url } = data;

  console.log(`[Scanner] Starting quick scan ${quickScanId} for ${url}`);

  try {
    await prisma.quickScan.update({
      where: { id: quickScanId },
      data: { status: "SCANNING" },
    });

    const activeBrowser = await getBrowser();
    const analysis = await analyzePage(activeBrowser, url);

    // Take top 5 issues sorted by severity for the quick scan result
    const severityOrder = { CRITICAL: 0, SERIOUS: 1, MODERATE: 2, MINOR: 3 };
    const topIssues = [...analysis.issues]
      .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
      .slice(0, 5)
      .map((issue) => ({
        axeRuleId: issue.axeRuleId,
        severity: issue.severity,
        description: issue.description,
        helpText: issue.helpText,
        fixSuggestion: issue.fixSuggestion,
        wcagCriteria: issue.wcagCriteria,
        wcagLevel: issue.wcagLevel,
        htmlElement: issue.htmlElement,
        cssSelector: issue.cssSelector,
      }));

    // Count issues by severity
    const issueCounts = {
      critical: analysis.issues.filter((i) => i.severity === "CRITICAL").length,
      serious: analysis.issues.filter((i) => i.severity === "SERIOUS").length,
      moderate: analysis.issues.filter((i) => i.severity === "MODERATE").length,
      minor: analysis.issues.filter((i) => i.severity === "MINOR").length,
      total: analysis.issues.length,
    };

    // Determine failed WCAG criteria for EAA status
    const failedCriteria = [
      ...new Set(analysis.issues.flatMap((i) => i.wcagCriteria)),
    ];

    await prisma.quickScan.update({
      where: { id: quickScanId },
      data: {
        status: "COMPLETED",
        score: analysis.score,
        results: {
          title: analysis.title,
          loadTime: analysis.loadTime,
          topIssues,
          issueCounts,
          failedWcagCriteria: failedCriteria,
        },
      },
    });

    console.log(
      `[Scanner] Quick scan ${quickScanId} completed: score=${analysis.score}, issues=${analysis.issues.length}`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Scanner] Quick scan ${quickScanId} failed:`, errorMessage);

    await prisma.quickScan.update({
      where: { id: quickScanId },
      data: {
        status: "FAILED",
        results: { error: errorMessage },
      },
    });

    throw error;
  }
}

// ─── Worker setup ────────────────────────────────────────

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error("[Scanner] REDIS_URL is required");
  process.exit(1);
}

const worker = new Worker(
  "scans",
  async (job) => {
    if (job.name === "quick-scan") {
      await processQuickScanJob(job.data as QuickScanJobData);
    } else {
      await processScanJob(job.data as ScanJobData);
    }
  },
  {
    connection: { url: redisUrl },
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60_000,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`[Scanner] Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`[Scanner] Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[Scanner] Worker error:", err);
});

// Graceful shutdown
async function shutdown() {
  console.log("[Scanner] Shutting down...");
  await worker.close();
  if (browser) await browser.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("[Scanner] Worker started, waiting for jobs...");
