import { expect, test } from "@playwright/test";

import { choosePreference, KYIV, openSettings, watchProblems } from "./helpers";

test("runs without console errors or policy violations", async ({ page }) => {
  const check = await watchProblems(page);
  await page.goto("/en");
  await page.getByRole("combobox", { name: "Search for a city" }).fill("Re");
  await expect(page.getByRole("option", { name: /Reykjavik/u })).toBeVisible();
  await page.getByRole("option", { name: /Reykjavik/u }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reykjavik");
  await openSettings(page);
  await choosePreference(page, "Dark");
  await page.goto(KYIV);
  // Safari reports requests that a navigation cancels as errors
  await page.waitForLoadState("networkidle");
  await page.goto("/uk?city=Atlantis");
  await expect(page.getByRole("heading", { name: "Місто не знайдено" })).toBeVisible();
  await check();
});

test("renders the missing page under the same policy", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await watchProblems(page);
  await page.goto("/de/nirgendwo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Seite nicht gefunden");
  expect(await page.evaluate(() => Reflect.get(window, "policyViolations"))).toEqual([]);
  expect(errors).toEqual([]);
});

test("sends a fresh nonce-based policy and the security headers", async ({ request }) => {
  const first = await request.get("/en");
  const second = await request.get("/en");
  const headers = first.headers();
  const policy = headers["content-security-policy"] ?? "";
  expect(policy).toMatch(/script-src 'self' 'nonce-[\w+/=]+' 'strict-dynamic'/u);
  expect(policy).not.toBe(second.headers()["content-security-policy"]);
  expect(policy).toContain("frame-ancestors 'none'");
  expect(policy).toContain("object-src 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("keeps the search API to the app itself", async ({ request }) => {
  const foreign = await request.get("/api/places?q=Kyiv&lang=en", { headers: { "sec-fetch-site": "cross-site" } });
  expect(foreign.status()).toBe(403);
  const own = await request.get("/api/places?q=Kyiv&lang=uk", { headers: { "sec-fetch-site": "same-origin" } });
  expect(own.headers()["cache-control"]).toBe("no-store");
  expect(await own.json()).toMatchObject({ places: [{ name: "Київ", country: "UA" }] });
  const long = await request.get(`/api/places?q=${"x".repeat(81)}`);
  expect(long.status()).toBe(400);
});

test("serves icons that cannot run scripts", async ({ request }) => {
  const icon = await request.get("/icons/weather/rain.svg");
  expect(icon.headers()["content-security-policy"]).toContain("sandbox");
  const flag = await request.get("/flags/UA");
  expect(flag.headers()["content-type"]).toContain("image/svg+xml");
});
