import { cx } from "@/shared/lib/cx";
import Card from "@/shared/ui/Card/Card";

import type { AirQuality, AirQualityIndex } from "../../model/types";
import type { ForecastViewProps } from "../props";

import styles from "./AirQualityCard.module.scss";

const LEVELS = [1, 2, 3, 4, 5] as const satisfies readonly AirQualityIndex[];

const POLLUTANTS = [
  { key: "fineParticles", label: "PM2.5" },
  { key: "coarseParticles", label: "PM10" },
  { key: "ozone", label: "O₃" },
  { key: "nitrogenDioxide", label: "NO₂" },
] as const satisfies readonly { key: keyof Omit<AirQuality, "index">; label: string }[];

// Air quality index with advice and a five-step scale
const AirQualityCard = ({ forecast: { airQuality }, t, format, className }: ForecastViewProps) => (
  <Card className={cx(styles.card, className)} title={t("air.title")} icon="leaf">
    {airQuality === null ? (
      <p className={styles.advice}>{t("air.unavailable")}</p>
    ) : (
      <div className={styles.body}>
        <div className={styles.summary}>
          <p className={styles.level} data-level={airQuality.index}>
            {t(`air.level.${airQuality.index}`)}
          </p>
          <p className={styles.advice}>{t(`air.advice.${airQuality.index}`)}</p>
        </div>
        <p className="visually-hidden">{t("air.scale", { index: airQuality.index })}</p>
        <div className={styles.scale} aria-hidden="true">
          {LEVELS.map((level) => (
            <span
              key={level}
              className={styles.segment}
              data-level={level}
              data-active={level === airQuality.index || undefined}
            />
          ))}
        </div>
        <dl className={styles.pollutants}>
          {POLLUTANTS.map(({ key, label }) => {
            const value = airQuality[key];
            if (value === null) return null;
            return (
              <div key={key} className={styles.pollutant}>
                <dt>{label}</dt>
                <dd>
                  {format.number(value)} <span className={styles.unit}>µg/m³</span>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    )}
  </Card>
);

export default AirQualityCard;
