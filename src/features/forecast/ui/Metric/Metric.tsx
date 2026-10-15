import type { ReactNode } from "react";

import styles from "./Metric.module.scss";

interface MetricProps {
  value: string;
  unit?: string;
  share: number;
  children: ReactNode;
}

// The smallest filled part that still reads as a bar
const MIN_FILL = 0.04;

// A large value with its unit, a short note and a meter for the value
const Metric = ({ value, unit, share, children }: MetricProps) => {
  const fill = share > 0 ? Math.max(share, MIN_FILL) : 0;

  return (
    <>
      <p className={styles.value}>
        {value}
        {unit && <span className={styles.unit}> {unit}</span>}
      </p>
      <p className={styles.note}>{children}</p>
      <svg className={styles.meter} aria-hidden="true">
        <rect className={styles.track} width="100%" height="100%" rx="3" />
        {fill > 0 && <rect className={styles.fill} width={`${(fill * 100).toFixed(1)}%`} height="100%" rx="3" />}
      </svg>
    </>
  );
};

export default Metric;
