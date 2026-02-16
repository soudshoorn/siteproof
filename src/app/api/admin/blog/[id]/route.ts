import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase/auth";
import { z } from "zod/v4";

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1).optional(),
  featuredImage: z.string().url().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { author: { select: { fullName: true, email: true } } },
  });

  if (!post) {
    return NextResponse.json({ error: "Post niet gevonden" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const body = await request.json();
  const result = updatePostSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Ongeldige invoer", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = result.data;

  // Check slug uniqueness if changed
  if (data.slug) {
    const existing = await prisma.blogPost.findFirst({
      where: { slug: data.slug, id: { not: id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Deze slug bestaat al. Kies een andere." },
        { status: 409 }
      );
    }
  }

  // Auto-set publishedAt when publishing
  const updateData: Record<string, unknown> = { ...data };
  if (data.status === "PUBLISHED" && !data.publishedAt) {
    const currentPost = await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });
    if (!currentPost?.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }
  if (data.publishedAt) {
    updateData.publishedAt = new Date(data.publishedAt);
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ post });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  await prisma.blogPost.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
