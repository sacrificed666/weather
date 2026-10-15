import { parsePlace, type Place } from "@/features/places/model/place";
import { clamp, readArray, readNumber, readRecord, readString } from "@/shared/lib/guards";
import { localDayKey, localHour } from "@/shared/lib/time";

import { conditionSeverity } from "./conditions";
import type { AirQuality, AirQualityIndex, Condition, CurrentWeather, DailyForecast, HourlyForecast } from "./types";

export interface ForecastSlot extends HourlyForecast {
  low: number;
  high: number;
}

export interface ParsedCurrent {
  current: CurrentWeather;
  timezoneOffset: number;
  place: Place | null;
}

// Removes missing entries from a list
const isPresent = <Value>(value: Value | null): value is Value => value !== null;

// A condition with code, text and icon, or null
const readCondition = (entry: unknown, daytime: boolean): Condition | null => {
  const weather = readArray(entry, "weather")[0];
  const code = readNumber(weather, "id");
  if (code === null) return null;
  const icon = readString(weather, "icon");
  return {
    code,
    description: readString(weather, "description") ?? "",
    daytime: icon ? !icon.endsWith("n") : daytime,
  };
};

// A time that is set, or null
const positiveTime = (value: number | null) => (value !== null && value > 0 ? value : null);

// A share between 0 and 1
const fraction = (value: number | null) => clamp(value ?? 0, 0, 1);

// Current weather and the place from the OpenWeather response
export const parseCurrent = (data: unknown): ParsedCurrent | null => {
  const main = readRecord(data, "main");
  const system = readRecord(data, "sys");
  const wind = readRecord(data, "wind");
  const coordinates = readRecord(data, "coord");
  const time = readNumber(data, "dt");
  const temperature = readNumber(main, "temp");
  const humidity = readNumber(main, "humidity");
  const pressure = readNumber(main, "pressure");
  const sunrise = positiveTime(readNumber(system, "sunrise"));
  const sunset = positiveTime(readNumber(system, "sunset"));
  const daytime = time !== null && sunrise !== null && sunset !== null ? time >= sunrise && time < sunset : true;
  const condition = readCondition(data, daytime);
  if (time === null || temperature === null || humidity === null || pressure === null || !condition) return null;

  return {
    timezoneOffset: readNumber(data, "timezone") ?? 0,
    place: parsePlace({
      name: readString(data, "name"),
      country: readString(system, "country")?.toUpperCase(),
      latitude: readNumber(coordinates, "lat"),
      longitude: readNumber(coordinates, "lon"),
    }),
    current: {
      time,
      condition,
      temperature,
      feelsLike: readNumber(main, "feels_like") ?? temperature,
      humidity: clamp(humidity, 0, 100),
      pressure,
      visibility: readNumber(data, "visibility"),
      cloudiness: clamp(readNumber(readRecord(data, "clouds"), "all") ?? 0, 0, 100),
      precipitation:
        (readNumber(readRecord(data, "rain"), "1h") ?? 0) + (readNumber(readRecord(data, "snow"), "1h") ?? 0),
      wind: {
        speed: Math.max(0, readNumber(wind, "speed") ?? 0),
        gust: readNumber(wind, "gust"),
        direction: readNumber(wind, "deg"),
      },
      sunrise,
      sunset,
    },
  };
};

// Three-hour forecast slots
export const parseSlots = (data: unknown): ForecastSlot[] =>
  readArray(data, "list")
    .map((entry): ForecastSlot | null => {
      const main = readRecord(entry, "main");
      const time = readNumber(entry, "dt");
      const temperature = readNumber(main, "temp");
      const condition = readCondition(entry, readString(readRecord(entry, "sys"), "pod") !== "n");
      if (time === null || temperature === null || !condition) return null;
      return {
        time,
        condition,
        temperature,
        low: readNumber(main, "temp_min") ?? temperature,
        high: readNumber(main, "temp_max") ?? temperature,
        precipitationChance: fraction(readNumber(entry, "pop")),
      };
    })
    .filter(isPresent)
    .toSorted((a, b) => a.time - b.time);

