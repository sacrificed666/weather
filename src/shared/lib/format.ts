import { toLocalDate } from "./time";
import {
  celsiusToFahrenheit,
  hectopascalsToInchesOfMercury,
  metersPerSecondToMilesPerHour,
  metersToMiles,
  millimetersToInches,
  type UnitSystem,
} from "./units";

export interface Formatter {
  readonly units: UnitSystem;
  temperature: (celsius: number) => string;
  speed: (metersPerSecond: number) => string;
  distance: (meters: number) => string;
  pressure: (hectopascals: number) => string;
  precipitation: (millimeters: number) => string;
  percent: (fraction: number) => string;
  number: (value: number) => string;
  time: (unixSeconds: number, offsetSeconds: number) => string;
  weekday: (unixSeconds: number, offsetSeconds: number) => string;
  date: (unixSeconds: number, offsetSeconds: number) => string;
  duration: (seconds: number) => string;
  country: (code: string) => string;
  sentence: (text: string) => string;
}

// A number formatter for a unit such as km/h
const unitFormat = (locale: string, unit: string, maximumFractionDigits = 0) =>
  new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "short", maximumFractionDigits });

// A date formatter in UTC, as times are shifted to the place first
const localFormat = (locale: string, options: Intl.DateTimeFormatOptions) => {
  const formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" });
  return (unixSeconds: number, offsetSeconds: number) => formatter.format(toLocalDate(unixSeconds, offsetSeconds));
};

// Temperatures, speeds, times and more in a language and unit system
export const createFormatter = (locale: string, units: UnitSystem): Formatter => {
  const imperial = units === "imperial";
  const integer = new Intl.NumberFormat(locale, { maximumFractionDigits: 0, signDisplay: "negative" });
  const decimal = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 });
  const speed = unitFormat(locale, imperial ? "mile-per-hour" : "meter-per-second");
  const shortDistance = unitFormat(locale, imperial ? "mile" : "kilometer", 1);
  const longDistance = unitFormat(locale, imperial ? "mile" : "kilometer");
  const precipitation = unitFormat(locale, imperial ? "inch" : "millimeter", imperial ? 2 : 1);
  const hours = unitFormat(locale, "hour");
  const minutes = unitFormat(locale, "minute");
  const countries = new Intl.DisplayNames(locale, { type: "region", fallback: "code" });

  return {
    units,
    temperature: (celsius) => `${integer.format(Math.round(imperial ? celsiusToFahrenheit(celsius) : celsius))}°`,
    speed: (metersPerSecond) =>
      speed.format(imperial ? metersPerSecondToMilesPerHour(metersPerSecond) : metersPerSecond),
    distance: (meters) => {
      const value = imperial ? metersToMiles(meters) : meters / 1000;
      return value < 10 ? shortDistance.format(value) : longDistance.format(value);
    },
    pressure: (hectopascals) =>
      imperial ? decimal.format(hectopascalsToInchesOfMercury(hectopascals)) : integer.format(hectopascals),
    precipitation: (millimeters) => precipitation.format(imperial ? millimetersToInches(millimeters) : millimeters),
    percent: (fraction) => percent.format(fraction),
    number: (value) => integer.format(value),
    time: localFormat(locale, { hour: "2-digit", minute: "2-digit" }),
    weekday: localFormat(locale, { weekday: "short" }),
    date: localFormat(locale, { weekday: "long", day: "numeric", month: "long" }),
    duration: (seconds) => {
      const totalMinutes = Math.round(seconds / 60);
      return `${hours.format(Math.floor(totalMinutes / 60))} ${minutes.format(totalMinutes % 60)}`;
    },
    country: (code) => countries.of(code) ?? code,
    sentence: (text) => (text === "" ? text : `${text.charAt(0).toLocaleUpperCase(locale)}${text.slice(1)}`),
  };
};
