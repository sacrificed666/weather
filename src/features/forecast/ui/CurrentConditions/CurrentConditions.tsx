import { useId } from "react";

import SavePlaceButton from "@/features/places/ui/SavePlaceButton/SavePlaceButton";
import { cx } from "@/shared/lib/cx";
import Flag from "@/shared/ui/Flag/Flag";
import WeatherIcon from "@/shared/ui/WeatherIcon/WeatherIcon";

import { conditionIcon } from "../../model/conditions";
import { todayForecast } from "../../model/normalize";
import LocalClock from "../LocalClock/LocalClock";
import type { ForecastViewProps } from "../props";

import styles from "./CurrentConditions.module.scss";

// The hero card: the place and the weather right now
const CurrentConditions = ({ forecast, t, format, animated, className }: ForecastViewProps) => {
  const headingId = useId();
  const { place, current, daily, timezoneOffset, generatedAt } = forecast;
  const today = todayForecast(daily, current, timezoneOffset);
  const description = format.sentence(current.condition.description);
  const location = [place.region, place.country ? format.country(place.country) : null].filter(Boolean).join(", ");

  return (
    <section className={cx(styles.current, className)} aria-labelledby={headingId}>
      <div className={styles.top}>
        <div className={styles.place}>
          <h1 className={styles.name} id={headingId}>
            {place.country && <Flag country={place.country} height={20} />}
            {place.name}
          </h1>
          <p className={styles.meta}>
            {location && <span>{location}</span>}
            <LocalClock timezoneOffset={timezoneOffset} renderedAt={generatedAt} />
          </p>
        </div>
        <SavePlaceButton place={place} />
      </div>

      <div className={styles.body}>
        <WeatherIcon
          className={styles.icon}
          name={conditionIcon(current.condition)}
          size={168}
          animated={animated}
          priority
        />
        <p className={styles.temperature}>
          <span className="visually-hidden">{t("current.title")}: </span>
          {format.temperature(current.temperature)}
        </p>
        <div className={styles.facts}>
          <p className={styles.description}>{description}</p>
          <p className={styles.range}>
            {today && (
              <>
                <span>{t("current.high", { value: format.temperature(today.high) })}</span>
                <span>{t("current.low", { value: format.temperature(today.low) })}</span>
              </>
            )}
            <span>{t("current.feelsLike", { value: format.temperature(current.feelsLike) })}</span>
          </p>
          <p className={styles.updated}>{t("current.updated", { time: format.time(current.time, timezoneOffset) })}</p>
        </div>
      </div>
    </section>
  );
};

export default CurrentConditions;
