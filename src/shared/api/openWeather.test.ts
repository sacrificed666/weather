import { afterEach, describe, expect, it, vi } from "vitest";

import { jsonResponse } from "@/test/fixtures";

import { fetchOpenWeather } from "./openWeather";

describe("fetchOpenWeather", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports a missing API key without calling the service", async () => {
    vi.stubEnv("OPENWEATHERMAP_API_KEY", " ");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchOpenWeather("/data/2.5/weather", {}, 60)).resolves.toEqual({ ok: false, failure: "missing-key" });
    await fetchOpenWeather("/data/2.5/forecast", {}, 60);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledExactlyOnceWith("[weather] OPENWEATHERMAP_API_KEY is not set, forecasts are off");
  });

  it("sends the parameters and key and caches the response", async () => {
    vi.stubEnv("OPENWEATHERMAP_API_KEY", "secret");
    const fetchMock = vi
      .fn<(input: URL, init: RequestInit) => Promise<Response>>()
      .mockResolvedValue(jsonResponse({ ok: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchOpenWeather("/data/2.5/weather", { lat: 1.5, units: "metric" }, 600)).resolves.toEqual({
      ok: true,
      data: { ok: 1 },
    });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url?.toString()).toBe("https://api.openweathermap.org/data/2.5/weather?lat=1.5&units=metric&appid=secret");
    expect(init?.next?.revalidate).toBe(600);
  });

  it("talks to the address from OPENWEATHERMAP_API_URL", async () => {
    vi.stubEnv("OPENWEATHERMAP_API_KEY", "secret");
    vi.stubEnv("OPENWEATHERMAP_API_URL", " http://127.0.0.1:4020 ");
    const fetchMock = vi.fn<(input: URL) => Promise<Response>>().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);
    await fetchOpenWeather("/geo/1.0/direct", { q: "Lviv" }, 60);
    expect(fetchMock.mock.calls[0]?.[0].toString()).toBe("http://127.0.0.1:4020/geo/1.0/direct?q=Lviv&appid=secret");
  });

  it.each([
    [401, "invalid-key"],
    [404, "not-found"],
    [429, "rate-limited"],
    [500, "unavailable"],
  ])("maps status %i to %s", async (status, failure) => {
    vi.stubEnv("OPENWEATHERMAP_API_KEY", "secret");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, status)));
    await expect(fetchOpenWeather("/x", {}, 60)).resolves.toEqual({ ok: false, failure });
  });

  it("logs a rejected key and a full quota with the path and status, never with the key", async () => {
    vi.stubEnv("OPENWEATHERMAP_API_KEY", "secret");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 401)));
    await fetchOpenWeather("/data/2.5/weather", { q: "Lviv" }, 60);
    expect(error).toHaveBeenCalledWith(
      '[weather] OpenWeatherMap rejected the API key {"path":"/data/2.5/weather","status":401}',
    );
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 429)));
    await fetchOpenWeather("/data/2.5/weather", {}, 60);
    expect(warn).toHaveBeenCalledWith(
      '[weather] OpenWeatherMap rate limit reached {"path":"/data/2.5/weather","status":429}',
    );
    const logged = [...warn.mock.calls, ...error.mock.calls].flat().join(" ");
    expect(logged).not.toContain("secret");
  });

  it("leaves a rejected key on an optional endpoint to the caller", async () => {
    vi.stubEnv("OPENWEATHERMAP_API_KEY", "secret");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 401)));
    await expect(fetchOpenWeather("/data/2.5/forecast/daily", {}, 60, { optional: true })).resolves.toEqual({
      ok: false,
      failure: "invalid-key",
    });
    expect(error).not.toHaveBeenCalled();
  });

  it("leaves unknown places out of the log", async () => {
    vi.stubEnv("OPENWEATHERMAP_API_KEY", "secret");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 404)));
    await fetchOpenWeather("/data/2.5/weather", { q: "Atlantis" }, 60);
    expect(warn).not.toHaveBeenCalled();
  });

  it("treats network errors as an unavailable service", async () => {
    vi.stubEnv("OPENWEATHERMAP_API_KEY", "secret");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(new TypeError("offline")));
    await expect(fetchOpenWeather("/x", {}, 60)).resolves.toEqual({ ok: false, failure: "unavailable" });
    expect(warn).toHaveBeenCalledWith('[weather] OpenWeatherMap is unavailable {"path":"/x","reason":"TypeError"}');
  });
});
