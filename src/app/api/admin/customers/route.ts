import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase/auth";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "25", 10);
  const planFilter = searchParams.get("plan");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (planFilter && ["FREE", "STARTER", "PROFESSIONAL", "BUREAU"].includes(planFilter)) {
    where.planType = planFilter;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { members: { some: { user: { email: { contains: search, mode: "insensitive" } } } } },
    ];
  }

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      include: {
        members: {
          include: { user: { select: { fullName: true, email: true } } },
          where: { role: "OWNER" },
          take: 1,
        },
        websites: { select: { id: true } },
        _count: { select: { websites: true, members: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.organization.count({ where }),
  ]);

  const customers = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    planType: org.planType,
    ownerEmail: org.members[0]?.user.email ?? null,
    ownerName: org.members[0]?.user.fullName ?? null,
    websiteCount: org._count.websites,
    memberCount: org._count.members,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    mollieCustomerId: org.mollieCustomerId,
    mollieCurrentPeriodEnd: org.mollieCurrentPeriodEnd,
  }));

  return NextResponse.json({ customers, total, page, limit });
}
