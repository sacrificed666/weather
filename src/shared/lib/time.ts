// A date whose UTC fields show the local time of the place
export const toLocalDate = (unixSeconds: number, offsetSeconds: number) =>
  new Date((unixSeconds + offsetSeconds) * 1000);

// The local date of the place as YYYY-MM-DD
export const localDayKey = (unixSeconds: number, offsetSeconds: number) =>
  toLocalDate(unixSeconds, offsetSeconds).toISOString().slice(0, 10);

// The local hour of the place
export const localHour = (unixSeconds: number, offsetSeconds: number) =>
  toLocalDate(unixSeconds, offsetSeconds).getUTCHours();

// The year for the copyright line
export const currentYear = () => new Date().getFullYear();
