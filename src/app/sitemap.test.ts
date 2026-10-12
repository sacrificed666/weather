import { afterEach, describe, expect, it, vi } from "vitest";

import { POPULAR_PLACES } from "@/features/places/model/popular";
import { LOCALES } from "@/shared/i18n/locales";

import sitemap from "./sitemap";

describe("sitemap.xml", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("lists the forecast in every language with its alternates", () => {
    vi.stubEnv("SITE_URL", "https://weather.example");
    const entries = sitemap();
    expect(entries.slice(0, LOCALES.length).map((entry) => entry.url)).toEqual(
      LOCALES.map((locale) => `https://weather.example/${locale}`),
    );
    expect(entries[0]?.alternates?.languages).toMatchObject({
      uk: "https://weather.example/uk",
      "x-default": "https://weather.example/",
    });
  });

  it("lists every popular city in every language, escaped for XML", () => {
    vi.stubEnv("SITE_URL", "https://weather.example");
    const entries = sitemap();
    expect(entries).toHaveLength(LOCALES.length * (POPULAR_PLACES.length + 1));
    const kyiv = entries.find((entry) => entry.url === "https://weather.example/uk?lat=50.45&amp;lon=30.52");
    expect(kyiv?.alternates?.languages).toMatchObject({
      de: "https://weather.example/de?lat=50.45&amp;lon=30.52",
      "x-default": "https://weather.example/?lat=50.45&amp;lon=30.52",
    });
  });
});
