"use client";

import Link from "next/link";

import { useI18n } from "@/shared/i18n/useI18n";
import Flag from "@/shared/ui/Flag/Flag";
import Icon from "@/shared/ui/Icon/Icon";

import { nearestPlace, placeHref, placeKey, placeName, type Place } from "../../model/place";
import { removeSavedPlace, savedPlaces, useStoredPlaces } from "../../model/storedPlaces";

import styles from "./SavedPlaces.module.scss";

interface SavedPlacesProps {
  position: Pick<Place, "latitude" | "longitude"> | null;
}

// Chips for the saved places, named in the language of the page
const SavedPlaces = ({ position }: SavedPlacesProps) => {
  const { locale, t } = useI18n();
  const places = useStoredPlaces(savedPlaces);
  if (places.length === 0) return null;
  const active = position ? nearestPlace(places, position) : null;

  return (
    <nav className={styles.places} aria-label={t("places.title")}>
      <ul className={styles.list}>
        {places.map((place) => {
          const name = placeName(place, locale);
          return (
            <li key={placeKey(place)} className={styles.chip}>
              <Link
                className={styles.link}
                href={placeHref(locale, place)}
                aria-current={place === active ? "page" : undefined}
              >
                {place.country && <Flag country={place.country} height={12} />}
                {name}
              </Link>
              <button
                className={styles.remove}
                type="button"
                aria-label={t("places.remove", { name })}
                onClick={() => removeSavedPlace(place)}
              >
                <Icon name="close" size={14} />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SavedPlaces;
