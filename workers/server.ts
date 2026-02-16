import "dotenv/config";
import express from "express";
import puppeteer from "puppeteer";
import type { Browser } from "puppeteer";
import { analyzePage } from "../src/lib/scanner/analyzer";
import { crawlWebsite } from "../src/lib/scanner/crawler";
import { calculateOverallScore } from "../src/lib/scanner/score";

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
app.use((req, res, next) => {
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
app.get("/health", (_req, res) => {
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
app.post("/scan", async (req, res) => {
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

/**
 * POST /scan/full
 *
 * Full scan: crawl a website and analyze all discovered pages.
 * Returns results for all pages inline.
 * Used for authenticated full scans.
 */
app.post("/scan/full", async (req, res) => {
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

    // Phase 2: Analyze each page
    const pageResults = [];
    let totalCritical = 0;
    let totalSerious = 0;
    let totalModerate = 0;
    let totalMinor = 0;
    let totalIssues = 0;

    for (const pageUrl of pagesToScan) {
      try {
        const analysis = await analyzePage(activeBrowser, pageUrl);

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
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[Scanner] Page failed: ${pageUrl}: ${message}`);
        pageResults.push({
          url: pageUrl,
          title: null,
          score: null,
          loadTime: null,
          issueCount: 0,
          issues: [],
          error: message,
        });
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
