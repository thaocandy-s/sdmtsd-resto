import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const handleIntl = createMiddleware(routing);

const publicPaths = ["/login", "/api/auth/login", "/api/auth/refresh"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and API requests
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Remove locale prefix for auth checking
  const pathnameWithoutLocale = pathname.replace(/^\/(ja|en)/, "") || "/";

  // Allow public paths
  if (publicPaths.some((path) => pathnameWithoutLocale.startsWith(path))) {
    return handleIntl(request);
  }

  // Check for refresh token cookie (indicates logged in user)
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    // Determine locale or default to 'ja'
    const localeMatch = pathname.match(/^\/(ja|en)/);
    const locale = localeMatch ? localeMatch[1] : "ja";

    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathnameWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  return handleIntl(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
