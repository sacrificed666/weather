import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  airResponse,
  dailyResponse,
  forecastResponse,
  geocodingResponse,
  jsonResponse,
  weatherResponse,
} from "@/test/fixtures";

type Routes = Readonly<Record<string, () => Response>>;

const defaultRoutes: Routes = {
  "/geo/1.0/direct": () => jsonResponse(geocodingResponse),
  "/geo/1.0/reverse": () => jsonResponse(geocodingResponse),
  "/data/2.5/weather": () => jsonResponse(weatherResponse),
  "/data/2.5/forecast": () => jsonResponse(forecastResponse),
  "/data/2.5/forecast/daily": () => jsonResponse(dailyResponse),
  "/data/2.5/air_pollution": () => jsonResponse(airResponse),
};

// Answers the OpenWeatherMap requests with fixtures
const serve = (overrides: Routes = {}) => {
  const routes = { ...defaultRoutes, ...overrides };
  const fetchMock = vi.fn<(url: URL) => Promise<Response>>((url) =>
    Promise.resolve(routes[url.pathname]?.() ?? jsonResponse({}, 404)),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

// The forecast loader, imported after the mocks
const load = async () => (await import("./getForecast")).getForecast;

describe("getForecast", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("OPENWEATHERMAP_API_KEY", "secret");
  });

  it("builds a forecast for coordinates with a localized place name", async () => {
    serve();
    const result = await (await load())({ kind: "coordinates", latitude: 49.84, longitude: 24.03 }, "uk");
    if (!result.ok) throw new Error(result.failure);
    const { forecast } = result;
    expect(forecast.place).toEqual({
      name: "Львів",
      names: expect.objectContaining({ uk: "Львів", en: "Lviv" }) as unknown,
      region: "Lviv Oblast",
      country: "UA",
      latitude: 49.84,
      longitude: 24.03,
    });
    expect(forecast.current.temperature).toBe(13.2);
    expect(forecast.hourly).toHaveLength(8);
    expect(forecast.daily).toHaveLength(7);
    expect(forecast.daily[0]?.low).toBe(6);
    expect(forecast.airQuality?.index).toBe(2);
    expect(forecast.generatedAt).toBeGreaterThan(0);
  });

  it("asks for metric units in the interface language", async () => {
    const fetchMock = serve();
    await (
      await load()
    )({ kind: "coordinates", latitude: 1, longitude: 2 }, "de");
    const weather = fetchMock.mock.calls.map(([url]) => url).find((url) => url.pathname === "/data/2.5/weather");
    expect(weather?.searchParams.get("units")).toBe("metric");
    expect(weather?.searchParams.get("lang")).toBe("de");
  });

  it("asks for Czech with the code OpenWeatherMap expects", async () => {
    const fetchMock = serve();
    await (
      await load()
    )({ kind: "coordinates", latitude: 1, longitude: 2 }, "cs");
    const weather = fetchMock.mock.calls.map(([url]) => url).find((url) => url.pathname === "/data/2.5/weather");
    expect(weather?.searchParams.get("lang")).toBe("cz");
  });

  it("resolves a city name to its coordinates", async () => {
    const fetchMock = serve();
    const result = await (await load())({ kind: "city", name: "Lviv" }, "en");
    expect(result.ok && result.forecast.place).toMatchObject({ name: "Lviv", latitude: 49.84, longitude: 24.03 });
    const direct = fetchMock.mock.calls.map(([url]) => url).find((url) => url.pathname === "/geo/1.0/direct");
    expect(direct?.searchParams.get("q")).toBe("Lviv");
  });

  it("reports unknown cities", async () => {
    serve({ "/geo/1.0/direct": () => jsonResponse([]) });
    await expect((await load())({ kind: "city", name: "Atlantis" }, "en")).resolves.toEqual({
      ok: false,
      failure: "not-found",
    });
  });

  it("passes geocoding failures through", async () => {
    serve({ "/geo/1.0/direct": () => jsonResponse({}, 429) });
    await expect((await load())({ kind: "city", name: "Lviv" }, "en")).resolves.toEqual({
      ok: false,
      failure: "rate-limited",
    });
  });

  it("reports a missing API key", async () => {
    vi.stubEnv("OPENWEATHERMAP_API_KEY", "");
    serve();
    await expect((await load())({ kind: "coordinates", latitude: 1, longitude: 2 }, "en")).resolves.toEqual({
      ok: false,
      failure: "missing-key",
    });
  });

  it("falls back to the weather response when reverse geocoding finds nothing", async () => {
    serve({ "/geo/1.0/reverse": () => jsonResponse([]) });
    const result = await (await load())({ kind: "coordinates", latitude: 10, longitude: 20 }, "en");
    expect(result.ok && result.forecast.place).toEqual({
      name: "Lviv",
      region: null,
      country: "UA",
      latitude: 10,
      longitude: 20,
    });
  });

  it("reports an unusable weather response", async () => {
    serve({ "/data/2.5/weather": () => jsonResponse({}) });
    await expect((await load())({ kind: "coordinates", latitude: 1, longitude: 2 }, "en")).resolves.toEqual({
      ok: false,
      failure: "unavailable",
    });
  });

  it("builds the week from three-hour slots when the daily forecast is not in the plan, and remembers that", async () => {
    const fetchMock = serve({ "/data/2.5/forecast/daily": () => jsonResponse({}, 401) });
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const getForecast = await load();
    const first = await getForecast({ kind: "coordinates", latitude: 1, longitude: 2 }, "en");
    expect(first.ok && first.forecast.daily).toHaveLength(6);
    await getForecast({ kind: "coordinates", latitude: 1, longitude: 2 }, "en");
    const dailyCalls = fetchMock.mock.calls.filter(([url]) => url.pathname === "/data/2.5/forecast/daily");
    expect(dailyCalls).toHaveLength(1);
    // A key without the plan is fine: one calm line instead of an error
    expect(error).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledExactlyOnceWith(
      "[weather] The API key has no daily forecast, the week comes from three-hour steps",
    );
  });

  it("keeps asking for the daily forecast while the whole key is rejected", async () => {
    serve({
      "/data/2.5/weather": () => jsonResponse({}, 401),
      "/data/2.5/forecast/daily": () => jsonResponse({}, 401),
    });
    const getForecast = await load();
    await expect(getForecast({ kind: "coordinates", latitude: 1, longitude: 2 }, "en")).resolves.toEqual({
      ok: false,
      failure: "invalid-key",
    });
    serve();
    const second = await getForecast({ kind: "coordinates", latitude: 1, longitude: 2 }, "en");
    expect(second.ok && second.forecast.daily).toHaveLength(7);
  });

  it("works without the hourly forecast and air quality", async () => {
    serve({
      "/data/2.5/forecast": () => jsonResponse({}, 500),
      "/data/2.5/forecast/daily": () => jsonResponse({}, 500),
      "/data/2.5/air_pollution": () => jsonResponse({}, 500),
    });
    const result = await (await load())({ kind: "coordinates", latitude: 1, longitude: 2 }, "en");
    expect(result.ok && result.forecast).toMatchObject({ hourly: [], daily: [], airQuality: null });
  });
});
