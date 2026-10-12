import { beforeEach, describe, expect, it, vi } from "vitest";

import { geocodingResponse, jsonResponse } from "@/test/fixtures";

import { findPlace, searchPlaces, toPlace } from "./geocoding";

describe("geocoding", () => {
  beforeEach(() => {
    vi.stubEnv("OPENWEATHERMAP_API_KEY", "secret");
  });

  it("prefers the local name in the interface language", () => {
    const [lviv] = geocodingResponse;
    expect(toPlace(lviv, "uk")?.name).toBe("Львів");
    expect(toPlace(lviv, "de")?.name).toBe("Lemberg");
    expect(toPlace(lviv, "pl")?.name).toBe("Lviv");
    expect(toPlace({ ...lviv, country: "ua" }, "en")?.country).toBe("UA");
    expect(toPlace({}, "en")).toBeNull();
  });

  it("searches places and removes duplicates", async () => {
    const [lviv] = geocodingResponse;
    const fetchMock = vi
      .fn<(input: URL) => Promise<Response>>()
      .mockResolvedValue(jsonResponse([lviv, { ...lviv, lat: 49.8401 }, { name: "" }]));
    vi.stubGlobal("fetch", fetchMock);
    const result = await searchPlaces("Lviv", "en", 3);
    expect(result).toEqual({
      ok: true,
      places: [
        {
          name: "Lviv",
          names: expect.objectContaining({ uk: "Львів" }) as unknown,
          region: "Lviv Oblast",
          country: "UA",
          latitude: 49.84,
          longitude: 24.03,
        },
      ],
    });
    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url?.searchParams.get("limit")).toBe("3");
  });

  it("returns no places for an unexpected response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ message: "?" })));
    await expect(searchPlaces("Lviv", "en")).resolves.toEqual({ ok: true, places: [] });
  });

  it("passes failures through", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 429)));
    await expect(searchPlaces("Lviv", "en")).resolves.toEqual({ ok: false, failure: "rate-limited" });
  });

  it("finds the place at coordinates and keeps the requested position", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(geocodingResponse)));
    await expect(findPlace(49.8, 24, "uk")).resolves.toMatchObject({ name: "Львів", latitude: 49.8, longitude: 24 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([])));
    await expect(findPlace(0, 0, "en")).resolves.toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 500)));
    await expect(findPlace(0, 0, "en")).resolves.toBeNull();
  });
});
