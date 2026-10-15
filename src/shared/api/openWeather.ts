import "server-only";
import { log } from "@/shared/lib/log";

export type OpenWeatherFailure = "missing-key" | "invalid-key" | "not-found" | "rate-limited" | "unavailable";

export type OpenWeatherResult = { ok: true; data: unknown } | { ok: false; failure: OpenWeatherFailure };

export type OpenWeatherParams = Readonly<Record<string, string | number>>;

interface OpenWeatherOptions {
  // An endpoint that some plans lack, so the caller decides what a 401 means
  optional?: boolean;
}

const DEFAULT_BASE_URL = "https://api.openweathermap.org";
const TIMEOUT_MS = 8000;

// The OpenWeather address, which tests point to the mock API
const baseUrl = () => {
  const configured = process.env.OPENWEATHERMAP_API_URL?.trim();
  return configured === undefined || configured === "" ? DEFAULT_BASE_URL : configured;
};

// The failure for an HTTP status
const failureForStatus = (status: number): OpenWeatherFailure => {
  if (status === 401) return "invalid-key";
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limited";
  return "unavailable";
};

let missingKeyReported = false;

// Writes a failure to the server log; the address is left out, it holds the key
const report = (path: string, failure: OpenWeatherFailure, details: Record<string, unknown> = {}) => {
  const context = { path, ...details };
  if (failure === "missing-key") {
    if (!missingKeyReported) log.warn("OPENWEATHERMAP_API_KEY is not set, forecasts are off");
    missingKeyReported = true;
  } else if (failure === "invalid-key") log.error("OpenWeatherMap rejected the API key", context);
  else if (failure === "rate-limited") log.warn("OpenWeatherMap rate limit reached", context);
  else if (failure === "unavailable") log.warn("OpenWeatherMap is unavailable", context);
};

// A cached OpenWeather request that never throws
export const fetchOpenWeather = async (
  path: string,
  params: OpenWeatherParams,
  revalidateSeconds: number,
  { optional = false }: OpenWeatherOptions = {},
): Promise<OpenWeatherResult> => {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY?.trim();
  if (!apiKey) {
    report(path, "missing-key");
    return { ok: false, failure: "missing-key" };
  }

  const url = new URL(path, baseUrl());
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));
  url.searchParams.set("appid", apiKey);

  try {
    const response = await fetch(url, {
      next: { revalidate: revalidateSeconds },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      const failure = failureForStatus(response.status);
      if (!optional || failure !== "invalid-key") report(path, failure, { status: response.status });
      return { ok: false, failure };
    }
    return { ok: true, data: await response.json() };
  } catch (error) {
    report(path, "unavailable", { reason: error instanceof Error ? error.name : "unknown" });
    return { ok: false, failure: "unavailable" };
  }
};
