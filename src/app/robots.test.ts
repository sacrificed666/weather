import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "./robots";

describe("robots.txt", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows pages, hides the API and points to the sitemap", () => {
    vi.stubEnv("SITE_URL", "https://weather.example");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: "https://weather.example/sitemap.xml",
      host: "https://weather.example",
    });
  });

  it("keeps preview deployments out of search engines", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });
});
