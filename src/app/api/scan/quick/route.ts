import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonSuccess, jsonError } from "@/lib/api/helpers";

const SCANNER_SERVICE_URL = process.env.SCANNER_SERVICE_URL;
const SCANNER_SECRET = process.env.SCANNER_SECRET || "";

/**
 * Normalize a domain or URL to a full URL with protocol.
 * "example.com" → "https://example.com"
 * "http://example.com" → "http://example.com"
 */
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
 * POST /api/scan/quick
 *
 * Free quick scan — proxies to Railway scanner service (Puppeteer + axe-core).
 * Rate limited to 3 per IP per day via database check.
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

    // Create record
    const quickScan = await prisma.quickScan.create({
      data: { url, status: "SCANNING", ipAddress: ip },
    });

    // Proxy to Railway scanner service
    try {
      const scanResponse = await fetch(`${SCANNER_SERVICE_URL}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(SCANNER_SECRET ? { Authorization: `Bearer ${SCANNER_SECRET}` } : {}),
        },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(30_000),
      });

      const scanData = await scanResponse.json();

      if (!scanResponse.ok || !scanData.success) {
        throw new Error(scanData.error || "Scan mislukt");
      }

      const analysis = scanData.data;

      const severityOrder: Record<string, number> = { CRITICAL: 0, SERIOUS: 1, MODERATE: 2, MINOR: 3 };
      const topIssues = [...analysis.issues]
        .sort((a: { severity: string }, b: { severity: string }) =>
          (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
        )
        .slice(0, 5)
        .map((issue: {
          axeRuleId: string;
          severity: string;
          description: string;
          helpText: string;
          fixSuggestion: string;
          wcagCriteria: string[];
          wcagLevel: string | null;
          htmlElement: string | null;
          cssSelector: string | null;
        }) => ({
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

      const counts = {
        critical: analysis.issues.filter((i: { severity: string }) => i.severity === "CRITICAL").length,
        serious: analysis.issues.filter((i: { severity: string }) => i.severity === "SERIOUS").length,
        moderate: analysis.issues.filter((i: { severity: string }) => i.severity === "MODERATE").length,
        minor: analysis.issues.filter((i: { severity: string }) => i.severity === "MINOR").length,
        total: analysis.issues.length,
      };

      await prisma.quickScan.update({
        where: { id: quickScan.id },
        data: {
          status: "COMPLETED",
          score: analysis.score,
          results: {
            title: analysis.title,
            loadTime: analysis.loadTime,
            topIssues,
            issueCounts: counts,
            failedWcagCriteria: [...new Set(analysis.issues.flatMap((i: { wcagCriteria: string[] }) => i.wcagCriteria))] as string[],
          },
        },
      });

      return jsonSuccess({
        id: quickScan.id,
        url: quickScan.url,
        status: "COMPLETED",
        score: analysis.score,
        results: {
          pageTitle: analysis.title,
          issues: topIssues,
          totalIssues: counts.total,
          criticalIssues: counts.critical,
          seriousIssues: counts.serious,
          moderateIssues: counts.moderate,
          minorIssues: counts.minor,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      await prisma.quickScan.update({
        where: { id: quickScan.id },
        data: { status: "FAILED", results: { error: errorMessage } },
      });

      return jsonError(errorMessage, 422);
    }
  } catch (error) {
    console.error("Quick scan error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}

export const maxDuration = 60;
