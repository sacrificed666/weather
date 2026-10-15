import "server-only";
import { findPlace, searchPlaces } from "@/features/places/model/geocoding";
import type { LocationQuery } from "@/features/places/model/location";
import type { Place } from "@/features/places/model/place";
import { fetchOpenWeather, type OpenWeatherResult } from "@/shared/api/openWeather";
import { LOCALE_INFO, type Locale } from "@/shared/i18n/locales";
import { log } from "@/shared/lib/log";

import {
  aggregateDaily,
  includeCurrent,
  parseAirQuality,
  parseCurrent,
  parseDaily,
  parseSlots,
  upcomingHours,
} from "./normalize";
import type { ForecastFailure, ForecastResult } from "./types";

const WEATHER_REVALIDATE_SECONDS = 60 * 10;
const AIR_QUALITY_REVALIDATE_SECONDS = 60 * 30;
const DAILY_ENDPOINT_RETRY_MS = 60 * 60 * 1000;

let dailyEndpointBlockedUntil = 0;
let outsidePlanReported = false;

type ResolvedLocation =
  | { ok: true; latitude: number; longitude: number; place: Place | null }
  | { ok: false; failure: ForecastFailure };

// Coordinates and place for a city name or a pair of coordinates
const resolveLocation = async (query: LocationQuery, locale: Locale): Promise<ResolvedLocation> => {
  if (query.kind === "coordinates") {
    const place = await findPlace(query.latitude, query.longitude, locale);
    return { ok: true, latitude: query.latitude, longitude: query.longitude, place };
  }
  const result = await searchPlaces(query.name, locale, 1);
  if (!result.ok) return result;
  const [place] = result.places;
  return place
    ? { ok: true, latitude: place.latitude, longitude: place.longitude, place }
    : { ok: false, failure: "not-found" };
};

// The seven-day forecast, skipped for a while when the plan lacks it
const fetchDaily = async (coordinates: Readonly<Record<string, string | number>>): Promise<OpenWeatherResult> => {
  if (Date.now() < dailyEndpointBlockedUntil) return { ok: false, failure: "invalid-key" };
  return fetchOpenWeather("/data/2.5/forecast/daily", { ...coordinates, cnt: 7 }, WEATHER_REVALIDATE_SECONDS, {
    optional: true,
  });
};

// The key works but the daily forecast is not part of its plan
const isOutsidePlan = (daily: OpenWeatherResult, current: OpenWeatherResult) =>
  current.ok && !daily.ok && daily.failure === "invalid-key";

// Current weather, hours, days and air quality of a place
export const getForecast = async (query: LocationQuery, locale: Locale): Promise<ForecastResult> => {
  const location = await resolveLocation(query, locale);
  if (!location.ok) return location;

  const coordinates = {
    lat: location.latitude,
    lon: location.longitude,
    units: "metric",
    lang: LOCALE_INFO[locale].openWeather,
  };
  const [currentResult, slotsResult, dailyResult, airResult] = await Promise.all([
    fetchOpenWeather("/data/2.5/weather", coordinates, WEATHER_REVALIDATE_SECONDS),
    fetchOpenWeather("/data/2.5/forecast", coordinates, WEATHER_REVALIDATE_SECONDS),
    fetchDaily(coordinates),
    fetchOpenWeather(
      "/data/2.5/air_pollution",
      { lat: location.latitude, lon: location.longitude },
      AIR_QUALITY_REVALIDATE_SECONDS,
    ),
  ]);

  if (isOutsidePlan(dailyResult, currentResult)) {
    dailyEndpointBlockedUntil = Date.now() + DAILY_ENDPOINT_RETRY_MS;
    if (!outsidePlanReported) log.info("The API key has no daily forecast, the week comes from three-hour steps");
    outsidePlanReported = true;
  }
  if (!currentResult.ok) return currentResult;
  const parsed = parseCurrent(currentResult.data);
  const place = location.place ?? parsed?.place;
  if (!parsed || !place) return { ok: false, failure: "unavailable" };

  const { current, timezoneOffset } = parsed;
  const slots = slotsResult.ok ? parseSlots(slotsResult.data) : [];
  const daily = dailyResult.ok ? parseDaily(dailyResult.data) : [];

  return {
    ok: true,
    forecast: {
      place: { ...place, latitude: location.latitude, longitude: location.longitude },
      generatedAt: Math.floor(Date.now() / 1000),
      timezoneOffset,
      current,
      hourly: upcomingHours(slots, current.time),
      daily: includeCurrent(daily.length > 0 ? daily : aggregateDaily(slots, timezoneOffset), current, timezoneOffset),
      airQuality: airResult.ok ? parseAirQuality(airResult.data) : null,
    },
  };
};
