import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const searchPlaces = vi.hoisted(() => vi.fn<(query: string, locale: string) => Promise<unknown>>());

vi.mock("@/features/places/model/geocoding", () => ({ searchPlaces }));

const { GET } = await import("./route");

// A search request with headers and a language
const request = (query: string, headers: Record<string, string> = {}, lang = "uk") =>
  new NextRequest(`http://localhost/api/places?q=${encodeURIComponent(query)}&lang=${lang}`, { headers });

describe("GET /api/places", () => {
  beforeEach(() => {
    searchPlaces.mockReset();
  });

  it("returns places in the visitor's language", async () => {
    const places = [{ name: "Львів", region: null, country: "UA", latitude: 49.84, longitude: 24.03 }];
    searchPlaces.mockResolvedValue({ ok: true, places });
    const response = await GET(request("Lv", { "x-forwarded-for": "10.0.0.1" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ places });
    expect(searchPlaces).toHaveBeenCalledWith("Lv", "uk");
  });

  it("falls back to English for an unknown language", async () => {
    searchPlaces.mockResolvedValue({ ok: true, places: [] });
    await GET(request("Lviv", { "x-forwarded-for": "10.0.0.3" }, "xx"));
    expect(searchPlaces).toHaveBeenCalledWith("Lviv", "en");
  });

  it("answers short queries without calling the service", async () => {
    const response = await GET(request(" L "));
    await expect(response.json()).resolves.toEqual({ places: [] });
    expect(searchPlaces).not.toHaveBeenCalled();
  });

  it("rejects long queries and requests from other sites", async () => {
    searchPlaces.mockResolvedValue({ ok: true, places: [] });
    expect((await GET(request("x".repeat(81)))).status).toBe(400);
    expect((await GET(request("Lviv", { "sec-fetch-site": "cross-site" }))).status).toBe(403);
    expect((await GET(request("Lviv", { "sec-fetch-site": "same-origin", "x-real-ip": "10.0.0.2" }))).status).not.toBe(
      403,
    );
  });

  it.each([
    ["rate-limited", 429],
    ["not-found", 404],
    ["missing-key", 503],
  ])("maps a %s failure to %i", async (failure, status) => {
    searchPlaces.mockResolvedValue({ ok: false, failure });
    const response = await GET(request("Lviv", { "x-real-ip": `10.1.${status}.1` }));
    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ error: failure });
  });

  it("limits each visitor to 30 searches a minute", async () => {
    searchPlaces.mockResolvedValue({ ok: true, places: [] });
    const responses = await Promise.all(
      Array.from({ length: 31 }, () => GET(request("Lviv", { "x-forwarded-for": "10.9.9.9, 10.0.0.1" }))),
    );
    const statuses = responses.map((response) => response.status);
    expect(statuses.slice(0, 30).every((status) => status === 200)).toBe(true);
    expect(statuses[30]).toBe(429);
  });
});
