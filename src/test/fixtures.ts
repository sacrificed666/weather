import type { Forecast } from "@/features/forecast/model/types";
import { en } from "@/shared/i18n/messages/en";
import { createTranslator } from "@/shared/i18n/translate";
import { createFormatter } from "@/shared/lib/format";

export const NOW = 1_759_500_000;
export const OFFSET = 10_800;
const SUNRISE = 1_759_465_920;
const SUNSET = 1_759_507_260;

export const weatherResponse = {
  coord: { lon: 24.0315, lat: 49.8419 },
  weather: [{ id: 500, main: "Rain", description: "light rain", icon: "10d" }],
  main: { temp: 13.2, feels_like: 11.1, temp_min: 12, temp_max: 14, pressure: 1009, humidity: 78 },
  visibility: 10_000,
  wind: { speed: 4.6, deg: 235, gust: 9.1 },
  rain: { "1h": 0.42 },
  clouds: { all: 75 },
  dt: NOW,
  sys: { country: "UA", sunrise: SUNRISE, sunset: SUNSET },
  timezone: OFFSET,
  name: "Lviv",
};

const slotCodes = [500, 500, 803, 801, 800, 800, 802, 600];

export const forecastResponse = {
  list: Array.from({ length: 40 }, (_, index) => {
    const dt = 1_759_503_600 + index * 10_800;
    const temperature = 10 + (index % 8);
    return {
      dt,
      main: { temp: temperature, temp_min: temperature - 1, temp_max: temperature + 1, humidity: 70 },
      weather: [{ id: slotCodes[index % 8], description: "clouds", icon: index % 8 < 4 ? "04d" : "04n" }],
      pop: (index % 5) / 4,
      sys: { pod: index % 8 < 4 ? "d" : "n" },
    };
  }),
  city: { timezone: OFFSET },
};

export const dailyResponse = {
  list: Array.from({ length: 7 }, (_, index) => ({
    dt: 1_759_482_000 + index * 86_400,
    temp: { min: 6 + index, max: 18 + index },
    weather: [{ id: index === 2 ? 501 : 800, description: index === 2 ? "moderate rain" : "clear sky", icon: "01d" }],
    pop: index === 2 ? 0.8 : 0,
  })),
};

export const airResponse = {
  list: [{ main: { aqi: 2 }, components: { pm2_5: 8.4, pm10: 14.2, o3: 61.7, no2: 12.9 } }],
};

export const geocodingResponse = [
  {
    name: "Lviv",
    local_names: { en: "Lviv", uk: "Львів", de: "Lemberg" },
    lat: 49.8419,
    lon: 24.0315,
    country: "UA",
    state: "Lviv Oblast",
  },
];

export const forecast: Forecast = {
  place: { name: "Lviv", region: "Lviv Oblast", country: "UA", latitude: 49.84, longitude: 24.03 },
  generatedAt: NOW + 60,
  timezoneOffset: OFFSET,
  current: {
    time: NOW,
    condition: { code: 500, description: "light rain", daytime: true },
    temperature: 13.2,
    feelsLike: 11.1,
    humidity: 78,
    pressure: 1009,
    visibility: 10_000,
    cloudiness: 75,
    precipitation: 0.42,
    wind: { speed: 4.6, gust: 9.1, direction: 235 },
    sunrise: SUNRISE,
    sunset: SUNSET,
  },
  hourly: [
    {
      time: 1_759_503_600,
      condition: { code: 803, description: "broken clouds", daytime: true },
      temperature: 14,
      precipitationChance: 0.4,
    },
    {
      time: 1_759_514_400,
      condition: { code: 800, description: "clear sky", daytime: false },
      temperature: 9,
      precipitationChance: 0,
    },
  ],
  daily: [
    {
      time: 1_759_482_000,
      condition: { code: 500, description: "light rain", daytime: true },
      low: 6,
      high: 18,
      precipitationChance: 0.8,
    },
    {
      time: 1_759_568_400,
      condition: { code: 800, description: "clear sky", daytime: true },
      low: 7,
      high: 21,
      precipitationChance: 0,
    },
  ],
  airQuality: { index: 2, fineParticles: 8.4, coarseParticles: 14.2, ozone: 61.7, nitrogenDioxide: null },
};

export const t = createTranslator(en);

// Props of a forecast card with fields to override
export const view = (overrides: Partial<Forecast> = {}) => ({
  forecast: { ...forecast, ...overrides },
  t,
  format: createFormatter("en-GB", "metric"),
  animated: true,
});

// A fetch response with a JSON body
export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
