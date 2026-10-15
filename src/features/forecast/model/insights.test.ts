import { describe, expect, it } from "vitest";

import {
  cloudLevel,
  compassPoint,
  daylightProgress,
  dewPointLevel,
  humidityLevel,
  pressureLevel,
  progress,
  TEMPERATURE_SCALE,
  TEMPERATURE_STOPS,
  visibilityLevel,
} from "./insights";

describe("insights", () => {
  it.each([
    [0, "n"],
    [22, "n"],
    [23, "ne"],
    [180, "s"],
    [235, "sw"],
    [350, "n"],
    [-90, "w"],
    [720, "n"],
  ] as const)("names %i° as %s", (degrees, point) => {
    expect(compassPoint(degrees)).toBe(point);
  });

  it("classifies humidity, dew point, pressure, visibility and cloud cover", () => {
    expect([20, 50, 78].map(humidityLevel)).toEqual(["low", "normal", "high"]);
    expect([-5, 9, 15, 21].map(dewPointLevel)).toEqual(["comfortable", "comfortable", "sticky", "muggy"]);
    expect([990, 1013, 1030].map(pressureLevel)).toEqual(["low", "normal", "high"]);
    expect([10_000, 5000, 800].map(visibilityLevel)).toEqual(["clear", "hazy", "poor"]);
    expect([5, 40, 75, 100].map(cloudLevel)).toEqual(["clear", "partly", "mostly", "overcast"]);
  });

  it("measures progress within a range", () => {
    expect(progress(5, 0, 10)).toBe(0.5);
    expect(progress(-5, 0, 10)).toBe(0);
    expect(progress(15, 0, 10)).toBe(1);
    expect(progress(3, 3, 3)).toBe(0.5);
  });

  it("tracks the sun only between sunrise and sunset", () => {
    expect(daylightProgress(150, 100, 200)).toBe(0.5);
    expect(daylightProgress(50, 100, 200)).toBeNull();
    expect(daylightProgress(250, 100, 200)).toBeNull();
  });

  it("spans the temperature colours over the scale", () => {
    expect(TEMPERATURE_STOPS[0].celsius).toBe(TEMPERATURE_SCALE.min);
    expect(TEMPERATURE_STOPS.at(-1)?.celsius).toBe(TEMPERATURE_SCALE.max);
  });
});
