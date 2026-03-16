import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LANGUAGES = ["en", "vi"];
const DEFAULT_LANGUAGE = "en";
const COOKIE_NAME = "i18next";

// Paths that should never be redirected
const BYPASS_PREFIXES = ["/api", "/_next", "/favicon.ico", "/public"];

function getLanguage(request: NextRequest): string {
  // Cookie only — always fallback to default, never auto-detect from browser
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie && SUPPORTED_LANGUAGES.includes(cookie)) return cookie;

  return DEFAULT_LANGUAGE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, Next.js internals, static files
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Already has a supported language prefix — just set the cookie
  const pathnameHasLng = SUPPORTED_LANGUAGES.some(
    (lng) => pathname.startsWith(`/${lng}/`) || pathname === `/${lng}`
  );

  if (pathnameHasLng) {
    const lng = pathname.split("/")[1];
    const response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, lng, { path: "/" });
    return response;
  }

  // No language prefix — detect and redirect
  const lng = getLanguage(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${lng}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
