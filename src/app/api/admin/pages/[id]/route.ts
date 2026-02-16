import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase/auth";
import { z } from "zod/v4";

const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  metaDescription: z.string().optional().nullable(),
  content: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const page = await prisma.seoPage.findUnique({ where: { id } });

  if (!page) {
    return NextResponse.json({ error: "Pagina niet gevonden" }, { status: 404 });
  }

  return NextResponse.json({ page });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const body = await request.json();
  const result = updatePageSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Ongeldige invoer", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const page = await prisma.seoPage.update({
    where: { id },
    data: result.data,
  });

  return NextResponse.json({ page });
}
