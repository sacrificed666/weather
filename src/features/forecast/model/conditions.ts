import type { Condition } from "./types";

export type Sky = "clear-day" | "clear-night" | "cloudy-day" | "cloudy-night" | "rain" | "storm" | "snow" | "fog";

// Day or night variant of an icon
const cycle = (daytime: boolean) => (daytime ? "day" : "night");

// Icon for a thunderstorm code
const thunderstormIcon = (code: number, daytime: boolean) => {
  if (code === 200 || code === 230) return `thunderstorms-${cycle(daytime)}-rain`;
  if (code === 201 || code === 231) return "thunderstorms-rain";
  if (code === 202 || code === 232) return "thunderstorms-extreme-rain";
  if (code === 210) return `thunderstorms-${cycle(daytime)}`;
  if (code === 212 || code === 221) return "thunderstorms-extreme";
  return "thunderstorms";
};

// Icon for a drizzle code
const drizzleIcon = (code: number, daytime: boolean) => {
  if (code === 300 || code === 310) return `partly-cloudy-${cycle(daytime)}-drizzle`;
  if (code === 302 || code === 312 || code === 314) return "extreme-drizzle";
  return "drizzle";
};

// Icon for a rain code
const rainIcon = (code: number, daytime: boolean) => {
  if (code === 500 || code === 520) return `partly-cloudy-${cycle(daytime)}-rain`;
  if (code === 511) return "sleet";
  if (code === 502 || code === 503 || code === 504 || code === 522 || code === 531) return "extreme-rain";
  return "rain";
};

// Icon for a snow code
const snowIcon = (code: number, daytime: boolean) => {
  if (code === 600 || code === 620) return `partly-cloudy-${cycle(daytime)}-snow`;
  if (code === 602 || code === 622) return "extreme-snow";
  if (code >= 611 && code <= 616) return "sleet";
  return "snow";
};

const atmosphereIcons: Readonly<Record<number, (daytime: boolean) => string>> = {
  701: () => "mist",
  711: () => "smoke",
  721: (daytime) => `haze-${cycle(daytime)}`,
  731: (daytime) => `dust-${cycle(daytime)}`,
  741: (daytime) => `fog-${cycle(daytime)}`,
  751: (daytime) => `dust-${cycle(daytime)}`,
  761: (daytime) => `dust-${cycle(daytime)}`,
  762: () => "smoke-particles",
  771: () => "wind",
  781: () => "tornado",
};

const cloudIcons: Readonly<Record<number, (daytime: boolean) => string>> = {
  800: (daytime) => `clear-${cycle(daytime)}`,
  801: (daytime) => `mostly-clear-${cycle(daytime)}`,
  802: (daytime) => `partly-cloudy-${cycle(daytime)}`,
  803: (daytime) => `overcast-${cycle(daytime)}`,
  804: () => "overcast",
};

// The weather icon for an OpenWeather condition code
export const conditionIcon = ({ code, daytime }: Pick<Condition, "code" | "daytime">): string => {
  const group = Math.floor(code / 100);
  if (group === 2) return thunderstormIcon(code, daytime);
  if (group === 3) return drizzleIcon(code, daytime);
  if (group === 5) return rainIcon(code, daytime);
  if (group === 6) return snowIcon(code, daytime);
  return (atmosphereIcons[code] ?? cloudIcons[code])?.(daytime) ?? "not-available";
};

// The sky behind the page for a condition
export const conditionSky = ({ code, daytime }: Pick<Condition, "code" | "daytime">): Sky => {
  const group = Math.floor(code / 100);
  if (group === 2 || code === 771 || code === 781) return "storm";
  if (group === 3 || group === 5) return "rain";
  if (group === 6) return "snow";
  if (group === 7) return "fog";
  if (code === 800 || code === 801) return daytime ? "clear-day" : "clear-night";
  return daytime ? "cloudy-day" : "cloudy-night";
};

// How bad a condition is, from clear sky to thunderstorm
export const conditionSeverity = (code: number) => {
  const group = Math.floor(code / 100);
  if (group === 2) return 6;
  if (group === 6) return 5;
  if (group === 5) return 4;
  if (group === 3) return 3;
  if (group === 7) return 2;
  return code === 800 ? 0 : 1;
};
