import type { Place } from "@/features/places/model/place";

export interface Condition {
  code: number;
  description: string;
  daytime: boolean;
}

export interface Wind {
  speed: number;
  gust: number | null;
  direction: number | null;
}

export interface CurrentWeather {
  time: number;
  condition: Condition;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  visibility: number | null;
  cloudiness: number;
  precipitation: number;
  wind: Wind;
  sunrise: number | null;
  sunset: number | null;
}

export interface HourlyForecast {
  time: number;
  condition: Condition;
  temperature: number;
  precipitationChance: number;
}

export interface DailyForecast {
  time: number;
  condition: Condition;
  low: number;
  high: number;
  precipitationChance: number;
}

export type AirQualityIndex = 1 | 2 | 3 | 4 | 5;

export interface AirQuality {
  index: AirQualityIndex;
  fineParticles: number | null;
  coarseParticles: number | null;
  ozone: number | null;
  nitrogenDioxide: number | null;
}

export interface Forecast {
  place: Place;
  generatedAt: number;
  timezoneOffset: number;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  airQuality: AirQuality | null;
}

export type ForecastFailure = "not-found" | "missing-key" | "invalid-key" | "rate-limited" | "unavailable";

export type ForecastResult = { ok: true; forecast: Forecast } | { ok: false; failure: ForecastFailure };
