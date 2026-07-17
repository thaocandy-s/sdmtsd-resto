import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login", "/api/auth/login", "/api/auth/refresh"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Check for refresh token cookie (indicates logged in user)
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    // Redirect to login if no refresh token
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
