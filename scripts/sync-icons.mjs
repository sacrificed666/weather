import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const sets = [
  { source: "../node_modules/@meteocons/svg/fill/", target: "../public/icons/weather/" },
  { source: "../node_modules/@meteocons/svg-static/fill/", target: "../public/icons/weather-static/" },
].map(({ source, target }) => ({
  source: new URL(source, import.meta.url).pathname,
  target: new URL(target, import.meta.url).pathname,
}));

const icons = [
  "clear-day",
  "clear-night",
  "mostly-clear-day",
  "mostly-clear-night",
  "partly-cloudy-day",
  "partly-cloudy-night",
  "overcast-day",
  "overcast-night",
  "overcast",
  "partly-cloudy-day-drizzle",
  "partly-cloudy-night-drizzle",
  "drizzle",
  "extreme-drizzle",
  "partly-cloudy-day-rain",
  "partly-cloudy-night-rain",
  "rain",
  "extreme-rain",
  "sleet",
  "partly-cloudy-day-snow",
  "partly-cloudy-night-snow",
  "snow",
  "extreme-snow",
  "thunderstorms-day",
  "thunderstorms-night",
  "thunderstorms",
  "thunderstorms-extreme",
  "thunderstorms-day-rain",
  "thunderstorms-night-rain",
  "thunderstorms-rain",
  "thunderstorms-extreme-rain",
  "mist",
  "smoke",
  "smoke-particles",
  "haze-day",
  "haze-night",
  "dust-day",
  "dust-night",
  "fog-day",
  "fog-night",
  "wind",
  "tornado",
  "not-available",
  "sunrise",
  "sunset",
];

for (const { source, target } of sets) {
  mkdirSync(target, { recursive: true });
  for (const file of readdirSync(target)) rmSync(join(target, file));
  for (const icon of icons) copyFileSync(join(source, `${icon}.svg`), join(target, `${icon}.svg`));
}

process.stdout.write(`Copied ${icons.length} animated and ${icons.length} static Meteocons to public/icons\n`);
