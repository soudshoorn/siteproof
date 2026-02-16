import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, getSupabaseUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const deleteSchema = z.object({
  confirmEmail: z.string().email(),
});

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  const supabaseUser = await getSupabaseUser();

  const body = await request.json();
  const result = deleteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Ongeldig e-mailadres" },
      { status: 400 }
    );
  }

  // Verify the confirmation email matches
  if (result.data.confirmEmail !== user.email) {
    return NextResponse.json(
      { error: "Het e-mailadres komt niet overeen met je account." },
      { status: 400 }
    );
  }

  try {
    // Delete all user data from our database
    // Prisma cascading deletes handle related records (memberships, etc.)
    // But we need to clean up organizations where user is the sole OWNER
    const ownedOrgs = await prisma.organizationMember.findMany({
      where: { userId: user.id, role: "OWNER" },
      include: {
        organization: {
          include: { _count: { select: { members: true } } },
        },
      },
    });

    // Delete organizations where user is the only member
    for (const membership of ownedOrgs) {
      if (membership.organization._count.members <= 1) {
        // This org only has this user — delete the whole org (cascade deletes websites, scans, etc.)
        await prisma.organization.delete({
          where: { id: membership.organizationId },
        });
      }
    }

    // Delete the user record (cascading deletes memberships)
    await prisma.user.delete({
      where: { id: user.id },
    });

    // Delete the Supabase auth user
    if (supabaseUser) {
      const supabase = await createClient();
      await supabase.auth.signOut();
      // Note: admin-level deletion of Supabase user requires service role
      // The user record is already removed from our DB, Supabase auth can be cleaned up separately
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion failed:", error);
    return NextResponse.json(
      { error: "Account verwijderen mislukt. Neem contact op met support." },
      { status: 500 }
    );
  }
}
