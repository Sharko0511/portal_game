import { NextRequest, NextResponse } from "next/server";

const DEFAULT_LANGUAGE = "en";
const COOKIE_NAME = "i18next";

// Paths that should never be redirected
const BYPASS_PREFIXES = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/public",
];

// Matches any ISO 639-1/2 language code (2–3 lowercase letters), optionally with a region tag
const LANG_SEGMENT_RE = /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/;

function isLangSegment(segment: string): boolean {
  return LANG_SEGMENT_RE.test(segment);
}

function getLanguage(request: NextRequest): string {
  // Cookie only — always fallback to default, never auto-detect from browser
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie && isLangSegment(cookie)) return cookie;

  return DEFAULT_LANGUAGE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, Next.js internals, static files
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Already has a language prefix — just set the cookie
  const firstSegment = pathname.split("/")[1] ?? "";
  const pathnameHasLng = isLangSegment(firstSegment);

  if (pathnameHasLng) {
    const lng = firstSegment;
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml)).*)",
  ],
};
