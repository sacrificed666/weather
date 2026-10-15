import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { clippedText, KYIV, MAC_USER_AGENT, openSettings } from "./helpers";

const PAGES = ["/en", "/uk?city=Kyiv", "/de?city=Reykjavik", "/pl?city=Bangkok", "/en?city=Atlantis", "/fr/nulle-part"];

test.use({ reducedMotion: "reduce" });

// Axe violations of the page, as rule ids and targets
const violations = async (page: Page) => {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .options({ rules: { "label-content-name-mismatch": { enabled: true }, "target-size": { enabled: true } } })
    .analyze();
  return results.violations.map((violation) => ({
    rule: violation.id,
    targets: violation.nodes.map((node) => node.target.join(" ")),
  }));
};

for (const path of PAGES) {
  test(`has no detectable accessibility issues on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });
}

test("keeps the dark theme accessible", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "weather-theme", value: "dark", url: baseURL ?? "" }]);
  await page.goto(KYIV);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await violations(page)).toEqual([]);
});

test.describe("with the full effects of Apple devices", () => {
  test.use({ userAgent: MAC_USER_AGENT });

  for (const theme of ["light", "dark"]) {
    test(`keeps the glass readable in the ${theme} theme`, async ({ page, context, baseURL }) => {
      await context.addCookies([{ name: "weather-theme", value: theme, url: baseURL ?? "" }]);
      await page.goto("/en?city=Reykjavik");
      await expect(page.locator("html")).toHaveAttribute("data-effects", "full");
      expect(await violations(page)).toEqual([]);
    });
  }
});

test("keeps the settings and the suggestions accessible", async ({ page }) => {
  await page.goto("/en");
  await openSettings(page);
  expect(await violations(page)).toEqual([]);
  await page.keyboard.press("Escape");
  await page.getByRole("combobox", { name: "Search for a city" }).fill("Ky");
  await expect(page.getByRole("option", { name: /Kyiv/u })).toBeVisible();
  expect(await violations(page)).toEqual([]);
});

test("can be used with the keyboard alone", async ({ page, browserName }) => {
  await page.goto("/en");
  // Safari moves focus to links with Option+Tab
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  const skip = page.getByRole("link", { name: "Skip to the forecast" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

for (const path of ["/en", "/uk?city=Kyiv", "/de?city=Reykjavik", "/fr?city=Bangkok", "/nl/nergens"]) {
  test(`reflows at 320 pixels without scrolling sideways on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

for (const [path, settings] of [
  ["/uk?city=Kyiv", "Налаштування"],
  ["/fr?city=Reykjavik", "Réglages"],
  ["/pt?city=Bangkok", "Definições"],
] as const) {
  test(`shows every word whole at 360 pixels on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await clippedText(page)).toEqual([]);
    await openSettings(page, settings);
    expect(await clippedText(page)).toEqual([]);
  });
}

test.describe("in forced colours mode", () => {
  test.use({ forcedColors: "active" });

  test("keeps the chosen option and the cards visible", async ({ page }) => {
    await page.goto("/en");
    await openSettings(page);
    const appearance = page.getByRole("group", { name: "Appearance" });
    const chosen = appearance.locator("label").filter({ has: page.getByRole("radio", { name: "Auto" }) });
    const other = appearance.locator("label").filter({ has: page.getByRole("radio", { name: "Dark" }) });
    // Background, outline and border of an element
    const style = (element: typeof chosen) =>
      element.evaluate((node) => {
        const computed = getComputedStyle(node);
        return `${computed.backgroundColor} ${computed.outlineStyle} ${computed.borderStyle}`;
      });
    expect(await style(chosen)).not.toBe(await style(other));
    const card = page.locator("section").filter({ has: page.getByRole("heading", { name: "Air quality" }) });
    expect(await card.evaluate((node) => getComputedStyle(node).borderTopStyle)).toBe("solid");
  });
});
