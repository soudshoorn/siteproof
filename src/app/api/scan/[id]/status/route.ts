import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest, jsonSuccess, jsonError } from "@/lib/api/helpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/scan/[id]/status
 *
 * Returns the current status of a scan for client-side polling.
 * Lightweight query — only fetches status fields, not full results.
 */
export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  try {
    const [user, errorResponse] = await authenticateRequest();
    if (errorResponse) return errorResponse;

    const { id } = await params;

    const scan = await prisma.scan.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        score: true,
        totalPages: true,
        scannedPages: true,
        totalIssues: true,
        criticalIssues: true,
        seriousIssues: true,
        moderateIssues: true,
        minorIssues: true,
        duration: true,
        errorMessage: true,
        completedAt: true,
        website: {
          select: { organizationId: true },
        },
      },
    });

    if (!scan) return jsonError("Scan niet gevonden.", 404);

    // Check access
    const hasAccess = user.memberships.some(
      (m) => m.organizationId === scan.website.organizationId
    );
    if (!hasAccess) return jsonError("Geen toegang.", 403);

    return jsonSuccess({
      id: scan.id,
      status: scan.status,
      score: scan.score,
      totalPages: scan.totalPages,
      scannedPages: scan.scannedPages,
      totalIssues: scan.totalIssues,
      criticalIssues: scan.criticalIssues,
      seriousIssues: scan.seriousIssues,
      moderateIssues: scan.moderateIssues,
      minorIssues: scan.minorIssues,
      duration: scan.duration,
      errorMessage: scan.errorMessage,
      completedAt: scan.completedAt,
    });
  } catch (error) {
    console.error("Scan status error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
