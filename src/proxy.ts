import { type NextRequest, NextResponse } from "next/server";

import { isLocale, LOCALE_COOKIE, LOCALE_HEADER, negotiateLocale, type Locale } from "@/shared/i18n/locales";
import { contentSecurityPolicy } from "@/shared/lib/contentSecurityPolicy";

// The saved language, or the best match for the browser
const preferredLocale = (request: NextRequest): Locale => {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  return isLocale(saved) ? saved : negotiateLocale(request.headers.get("accept-language"));
};

// A redirect to other path segments
const redirectTo = (request: NextRequest, segments: readonly string[], status: 307 | 308) => {
  const url = request.nextUrl.clone();
  url.pathname = ["", ...segments].join("/");
  return NextResponse.redirect(url, status);
};

// Passes the language and a fresh CSP nonce to the page
const render = (request: NextRequest, locale: Locale) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = contentSecurityPolicy(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
};

// Adds the language to bare addresses and secures every page
export const proxy = (request: NextRequest) => {
  const [first = "", ...rest] = request.nextUrl.pathname.split("/").filter(Boolean);
  if (isLocale(first)) return render(request, first);

  const lowercase = first.toLowerCase();
  if (isLocale(lowercase)) return redirectTo(request, [lowercase, ...rest], 308);

  const response = redirectTo(request, [preferredLocale(request), first, ...rest].filter(Boolean), 307);
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
};

export const config = {
  matcher: [
    {
      source:
        "/((?!(?:api|_next/static|_next/image|icons|flags|pwa|healthz|offline|\\.well-known)(?:/|$)|(?:favicon\\.ico|icon\\.svg|apple-icon|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|sw\\.js)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
