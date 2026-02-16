import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateRequest, jsonSuccess, jsonError, withErrorHandling } from "@/lib/api/helpers";
import { enforcePlanLimits } from "@/lib/plan-enforcement";
import { getMaxPagesPerScan } from "@/lib/mollie/plans";

const SCANNER_SERVICE_URL = process.env.SCANNER_SERVICE_URL;
const SCANNER_SECRET = process.env.SCANNER_SECRET || "";

const startScanSchema = z.object({
  websiteId: z.string().uuid(),
});

export const POST = withErrorHandling(async (request: Request) => {
  const [user, errorResponse] = await authenticateRequest();
  if (errorResponse) return errorResponse;

  if (!SCANNER_SERVICE_URL) {
    return jsonError("Scanner service is niet geconfigureerd. Stel SCANNER_SERVICE_URL in.", 503);
  }

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

  // Fire off the scan to Railway in the background
  processScanAsync(scan.id, website.url, maxPages).catch((error) => {
    console.error(`[Scan] Background scan ${scan.id} failed:`, error);
  });

  return jsonSuccess({ id: scan.id, status: "QUEUED" }, 201);
});

/**
 * Run the full scan via Railway scanner service.
 * Updates the database with results as it progresses.
 */
async function processScanAsync(
  scanId: string,
  url: string,
  maxPages: number
): Promise<void> {
  const startTime = Date.now();

  try {
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "SCANNING" },
    });

    const scanResponse = await fetch(`${SCANNER_SERVICE_URL}/scan/full`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SCANNER_SECRET ? { Authorization: `Bearer ${SCANNER_SECRET}` } : {}),
      },
      body: JSON.stringify({ url, maxPages }),
      signal: AbortSignal.timeout(maxPages * 35_000), // ~35s per page
    });

    const scanData = await scanResponse.json();

    if (!scanResponse.ok || !scanData.success) {
      throw new Error(scanData.error || "Scan mislukt");
    }

    const result = scanData.data;

    // Save page results and issues
    for (const page of result.pages) {
      if (page.error) {
        await prisma.pageResult.create({
          data: {
            scanId,
            url: page.url,
            title: null,
            score: null,
            issueCount: 0,
            loadTime: page.loadTime,
          },
        });
        continue;
      }

      const pageResult = await prisma.pageResult.create({
        data: {
          scanId,
          url: page.url,
          title: page.title,
          score: page.score,
          issueCount: page.issueCount,
          loadTime: page.loadTime,
        },
      });

      if (page.issues && page.issues.length > 0) {
        await prisma.issue.createMany({
          data: page.issues.map((issue: {
            axeRuleId: string;
            severity: string;
            impact: string;
            wcagCriteria: string[];
            wcagLevel: string | null;
            description: string;
            helpText: string;
            fixSuggestion: string;
            htmlElement: string | null;
            cssSelector: string | null;
            pageUrl: string;
          }) => ({
            scanId,
            pageResultId: pageResult.id,
            axeRuleId: issue.axeRuleId,
            severity: issue.severity as "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR",
            impact: issue.impact as "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR",
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
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Finalize scan
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "COMPLETED",
        score: result.score,
        totalPages: result.totalPages,
        scannedPages: result.totalPages,
        totalIssues: result.totalIssues,
        criticalIssues: result.criticalIssues,
        seriousIssues: result.seriousIssues,
        moderateIssues: result.moderateIssues,
        minorIssues: result.minorIssues,
        duration,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const errorMessage = error instanceof Error ? error.message : String(error);

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "FAILED",
        errorMessage,
        duration,
        completedAt: new Date(),
      },
    });
  }
}

export const maxDuration = 300; // 5 minutes for full scans (Vercel Pro)
