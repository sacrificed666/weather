import { expect, test } from "@playwright/test";

import { choosePreference, endlessAnimations, KYIV, MAC_USER_AGENT, openSettings, WINDOWS_USER_AGENT } from "./helpers";

test("shows the weather for the default city", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lviv");
  await expect(page.getByText("Light rain", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hourly forecast" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^\d-day forecast$/u })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Air quality" })).toBeVisible();
});

test("builds the week from the free three-hour forecast", async ({ page }) => {
  await page.goto(KYIV);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kyiv");
  const week = page.locator("section").filter({ has: page.getByRole("heading", { name: /^[5-7]-day forecast$/u }) });
  // Late in the evening the free forecast already starts tomorrow, like the real API
  await expect(week.getByRole("listitem").first()).toContainText(/^(?:Today|Mon|Tue|Wed|Thu|Fri|Sat|Sun)/u);
  expect(await week.getByRole("listitem").count()).toBeGreaterThanOrEqual(5);
});

test("finds a city with the keyboard", async ({ page }) => {
  await page.goto("/en");
  const search = page.getByRole("combobox", { name: "Search for a city" });
  await search.fill("Ky");
  await expect(page.getByRole("option", { name: /Kyiv/u })).toBeVisible();
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/en\?lat=50\.45&lon=30\.52$/u);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kyiv");
});

test("explains when a city does not exist", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("combobox", { name: "Search for a city" }).fill("Atlantis");
  await page.getByRole("combobox", { name: "Search for a city" }).press("Enter");
  await expect(page).toHaveURL(/\/en\?city=Atlantis$/u);
  await expect(page.getByRole("heading", { name: "City not found" })).toBeVisible();
});

test("saves places and switches between them", async ({ page }) => {
  await page.goto(KYIV);
  const star = page.getByRole("button", { name: "Save Kyiv" });
  await star.click();
  await expect(star).toHaveAttribute("aria-pressed", "true");
  const saved = page.getByRole("navigation", { name: "Saved places" });
  await expect(saved.getByRole("link", { name: "Kyiv" })).toHaveAttribute("aria-current", "page");

  await page.goto("/en?city=Reykjavik");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reykjavik");
  await saved.getByRole("link", { name: "Kyiv" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kyiv");
  await saved.getByRole("button", { name: "Remove Kyiv from saved places" }).click();
  await expect(saved).toBeHidden();
});

test("opens the forecast for the current position", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 64.1466, longitude: -21.9426 });
  await page.goto("/en");
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page).toHaveURL(/\/en\?lat=64\.15&lon=-21\.94$/u);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reykjavik");
});

test("changes units and theme without leaving the page", async ({ page }) => {
  await page.goto(KYIV);
  await openSettings(page);
  await choosePreference(page, "°F, mph");
  await expect(page.getByText("Clear sky", { exact: true }).first()).toBeVisible();
  await expect(page.locator("p").filter({ hasText: /^Current weather: 63°$/u })).toBeVisible();
  await choosePreference(page, "Dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("p").filter({ hasText: /^Current weather: 63°$/u })).toBeVisible();
});

test.describe("on a Windows computer", () => {
  test.use({ userAgent: WINDOWS_USER_AGENT });

  test("keeps the sky still where it could stutter and lets the visitor choose", async ({ page, browserName }) => {
    // Without a GPU, WebKit on Linux paints the full effects too slowly to check
    test.skip(browserName === "webkit" && process.platform === "linux", "Chromium covers it on Linux");
    await page.goto("/en?city=Bangkok");
    await expect(page.locator("html")).toHaveAttribute("data-effects", "reduced");
    await expect(page.getByRole("img", { name: "Thunderstorm" }).first()).toHaveAttribute(
      "src",
      /^\/icons\/weather-static\/thunderstorms/u,
    );
    expect(await endlessAnimations(page)).toBe(0);

    await openSettings(page);
    await expect(page.getByRole("group", { name: "Effects" })).toHaveAccessibleDescription("On this device: Reduced");
    await choosePreference(page, "Full");
    await expect(page.locator("html")).toHaveAttribute("data-effects", "full");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-effects", "full");
    await expect(page.getByRole("img", { name: "Thunderstorm" }).first()).toHaveAttribute(
      "src",
      /^\/icons\/weather\/thunderstorms/u,
    );
  });
});

test.describe("on an Apple device", () => {
  test.use({ userAgent: MAC_USER_AGENT });

  test("shows the living sky and animated icons", async ({ page }) => {
    await page.goto("/en?city=Bangkok");
    await expect(page.locator("html")).toHaveAttribute("data-effects", "full");
    expect(await endlessAnimations(page)).toBeGreaterThan(0);
  });
});

test("switches the language and remembers it", async ({ page }) => {
  await page.goto("/en?city=Kyiv");
  await openSettings(page);
  await page.getByRole("link", { name: "Українська" }).click();
  await expect(page).toHaveURL(/\/uk\?city=Kyiv$/u);
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Київ");

  await page.goto("/");
  await expect(page).toHaveURL(/\/uk$/u);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("still searches with the form", async ({ page }) => {
    await page.goto("/de");
    await expect(page).toHaveTitle("Wetter · Vorhersage für jede Stadt der Welt");
    await page.getByRole("combobox").fill("Kyiv");
    await page.getByRole("combobox").press("Enter");
    await expect(page).toHaveURL(/\/de\?city=Kyiv$/u);
    await expect(page).toHaveTitle("Kiew: stündliche und tägliche Vorhersage · Wetter");
  });
});
