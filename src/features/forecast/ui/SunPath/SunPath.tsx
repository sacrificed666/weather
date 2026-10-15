import { cx } from "@/shared/lib/cx";
import Card from "@/shared/ui/Card/Card";
import WeatherIcon from "@/shared/ui/WeatherIcon/WeatherIcon";

import { daylightProgress } from "../../model/insights";
import type { ForecastViewProps } from "../props";

import styles from "./SunPath.module.scss";

// A wide, low arc over the horizon at y 68; it peaks at y 12.5
const ARC = "M14 68C70 -6 230 -6 286 68";

// Point on the arc for the share of daylight that has passed
const sunPosition = (share: number) => {
  const inverse = 1 - share;
  return {
    x: inverse ** 3 * 14 + 3 * inverse ** 2 * share * 70 + 3 * inverse * share ** 2 * 230 + share ** 3 * 286,
    y: inverse ** 3 * 68 + 3 * inverse ** 2 * share * -6 + 3 * inverse * share ** 2 * -6 + share ** 3 * 68,
  };
};

// Sunrise, sunset and the sun's path over the day
const SunPath = ({
  forecast: { current, timezoneOffset, generatedAt },
  t,
  format,
  animated,
  className,
}: ForecastViewProps) => {
  const { sunrise, sunset } = current;
  const share = sunrise !== null && sunset !== null ? daylightProgress(generatedAt, sunrise, sunset) : null;
  const sun = share === null ? null : sunPosition(share);

  return (
    <Card className={cx(styles.sun, className)} title={t("sun.title")} icon="sunrise">
      {sunrise === null || sunset === null ? (
        <p className={styles.note}>{t("sun.unavailable")}</p>
      ) : (
        <>
          <svg className={styles.arc} viewBox="0 0 300 76" aria-hidden="true">
            <path className={styles.path} d={ARC} />
            {share !== null && (
              <path className={styles.travelled} d={ARC} pathLength={1} strokeDasharray={`${share} 1`} />
            )}
            <line className={styles.horizon} x1="4" y1="68" x2="296" y2="68" />
            {sun && <circle className={styles.dot} cx={sun.x.toFixed(2)} cy={sun.y.toFixed(2)} r="7" />}
          </svg>
          <dl className={styles.times}>
            <div className={styles.time}>
              <dt>
                <WeatherIcon className={styles.icon} name="sunrise" size={32} animated={animated} />
                {t("sun.sunrise")}
              </dt>
              <dd>{format.time(sunrise, timezoneOffset)}</dd>
            </div>
            <div className={styles.time}>
              <dt>
                <WeatherIcon className={styles.icon} name="sunset" size={32} animated={animated} />
                {t("sun.sunset")}
              </dt>
              <dd>{format.time(sunset, timezoneOffset)}</dd>
            </div>
          </dl>
          <p className={styles.note}>{t("sun.daylight", { duration: format.duration(sunset - sunrise) })}</p>
        </>
      )}
    </Card>
  );
};

export default SunPath;
