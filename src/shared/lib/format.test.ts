import { describe, expect, it } from "vitest";

import { createFormatter } from "./format";

const NOON_KYIV = 1_759_482_000;
const OFFSET = 10_800;

describe("createFormatter", () => {
  const metric = createFormatter("en-GB", "metric");
  const imperial = createFormatter("en-GB", "imperial");

  it("rounds temperatures and converts them to Fahrenheit", () => {
    expect(metric.temperature(13.6)).toBe("14°");
    expect(metric.temperature(-0.4)).toBe("0°");
    expect(metric.temperature(-0.6)).toBe("-1°");
    expect(imperial.temperature(20)).toBe("68°");
  });

  it("formats wind speed in the selected unit system", () => {
    expect(metric.speed(4.6)).toBe("5 m/s");
    expect(imperial.speed(4.47)).toBe("10 mph");
  });

  it("uses one decimal for short distances only", () => {
    expect(metric.distance(3200)).toBe("3.2 km");
    expect(metric.distance(10_000)).toBe("10 km");
    expect(imperial.distance(10_000)).toBe("6.2 mi");
  });

  it("formats pressure in hectopascals or inches of mercury", () => {
    expect(metric.pressure(1009)).toBe("1,009");
    expect(imperial.pressure(1009)).toBe("29.8");
  });

  it("formats precipitation, percentages and numbers", () => {
    expect(metric.precipitation(0.42)).toBe("0.4 mm");
    expect(imperial.precipitation(25.4)).toBe("1 in");
    expect(metric.percent(0.456)).toBe("46%");
    expect(metric.number(1234.4)).toBe("1,234");
  });

  it("formats times and dates in the place's own time zone", () => {
    expect(metric.time(NOON_KYIV, OFFSET)).toBe("12:00");
    expect(metric.time(NOON_KYIV, 0)).toBe("09:00");
    expect(metric.weekday(NOON_KYIV, OFFSET)).toBe("Fri");
    expect(metric.date(NOON_KYIV, OFFSET)).toBe("Friday 3 October");
  });

  it("formats durations in hours and minutes", () => {
    expect(metric.duration(11 * 3600 + 29 * 60)).toBe("11 hrs 29 mins");
  });

  it("names countries in the interface language", () => {
    expect(metric.country("UA")).toBe("Ukraine");
    expect(createFormatter("uk-UA", "metric").country("UA")).toBe("Україна");
  });

  it("capitalises sentences with the locale's rules", () => {
    expect(metric.sentence("light rain")).toBe("Light rain");
    expect(createFormatter("uk-UA", "metric").sentence("легкий дощ")).toBe("Легкий дощ");
    expect(metric.sentence("")).toBe("");
  });

  it("remembers its unit system", () => {
    expect(imperial.units).toBe("imperial");
  });
});
