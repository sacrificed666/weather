// Takes the pictures of the README and the docs from a running app
import { mkdir, writeFile } from "node:fs/promises";
import process from "node:process";

import { chromium } from "@playwright/test";

// Where the app runs, where the pictures go and how long the page settles
const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = new URL("../docs/images/", import.meta.url);
const SETTLE = 1500;
// The browser clock, so the city clocks match a server with a moved clock
const NOW = process.env.SCREENSHOT_TIME ? new Date(process.env.SCREENSHOT_TIME) : null;
const DESKTOP = { viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
// Saved places with the local names the search would have stored
const SAVED = [
  {
    name: "Lviv",
    names: { en: "Lviv", uk: "Львів", cs: "Lvov", de: "Lemberg", pl: "Lwów", pt: "Lviv" },
    region: "Lviv Oblast",
    country: "UA",
    latitude: 49.8419,
    longitude: 24.0315,
  },
  {
    name: "Kyiv",
    names: { en: "Kyiv", uk: "Київ", cs: "Kyjev", de: "Kiew", pl: "Kijów", pt: "Kiev" },
    region: "Kyiv City",
    country: "UA",
    latitude: 50.4501,
    longitude: 30.5234,
  },
  {
    name: "Tokyo",
    names: { en: "Tokyo", uk: "Токіо", cs: "Tokio", de: "Tokio", es: "Tokio", nl: "Tokio", pl: "Tokio", pt: "Tóquio" },
    region: "Tokyo",
    country: "JP",
    latitude: 35.6828,
    longitude: 139.759,
  },
  {
    name: "London",
    names: { en: "London", uk: "Лондон", cs: "Londýn", es: "Londres", fr: "Londres", it: "Londra", pl: "Londyn" },
    region: "England",
    country: "GB",
    latitude: 51.5073,
    longitude: -0.1276,
  },
];

// Saves a picture next to the others
const save = (name, buffer) => writeFile(new URL(name, OUT), buffer);

// A page in a theme with the saved places, settled and ready for a picture
const open = async (browser, device, theme, path) => {
  const context = await browser.newContext({ ...device, locale: "en-GB", timezoneId: "Europe/Kyiv" });
  if (NOW) await context.clock.setFixedTime(NOW);
  await context.addCookies(
    [
      ["weather-theme", theme],
      ["weather-effects", "full"],
      ["weather-units", "metric"],
    ].map(([name, value]) => ({ name, value, url: BASE })),
  );
  await context.addInitScript((places) => {
    localStorage.setItem("weather/saved-places", JSON.stringify(places));
  }, SAVED);
  const page = await context.newPage();
  await page.goto(new URL(path, BASE).href);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(SETTLE);
  return page;
};

// Still icons, so every picture shows the drops and flakes in the same place
const stillIcons = (page) =>
  page.evaluate(async () => {
    const images = [...document.querySelectorAll('img[src*="/icons/weather/"]')];
    for (const image of images) image.src = image.src.replace("/icons/weather/", "/icons/weather-static/");
    const loaded = images.map((image) => image.decode().catch(() => null));
    await Promise.race([Promise.all(loaded), new Promise((resolve) => setTimeout(resolve, 3000))]);
  });

// Takes a picture of the window and closes it
const shoot = async (page, name, options = {}) => {
  await stillIcons(page);
  await save(name, await page.screenshot({ type: "jpeg", quality: 85, ...options }));
  await page.context().close();
};

const SHOTS = [
  // Lviv on a wide screen in both themes
  async (browser) => shoot(await open(browser, DESKTOP, "light", "/en"), "desktop-light.jpg"),
  async (browser) => shoot(await open(browser, DESKTOP, "dark", "/en"), "desktop-dark.jpg"),
  // The lower half of the dashboard down to the footer
  async (browser) => {
    const page = await open(browser, { ...DESKTOP, viewport: { width: 1440, height: 900 } }, "dark", "/en");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(SETTLE);
    await shoot(page, "desktop-details.jpg");
  },
  // Phones: Lviv in the light and snow in Reykjavik in Ukrainian
  async (browser) => shoot(await open(browser, PHONE, "light", "/en"), "mobile-light.jpg"),
  async (browser) => shoot(await open(browser, PHONE, "dark", "/uk?city=Reykjavik"), "mobile-dark-uk.jpg"),
  // Suggestions for Ky under the search field
  async (browser) => {
    const page = await open(browser, { ...DESKTOP, viewport: { width: 1200, height: 520 } }, "light", "/en");
    await page.getByRole("combobox").fill("Ky");
    await page.getByRole("option", { name: /Kyiv/u }).waitFor();
    await page.waitForTimeout(SETTLE);
    await shoot(page, "search.jpg");
  },
  // The settings over a thunderstorm in Bangkok
  async (browser) => {
    const page = await open(
      browser,
      { ...DESKTOP, viewport: { width: 1200, height: 860 } },
      "dark",
      "/en?city=Bangkok",
    );
    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("heading", { name: "Settings" }).waitFor();
    await page.waitForTimeout(SETTLE);
    await shoot(page, "settings.jpg");
  },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
try {
  await SHOTS.reduce((previous, shot) => previous.then(() => shot(browser)), Promise.resolve());
  process.stdout.write(`Saved ${SHOTS.length} pictures in docs/images.\n`);
} finally {
  await browser.close();
}
