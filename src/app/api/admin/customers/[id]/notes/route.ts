import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase/auth";
import { z } from "zod/v4";

const createNoteSchema = z.object({
  content: z.string().min(1, "Notitie mag niet leeg zijn"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const body = await request.json();
  const result = createNoteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Ongeldige invoer" },
      { status: 400 }
    );
  }

  const note = await prisma.customerNote.create({
    data: {
      organizationId: id,
      content: result.data.content,
    },
  });

  return NextResponse.json({ note }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("noteId");

  if (!noteId) {
    return NextResponse.json({ error: "noteId is verplicht" }, { status: 400 });
  }

  await prisma.customerNote.delete({ where: { id: noteId } });

  return NextResponse.json({ success: true });
}
