import { SITE } from "@/shared/lib/site";
import { isUnitSystem, type UnitSystem } from "@/shared/lib/units";

export const THEMES = ["system", "light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

// Whether a value is a valid theme
export const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" && (THEMES as readonly string[]).includes(value);

// The browser colour for a theme and a theme-color media query
export const themeColorFor = (theme: Theme, media: string) => {
  if (theme !== "system") return SITE.themeColor[theme];
  return media.includes("dark") ? SITE.themeColor.dark : SITE.themeColor.light;
};

export const EFFECTS = ["auto", "full", "reduced"] as const;

export type Effects = (typeof EFFECTS)[number];

export type EffectsLevel = Exclude<Effects, "auto">;

// Whether a value is a valid effects choice
export const isEffects = (value: unknown): value is Effects =>
  typeof value === "string" && (EFFECTS as readonly string[]).includes(value);

const RICH_EFFECTS_DEVICES = /Mac|iPhone|iPad|iPod/u;

// Auto becomes full on Apple devices and reduced elsewhere
export const resolveEffects = (effects: Effects, userAgent: string | null): EffectsLevel => {
  if (effects !== "auto") return effects;
  return RICH_EFFECTS_DEVICES.test(userAgent ?? "") ? "full" : "reduced";
};

export interface EffectsState {
  level: EffectsLevel;
  device: EffectsLevel;
}

export interface Preferences {
  theme: Theme;
  units: UnitSystem;
  effects: Effects;
}

export type PreferenceName = keyof Preferences;

export const PREFERENCE_COOKIES: Record<PreferenceName, string> = {
  theme: "weather-theme",
  units: "weather-units",
  effects: "weather-effects",
};

export const DEFAULT_PREFERENCES: Preferences = { theme: "system", units: "metric", effects: "auto" };

// Whether a value is valid for the named setting
export const isPreferenceValue = <Name extends PreferenceName>(
  name: Name,
  value: unknown,
): value is Preferences[Name] => {
  if (name === "theme") return isTheme(value);
  if (name === "units") return isUnitSystem(value);
  return isEffects(value);
};
