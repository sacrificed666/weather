import { describe, expect, it } from "vitest";

import { airResponse, dailyResponse, forecastResponse, NOW, OFFSET, weatherResponse } from "@/test/fixtures";

import {
  aggregateDaily,
  includeCurrent,
  todayForecast,
  parseAirQuality,
  parseCurrent,
  parseDaily,
  parseSlots,
  upcomingHours,
} from "./normalize";

describe("parseCurrent", () => {
  it("normalizes the current weather", () => {
    const parsed = parseCurrent(weatherResponse);
    expect(parsed?.timezoneOffset).toBe(OFFSET);
    expect(parsed?.place).toEqual({ name: "Lviv", region: null, country: "UA", latitude: 49.84, longitude: 24.03 });
    expect(parsed?.current).toMatchObject({
      time: NOW,
      condition: { code: 500, description: "light rain", daytime: true },
      temperature: 13.2,
      feelsLike: 11.1,
      humidity: 78,
      pressure: 1009,
      visibility: 10_000,
      cloudiness: 75,
      precipitation: 0.42,
      wind: { speed: 4.6, gust: 9.1, direction: 235 },
    });
  });

  it("derives day and night from the sun when the icon is missing", () => {
    const night = { ...weatherResponse, weather: [{ id: 800 }], dt: weatherResponse.sys.sunset + 60 };
    expect(parseCurrent(night)?.current.condition).toEqual({ code: 800, description: "", daytime: false });
  });

  it("fills optional fields with safe defaults", () => {
    const minimal = {
      dt: NOW,
      weather: [{ id: 800, icon: "01d" }],
      main: { temp: 20, humidity: 140, pressure: 1000 },
      sys: { sunrise: 0 },
    };
    expect(parseCurrent(minimal)).toMatchObject({
      timezoneOffset: 0,
      place: null,
      current: {
        feelsLike: 20,
        humidity: 100,
        visibility: null,
        cloudiness: 0,
        precipitation: 0,
        wind: { speed: 0, gust: null, direction: null },
        sunrise: null,
        sunset: null,
      },
    });
  });

  it.each([null, {}, { ...weatherResponse, main: {} }, { ...weatherResponse, weather: [] }])("rejects %j", (data) => {
    expect(parseCurrent(data)).toBeNull();
  });
});

describe("parseSlots", () => {
  it("normalizes three-hour slots and skips broken ones", () => {
    const slots = parseSlots({ list: [...forecastResponse.list.slice(0, 2).toReversed(), { dt: 1 }] });
    expect(slots).toHaveLength(2);
    expect(slots[0]).toMatchObject({ time: 1_759_503_600, temperature: 10, low: 9, high: 11, precipitationChance: 0 });
    expect(slots[1]?.precipitationChance).toBe(0.25);
  });

  it("reads night slots", () => {
    const night = forecastResponse.list[4];
    expect(parseSlots({ list: [{ ...night, weather: [{ id: 800 }] }] })[0]?.condition.daytime).toBe(false);
  });
});

describe("parseDaily", () => {
  it("normalizes the daily forecast", () => {
    const days = parseDaily(dailyResponse);
    expect(days).toHaveLength(7);
    expect(days[2]).toMatchObject({ low: 8, high: 20, precipitationChance: 0.8, condition: { code: 501 } });
    expect(parseDaily({ list: [{ dt: 1, temp: {} }] })).toEqual([]);
  });
});

describe("parseAirQuality", () => {
  it("reads the index and the main pollutants", () => {
    expect(parseAirQuality(airResponse)).toEqual({
      index: 2,
      fineParticles: 8.4,
      coarseParticles: 14.2,
      ozone: 61.7,
      nitrogenDioxide: 12.9,
    });
  });

  it("rejects indices outside the scale", () => {
    expect(parseAirQuality({ list: [{ main: { aqi: 6 } }] })).toBeNull();
    expect(parseAirQuality({})).toBeNull();
  });
});

describe("aggregateDaily", () => {
  const slots = parseSlots(forecastResponse);

  it("groups slots into local days", () => {
    const days = aggregateDaily(slots, OFFSET);
    expect(days).toHaveLength(6);
    expect(days[0]?.time).toBe(slots[0]?.time);
    expect(days[1]).toMatchObject({ low: 9, high: 18, precipitationChance: 1 });
  });

  it("drops an incomplete last day but always keeps today", () => {
    const days = aggregateDaily(slots.slice(0, 36), OFFSET);
    expect(days).toHaveLength(5);
    expect(aggregateDaily(slots.slice(0, 1), OFFSET)).toHaveLength(1);
  });

  it("picks the most severe daytime condition for the icon", () => {
    const [, day] = aggregateDaily(slots, OFFSET);
    expect(day?.condition).toMatchObject({ code: 600, daytime: true });
  });

  it("uses night slots when a day has nothing else", () => {
    const night = slots.filter((slot) => !slot.condition.daytime).slice(0, 1);
    expect(aggregateDaily(night, 0)[0]?.condition.daytime).toBe(true);
  });
});

describe("includeCurrent", () => {
  const current = parseCurrent(weatherResponse)?.current;
  if (!current) throw new Error("fixture");

  it("drops past days and stretches today's range to the current temperature", () => {
    const days = includeCurrent(
      [
        { time: NOW - 86_400, condition: current.condition, low: 1, high: 2, precipitationChance: 0 },
        { time: NOW, condition: current.condition, low: 14, high: 18, precipitationChance: 0 },
        { time: NOW + 86_400, condition: current.condition, low: 5, high: 6, precipitationChance: 0 },
      ],
      current,
      OFFSET,
    );
    expect(days.map(({ low, high }) => [low, high])).toEqual([
      [13.2, 18],
      [5, 6],
    ]);
  });

  it("leaves forecasts that start tomorrow untouched", () => {
    const tomorrow = [{ time: NOW + 86_400, condition: current.condition, low: 5, high: 6, precipitationChance: 0 }];
    expect(includeCurrent(tomorrow, current, OFFSET)).toEqual(tomorrow);
    expect(includeCurrent([], current, OFFSET)).toEqual([]);
  });
});

describe("upcomingHours", () => {
  it("returns the next slots without the daily range", () => {
    const hours = upcomingHours(parseSlots(forecastResponse), 1_759_503_600, 3);
    expect(hours.map((hour) => hour.time)).toEqual([1_759_514_400, 1_759_525_200, 1_759_536_000]);
    expect(hours[0]).not.toHaveProperty("low");
  });
});

describe("todayForecast", () => {
  const current = parseCurrent(weatherResponse)?.current;
  if (!current) throw new Error("fixture");
  // A day of the daily forecast
  const day = (time: number, high: number) => ({
    time,
    condition: current.condition,
    low: 1,
    high,
    precipitationChance: 0,
  });

  it("finds today in the city's own calendar", () => {
    expect(todayForecast([day(NOW, 18), day(NOW + 86_400, 21)], current, OFFSET)?.high).toBe(18);
  });

  it("returns nothing late in the evening, when the forecast already starts tomorrow", () => {
    expect(todayForecast([day(NOW + 86_400, 21)], current, OFFSET)).toBeNull();
  });
});
