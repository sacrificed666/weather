import { beforeEach, describe, expect, it, vi } from "vitest";

const request = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  headers: new Map<string, string>(),
  locale: "en" as string | undefined,
}));

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) => (request.cookies.has(name) ? { value: request.cookies.get(name) } : undefined),
    }),
  headers: () => Promise.resolve(new Headers([...request.headers])),
}));

vi.mock("next/root-params", () => ({ locale: () => Promise.resolve(request.locale) }));

const { currentLocale, getEffects, getLocalization, getPreferences, getRequestLocalization, requestLocale } =
  await import("./server");

describe("server preferences", () => {
  beforeEach(() => {
    request.cookies.clear();
    request.headers.clear();
    request.locale = "en";
  });

  it("uses defaults without cookies", async () => {
    await expect(getPreferences()).resolves.toEqual({ theme: "system", units: "metric", effects: "auto" });
  });

  it("reads saved preferences and ignores invalid ones", async () => {
    request.cookies.set("weather-theme", "dark");
    request.cookies.set("weather-units", "kelvin");
    request.cookies.set("weather-effects", "lite");
    await expect(getPreferences()).resolves.toEqual({ theme: "dark", units: "metric", effects: "auto" });
  });

  it("resolves the effects level from the choice and the device", async () => {
    request.headers.set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    await expect(getEffects()).resolves.toEqual({ level: "reduced", device: "reduced" });
    request.cookies.set("weather-effects", "full");
    await expect(getEffects()).resolves.toEqual({ level: "full", device: "reduced" });
    request.headers.set("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
    request.cookies.set("weather-effects", "auto");
    await expect(getEffects()).resolves.toEqual({ level: "full", device: "full" });
  });

  it("reads the language from the address", async () => {
    request.locale = "pl";
    await expect(currentLocale()).resolves.toBe("pl");
    request.locale = "xx";
    await expect(currentLocale()).resolves.toBe("en");
    request.locale = undefined;
    await expect(currentLocale()).resolves.toBe("en");
  });

  it("finds the language of a request outside the localized routes", async () => {
    request.headers.set("accept-language", "nl-NL,nl;q=0.9");
    await expect(requestLocale()).resolves.toBe("nl");
    request.cookies.set("weather-locale", "fr");
    await expect(requestLocale()).resolves.toBe("fr");
    request.headers.set("x-weather-locale", "it");
    await expect(requestLocale()).resolves.toBe("it");
    request.headers.set("x-weather-locale", "xx");
    request.cookies.set("weather-locale", "xx");
    await expect(requestLocale()).resolves.toBe("nl");
    const { locale, t } = await getRequestLocalization();
    expect(locale).toBe("nl");
    expect(t("app.name")).toBe("Weer");
  });

  it("prepares translations and formatting", async () => {
    request.locale = "uk";
    request.cookies.set("weather-units", "imperial");
    const { locale, t, format, messages } = await getLocalization();
    expect(locale).toBe("uk");
    expect(t("app.name")).toBe("Погода");
    expect(messages["app.name"]).toBe("Погода");
    expect(format.temperature(0)).toBe("32°");
  });
});
