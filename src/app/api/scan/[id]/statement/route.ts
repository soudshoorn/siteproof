import { prisma } from "@/lib/db";
import { authenticateRequest, jsonError } from "@/lib/api/helpers";
import { PLANS } from "@/lib/mollie/plans";
import { generateAccessibilityStatement } from "@/lib/eaa/statement";

/**
 * GET /api/scan/[id]/statement
 *
 * Generate and download a Dutch accessibility statement (toegankelijkheidsverklaring)
 * based on scan results. Returns a Markdown file.
 * Requires authentication and a plan that supports EAA statements (Starter+).
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
          include: {
            organization: true,
          },
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

    // Check plan supports EAA statements
    const org = scan.website.organization;
    const plan = PLANS[org.planType];
    if (!plan.features.eaaStatement) {
      return jsonError(
        "Toegankelijkheidsverklaring is niet beschikbaar op je huidige plan. Upgrade naar Starter of hoger.",
        403
      );
    }

    if (scan.status !== "COMPLETED") {
      return jsonError("Scan is nog niet voltooid.", 400);
    }

    const failedCriteria = [
      ...new Set(scan.issues.flatMap((i) => i.wcagCriteria)),
    ];

    const statement = generateAccessibilityStatement({
      websiteName: scan.website.name,
      websiteUrl: scan.website.url,
      organizationName: org.name,
      scanDate: scan.completedAt ?? scan.createdAt,
      score: scan.score ?? 0,
      failedWcagCriteria: failedCriteria,
    });

    const filename = `toegankelijkheidsverklaring-${scan.website.name.replace(/[^a-zA-Z0-9-_]/g, "-")}.md`;

    return new Response(statement, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[Statement] Generation failed:", error);
    return jsonError("Generatie van de toegankelijkheidsverklaring mislukt.", 500);
  }
}
