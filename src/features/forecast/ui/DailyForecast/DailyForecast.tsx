import { localDayKey } from "@/shared/lib/time";
import Card from "@/shared/ui/Card/Card";
import Icon from "@/shared/ui/Icon/Icon";
import WeatherIcon from "@/shared/ui/WeatherIcon/WeatherIcon";

import { conditionIcon } from "../../model/conditions";
import type { ForecastViewProps } from "../props";
import TemperatureRange from "../TemperatureRange/TemperatureRange";

import styles from "./DailyForecast.module.scss";

const VISIBLE_CHANCE = 0.1;

// The next days with icons and temperature ranges on one scale
const DailyForecast = ({ forecast, t, format, animated, className }: ForecastViewProps) => {
  const { daily, current, timezoneOffset } = forecast;
  const today = localDayKey(current.time, timezoneOffset);
  const scaleMin = Math.min(...daily.map((day) => day.low));
  const scaleMax = Math.max(...daily.map((day) => day.high));

  return (
    <Card className={className} title={t("daily.title", { count: daily.length })} icon="calendar">
      <div className={styles.frame}>
        <ol className={styles.days}>
          {daily.map((day) => {
            const isToday = localDayKey(day.time, timezoneOffset) === today;
            const low = format.temperature(day.low);
            const high = format.temperature(day.high);
            return (
              <li key={day.time} className={styles.day}>
                <span className={styles.weekday}>
                  {isToday ? t("daily.today") : format.weekday(day.time, timezoneOffset)}
                </span>
                <span className={styles.condition}>
                  <WeatherIcon
                    name={conditionIcon(day.condition)}
                    size={40}
                    label={format.sentence(day.condition.description)}
                    animated={animated}
                  />
                </span>
                <span className={styles.chance}>
                  {day.precipitationChance >= VISIBLE_CHANCE && (
                    <>
                      <Icon name="droplet" size={10} />
                      <span className="visually-hidden">
                        {t("hourly.precipitation", { value: format.percent(day.precipitationChance) })}
                      </span>
                      <span aria-hidden="true">{format.percent(day.precipitationChance)}</span>
                    </>
                  )}
                </span>
                <span className="visually-hidden">{t("daily.range", { low, high })}</span>
                <span className={styles.low} aria-hidden="true">
                  {low}
                </span>
                <span className={styles.bar}>
                  <TemperatureRange
                    low={day.low}
                    high={day.high}
                    scaleMin={scaleMin}
                    scaleMax={scaleMax}
                    current={isToday ? current.temperature : undefined}
                  />
                </span>
                <span className={styles.high} aria-hidden="true">
                  {high}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
};

export default DailyForecast;
