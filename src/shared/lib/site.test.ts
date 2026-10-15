import { describe, expect, it } from "vitest";

import { isIndexable, siteUrl } from "./site";

describe("siteUrl", () => {
  it("prefers the explicit address", () => {
    expect(
      siteUrl({ SITE_URL: " https://weather.example/ ", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }).href,
    ).toBe("https://weather.example/");
  });

  it("falls back to the Vercel production domain and then to localhost", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "weather.vercel.app" }).href).toBe("https://weather.vercel.app/");
    expect(siteUrl({ PORT: "4000" }).href).toBe("http://localhost:4000/");
    expect(siteUrl({}).href).toBe("http://localhost:3000/");
  });
});

describe("isIndexable", () => {
  it("lets search engines index production and self-hosted builds only", () => {
    expect(isIndexable({})).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "production" })).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isIndexable({ VERCEL_ENV: "development" })).toBe(false);
  });

  it("follows APP_ENV in Docker", () => {
    expect(isIndexable({ APP_ENV: "production" })).toBe(true);
    expect(isIndexable({ APP_ENV: "staging" })).toBe(false);
    expect(isIndexable({ APP_ENV: "development" })).toBe(false);
  });
});
