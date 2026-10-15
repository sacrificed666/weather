import * as flags from "country-flag-icons/string/3x2";
import { describe, expect, it } from "vitest";

import { LOCALES } from "@/shared/i18n/locales";

import { placeKey } from "./place";
import { POPULAR_PLACES } from "./popular";

describe("POPULAR_PLACES", () => {
  it("names every city in every language", () => {
    for (const place of POPULAR_PLACES) {
      for (const locale of LOCALES) expect(place.names[locale].trim()).not.toBe("");
    }
  });

  it("points to different places that have a flag", () => {
    const keys = POPULAR_PLACES.map((place) => placeKey(place));
    expect(new Set(keys).size).toBe(keys.length);
    for (const place of POPULAR_PLACES) expect(Object.keys(flags)).toContain(place.country);
  });
});
