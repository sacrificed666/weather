"use client";

import { useSyncExternalStore } from "react";

import { useI18n } from "@/shared/i18n/useI18n";
import { createFormatter } from "@/shared/lib/format";

const TICK_MS = 15_000;

// Checks the time often enough to change the minute on time
const subscribe = (onTick: () => void) => {
  const timer = setInterval(onTick, TICK_MS);
  return () => clearInterval(timer);
};

// Minutes since the epoch
const currentMinute = () => Math.floor(Date.now() / 60_000);

interface LocalClockProps {
  timezoneOffset: number;
  renderedAt: number;
}

// Date and time at the place, ticking every minute
const LocalClock = ({ timezoneOffset, renderedAt }: LocalClockProps) => {
  const { intlLocale } = useI18n();
  const minute = useSyncExternalStore(subscribe, currentMinute, () => Math.floor(renderedAt / 60));
  const seconds = minute * 60;
  const format = createFormatter(intlLocale, "metric");
  return (
    <time dateTime={new Date(seconds * 1000).toISOString()} suppressHydrationWarning>
      {format.date(seconds, timezoneOffset)}, {format.time(seconds, timezoneOffset)}
    </time>
  );
};

export default LocalClock;
