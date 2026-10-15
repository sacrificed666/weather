import { describe, expect, it } from "vitest";

import { isEffects, isPreferenceValue, isTheme, resolveEffects, themeColorFor } from "./preferences";

const MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";
const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1";
const WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";
const ANDROID =
  "Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36";

describe("preferences", () => {
  it("recognises themes and effects levels", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("sepia")).toBe(false);
    expect(isEffects("reduced")).toBe(true);
    expect(isEffects("lite")).toBe(false);
  });

  it("validates values per preference", () => {
    expect(isPreferenceValue("theme", "light")).toBe(true);
    expect(isPreferenceValue("theme", "metric")).toBe(false);
    expect(isPreferenceValue("units", "imperial")).toBe(true);
    expect(isPreferenceValue("units", "dark")).toBe(false);
    expect(isPreferenceValue("effects", "auto")).toBe(true);
    expect(isPreferenceValue("effects", "metric")).toBe(false);
  });

  it("keeps the full effects for Apple devices and reduces them elsewhere", () => {
    expect(resolveEffects("auto", MAC)).toBe("full");
    expect(resolveEffects("auto", IPHONE)).toBe("full");
    expect(resolveEffects("auto", WINDOWS)).toBe("reduced");
    expect(resolveEffects("auto", ANDROID)).toBe("reduced");
    expect(resolveEffects("auto", null)).toBe("reduced");
  });

  it("colours the browser bar with the picked theme or the system one", () => {
    expect(themeColorFor("dark", "(prefers-color-scheme: light)")).toBe("#0a1020");
    expect(themeColorFor("light", "(prefers-color-scheme: dark)")).toBe("#dbe5f1");
    expect(themeColorFor("system", "(prefers-color-scheme: light)")).toBe("#dbe5f1");
    expect(themeColorFor("system", "(prefers-color-scheme: dark)")).toBe("#0a1020");
  });

  it("follows an explicit choice on every device", () => {
    expect(resolveEffects("full", WINDOWS)).toBe("full");
    expect(resolveEffects("reduced", MAC)).toBe("reduced");
  });
});
