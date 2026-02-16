import { prisma } from "@/lib/db";
import { authenticateRequest, jsonError, jsonSuccess } from "@/lib/api/helpers";
import { calculateEaaCompliance, getEaaStatus } from "@/lib/eaa/mapping";
import { generateComplianceSummary } from "@/lib/eaa/statement";

/**
 * GET /api/scan/[id]/eaa
 *
 * Returns EAA compliance data for a completed scan,
 * including overall status and per-principle breakdown.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = await authenticateRequest();
    if (errorResponse) return errorResponse;

    const { id: scanId } = await params;

    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: {
        website: {
          select: { organizationId: true },
        },
        issues: {
          select: { wcagCriteria: true },
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

    if (scan.status !== "COMPLETED") {
      return jsonError("Scan is nog niet voltooid.", 400);
    }

    const failedCriteria = [
      ...new Set(scan.issues.flatMap((i) => i.wcagCriteria)),
    ];

    const compliance = calculateEaaCompliance(failedCriteria);
    const status = getEaaStatus(compliance.percentage);
    const summary = generateComplianceSummary(failedCriteria);

    return jsonSuccess({
      percentage: compliance.percentage,
      status: status.status,
      label: status.label,
      description: status.description,
      passedCriteria: compliance.passedCriteria,
      failedCriteria: compliance.failedCriteria,
      totalRequired: compliance.totalRequired,
      principleScores: summary.principleScores,
    });
  } catch (error) {
    console.error("[EAA] Compliance calculation failed:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
