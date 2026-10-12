import { describe, expect, it } from "vitest";

import type { Place } from "./place";
import {
  canSavePlace,
  clearRecentPlaces,
  isSaved,
  recentPlaces,
  rememberPlace,
  removeSavedPlace,
  SAVED_PLACES_LIMIT,
  savedPlaces,
  toggleSavedPlace,
} from "./storedPlaces";

// A place with a name and a latitude
const place = (name: string, latitude: number): Place => ({
  name,
  region: null,
  country: "UA",
  latitude,
  longitude: 30,
});

describe("stored places", () => {
  it("saves, unsaves and removes places", () => {
    const kyiv = place("Kyiv", 50.45);
    toggleSavedPlace(kyiv);
    expect(isSaved(savedPlaces.getSnapshot(), kyiv)).toBe(true);
    toggleSavedPlace({ ...kyiv, name: "Київ" });
    expect(savedPlaces.getSnapshot()).toEqual([]);
    toggleSavedPlace(kyiv);
    removeSavedPlace(kyiv);
    expect(savedPlaces.getSnapshot()).toEqual([]);
  });

  it("does not save the same city twice from a search and from the location button", () => {
    const kyiv: Place = { ...place("Kyiv", 50.45), names: { uk: "Київ" }, longitude: 30.52 };
    toggleSavedPlace(kyiv);
    const located: Place = { ...kyiv, name: "Київ", latitude: 50.41, longitude: 30.6 };
    expect(isSaved(savedPlaces.getSnapshot(), located)).toBe(true);
    toggleSavedPlace(located);
    expect(savedPlaces.getSnapshot()).toEqual([]);
  });

  it("drops duplicates that older versions stored", () => {
    localStorage.setItem(
      "weather/saved-places",
      JSON.stringify([place("Kyiv", 50.45), place("Kyiv", 50.47), place("Lviv", 49.84)]),
    );
    expect(savedPlaces.getSnapshot().map((entry) => entry.name)).toEqual(["Kyiv", "Lviv"]);
  });

  it("refuses a new place once the list is full but still lets saved ones go", () => {
    for (let index = 0; index < SAVED_PLACES_LIMIT; index += 1) toggleSavedPlace(place(`City ${index}`, index));
    const extra = place("Extra", 80);
    expect(canSavePlace(savedPlaces.getSnapshot(), extra)).toBe(false);
    toggleSavedPlace(extra);
    expect(savedPlaces.getSnapshot()).toHaveLength(SAVED_PLACES_LIMIT);
    expect(isSaved(savedPlaces.getSnapshot(), extra)).toBe(false);

    const first = place("City 0", 0);
    expect(canSavePlace(savedPlaces.getSnapshot(), first)).toBe(true);
    toggleSavedPlace(first);
    expect(canSavePlace(savedPlaces.getSnapshot(), extra)).toBe(true);
  });

  it("keeps the five most recent places, newest first and without duplicates", () => {
    for (let index = 0; index < 7; index += 1) rememberPlace(place(`City ${index}`, index));
    rememberPlace(place("City 4", 4));
    expect(recentPlaces.getSnapshot().map((entry) => entry.name)).toEqual([
      "City 4",
      "City 6",
      "City 5",
      "City 3",
      "City 2",
    ]);
    clearRecentPlaces();
    expect(recentPlaces.getSnapshot()).toEqual([]);
  });
});
