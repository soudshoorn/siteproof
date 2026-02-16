import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateRequest, jsonSuccess, jsonError, withErrorHandling } from "@/lib/api/helpers";
import { enforcePlanLimits } from "@/lib/plan-enforcement";
import { getMaxPagesPerScan } from "@/lib/mollie/plans";
import puppeteer, { type Browser } from "puppeteer";
import { crawlWebsite } from "@/lib/scanner/crawler";
import { analyzePage, PageAnalysisError } from "@/lib/scanner/analyzer";
import { calculateOverallScore } from "@/lib/scanner/score";

const startScanSchema = z.object({
  websiteId: z.string().uuid(),
});

export const POST = withErrorHandling(async (request: Request) => {
  const [user, errorResponse] = await authenticateRequest();
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Ongeldige request body.", 400);

  const validation = startScanSchema.safeParse(body);
  if (!validation.success) return jsonError("Validatiefout.", 400);

  const { websiteId } = validation.data;

  // Get website and check access
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: { organization: true },
  });

  if (!website) return jsonError("Website niet gevonden.", 404);

  const membership = user.memberships.find(
    (m) => m.organizationId === website.organizationId
  );
  if (!membership) return jsonError("Geen toegang.", 403);

  // Check plan limits for concurrent scans
  await enforcePlanLimits(website.organizationId, "startScan");

  const maxPages = getMaxPagesPerScan(website.organization.planType);

  // Create scan record
  const scan = await prisma.scan.create({
    data: {
      websiteId,
      startedById: user.id,
      status: "QUEUED",
    },
  });

  // Run scan in the background — don't await
  processScanAsync(scan.id, website.url, maxPages).catch((error) => {
    console.error(`[Scan] Background scan ${scan.id} failed:`, error);
  });

  return jsonSuccess({ id: scan.id, status: "QUEUED" }, 201);
});

/**
 * Run the full scan using local Puppeteer + axe-core.
 * Updates the database with results as it progresses.
 */
async function processScanAsync(
  scanId: string,
  url: string,
  maxPages: number
): Promise<void> {
  const startTime = Date.now();
  let browser: Browser | null = null;

  try {
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "CRAWLING" },
    });

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

    // Phase 1: Crawl and discover pages
    const crawlResult = await crawlWebsite(
      browser,
      url,
      maxPages,
      async (scanned, total) => {
        await prisma.scan.update({
          where: { id: scanId },
          data: { totalPages: total, scannedPages: 0 },
        }).catch(() => {});
      }
    );

    const pagesToScan = crawlResult.urls;
    console.log(`[Scan] Found ${pagesToScan.length} pages for scan ${scanId}`);

    if (pagesToScan.length === 0) {
      throw new Error(`Geen pagina's gevonden op ${url}. Controleer of de website bereikbaar is.`);
    }

    // Update to SCANNING
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "SCANNING",
        totalPages: pagesToScan.length,
      },
    });

    // Phase 2: Analyze each page
    const pageResults: Array<{ score: number; issueCount: number }> = [];
    let totalCritical = 0;
    let totalSerious = 0;
    let totalModerate = 0;
    let totalMinor = 0;
    let totalIssues = 0;

    for (let i = 0; i < pagesToScan.length; i++) {
      const pageUrl = pagesToScan[i];
      console.log(`[Scan] Analyzing page ${i + 1}/${pagesToScan.length}: ${pageUrl}`);

      try {
        const analysis = await analyzePage(browser, pageUrl);

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
          score: analysis.score,
          issueCount: analysis.issues.length,
        });
      } catch (error) {
        if (error instanceof PageAnalysisError) {
          console.warn(`[Scan] Page analysis failed for ${pageUrl}: ${error.message}`);
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
          console.error(`[Scan] Unexpected error analyzing ${pageUrl}:`, error);
        }
      }

      // Update progress
      await prisma.scan.update({
        where: { id: scanId },
        data: { scannedPages: i + 1 },
      }).catch(() => {});
    }

    // Phase 3: Calculate overall score and finalize
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "ANALYZING" },
    });

    const overallScore =
      pageResults.length > 0
        ? calculateOverallScore(pageResults)
        : 0;

    const duration = Math.round((Date.now() - startTime) / 1000);

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "COMPLETED",
        score: overallScore,
        totalPages: pagesToScan.length,
        scannedPages: pagesToScan.length,
        totalIssues,
        criticalIssues: totalCritical,
        seriousIssues: totalSerious,
        moderateIssues: totalModerate,
        minorIssues: totalMinor,
        duration,
        completedAt: new Date(),
      },
    });

    console.log(
      `[Scan] Scan ${scanId} completed: score=${overallScore}, ` +
        `pages=${pagesToScan.length}, issues=${totalIssues}, duration=${duration}s`
    );
  } catch (error) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`[Scan] Scan ${scanId} failed:`, errorMessage);

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
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Browser might already be closed
      }
    }
  }
}

export const maxDuration = 300; // 5 minutes for full scans
