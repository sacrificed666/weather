import { expect, test } from "@playwright/test";

import { LOCALES } from "../src/shared/i18n/locales";

test.skip(({ isMobile }) => isMobile, "The markup for search engines is the same on every screen");

test("links every language version of a forecast", async ({ page, baseURL }) => {
  await page.goto("/uk?city=Kyiv");
  await expect(page).toHaveTitle("Київ: погодинний і щоденний прогноз · Погода");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${baseURL}/uk?lat=50.45&lon=30.52`);
  const languages = await page
    .locator('link[rel="alternate"][hreflang]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("hreflang")));
  expect(new Set(languages)).toEqual(new Set([...LOCALES, "x-default"]));
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "uk_UA");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
});

test("gives the default city the address of the home page", async ({ page, baseURL }) => {
  await page.goto("/en?lat=49.84&lon=24.03");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${baseURL}/en`);
});

test("describes the forecast with structured data", async ({ page, baseURL }) => {
  await page.goto("/de?city=Reykjavik");
  const json = await page.locator('script[type="application/ld+json"]').textContent();
  const schema: unknown = JSON.parse(json ?? "null");
  expect(schema).toHaveProperty(["@graph", "0", "@type"], "WebSite");
  expect(schema).not.toHaveProperty(["@graph", "0", "potentialAction"]);
  expect(schema).toHaveProperty(["@graph", "1", "@type"], "WebPage");
  expect(schema).toHaveProperty(["@graph", "1", "url"], `${baseURL}/de?lat=64.15&lon=-21.94`);
  expect(schema).toHaveProperty(["@graph", "1", "inLanguage"], "de");
  expect(schema).toHaveProperty(["@graph", "1", "about", "name"], "Reykjavík");
});

test("keeps failed searches and missing pages out of the index", async ({ page }) => {
  await page.goto("/en?city=Atlantis");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
  await page.goto("/en/nowhere");
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
});

test("lists every language in the sitemap and allows crawling", async ({ request, baseURL }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  for (const locale of LOCALES) expect(xml).toContain(`<loc>${baseURL}/${locale}</loc>`);
  expect(xml).toContain(`<loc>${baseURL}/pl?lat=52.23&amp;lon=21.01</loc>`);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain(`Sitemap: ${baseURL}/sitemap.xml`);
  expect(robots).toContain("Disallow: /api/");
});

for (const path of ["/en", "/uk?city=Kyiv", "/pl", "/cs"]) {
  test(`serves a share image for ${path}`, async ({ page, request }) => {
    await page.goto(path);
    const image = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    const response = await request.get(image ?? "");
    expect(response.headers()["content-type"]).toBe("image/png");
  });
}

test("describes the app for installation", async ({ request }) => {
  const manifest: unknown = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest).toMatchObject({ name: "Weather", start_url: "/", display: "standalone", lang: "en" });
});

test("names a security contact that has not expired", async ({ request }) => {
  const text = await (await request.get("/.well-known/security.txt")).text();
  expect(text).toMatch(/^Contact: https:\/\/github\.com\/sacrificed666\/[\w-]+\/security\/advisories\/new$/mu);
  const expires = Date.parse(/^Expires: (?<date>.+)$/mu.exec(text)?.groups?.date ?? "");
  expect(expires).toBeGreaterThan(Date.now());
});
