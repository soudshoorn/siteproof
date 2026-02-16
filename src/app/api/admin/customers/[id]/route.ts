import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase/auth";
import { z } from "zod/v4";

const updateOrgSchema = z.object({
  planType: z.enum(["FREE", "STARTER", "PROFESSIONAL", "BUREAU"]).optional(),
  maxWebsites: z.number().int().positive().optional(),
  maxPagesPerScan: z.number().int().positive().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, fullName: true, email: true, createdAt: true } } },
      },
      websites: {
        include: {
          scans: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, score: true, status: true, totalIssues: true, createdAt: true },
          },
        },
      },
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 });
  }

  return NextResponse.json({ organization });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const body = await request.json();
  const result = updateOrgSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Ongeldige invoer", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const organization = await prisma.organization.update({
    where: { id },
    data: result.data,
  });

  return NextResponse.json({ organization });
}
