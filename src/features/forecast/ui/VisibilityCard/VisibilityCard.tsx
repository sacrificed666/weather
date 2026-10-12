import Card from "@/shared/ui/Card/Card";

import { progress, VISIBILITY_SCALE, visibilityLevel } from "../../model/insights";
import Metric from "../Metric/Metric";
import type { ForecastViewProps } from "../props";

// Visibility in kilometres or miles with its level
const VisibilityCard = ({ forecast: { current }, t, format, className }: ForecastViewProps) => {
  if (current.visibility === null) return null;
  return (
    <Card compact className={className} title={t("visibility.title")} icon="eye">
      <Metric
        value={format.distance(current.visibility)}
        share={progress(current.visibility, VISIBILITY_SCALE.min, VISIBILITY_SCALE.max)}
      >
        {t(`visibility.${visibilityLevel(current.visibility)}`)}
      </Metric>
    </Card>
  );
};

export default VisibilityCard;
