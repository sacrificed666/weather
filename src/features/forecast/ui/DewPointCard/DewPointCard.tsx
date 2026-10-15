import { dewPoint } from "@/shared/lib/units";
import Card from "@/shared/ui/Card/Card";

import { DEW_POINT_SCALE, dewPointLevel, progress } from "../../model/insights";
import Metric from "../Metric/Metric";
import type { ForecastViewProps } from "../props";

// The dew point with how the moisture in the air feels
const DewPointCard = ({ forecast: { current }, t, format, className }: ForecastViewProps) => {
  const celsius = dewPoint(current.temperature, current.humidity);

  return (
    <Card compact className={className} title={t("dewPoint.title")} icon="thermometer">
      <Metric value={format.temperature(celsius)} share={progress(celsius, DEW_POINT_SCALE.min, DEW_POINT_SCALE.max)}>
        {t(`dewPoint.${dewPointLevel(celsius)}`)}
      </Metric>
    </Card>
  );
};

export default DewPointCard;
