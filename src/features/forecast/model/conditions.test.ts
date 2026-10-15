import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { conditionIcon, conditionSeverity, conditionSky } from "./conditions";

const CODES = [
  200, 201, 202, 210, 211, 212, 221, 230, 231, 232, 300, 301, 302, 310, 311, 312, 313, 314, 321, 500, 501, 502, 503,
  504, 511, 520, 521, 522, 531, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622, 701, 711, 721, 731, 741, 751,
  761, 762, 771, 781, 800, 801, 802, 803, 804,
];

// The file of an animated icon
const iconPath = (name: string) => join(process.cwd(), "public/icons/weather", `${name}.svg`);

describe("conditionIcon", () => {
  it("has a bundled Meteocon for every OpenWeatherMap condition by day and by night", () => {
    const missing = CODES.flatMap((code) =>
      [true, false]
        .map((daytime) => ({ code, daytime, icon: conditionIcon({ code, daytime }) }))
        .filter(({ icon }) => icon === "not-available" || !existsSync(iconPath(icon))),
    );
    expect(missing).toEqual([]);
  });

  it("chooses day and night variants", () => {
    expect(conditionIcon({ code: 800, daytime: true })).toBe("clear-day");
    expect(conditionIcon({ code: 800, daytime: false })).toBe("clear-night");
    expect(conditionIcon({ code: 500, daytime: false })).toBe("partly-cloudy-night-rain");
    expect(conditionIcon({ code: 804, daytime: false })).toBe("overcast");
  });

  it("falls back for unknown codes", () => {
    expect(conditionIcon({ code: 999, daytime: true })).toBe("not-available");
    expect(existsSync(iconPath("not-available"))).toBe(true);
  });
});

describe("conditionSky", () => {
  it.each([
    [211, true, "storm"],
    [781, true, "storm"],
    [301, true, "rain"],
    [501, false, "rain"],
    [601, true, "snow"],
    [741, true, "fog"],
    [800, true, "clear-day"],
    [801, false, "clear-night"],
    [803, true, "cloudy-day"],
    [804, false, "cloudy-night"],
  ] as const)("maps %i (day: %s) to %s", (code, daytime, sky) => {
    expect(conditionSky({ code, daytime })).toBe(sky);
  });
});

describe("conditionSeverity", () => {
  it("ranks storms above snow, rain, drizzle, haze, clouds and clear skies", () => {
    const ranked = [211, 601, 501, 301, 741, 803, 800].map(conditionSeverity);
    expect(ranked).toEqual([...ranked].toSorted((a, b) => b - a));
    expect(new Set(ranked).size).toBe(ranked.length);
  });
});