// Days of the daily forecast
export const parseDaily = (data: unknown): DailyForecast[] =>
  readArray(data, "list")
    .map((entry): DailyForecast | null => {
      const temperatures = readRecord(entry, "temp");
      const time = readNumber(entry, "dt");
      const low = readNumber(temperatures, "min");
      const high = readNumber(temperatures, "max");
      const condition = readCondition(entry, true);
      if (time === null || low === null || high === null || !condition) return null;
      return {
        time,
        condition: { ...condition, daytime: true },
        low,
        high,
        precipitationChance: fraction(readNumber(entry, "pop")),
      };
    })
    .filter(isPresent)
    .toSorted((a, b) => a.time - b.time);

// Whether a value is an index from 1 to 5
const isAirQualityIndex = (value: number | null): value is AirQualityIndex =>
  value === 1 || value === 2 || value === 3 || value === 4 || value === 5;

// Air quality index and pollutants
export const parseAirQuality = (data: unknown): AirQuality | null => {
  const [entry] = readArray(data, "list");
  const index = readNumber(readRecord(entry, "main"), "aqi");
  if (!isAirQualityIndex(index)) return null;
  const components = readRecord(entry, "components");
  return {
    index,
    fineParticles: readNumber(components, "pm2_5"),
    coarseParticles: readNumber(components, "pm10"),
    ozone: readNumber(components, "o3"),
    nitrogenDioxide: readNumber(components, "no2"),
  };
};

const MIN_SLOTS_PER_DAY = 4;
const MAX_DAYS = 7;
const DAYTIME_HOURS = { from: 6, to: 21 };

// The worst condition of the daytime hours describes the day
const representativeCondition = (slots: readonly ForecastSlot[], timezoneOffset: number): Condition => {
  const daytime = slots.filter((slot) => {
    const hour = localHour(slot.time, timezoneOffset);
    return hour >= DAYTIME_HOURS.from && hour <= DAYTIME_HOURS.to;
  });
  const candidates = daytime.length > 0 ? daytime : slots;
  const [first, ...rest] = candidates;
  if (!first) throw new Error("A day needs at least one forecast slot");
  const worst = rest.reduce(
    (best, slot) => (conditionSeverity(slot.condition.code) > conditionSeverity(best.condition.code) ? slot : best),
    first,
  );
  return { ...worst.condition, daytime: true };
};

// Days built from three-hour slots when the daily forecast is missing
export const aggregateDaily = (slots: readonly ForecastSlot[], timezoneOffset: number): DailyForecast[] => {
  const days = Map.groupBy(slots, (slot) => localDayKey(slot.time, timezoneOffset));
  return [...days.values()]
    .filter((day, index) => index === 0 || day.length >= MIN_SLOTS_PER_DAY)
    .slice(0, MAX_DAYS)
    .map((day) => ({
      time: day[0]?.time ?? 0,
      condition: representativeCondition(day, timezoneOffset),
      low: Math.min(...day.map((slot) => slot.low)),
      high: Math.max(...day.map((slot) => slot.high)),
      precipitationChance: Math.max(...day.map((slot) => slot.precipitationChance)),
    }));
};

// Today's range widened by the current temperature
export const includeCurrent = (
  days: readonly DailyForecast[],
  current: CurrentWeather,
  timezoneOffset: number,
): DailyForecast[] => {
  const today = localDayKey(current.time, timezoneOffset);
  const upcoming = days.filter((day) => localDayKey(day.time, timezoneOffset) >= today);
  const [first, ...rest] = upcoming;
  if (!first || localDayKey(first.time, timezoneOffset) !== today) return upcoming;
  const low = Math.min(first.low, current.temperature);
  const high = Math.max(first.high, current.temperature);
  return [{ ...first, low, high }, ...rest];
};

// Today's entry of the daily forecast
export const todayForecast = (
  days: readonly DailyForecast[],
  current: CurrentWeather,
  timezoneOffset: number,
): DailyForecast | null => {
  const today = localDayKey(current.time, timezoneOffset);
  return days.find((day) => localDayKey(day.time, timezoneOffset) === today) ?? null;
};

// The next forecast slots
export const upcomingHours = (slots: readonly ForecastSlot[], now: number, count = 8): HourlyForecast[] =>
  slots
    .filter((slot) => slot.time > now)
    .slice(0, count)
    .map(({ time, condition, temperature, precipitationChance }) => ({
      time,
      condition,
      temperature,
      precipitationChance,
    }));
