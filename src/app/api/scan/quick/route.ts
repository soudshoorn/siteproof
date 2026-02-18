import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonSuccess, jsonError } from "@/lib/api/helpers";
import { after } from "next/server";
import { trackEvent } from "@/lib/analytics";

const SCANNER_SERVICE_URL = process.env.SCANNER_SERVICE_URL;
const SCANNER_SECRET = process.env.SCANNER_SECRET || "";

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

const quickScanSchema = z.object({
  url: z
    .string()
    .min(1, "Voer een URL of domeinnaam in.")
    .transform(normalizeUrl)
    .pipe(
      z.string().url("Voer een geldige URL of domeinnaam in (bijv. jouwwebsite.nl)")
    ),
});

/**
 * Run the actual scan and update the DB record.
 * This runs after the response is sent to the client.
 */
async function performScan(scanId: string, url: string) {
  try {
    const scanResponse = await fetch(`${SCANNER_SERVICE_URL}/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SCANNER_SECRET ? { Authorization: `Bearer ${SCANNER_SECRET}` } : {}),
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(45_000),
    });

    const scanData = await scanResponse.json();

    if (!scanResponse.ok || !scanData.success) {
      throw new Error(scanData.error || "Scan mislukt");
    }

    const analysis = scanData.data;

    const severityOrder: Record<string, number> = { CRITICAL: 0, SERIOUS: 1, MODERATE: 2, MINOR: 3 };

    const seenRules = new Set<string>();
    const uniqueIssues = [...analysis.issues]
      .sort((a: { severity: string }, b: { severity: string }) =>
        (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
      )
      .filter((issue: { axeRuleId: string }) => {
        if (seenRules.has(issue.axeRuleId)) return false;
        seenRules.add(issue.axeRuleId);
        return true;
      });

    const ruleCounts = new Map<string, number>();
    for (const issue of analysis.issues) {
      ruleCounts.set(issue.axeRuleId, (ruleCounts.get(issue.axeRuleId) || 0) + 1);
    }

    type IssueData = {
      axeRuleId: string;
      severity: string;
      description: string;
      helpText: string;
      fixSuggestion: string;
      wcagCriteria: string[];
      wcagLevel: string | null;
      htmlElement: string | null;
      cssSelector: string | null;
    };

    const mapFullIssue = (issue: IssueData) => ({
      axeRuleId: issue.axeRuleId,
      severity: issue.severity,
      description: issue.description,
      helpText: issue.helpText,
      fixSuggestion: issue.fixSuggestion,
      wcagCriteria: issue.wcagCriteria,
      wcagLevel: issue.wcagLevel,
      htmlElement: issue.htmlElement,
      cssSelector: issue.cssSelector,
      elementCount: ruleCounts.get(issue.axeRuleId) || 1,
    });

    const mapLimitedIssue = (issue: IssueData) => ({
      axeRuleId: issue.axeRuleId,
      severity: issue.severity,
      description: issue.description,
      wcagCriteria: issue.wcagCriteria,
      wcagLevel: issue.wcagLevel,
      elementCount: ruleCounts.get(issue.axeRuleId) || 1,
    });

    // First 3 issues get full details (free value), rest are gated
    const FREE_ISSUE_LIMIT = 3;
    const topIssues = uniqueIssues.slice(0, FREE_ISSUE_LIMIT).map(mapFullIssue);
    const remainingIssues = uniqueIssues.slice(FREE_ISSUE_LIMIT).map(mapLimitedIssue);
    const blurredCount = remainingIssues.length;

    // Also store all issues with full details for internal use (dashboard after signup)
    const allIssuesFull = uniqueIssues.slice(0, 10).map(mapFullIssue);

    const counts = {
      critical: analysis.issues.filter((i: { severity: string }) => i.severity === "CRITICAL").length,
      serious: analysis.issues.filter((i: { severity: string }) => i.severity === "SERIOUS").length,
      moderate: analysis.issues.filter((i: { severity: string }) => i.severity === "MODERATE").length,
      minor: analysis.issues.filter((i: { severity: string }) => i.severity === "MINOR").length,
      total: analysis.issues.length,
      uniqueRules: uniqueIssues.length,
    };

    // Count internal links found on this page (for "estimated pages" nudge)
    const estimatedPages = analysis.internalLinksCount ?? null;

    await prisma.quickScan.update({
      where: { id: scanId },
      data: {
        status: "COMPLETED",
        score: analysis.score,
        results: {
          title: analysis.title,
          loadTime: analysis.loadTime,
          topIssues,
          remainingIssues,
          blurredCount,
          allIssuesFull,
          estimatedPages,
          issueCounts: counts,
          failedWcagCriteria: [...new Set(analysis.issues.flatMap((i: { wcagCriteria: string[] }) => i.wcagCriteria))] as string[],
        },
      },
    });

    await trackEvent("quick_scan_completed", {
      scanId,
      url,
      score: analysis.score,
      totalIssues: counts.total,
      uniqueRules: counts.uniqueRules,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await prisma.quickScan.update({
      where: { id: scanId },
      data: { status: "FAILED", results: { error: errorMessage } },
    });
  }
}

/**
 * POST /api/scan/quick
 *
 * Creates a scan record and returns immediately.
 * The actual scan runs asynchronously via next/server after().
 * Client polls /api/scan/quick/[id] for results.
 */
export async function POST(request: Request) {
  try {
    if (!SCANNER_SERVICE_URL) {
      return jsonError("Scanner service is niet geconfigureerd. Stel SCANNER_SERVICE_URL in.", 503);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return jsonError("Ongeldige request body.", 400);
    }

    const validation = quickScanSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validatiefout", details: errors },
        { status: 400 }
      );
    }

    const url = validation.data.url;

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Rate limit: 3 per IP per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scanCount = await prisma.quickScan.count({
      where: { ipAddress: ip, createdAt: { gte: today } },
    });

    if (scanCount >= 3) {
      return jsonError(
        "Je hebt het maximum aantal gratis scans voor vandaag bereikt (3 per dag). Maak een account aan voor meer scans.",
        429
      );
    }

    // Create record immediately
    const quickScan = await prisma.quickScan.create({
      data: { url, status: "SCANNING", ipAddress: ip },
    });

    // Run scan asynchronously after response is sent
    after(() => performScan(quickScan.id, url));
    after(() => trackEvent("quick_scan_started", { url, scanId: quickScan.id }));

    // Return immediately so client can redirect to result page
    return jsonSuccess({
      id: quickScan.id,
      url: quickScan.url,
      status: "SCANNING",
    });
  } catch (error) {
    console.error("Quick scan error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}

export const maxDuration = 60;
