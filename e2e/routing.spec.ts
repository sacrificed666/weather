import { expect, test } from "@playwright/test";

test.describe("with a Ukrainian browser", () => {
  test.use({ locale: "uk-UA" });

  test("opens the forecast in the browser language", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/uk$/u);
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Львів");
  });

  test("prefers the language chosen earlier and keeps the city", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "weather-locale", value: "pl", url: baseURL ?? "" }]);
    await page.goto("/?city=Kyiv");
    await expect(page).toHaveURL(/\/pl\?city=Kyiv$/u);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kijów");
  });
});

test.describe("with a Czech browser", () => {
  test.use({ locale: "cs-CZ" });

  test("opens the forecast in Czech with local names and descriptions", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/cs$/u);
    await expect(page.locator("html")).toHaveAttribute("lang", "cs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lvov");
    await expect(page.getByText("Slabý déšť", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Nastavení" })).toBeVisible();
  });
});

test("lowercases the language of an address", async ({ page }) => {
  await page.goto("/DE?city=Kyiv");
  await expect(page).toHaveURL(/\/de\?city=Kyiv$/u);
});

test("answers unknown pages with a translated 404", async ({ page }) => {
  const response = await page.goto("/de/nirgendwo");
  expect(response?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Seite nicht gefunden");
  await expect(page.getByRole("link", { name: "Zurück zur Vorhersage" })).toHaveAttribute("href", "/de");
});

test("treats broken coordinates as an unknown city", async ({ page }) => {
  await page.goto("/en?lat=95&lon=10");
  await expect(page.getByRole("heading", { name: "City not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to the forecast" })).toHaveAttribute("href", "/en");
});
