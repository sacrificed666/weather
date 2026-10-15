import Link from "next/link";

import type { Locale } from "@/shared/i18n/locales";
import type { Translate } from "@/shared/i18n/translate";
import Flag from "@/shared/ui/Flag/Flag";

import { placeHref, placeKey } from "../../model/place";
import { POPULAR_PLACES } from "../../model/popular";

import styles from "./PopularPlaces.module.scss";

interface PopularPlacesProps {
  locale: Locale;
  t: Translate;
  current: string | null;
}

// Forecast links to a capital per language, named in the page language
const PopularPlaces = ({ locale, t, current }: PopularPlacesProps) => (
  <nav className={styles.popular} aria-labelledby="popular-places-title">
    <h2 className={styles.title} id="popular-places-title">
      {t("places.popular")}
    </h2>
    <ul className={styles.list}>
      {POPULAR_PLACES.map((place) => (
        <li key={placeKey(place)} className={styles.chip}>
          <Link
            className={styles.link}
            href={placeHref(locale, place)}
            aria-current={placeKey(place) === current ? "page" : undefined}
          >
            <Flag country={place.country} height={12} />
            {place.names[locale]}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);

export default PopularPlaces;
