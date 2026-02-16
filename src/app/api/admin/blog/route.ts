import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase/auth";
import { z } from "zod/v4";

const createPostSchema = z.object({
  title: z.string().min(1, "Titel is verplicht"),
  slug: z.string().min(1, "Slug is verplicht"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Inhoud is verplicht"),
  featuredImage: z.string().url().optional().nullable(),
  metaDescription: z.string().optional(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "25", 10);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status && ["DRAFT", "PUBLISHED", "SCHEDULED"].includes(status)) {
    where.status = status;
  }
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: { author: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin();

  const body = await request.json();
  const result = createPostSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Ongeldige invoer", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = result.data;

  // Check slug uniqueness
  const existing = await prisma.blogPost.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Deze slug bestaat al. Kies een andere." },
      { status: 409 }
    );
  }

  const post = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? null,
      content: data.content,
      featuredImage: data.featuredImage ?? null,
      metaDescription: data.metaDescription ?? null,
      category: data.category ?? null,
      tags: data.tags ?? [],
      status: data.status ?? "DRAFT",
      publishedAt: data.status === "PUBLISHED" ? new Date() : data.publishedAt ? new Date(data.publishedAt) : null,
      authorId: user.id,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
