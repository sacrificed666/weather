export const UNIT_SYSTEMS = ["metric", "imperial"] as const;

export type UnitSystem = (typeof UNIT_SYSTEMS)[number];

// Whether a value is metric or imperial
export const isUnitSystem = (value: unknown): value is UnitSystem =>
  typeof value === "string" && (UNIT_SYSTEMS as readonly string[]).includes(value);

// Degrees Celsius as Fahrenheit
export const celsiusToFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;

// Metres per second as miles per hour
export const metersPerSecondToMilesPerHour = (speed: number) => speed * 2.236_936;

// Hectopascals as inches of mercury
export const hectopascalsToInchesOfMercury = (pressure: number) => pressure * 0.029_53;

// Metres as miles
export const metersToMiles = (meters: number) => meters / 1609.344;

// Millimetres as inches
export const millimetersToInches = (millimeters: number) => millimeters / 25.4;

// Dew point from temperature and humidity, Magnus formula
export const dewPoint = (celsius: number, humidity: number) => {
  const a = 17.62;
  const b = 243.12;
  const gamma = Math.log(Math.max(humidity, 1) / 100) + (a * celsius) / (b + celsius);
  return (b * gamma) / (a - gamma);
};
