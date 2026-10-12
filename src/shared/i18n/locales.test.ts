import { describe, expect, it } from "vitest";

import { isLocale, LOCALE_INFO, LOCALES, localeFromPath, negotiateLocale } from "./locales";

describe("locales", () => {
  it("recognises supported locales", () => {
    expect(isLocale("uk")).toBe(true);
    expect(isLocale("ru")).toBe(false);
    expect(isLocale(42)).toBe(false);
  });

  it.each([
    ["/uk/places", "uk"],
    ["/de", "de"],
    ["/ru/places", "en"],
    ["/", "en"],
    ["", "en"],
  ] as const)("reads the language of %j", (pathname, locale) => {
    expect(localeFromPath(pathname)).toBe(locale);
  });

  it("describes every locale", () => {
    for (const locale of LOCALES) {
      expect(LOCALE_INFO[locale].intl.startsWith(locale)).toBe(true);
      expect(LOCALE_INFO[locale].flag).toMatch(/^[A-Z]{2}$/u);
      expect(LOCALE_INFO[locale].openWeather).toMatch(/^[a-z]{2}$/u);
    }
  });

  it.each([
    [null, "en"],
    ["", "en"],
    ["uk-UA,uk;q=0.9,en;q=0.8", "uk"],
    ["ru-RU,ru;q=0.9,de;q=0.7,en;q=0.5", "de"],
    ["en;q=0.2, pl;q=0.9", "pl"],
    ["fr-CA;q=0, it", "it"],
    ["pt-BR,pt;q=0.9,en;q=0.8", "pt"],
    ["cs-CZ,cs;q=0.9", "cs"],
    ["sk-SK,sk;q=0.9,cs;q=0.8,en;q=0.7", "cs"],
    ["ja, zh", "en"],
    ["*", "en"],
  ])("matches %j to %s", (header, locale) => {
    expect(negotiateLocale(header)).toBe(locale);
  });
});
