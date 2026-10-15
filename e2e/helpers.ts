import { expect, type Page } from "@playwright/test";

export const KYIV = "/en?lat=50.45&lon=30.52";

// What Safari logs for a request that a navigation cancelled
const SAFARI_LOAD_FAILED = "TypeError: Load failed";

// Safari blames a cancelled request to the app itself on access control
const isCancelledFetch = (problem: string, host: string) =>
  problem.endsWith(" due to access control checks.") && problem.includes(`/${host}/`);

// A Mac browser, which gets the full effects by default
export const MAC_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

// A Windows browser, which gets reduced effects by default
export const WINDOWS_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

// How many infinite animations are running on the page
export const endlessAnimations = (page: Page) =>
  page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (animation) => animation.playState === "running" && animation.effect?.getTiming().iterations === Infinity,
        ).length,
  );

// Collects console errors and CSP violations, then checks there are none
export const watchProblems = async (page: Page) => {
  const problems: string[] = [];
  let cancelled = 0;
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  // Safari logs a prefetch that a navigation cancels as a failed load
  page.on("requestfailed", (request) => {
    if (/cancel/iu.test(request.failure()?.errorText ?? "")) cancelled += 1;
  });
  await page.addInitScript(() => {
    const violations: string[] = [];
    Reflect.set(window, "policyViolations", violations);
    document.addEventListener("securitypolicyviolation", (event) => {
      violations.push(`${event.violatedDirective} ${event.blockedURI}`);
    });
  });
  return async () => {
    const { host } = new URL(page.url());
    const real = problems.filter((problem) => problem !== SAFARI_LOAD_FAILED && !isCancelledFetch(problem, host));
    expect(real).toEqual([]);
    expect(problems.filter((problem) => problem === SAFARI_LOAD_FAILED).length).toBeLessThanOrEqual(cancelled);
    expect(await page.evaluate(() => Reflect.get(window, "policyViolations"))).toEqual([]);
  };
};

// Opens the settings dialog
export const openSettings = async (page: Page, name = "Settings") => {
  await page.getByRole("button", { name, exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
};

// Picks a setting and waits until the server has saved it
export const choosePreference = async (page: Page, label: string) => {
  const saved = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.request().headers()["next-action"] !== undefined,
  );
  await page.getByText(label, { exact: true }).click();
  await saved;
};

// Texts cut off by their own box, skipping transparent and hidden ones
export const clippedText = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .filter((element) => {
        if (!element.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
        const box = element.getBoundingClientRect();
        if (box.width < 2 || box.height < 2) return false;
        const style = getComputedStyle(element);
        if (!["hidden", "clip"].includes(style.overflowX) && style.textOverflow !== "ellipsis") return false;
        const text = [...element.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        );
        return text && element.scrollWidth > element.clientWidth;
      })
      .map((element) => element.textContent.trim()),
  );
