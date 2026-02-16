import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { prisma } from "@/lib/db";
import { authenticateRequest, jsonError } from "@/lib/api/helpers";
import { PLANS } from "@/lib/mollie/plans";
import { calculateEaaCompliance, getEaaStatus } from "@/lib/eaa/mapping";
import { ScanReport } from "@/lib/pdf/report";
import type { PdfScanData, PdfPageData, PdfIssueData } from "@/lib/pdf/report";

/**
 * GET /api/scan/[id]/pdf
 *
 * Generate and return a PDF accessibility report for a completed scan.
 * Requires authentication and a plan that supports PDF export.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = await authenticateRequest();
    if (errorResponse) return errorResponse;

    const { id: scanId } = await params;

    // Fetch scan with all related data
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: {
        website: {
          include: {
            organization: true,
          },
        },
        pages: {
          orderBy: { score: "asc" },
          select: {
            url: true,
            title: true,
            score: true,
            issueCount: true,
          },
        },
        issues: {
          orderBy: [{ severity: "asc" }, { createdAt: "asc" }],
          select: {
            severity: true,
            description: true,
            helpText: true,
            fixSuggestion: true,
            wcagCriteria: true,
            wcagLevel: true,
            pageUrl: true,
            htmlElement: true,
            cssSelector: true,
          },
        },
      },
    });

    if (!scan) {
      return jsonError("Scan niet gevonden.", 404);
    }

    // Check organization access
    const membership = user.memberships.find(
      (m) => m.organizationId === scan.website.organizationId
    );
    if (!membership) {
      return jsonError("Geen toegang.", 403);
    }

    // Check plan allows PDF export
    const org = scan.website.organization;
    const plan = PLANS[org.planType];
    if (!plan.features.pdfExport) {
      return jsonError(
        "PDF export is niet beschikbaar op je huidige plan. Upgrade naar Starter of hoger.",
        403
      );
    }

    if (scan.status !== "COMPLETED") {
      return jsonError("Scan is nog niet voltooid.", 400);
    }

    // Calculate EAA compliance
    const failedCriteria = [
      ...new Set(scan.issues.flatMap((i) => i.wcagCriteria)),
    ];
    const eaaCompliance = calculateEaaCompliance(failedCriteria);
    const eaaStatus = getEaaStatus(eaaCompliance.percentage);

    // Build PDF data
    const scanDate = (scan.completedAt ?? scan.createdAt).toLocaleDateString(
      "nl-NL",
      { day: "numeric", month: "long", year: "numeric" }
    );

    // White-label branding for plans that support it
    const branding =
      plan.features.whiteLabel && org.name
        ? {
            companyName: org.name,
            primaryColor: org.customPrimaryColor ?? "#0D9488",
            ...(org.customLogoUrl && { logoUrl: org.customLogoUrl }),
          }
        : undefined;

    const pdfData: PdfScanData = {
      scanId: scan.id,
      score: scan.score ?? 0,
      totalPages: scan.totalPages,
      scannedPages: scan.scannedPages,
      totalIssues: scan.totalIssues,
      criticalIssues: scan.criticalIssues,
      seriousIssues: scan.seriousIssues,
      moderateIssues: scan.moderateIssues,
      minorIssues: scan.minorIssues,
      duration: scan.duration ?? 0,
      scanDate,
      websiteName: scan.website.name,
      websiteUrl: scan.website.url,
      organizationName: org.name,
      pages: scan.pages as PdfPageData[],
      issues: scan.issues as PdfIssueData[],
      eaaCompliance: {
        percentage: eaaCompliance.percentage,
        status: eaaStatus.description,
        label: eaaStatus.label,
        passedCount: eaaCompliance.passedCriteria.length,
        failedCount: eaaCompliance.failedCriteria.length,
        totalRequired: eaaCompliance.totalRequired,
      },
      branding,
    };

    // Render PDF to buffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(
      React.createElement(ScanReport, { data: pdfData }) as any
    );

    const filename = `siteproof-${scan.website.name.replace(/[^a-zA-Z0-9-_]/g, "-")}-${scanDate.replace(/\s/g, "-")}.pdf`;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[PDF] Generation failed:", error);
    return jsonError("PDF generatie mislukt.", 500);
  }
}
