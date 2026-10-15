import { expect, test } from "@playwright/test";

// The missing page, as the mock data follows the clock
for (const colorScheme of ["light", "dark"] as const) {
  test(`the missing page in the ${colorScheme} appearance`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/en/nowhere");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveScreenshot(`missing-${colorScheme}.png`);
  });
}

test("the missing page on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/nowhere");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page).toHaveScreenshot("missing-phone.png");
});
