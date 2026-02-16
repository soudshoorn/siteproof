import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email/notifications";

/**
 * Auth callback handler.
 * Supabase redirects here after:
 * - Email verification (signup)
 * - Password reset (recovery)
 * - OAuth login (Google/GitHub)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }

  // Sync Supabase user to Prisma DB
  const supabaseUser = data.user;
  let user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });

  if (!user) {
    const fullName =
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      null;
    const orgName = fullName ? `${fullName}'s organisatie` : "Mijn organisatie";

    // Generate unique slug
    let slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);
    let attempt = 0;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      attempt++;
      slug = `${slug.slice(0, 44)}-${attempt}`;
    }

    user = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email!,
        fullName,
        avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
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
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(supabaseUser.email!, fullName || "").catch((err) =>
      console.error("[Auth] Failed to send welcome email:", err)
    );
  }

  // Password recovery: redirect to password update page
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/auth/update-password`);
  }

  // Default: redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}
