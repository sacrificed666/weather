import { describe, expect, it } from "vitest";

import {
  distanceKm,
  isLatitude,
  isLongitude,
  isSamePlace,
  parseNames,
  parsePlace,
  placeHref,
  placeKey,
  placeName,
  placeSearch,
  roundCoordinate,
} from "./place";

const lviv = { name: "Lviv", region: "Lviv Oblast", country: "UA", latitude: 49.8419, longitude: 24.0315 };

describe("place", () => {
  it("rounds coordinates to about a kilometre", () => {
    expect(roundCoordinate(49.8419)).toBe(49.84);
    expect(roundCoordinate(-0.1276)).toBe(-0.13);
  });

  it("validates coordinate ranges", () => {
    expect(isLatitude(90)).toBe(true);
    expect(isLatitude(90.1)).toBe(false);
    expect(isLongitude(-180)).toBe(true);
    expect(isLongitude(Number.NaN)).toBe(false);
  });

  it("builds stable keys and links", () => {
    expect(placeKey(lviv)).toBe("49.84,24.03");
    expect(placeSearch({ latitude: 50, longitude: -0.1276 })).toBe("?lat=50.00&lon=-0.13");
    expect(placeHref("uk", { latitude: 50, longitude: -0.1276 })).toBe("/uk?lat=50.00&lon=-0.13");
  });

  it("parses stored places field by field", () => {
    expect(parsePlace({ ...lviv, extra: true })).toEqual({ ...lviv, latitude: 49.84, longitude: 24.03 });
    expect(parsePlace({ ...lviv, region: " ", country: "ukraine" })).toEqual({
      ...lviv,
      region: null,
      country: null,
      latitude: 49.84,
      longitude: 24.03,
    });
  });

  it.each([
    null,
    [],
    { ...lviv, name: "" },
    { ...lviv, name: "x".repeat(81) },
    { ...lviv, latitude: 91 },
    { ...lviv, longitude: "24" },
  ])("rejects %j", (value) => {
    expect(parsePlace(value)).toBeNull();
  });
});

describe("place names", () => {
  it("keeps names in the supported languages only", () => {
    expect(parseNames({ uk: " Львів ", de: "Lemberg", ja: "リヴィウ", fr: "", pl: 7 })).toEqual({
      uk: "Львів",
      de: "Lemberg",
    });
    expect(parseNames({ ja: "リヴィウ" })).toBeUndefined();
    expect(parseNames("Lviv")).toBeUndefined();
  });

  it("shows the name in the language of the page", () => {
    const place = { name: "Lviv", names: { uk: "Львів" } };
    expect(placeName(place, "uk")).toBe("Львів");
    expect(placeName(place, "de")).toBe("Lviv");
  });

  it("stores the names with the place", () => {
    expect(parsePlace({ ...lviv, names: { uk: "Львів" } })?.names).toEqual({ uk: "Львів" });
    expect(parsePlace(lviv)).not.toHaveProperty("names");
  });
});

describe("isSamePlace", () => {
  const kyiv = {
    name: "Kyiv",
    names: { uk: "Київ" },
    region: "Kyiv City",
    country: "UA",
    latitude: 50.45,
    longitude: 30.52,
  };

  it("measures distances on the globe", () => {
    expect(distanceKm(kyiv, lviv)).toBeGreaterThan(460);
    expect(distanceKm(kyiv, lviv)).toBeLessThan(475);
  });

  it("treats the same city from a search and from the location button as one place", () => {
    expect(isSamePlace(kyiv, { ...kyiv, latitude: 50.4, longitude: 30.61 })).toBe(true);
    expect(isSamePlace(kyiv, { ...kyiv, name: "Київ", names: undefined, latitude: 50.47, longitude: 30.5 })).toBe(true);
  });

  it("keeps different or distant places apart", () => {
    expect(isSamePlace(kyiv, { ...kyiv, name: "Brovary", names: undefined, latitude: 50.51, longitude: 30.8 })).toBe(
      false,
    );
    expect(isSamePlace(kyiv, { ...kyiv, latitude: 51, longitude: 31.3 })).toBe(false);
    expect(isSamePlace(kyiv, { ...kyiv, country: "PL", latitude: 50.46 })).toBe(false);
  });
});
