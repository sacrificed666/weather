import Card from "@/shared/ui/Card/Card";
import Icon from "@/shared/ui/Icon/Icon";
import WeatherIcon from "@/shared/ui/WeatherIcon/WeatherIcon";

import { conditionIcon } from "../../model/conditions";
import type { Condition } from "../../model/types";
import type { ForecastViewProps } from "../props";

import styles from "./HourlyForecast.module.scss";

const VISIBLE_CHANCE = 0.1;

interface Hour {
  key: number;
  label: string;
  condition: Condition;
  temperature: number;
  precipitationChance: number | null;
}

// Now and the next hours with icons, temperatures and chances of rain
const HourlyForecast = ({ forecast, t, format, animated, className }: ForecastViewProps) => {
  const { current, hourly, timezoneOffset } = forecast;
  const hours: Hour[] = [
    {
      key: current.time,
      label: t("hourly.now"),
      condition: current.condition,
      temperature: current.temperature,
      precipitationChance: null,
    },
    ...hourly.map((hour): Hour => ({
      key: hour.time,
      label: format.time(hour.time, timezoneOffset),
      condition: hour.condition,
      temperature: hour.temperature,
      precipitationChance: hour.precipitationChance,
    })),
  ];

  return (
    <Card className={className} title={t("hourly.title")} icon="clock">
      <ol className={styles.hours} aria-label={t("hourly.title")} tabIndex={0}>
        {hours.map((hour) => (
          <li key={hour.key} className={styles.hour}>
            <span className={styles.time}>{hour.label}</span>
            <WeatherIcon
              name={conditionIcon(hour.condition)}
              size={48}
              label={format.sentence(hour.condition.description)}
              animated={animated}
            />
            <span className={styles.temperature}>{format.temperature(hour.temperature)}</span>
            <span className={styles.chance}>
              {hour.precipitationChance !== null && hour.precipitationChance >= VISIBLE_CHANCE && (
                <>
                  <Icon name="droplet" size={11} />
                  <span className="visually-hidden">
                    {t("hourly.precipitation", { value: format.percent(hour.precipitationChance) })}
                  </span>
                  <span aria-hidden="true">{format.percent(hour.precipitationChance)}</span>
                </>
              )}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
};

export default HourlyForecast;
