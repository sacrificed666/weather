import type { Translate } from "@/shared/i18n/translate";
import type { Formatter } from "@/shared/lib/format";

import type { Forecast } from "../model/types";

export interface ForecastViewProps {
  forecast: Forecast;
  t: Translate;
  format: Formatter;
  animated: boolean;
  className?: string;
}
