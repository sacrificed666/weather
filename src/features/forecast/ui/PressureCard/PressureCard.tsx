import Card from "@/shared/ui/Card/Card";

import { PRESSURE_SCALE, pressureLevel, progress } from "../../model/insights";
import Metric from "../Metric/Metric";
import type { ForecastViewProps } from "../props";

// Air pressure with its level
const PressureCard = ({ forecast: { current }, t, format, className }: ForecastViewProps) => (
  <Card compact className={className} title={t("pressure.title")} icon="gauge">
    <Metric
      value={format.pressure(current.pressure)}
      unit={format.units === "imperial" ? t("pressure.inhg") : t("pressure.hpa")}
      share={progress(current.pressure, PRESSURE_SCALE.min, PRESSURE_SCALE.max)}
    >
      {t(`pressure.${pressureLevel(current.pressure)}`)}
    </Metric>
  </Card>
);

export default PressureCard;
