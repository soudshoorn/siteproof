import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Simple in-memory rate limit store for Edge middleware
const authRateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>();

function checkAuthRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = `auth:${ip}`;
  const entry = authRateLimitStore.get(key);

  // Cleanup old entries periodically (every 100th call)
  if (Math.random() < 0.01) {
    for (const [k, v] of authRateLimitStore) {
      if (v.resetAt < now) authRateLimitStore.delete(k);
    }
  }

  if (!entry || entry.resetAt < now) {
    authRateLimitStore.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= 10) {
    return false;
  }

  entry.count++;
  return true;
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // Rate limit auth endpoints (login/register) — 10 req/min per IP
  if (pathname.startsWith("/auth/") && request.method === "POST") {
    const ip = getIp(request);
    if (!checkAuthRateLimit(ip)) {
      return NextResponse.json(
        { error: "Te veel verzoeken. Probeer het over een minuut opnieuw." },
        { status: 429 }
      );
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes — require authentication
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Protect admin routes — require authentication
  // (isAdmin check happens at the page level via Prisma)
  if (!user && pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages (except update-password)
  if (
    user &&
    pathname.startsWith("/auth/") &&
    !pathname.startsWith("/auth/update-password") &&
    !pathname.startsWith("/auth/callback")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
