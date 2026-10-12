import { describe, expect, it } from "vitest";

import {
  celsiusToFahrenheit,
  dewPoint,
  hectopascalsToInchesOfMercury,
  isUnitSystem,
  metersPerSecondToMilesPerHour,
  metersToMiles,
  millimetersToInches,
} from "./units";

describe("units", () => {
  it("converts metric values to imperial ones", () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(metersPerSecondToMilesPerHour(10)).toBeCloseTo(22.37, 2);
    expect(hectopascalsToInchesOfMercury(1013.25)).toBeCloseTo(29.92, 2);
    expect(metersToMiles(1609.344)).toBe(1);
    expect(millimetersToInches(25.4)).toBe(1);
  });

  it("estimates the dew point with the Magnus formula", () => {
    expect(dewPoint(20, 50)).toBeCloseTo(9.3, 1);
    expect(dewPoint(13, 100)).toBeCloseTo(13, 5);
    expect(Number.isFinite(dewPoint(10, 0))).toBe(true);
  });

  it("recognises unit systems", () => {
    expect(isUnitSystem("metric")).toBe(true);
    expect(isUnitSystem("kelvin")).toBe(false);
    expect(isUnitSystem(null)).toBe(false);
  });
});
