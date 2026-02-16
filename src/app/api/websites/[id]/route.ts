import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateRequest, jsonSuccess, jsonError } from "@/lib/api/helpers";
import { PlanLimitError } from "@/lib/plan-enforcement";

const updateWebsiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = await authenticateRequest();
    if (errorResponse) return errorResponse;

    const { id } = await params;

    const website = await prisma.website.findUnique({
      where: { id },
      include: {
        organization: { select: { id: true } },
        scans: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true, score: true, status: true, totalIssues: true,
            criticalIssues: true, seriousIssues: true, moderateIssues: true, minorIssues: true,
            scannedPages: true, duration: true, createdAt: true, completedAt: true,
          },
        },
        schedules: true,
      },
    });

    if (!website) return jsonError("Website niet gevonden.", 404);

    const membership = user.memberships.find((m) => m.organizationId === website.organization.id);
    if (!membership) return jsonError("Geen toegang.", 403);

    return jsonSuccess(website);
  } catch (error) {
    console.error("GET /api/websites/[id] error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = await authenticateRequest();
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return jsonError("Ongeldige request body.", 400);

    const validation = updateWebsiteSchema.safeParse(body);
    if (!validation.success) return jsonError("Validatiefout.", 400);

    const website = await prisma.website.findUnique({
      where: { id },
      select: { organizationId: true },
    });
    if (!website) return jsonError("Website niet gevonden.", 404);

    const membership = user.memberships.find((m) => m.organizationId === website.organizationId);
    if (!membership) return jsonError("Geen toegang.", 403);

    const updated = await prisma.website.update({
      where: { id },
      data: validation.data,
    });

    return jsonSuccess(updated);
  } catch (error) {
    if (error instanceof PlanLimitError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    console.error("PATCH /api/websites/[id] error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = await authenticateRequest();
    if (errorResponse) return errorResponse;

    const { id } = await params;

    const website = await prisma.website.findUnique({
      where: { id },
      select: { organizationId: true },
    });
    if (!website) return jsonError("Website niet gevonden.", 404);

    const membership = user.memberships.find((m) => m.organizationId === website.organizationId);
    if (!membership || membership.role === "MEMBER") {
      return jsonError("Geen rechten om deze website te verwijderen.", 403);
    }

    await prisma.website.delete({ where: { id } });

    return jsonSuccess({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/websites/[id] error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
