import { useId } from "react";

import { progress, TEMPERATURE_SCALE, TEMPERATURE_STOPS } from "../../model/insights";

import styles from "./TemperatureRange.module.scss";

interface TemperatureRangeProps {
  low: number;
  high: number;
  scaleMin: number;
  scaleMax: number;
  current?: number;
}

const MIN_WIDTH = 0.04;

// A share as a CSS percentage
const percent = (value: number) => `${(value * 100).toFixed(2)}%`;

// A day's low to high on the shared scale, with the current temperature
const TemperatureRange = ({ low, high, scaleMin, scaleMax, current }: TemperatureRangeProps) => {
  const gradientId = useId();
  const span = scaleMax - scaleMin || 1;
  // Where a temperature sits on the shared scale
  const position = (celsius: number) => (celsius - scaleMin) / span;
  const start = progress(low, scaleMin, scaleMax);
  const width = Math.max(progress(high, scaleMin, scaleMax) - start, MIN_WIDTH);

  return (
    <svg className={styles.range} width="100%" height="8" aria-hidden="true">
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={percent(position(TEMPERATURE_SCALE.min))}
          x2={percent(position(TEMPERATURE_SCALE.max))}
          y1="0"
          y2="0"
        >
          {TEMPERATURE_STOPS.map((stop) => (
            <stop
              key={stop.celsius}
              offset={progress(stop.celsius, TEMPERATURE_SCALE.min, TEMPERATURE_SCALE.max)}
              stopColor={stop.color}
            />
          ))}
        </linearGradient>
      </defs>
      <rect className={styles.track} x="0" y="1" width="100%" height="6" rx="3" />
      <rect
        x={percent(Math.min(start, 1 - MIN_WIDTH))}
        y="1"
        width={percent(width)}
        height="6"
        rx="3"
        fill={`url(#${gradientId})`}
      />
      {current !== undefined && (
        <circle className={styles.now} cx={percent(progress(current, scaleMin, scaleMax))} cy="4" r="3.5" />
      )}
    </svg>
  );
};

export default TemperatureRange;
