import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isSessionExpired,
  SUPABASE_ACCESS_TOKEN_COOKIE,
} from "@/lib/auth/session-config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect admin routes — skip everything else
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow login, forgot-password, and reset-password pages
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password"
  ) {
    return NextResponse.next();
  }

  // Quick session expiry check from cookie (no API call)
  // This catches sessions older than 24h before making an API request
  const accessTokenCookie = request.cookies.get(SUPABASE_ACCESS_TOKEN_COOKIE);
  if (accessTokenCookie?.value) {
    try {
      const parts = accessTokenCookie.value.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1], "base64").toString("utf-8")
        );
        if (payload.exp && isSessionExpired(payload.exp)) {
          const loginUrl = new URL("/admin/login", request.url);
          loginUrl.searchParams.set("redirect", pathname);
          loginUrl.searchParams.set("expired", "true");
          return NextResponse.redirect(loginUrl);
        }
      }
    } catch {
      // Malformed token — fall through to getUser() check
    }
  }

  // Create a mutable response for cookie handling (required by Supabase SSR)
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Validate the session — getUser() makes an API call to verify JWT is still valid
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // No valid session — redirect to login
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // If the Supabase Auth API call fails (network error, timeout), redirect to login
    // instead of showing a 500 error page
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("unavailable", "true");
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
