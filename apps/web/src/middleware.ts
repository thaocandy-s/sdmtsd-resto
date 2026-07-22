import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const handleIntl = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass next-intl for admin paths to avoid redirect loops
  if (pathname.startsWith("/admin") || pathname.match(/^\/(ja|en)\/admin/)) {
    return NextResponse.next();
  }

  return handleIntl(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
