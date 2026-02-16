import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect dashboard routes — check for Supabase auth cookie
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    const hasAuthCookie = request.cookies.getAll().some(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );

    if (!hasAuthCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      if (pathname.startsWith("/dashboard")) {
        url.searchParams.set("redirect", pathname);
      }
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith("/auth/") && !pathname.startsWith("/auth/update-password") && !pathname.startsWith("/auth/callback")) {
    const hasAuthCookie = request.cookies.getAll().some(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );

    if (hasAuthCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/webhooks|api/scan/quick|api/cron).*)",
  ],
};
