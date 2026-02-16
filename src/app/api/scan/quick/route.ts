import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { analyzePageLite } from "@/lib/scanner/analyzer-lite";
import { jsonSuccess, jsonError } from "@/lib/api/helpers";

const quickScanSchema = z.object({
  url: z
    .string()
    .url("Voer een geldige URL in (bijv. https://jouwwebsite.nl)")
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === "https:" || parsed.protocol === "http:";
        } catch {
          return false;
        }
      },
      { message: "URL moet beginnen met http:// of https://" }
    ),
});

/**
 * POST /api/scan/quick
 *
 * Free quick scan — runs inline on Vercel serverless (no Puppeteer).
 * Uses fetch + jsdom + axe-core for lightweight analysis.
 * Rate limited to 3 per IP per day via database check.
 */
export async function POST(request: Request) {
  try {
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

    // Run scan inline
    try {
      const analysis = await analyzePageLite(url);

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

      const counts = {
        critical: analysis.issues.filter((i) => i.severity === "CRITICAL").length,
        serious: analysis.issues.filter((i) => i.severity === "SERIOUS").length,
        moderate: analysis.issues.filter((i) => i.severity === "MODERATE").length,
        minor: analysis.issues.filter((i) => i.severity === "MINOR").length,
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
            failedWcagCriteria: [...new Set(analysis.issues.flatMap((i) => i.wcagCriteria))],
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

export const maxDuration = 30;
