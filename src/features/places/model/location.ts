import type { Locale } from "@/shared/i18n/locales";

import { isLatitude, isLongitude, MAX_NAME_LENGTH, placeKey, placeSearch, roundCoordinate, type Place } from "./place";

export type LocationQuery =
  | { kind: "coordinates"; latitude: number; longitude: number }
  | { kind: "city"; name: string };

export type SearchParams = Readonly<Record<string, string | string[] | undefined>>;

export const DEFAULT_LOCATION = {
  kind: "coordinates",
  latitude: 49.84,
  longitude: 24.03,
} as const satisfies LocationQuery;

// The first value of a search parameter, trimmed
const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

// Coordinates or a city from the address, Lviv when both are missing
export const parseLocation = (params: SearchParams): LocationQuery | null => {
  const city = single(params.city);
  const latitude = single(params.lat);
  const longitude = single(params.lon);

  if (latitude !== "" || longitude !== "") {
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (latitude === "" || longitude === "" || !isLatitude(lat) || !isLongitude(lon)) return null;
    return { kind: "coordinates", latitude: roundCoordinate(lat), longitude: roundCoordinate(lon) };
  }

  if (city !== "") return city.length > MAX_NAME_LENGTH ? null : { kind: "city", name: city };

  return DEFAULT_LOCATION;
};

// A key that changes when the requested place changes
export const locationKey = (query: LocationQuery | null) => {
  if (!query) return "invalid";
  return query.kind === "city" ? `city:${query.name.toLocaleLowerCase()}` : placeKey(query);
};

// Whether the address points to the default place
export const isDefaultLocation = (query: LocationQuery) => locationKey(query) === placeKey(DEFAULT_LOCATION);

// The home page for a city name
export const cityHref = (locale: Locale, name: string): `/${Locale}?${string}` =>
  `/${locale}?city=${encodeURIComponent(name.trim())}`;

// The query of a forecast address, empty for the default place
export const forecastSearch = (query: LocationQuery, place: Pick<Place, "latitude" | "longitude">) =>
  isDefaultLocation(query) ? "" : placeSearch(place);
