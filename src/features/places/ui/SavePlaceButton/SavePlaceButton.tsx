"use client";

import { useI18n } from "@/shared/i18n/useI18n";
import IconButton from "@/shared/ui/IconButton/IconButton";

import type { Place } from "../../model/place";
import { canSavePlace, isSaved, savedPlaces, toggleSavedPlace, useStoredPlaces } from "../../model/storedPlaces";

import styles from "./SavePlaceButton.module.scss";

// Saves the shown place or removes it from the saved ones
const SavePlaceButton = ({ place }: { place: Place }) => {
  const { t } = useI18n();
  const places = useStoredPlaces(savedPlaces);
  const saved = isSaved(places, place);
  const full = !canSavePlace(places, place);
  return (
    <IconButton
      className={styles.button}
      icon="star"
      label={t(full ? "places.full" : "places.save", { name: place.name })}
      aria-pressed={saved}
      aria-disabled={full || undefined}
      onClick={() => toggleSavedPlace(place)}
    />
  );
};

export default SavePlaceButton;
