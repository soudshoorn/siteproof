import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase/auth";

export async function GET() {
  await requireAdmin();

  const pages = await prisma.seoPage.findMany({
    orderBy: { slug: "asc" },
  });

  return NextResponse.json({ pages });
}
