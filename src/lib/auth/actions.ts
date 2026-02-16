"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${base}-${attempt}`;
  }
  return slug;
}

/**
 * Ensure a Prisma User + default Organization exist for the Supabase user.
 * Called after login/signup/callback to sync Supabase -> Prisma.
 */
async function syncUser(supabaseId: string, email: string, fullName?: string) {
  let user = await prisma.user.findUnique({
    where: { supabaseId },
    include: { memberships: true },
  });

  if (!user) {
    const orgName = fullName ? `${fullName}'s organisatie` : "Mijn organisatie";
    const slug = await uniqueSlug(generateSlug(orgName));

    user = await prisma.user.create({
      data: {
        supabaseId,
        email,
        fullName: fullName || null,
        memberships: {
          create: {
            role: "OWNER",
            organization: {
              create: {
                name: orgName,
                slug,
                planType: "FREE",
                maxWebsites: 1,
                maxPagesPerScan: 5,
              },
            },
          },
        },
      },
      include: { memberships: true },
    });
  }

  return user;
}

export type AuthResult = {
  error?: string;
};

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Vul je e-mailadres en wachtwoord in." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Ongeldige inloggegevens." };
  }

  // Sync user to Prisma DB
  await syncUser(
    data.user.id,
    data.user.email!,
    data.user.user_metadata?.full_name
  );

  const redirectTo = (formData.get("redirect") as string) || "/dashboard";
  redirect(redirectTo);
}

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const plan = (formData.get("plan") as string)?.trim().toLowerCase() || "";

  if (!email || !password) {
    return { error: "Vul alle verplichte velden in." };
  }

  if (password.length < 8) {
    return { error: "Wachtwoord moet minimaal 8 tekens bevatten." };
  }

  if (password !== confirmPassword) {
    return { error: "Wachtwoorden komen niet overeen." };
  }

  const validPlans = ["starter", "professional", "bureau"];
  const selectedPlan = validPlans.includes(plan) ? plan : "";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${selectedPlan ? `?plan=${selectedPlan}` : ""}`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Dit e-mailadres is al geregistreerd." };
    }
    return { error: "Registratie mislukt. Probeer het opnieuw." };
  }

  // If email confirmation is disabled, user is immediately logged in
  if (data.user && data.session) {
    await syncUser(data.user.id, data.user.email!, fullName);
    // Redirect to checkout if a paid plan was selected
    if (selectedPlan) {
      redirect(`/dashboard/settings/billing?upgrade=${selectedPlan}`);
    }
    redirect("/dashboard");
  }

  // Email confirmation enabled — show check-email message
  redirect("/auth/verify");
}

export async function forgotPasswordAction(
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { error: "Vul je e-mailadres in." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
  });

  if (error) {
    // Don't reveal whether the email exists
    return { error: "Er ging iets mis. Probeer het opnieuw." };
  }

  // Always show success to prevent email enumeration
  redirect("/auth/check-email?type=reset");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
