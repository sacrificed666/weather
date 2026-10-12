import type { NextRequest } from "next/server";

import { searchPlaces } from "@/features/places/model/geocoding";
import { MAX_NAME_LENGTH } from "@/features/places/model/place";
import type { OpenWeatherFailure } from "@/shared/api/openWeather";
import { DEFAULT_LOCALE, isLocale } from "@/shared/i18n/locales";
import { createRateLimiter } from "@/shared/lib/rateLimit";

const MIN_QUERY_LENGTH = 2;

const allowRequest = createRateLimiter({ limit: 30, windowMs: 60_000 });

// The HTTP status for an OpenWeather failure
const statusFor = (failure: OpenWeatherFailure) => {
  if (failure === "rate-limited") return 429;
  if (failure === "not-found") return 404;
  return 503;
};

// The visitor's address for rate limiting
const clientAddress = (request: NextRequest) => {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return request.headers.get("x-real-ip") ?? "anonymous";
};

// City search for this site only, limited per visitor
export const GET = async (request: NextRequest) => {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return Response.json({ error: "forbidden" }, { status: 403 });

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const language = request.nextUrl.searchParams.get("lang");
  const locale = isLocale(language) ? language : DEFAULT_LOCALE;
  if (query.length > MAX_NAME_LENGTH) return Response.json({ error: "query-too-long" }, { status: 400 });
  if (query.length < MIN_QUERY_LENGTH) return Response.json({ places: [] });

  if (!allowRequest(clientAddress(request))) {
    return Response.json({ error: "rate-limited" }, { status: 429, headers: { "Retry-After": "60" } });
  }

  const result = await searchPlaces(query, locale);
  if (!result.ok) return Response.json({ error: result.failure }, { status: statusFor(result.failure) });
  return Response.json({ places: result.places });
};
