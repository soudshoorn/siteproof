import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "./server";
import { prisma } from "@/lib/db";

/**
 * Get the current authenticated Supabase user. Returns null if not logged in.
 * Cached per request via React cache() to avoid duplicate auth calls.
 */
export const getSupabaseUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Get the current SiteProof user (Prisma) with optional includes.
 * Returns null if not authenticated or user doesn't exist in our DB yet.
 */
export const getCurrentUser = cache(async () => {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) return null;

  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: {
      memberships: {
        include: {
          organization: true,
        },
      },
    },
  });

  return user;
});

/**
 * Get the current user's active organization.
 * Returns the first org they're a member of (OWNER preferred).
 */
export const getCurrentOrganization = cache(async () => {
  const user = await getCurrentUser();
  if (!user || user.memberships.length === 0) return null;

  // Prefer the org where user is OWNER, fall back to first membership
  const ownerMembership = user.memberships.find((m) => m.role === "OWNER");
  return ownerMembership?.organization ?? user.memberships[0].organization;
});

/**
 * Require authentication. Redirects to login if not authenticated.
 * Use in Server Components and Server Actions for protected pages.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

/**
 * Require admin access. Redirects to dashboard if not admin.
 * Use in Server Components for admin pages.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }
  if (!user.isAdmin) {
    redirect("/dashboard");
  }
  return user;
}

/**
 * Get the user's role in a specific organization.
 */
export async function getUserRole(organizationId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const membership = user.memberships.find(
    (m) => m.organizationId === organizationId
  );
  return membership?.role ?? null;
}

/**
 * Check if the current user has at least the required role in the organization.
 * Role hierarchy: OWNER > ADMIN > MEMBER
 */
export async function requireRole(
  organizationId: string,
  minimumRole: "MEMBER" | "ADMIN" | "OWNER"
) {
  const role = await getUserRole(organizationId);
  if (!role) {
    redirect("/dashboard");
  }

  const hierarchy = { MEMBER: 0, ADMIN: 1, OWNER: 2 };
  if (hierarchy[role] < hierarchy[minimumRole]) {
    redirect("/dashboard");
  }

  return role;
}
