import { clamp } from "@/shared/lib/guards";

const COMPASS_POINTS = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;

export type CompassPoint = (typeof COMPASS_POINTS)[number];

// One of eight compass points for a wind direction
export const compassPoint = (degrees: number): CompassPoint =>
  COMPASS_POINTS[Math.round((((degrees % 360) + 360) % 360) / 45) % COMPASS_POINTS.length] ?? "n";

export type PressureLevel = "low" | "normal" | "high";

export const PRESSURE_SCALE = { min: 960, max: 1060 } as const;

// Low, normal or high air pressure
export const pressureLevel = (hectopascals: number): PressureLevel => {
  if (hectopascals < 1006) return "low";
  if (hectopascals > 1020) return "high";
  return "normal";
};

export type HumidityLevel = "low" | "normal" | "high";

// Low, normal or high relative humidity
export const humidityLevel = (percent: number): HumidityLevel => {
  if (percent < 30) return "low";
  if (percent > 70) return "high";
  return "normal";
};

export type DewPointLevel = "comfortable" | "sticky" | "muggy";

export const DEW_POINT_SCALE = { min: -10, max: 25 } as const;

// How the moisture in the air feels, from the dew point in Celsius
export const dewPointLevel = (celsius: number): DewPointLevel => {
  if (celsius >= 18) return "muggy";
  if (celsius >= 13) return "sticky";
  return "comfortable";
};

export const VISIBILITY_SCALE = { min: 0, max: 10_000 } as const;

export type VisibilityLevel = "clear" | "hazy" | "poor";

// Clear, hazy or poor visibility
export const visibilityLevel = (meters: number): VisibilityLevel => {
  if (meters >= 10_000) return "clear";
  if (meters >= 4000) return "hazy";
  return "poor";
};

export type CloudLevel = "clear" | "partly" | "mostly" | "overcast";

// Clear, partly, mostly cloudy or overcast
export const cloudLevel = (percent: number): CloudLevel => {
  if (percent < 20) return "clear";
  if (percent < 60) return "partly";
  if (percent < 90) return "mostly";
  return "overcast";
};

export const PRECIPITATION_SCALE = { min: 0, max: 8 } as const;

// Where a value sits between two ends, from 0 to 1
export const progress = (value: number, min: number, max: number) =>
  max === min ? 0.5 : clamp((value - min) / (max - min), 0, 1);

// How far the sun is through the day, or null at night
export const daylightProgress = (now: number, sunrise: number, sunset: number) =>
  now < sunrise || now > sunset ? null : progress(now, sunrise, sunset);

export const TEMPERATURE_SCALE = { min: -10, max: 35 } as const;

export const TEMPERATURE_STOPS = [
  { celsius: -10, color: "#5aa7ff" },
  { celsius: 5, color: "#5ed3c4" },
  { celsius: 15, color: "#9ad66b" },
  { celsius: 25, color: "#ffc145" },
  { celsius: 35, color: "#ff7a45" },
] as const;
