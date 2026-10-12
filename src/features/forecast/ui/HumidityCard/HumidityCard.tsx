import Card from "@/shared/ui/Card/Card";

import { humidityLevel } from "../../model/insights";
import Metric from "../Metric/Metric";
import type { ForecastViewProps } from "../props";

// Relative humidity with its level
const HumidityCard = ({ forecast: { current }, t, format, className }: ForecastViewProps) => (
  <Card compact className={className} title={t("humidity.title")} icon="droplet">
    <Metric value={format.percent(current.humidity / 100)} share={current.humidity / 100}>
      {t(`humidity.${humidityLevel(current.humidity)}`)}
    </Metric>
  </Card>
);

export default HumidityCard;
