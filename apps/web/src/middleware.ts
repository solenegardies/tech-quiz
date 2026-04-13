import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/backoffice"];
const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");

  // Protected routes: redirect to login if no session
  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth pages: redirect to dashboard if already logged in
  if (AUTH_PAGES.some((path) => pathname.startsWith(path))) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/backoffice/:path*", "/login", "/signup", "/forgot-password"],
};
