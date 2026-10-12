import { expect, test } from "@playwright/test";

test("tells the visitor when the connection drops and when it is back", async ({ page, context }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Next.js tells only a hydrated page that the connection dropped
  await page.waitForLoadState("networkidle");
  const notice = page.getByRole("status").filter({ hasText: "You are offline" });
  await expect(notice).toHaveCount(0);
  await context.setOffline(true);
  await expect(notice).toBeVisible();
  await context.setOffline(false);
  await expect(notice).toHaveCount(0);
});

test("shows its own page when a reload fails offline and returns once online", async ({ page, context }) => {
  await page.goto("/uk");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // The worker keeps the offline page in the language of the visited page
  await expect.poll(() => page.evaluate(async () => Boolean(await caches.match("/offline/uk")))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  const offline = page.getByRole("heading", { level: 1, name: "Немає зв'язку" });
  await expect(offline).toBeVisible();
  await expect(page.getByRole("link", { name: "Спробувати ще" })).toBeVisible();
  await context.setOffline(false);
  await expect(offline).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
