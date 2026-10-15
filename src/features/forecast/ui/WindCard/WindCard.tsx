import Card from "@/shared/ui/Card/Card";

import { compassPoint } from "../../model/insights";
import type { ForecastViewProps } from "../props";

import styles from "./WindCard.module.scss";

const TICKS = Array.from({ length: 36 }, (_, index) => index * 10);
const CARDINALS = [
  { point: "n", x: 60, y: 24 },
  { point: "e", x: 97, y: 61 },
  { point: "s", x: 60, y: 98 },
  { point: "w", x: 23, y: 61 },
] as const;

// Wind speed, gusts and direction on a compass
const WindCard = ({ forecast: { current }, t, format, className }: ForecastViewProps) => {
  const { speed, gust, direction } = current.wind;
  const calm = speed < 0.5;
  const rows = [
    { label: t("wind.speed"), value: calm ? t("wind.calm") : format.speed(speed) },
    ...(gust !== null ? [{ label: t("wind.gusts"), value: format.speed(gust) }] : []),
    ...(direction !== null
      ? [
          {
            label: t("wind.direction"),
            value: `${format.number(direction)}° ${t(`direction.${compassPoint(direction)}`)}`,
          },
        ]
      : []),
  ];

  return (
    <Card className={className} title={t("wind.title")} icon="wind">
      <div className={styles.wind}>
        <dl className={styles.rows}>
          {rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <svg className={styles.compass} viewBox="0 0 120 120" aria-hidden="true">
          <circle className={styles.dial} cx="60" cy="60" r="56" />
          {TICKS.map((angle) => (
            <line
              key={angle}
              className={angle % 90 === 0 ? styles.majorTick : styles.tick}
              x1="60"
              y1="6"
              x2="60"
              y2={angle % 90 === 0 ? 13 : 10}
              transform={`rotate(${angle} 60 60)`}
            />
          ))}
          {CARDINALS.map(({ point, x, y }) => (
            <text key={point} className={styles.cardinal} x={x} y={y} textAnchor="middle" dominantBaseline="middle">
              {t(`direction.${point}`)}
            </text>
          ))}
          {direction !== null && !calm && (
            <g className={styles.arrow} transform={`rotate(${direction + 180} 60 60)`}>
              <line x1="60" y1="88" x2="60" y2="38" />
              <path d="M60 28 67 42 60 38 53 42Z" />
              <circle cx="60" cy="88" r="3.5" />
            </g>
          )}
          <circle className={styles.hub} cx="60" cy="60" r="4" />
        </svg>
      </div>
    </Card>
  );
};

export default WindCard;
