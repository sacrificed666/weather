import { useSyncExternalStore } from "react";

import { createStoredList, type StoredList } from "@/shared/lib/storedList";

import { isSamePlace, parsePlace, type Place } from "./place";

export const SAVED_PLACES_LIMIT = 12;

export const savedPlaces = createStoredList("weather/saved-places", {
  parse: parsePlace,
  limit: SAVED_PLACES_LIMIT,
  isSame: isSamePlace,
});

export const recentPlaces = createStoredList("weather/recent-places", {
  parse: parsePlace,
  limit: 5,
  isSame: isSamePlace,
});

// The current list, updated in every tab
export const useStoredPlaces = (list: StoredList<Place>) =>
  useSyncExternalStore(list.subscribe, list.getSnapshot, list.getServerSnapshot);

// The list without the given place
const without = (places: readonly Place[], place: Place) =>
  places.filter((candidate) => !isSamePlace(candidate, place));

// Whether a place is among the saved ones
export const isSaved = (places: readonly Place[], place: Place) =>
  places.some((candidate) => isSamePlace(candidate, place));

// Whether a place is saved or there is room for it
export const canSavePlace = (places: readonly Place[], place: Place) =>
  isSaved(places, place) || places.length < SAVED_PLACES_LIMIT;

// Saves a place or removes it again
export const toggleSavedPlace = (place: Place) => {
  const places = savedPlaces.getSnapshot();
  if (isSaved(places, place)) savedPlaces.replace(without(places, place));
  else if (canSavePlace(places, place)) savedPlaces.replace([...places, place]);
};

// Removes a saved place
export const removeSavedPlace = (place: Place) => savedPlaces.replace(without(savedPlaces.getSnapshot(), place));

// Puts a place first among the recent ones
export const rememberPlace = (place: Place) =>
  recentPlaces.replace([place, ...without(recentPlaces.getSnapshot(), place)]);

// Forgets every recent place
export const clearRecentPlaces = () => recentPlaces.replace([]);
