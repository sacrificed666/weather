import { conditionSky } from "@/features/forecast/model/conditions";
import { getForecast } from "@/features/forecast/model/getForecast";
import AirQualityCard from "@/features/forecast/ui/AirQualityCard/AirQualityCard";
import CloudCoverCard from "@/features/forecast/ui/CloudCoverCard/CloudCoverCard";
import CurrentConditions from "@/features/forecast/ui/CurrentConditions/CurrentConditions";
import DailyForecast from "@/features/forecast/ui/DailyForecast/DailyForecast";
import DewPointCard from "@/features/forecast/ui/DewPointCard/DewPointCard";
import ForecastError from "@/features/forecast/ui/ForecastError/ForecastError";
import HourlyForecast from "@/features/forecast/ui/HourlyForecast/HourlyForecast";
import HumidityCard from "@/features/forecast/ui/HumidityCard/HumidityCard";
import PrecipitationCard from "@/features/forecast/ui/PrecipitationCard/PrecipitationCard";
import PressureCard from "@/features/forecast/ui/PressureCard/PressureCard";
import Sky from "@/features/forecast/ui/Sky/Sky";
import SunPath from "@/features/forecast/ui/SunPath/SunPath";
import VisibilityCard from "@/features/forecast/ui/VisibilityCard/VisibilityCard";
import WindCard from "@/features/forecast/ui/WindCard/WindCard";
import { forecastSearch, type LocationQuery } from "@/features/places/model/location";
import { describeForecast, forecastSchema } from "@/features/seo/model/seo";
import JsonLd from "@/features/seo/ui/JsonLd/JsonLd";
import { getEffects, getLocalization } from "@/features/settings/model/server";
import { homeHref } from "@/shared/i18n/locales";
import { siteUrl } from "@/shared/lib/site";

import styles from "./Forecast.module.scss";

// The whole forecast of a place, or why it is missing
const Forecast = async ({ query }: { query: LocationQuery | null }) => {
  const { locale, t, format } = await getLocalization();
  const result = query ? await getForecast(query, locale) : null;

  if (!query || !result) return <ForecastError kind="not-found" t={t} home={homeHref(locale)} />;
  if (!result.ok) return <ForecastError kind={result.failure} t={t} home={homeHref(locale)} />;

  const { forecast } = result;
  const { level } = await getEffects();
  const view = { forecast, t, format, animated: level === "full" };
  const page = {
    ...describeForecast(forecast, t, format),
    path: `${homeHref(locale)}${forecastSearch(query, forecast.place)}`,
  };

  return (
    <>
      <JsonLd data={forecastSchema(forecast, page, siteUrl(), locale, t)} />
      <Sky sky={conditionSky(forecast.current.condition)} />
      <div className={styles.dashboard}>
        <CurrentConditions {...view} className={styles.current} />
        <HourlyForecast {...view} className={styles.hourly} />
        <DailyForecast {...view} className={styles.daily} />
        <SunPath {...view} className={styles.sun} />
        <WindCard {...view} className={styles.wind} />
        <AirQualityCard {...view} className={styles.air} />
        <div className={styles.details}>
          <HumidityCard {...view} />
          <DewPointCard {...view} />
          <PressureCard {...view} />
          <VisibilityCard {...view} />
          <PrecipitationCard {...view} />
          <CloudCoverCard {...view} />
        </div>
      </div>
    </>
  );
};

export default Forecast;
