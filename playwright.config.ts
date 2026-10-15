import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env.CI);
// Safari on Linux, which gets the effects of every system but Apple's
const LINUX_SAFARI =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15";
// Linux WebKit paints without a GPU, so it gets the effects of Linux Safari
const WEBKIT = process.platform === "linux" ? { userAgent: LINUX_SAFARI } : {};
// Screenshots are compared on the Linux runners of CI only, see docs/testing.md
const VISUAL = CI || Boolean(process.env.VISUAL);
const SCREENSHOTS = "e2e/__screenshots__";
const PORT = 3100;
const API_PORT = 4020;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  snapshotPathTemplate: `${SCREENSHOTS}/{testFilePath}/{arg}{ext}`,
  // Until the first screenshots are committed, the visual tests only load the pages
  ignoreSnapshots: !existsSync(SCREENSHOTS),
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  use: {
    baseURL: BASE_URL,
    locale: "en-GB",
    timezoneId: "Europe/Kyiv",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", testIgnore: /lighthouse|visual/, use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", testIgnore: /lighthouse|visual/, use: { ...devices["Pixel 7"] } },
    { name: "webkit", testIgnore: /lighthouse|visual/, use: { ...devices["Desktop Safari"], ...WEBKIT } },
    ...(VISUAL ? [{ name: "visual", testMatch: /visual\.spec\.ts/, use: { ...devices["Desktop Chrome"] } }] : []),
    {
      name: "lighthouse",
      testMatch: /lighthouse\.spec\.ts/,
      dependencies: ["desktop", "mobile", ...(VISUAL ? ["visual"] : [])],
    },
  ],
  webServer: [
    {
      command: "node e2e/openweather-api.ts",
      url: `http://127.0.0.1:${API_PORT}/health`,
      env: { E2E_API_PORT: String(API_PORT), E2E_API_KEY: "e2e-key" },
      reuseExistingServer: !CI,
    },
    {
      command: `npm run build && npm run start -- --port ${PORT}`,
      url: `${BASE_URL}/en`,
      env: {
        OPENWEATHERMAP_API_KEY: "e2e-key",
        OPENWEATHERMAP_API_URL: `http://127.0.0.1:${API_PORT}`,
        SITE_URL: BASE_URL,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      timeout: 300_000,
      reuseExistingServer: !CI,
    },
  ],
});
