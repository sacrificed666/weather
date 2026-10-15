import { isLocale, type Locale } from "@/shared/i18n/locales";
import { isRecord } from "@/shared/lib/guards";

export type PlaceNames = Partial<Record<Locale, string>>;

export interface Place {
  name: string;
  names?: PlaceNames;
  region: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export const MAX_NAME_LENGTH = 80;

// Places closer than this with a shared name count as one city
const SAME_PLACE_KM = 25;

const EARTH_RADIUS_KM = 6371;

// Degrees as radians
const radians = (degrees: number) => (degrees * Math.PI) / 180;

// Two decimals, about a kilometre, so one place keeps one address
export const roundCoordinate = (value: number) => Math.round(value * 100) / 100;

// Whether a number is a valid latitude
export const isLatitude = (value: number) => Number.isFinite(value) && value >= -90 && value <= 90;

// Whether a number is a valid longitude
export const isLongitude = (value: number) => Number.isFinite(value) && value >= -180 && value <= 180;

// A key for the rounded coordinates of a place
export const placeKey = ({ latitude, longitude }: Pick<Place, "latitude" | "longitude">) =>
  `${roundCoordinate(latitude).toFixed(2)},${roundCoordinate(longitude).toFixed(2)}`;

// The query of a place's address
export const placeSearch = (place: Pick<Place, "latitude" | "longitude">): `?lat=${string}&lon=${string}` => {
  const [latitude, longitude] = placeKey(place).split(",");
  return `?lat=${latitude}&lon=${longitude}`;
};

// The forecast address of a place
export const placeHref = (locale: Locale, place: Pick<Place, "latitude" | "longitude">): `/${Locale}?${string}` =>
  `/${locale}${placeSearch(place)}`;

// Whether a value is a usable place name
const isName = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "" && value.length <= MAX_NAME_LENGTH;

// Names in the supported languages, as OpenWeatherMap returns them in local_names
export const parseNames = (value: unknown): PlaceNames | undefined => {
  if (!isRecord(value)) return undefined;
  const entries = Object.entries(value).filter(
    (entry): entry is [Locale, string] => isLocale(entry[0]) && isName(entry[1]),
  );
  return entries.length > 0 ? Object.fromEntries(entries.map(([locale, name]) => [locale, name.trim()])) : undefined;
};

// The name of a place in a language, or its default name
export const placeName = (place: Pick<Place, "name" | "names">, locale: Locale) => place.names?.[locale] ?? place.name;

// Distance between two places along the Earth's surface
export const distanceKm = (a: Pick<Place, "latitude" | "longitude">, b: Pick<Place, "latitude" | "longitude">) => {
  const latitude = radians(b.latitude - a.latitude);
  const longitude = radians(b.longitude - a.longitude);
  const chord =
    Math.sin(latitude / 2) ** 2 +
    Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(longitude / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(chord)));
};

// Every name of a place in lower case
const allNames = (place: Place) =>
  new Set([place.name, ...Object.values(place.names ?? {})].map((name) => name.toLowerCase()));

// The saved place closest to the coordinates of the page, if one is near enough
export const nearestPlace = <Item extends Place>(
  places: readonly Item[],
  position: Pick<Place, "latitude" | "longitude">,
) => {
  const distances = places.map((place) => ({ place, distance: distanceKm(place, position) }));
  const [nearest] = distances
    .filter(({ distance }) => distance <= SAME_PLACE_KM)
    .toSorted((a, b) => a.distance - b.distance);
  return nearest?.place ?? null;
};

// Whether two entries are one city, saved from a search, a link or the locator
export const isSamePlace = (a: Place, b: Place) => {
  if (placeKey(a) === placeKey(b)) return true;
  if (a.country !== b.country || distanceKm(a, b) > SAME_PLACE_KM) return false;
  const names = allNames(b);
  return [...allNames(a)].some((name) => names.has(name));
};

// A stored place, or null when it is broken
export const parsePlace = (value: unknown): Place | null => {
  if (!isRecord(value)) return null;
  const { name, names, region, country, latitude, longitude } = value;
  if (!isName(name)) return null;
  if (typeof latitude !== "number" || !isLatitude(latitude)) return null;
  if (typeof longitude !== "number" || !isLongitude(longitude)) return null;
  const localNames = parseNames(names);
  return {
    name: name.trim(),
    ...(localNames && { names: localNames }),
    region: typeof region === "string" && region.trim() !== "" ? region.trim().slice(0, MAX_NAME_LENGTH) : null,
    country: typeof country === "string" && /^[A-Z]{2}$/u.test(country) ? country : null,
    latitude: roundCoordinate(latitude),
    longitude: roundCoordinate(longitude),
  };
};
