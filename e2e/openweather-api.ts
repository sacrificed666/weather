import { createServer, type ServerResponse } from "node:http";

const PORT = Number(process.env.E2E_API_PORT ?? 4020);
const API_KEY = process.env.E2E_API_KEY ?? "e2e-key";
const DAILY_PLAN = process.env.E2E_DAILY_PLAN === "1";
const HOUR = 3600;
const DAY = 24 * HOUR;

interface MockCity {
  name: string;
  localNames: Readonly<Record<string, string>>;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number;
  code: number;
  temperature: number;
  airQuality: number;
}

const CITIES: readonly MockCity[] = [
  {
    name: "Lviv",
    localNames: { en: "Lviv", uk: "Львів", cs: "Lvov", de: "Lemberg", pl: "Lwów", pt: "Lviv" },
    state: "Lviv Oblast",
    country: "UA",
    latitude: 49.8419,
    longitude: 24.0315,
    timezone: 3 * HOUR,
    code: 500,
    temperature: 13,
    airQuality: 2,
  },
  {
    name: "Kyiv",
    localNames: { en: "Kyiv", uk: "Київ", cs: "Kyjev", de: "Kiew", pl: "Kijów", pt: "Kiev" },
    state: "Kyiv City",
    country: "UA",
    latitude: 50.4501,
    longitude: 30.5234,
    timezone: 3 * HOUR,
    code: 800,
    temperature: 17,
    airQuality: 3,
  },
  {
    name: "Reykjavik",
    localNames: { en: "Reykjavik", uk: "Рейк'явік", cs: "Reykjavík", de: "Reykjavík" },
    state: "Capital Region",
    country: "IS",
    latitude: 64.1466,
    longitude: -21.9426,
    timezone: 0,
    code: 601,
    temperature: -3,
    airQuality: 1,
  },
  {
    name: "Bangkok",
    localNames: { en: "Bangkok", uk: "Бангкок" },
    state: "Bangkok",
    country: "TH",
    latitude: 13.7563,
    longitude: 100.5018,
    timezone: 7 * HOUR,
    code: 211,
    temperature: 31,
    airQuality: 4,
  },
];

const DESCRIPTIONS: Readonly<Record<string, Readonly<Record<number, string>>>> = {
  en: {
    211: "thunderstorm",
    500: "light rain",
    501: "moderate rain",
    601: "snow",
    800: "clear sky",
    801: "few clouds",
    802: "scattered clouds",
    803: "broken clouds",
  },
  uk: {
    211: "гроза",
    500: "легкий дощ",
    501: "помірний дощ",
    601: "сніг",
    800: "чисте небо",
    801: "невелика хмарність",
    802: "мінлива хмарність",
    803: "хмарно з проясненнями",
  },
  de: {
    211: "Gewitter",
    500: "leichter Regen",
    501: "mäßiger Regen",
    601: "Schnee",
    800: "klarer Himmel",
    801: "ein paar Wolken",
    802: "Mäßig bewölkt",
    803: "Überwiegend bewölkt",
  },
  cz: {
    211: "bouřka",
    500: "slabý déšť",
    501: "mírný déšť",
    601: "sněžení",
    800: "jasno",
    801: "skoro jasno",
    802: "polojasno",
    803: "oblačno",
  },
};

const HOURLY_CODES = [800, 801, 803, 500, 501, 802, 800, 801];
const DAILY_CODES = [800, 801, 500, 803, 800, 211, 802];

// The condition text in the requested language
const describe = (code: number, language: string) =>
  DESCRIPTIONS[language]?.[code] ?? DESCRIPTIONS.en?.[code] ?? "clouds";

// The mock city closest to the coordinates
const nearest = (latitude: number, longitude: number) =>
  CITIES.reduce((best, city) =>
    Math.hypot(city.latitude - latitude, city.longitude - longitude) <
    Math.hypot(best.latitude - latitude, best.longitude - longitude)
      ? city
      : best,
  );

// A city as the geocoding API returns it
const geocoded = (city: MockCity) => ({
  name: city.name,
  local_names: city.localNames,
  lat: city.latitude,
  lon: city.longitude,
  country: city.country,
  state: city.state,
});

// The start of the city's current day
const localMidnight = (city: MockCity, now: number) => Math.floor((now + city.timezone) / DAY) * DAY - city.timezone;

// Current weather of a mock city
const current = (city: MockCity, language: string, now: number) => {
  const midnight = localMidnight(city, now);
  const sunrise = midnight + 7 * HOUR + 720;
  const sunset = midnight + 18 * HOUR + 2460;
  // The icon ends in d by day and n by night, as OpenWeatherMap sends it
  const icon = now >= sunrise && now < sunset ? "01d" : "01n";
  return {
    coord: { lon: city.longitude, lat: city.latitude },
    weather: [{ id: city.code, description: describe(city.code, language), icon }],
    main: { temp: city.temperature, feels_like: city.temperature - 2.4, pressure: 1009, humidity: 78 },
    visibility: city.code === 601 ? 3200 : 10_000,
    wind: { speed: 4.6, deg: 235, gust: 9.1 },
    ...(city.code === 500 ? { rain: { "1h": 0.42 } } : {}),
    clouds: { all: 75 },
    dt: now - 240,
    sys: { country: city.country, sunrise, sunset },
    timezone: city.timezone,
    name: city.name,
  };
};

// The three-hour forecast with a daily temperature wave
const slots = (city: MockCity, language: string, now: number) => {
  const start = Math.ceil(now / (3 * HOUR)) * 3 * HOUR;
  return {
    list: Array.from({ length: 40 }, (_, index) => {
      const time = start + index * 3 * HOUR;
      const hour = ((time + city.timezone) % DAY) / HOUR;
      const temperature = city.temperature + 5 * Math.sin(((hour - 9) / 24) * 2 * Math.PI) + (index % 7) * 0.4 - 1.5;
      const code = HOURLY_CODES[Math.floor(index / 5) % HOURLY_CODES.length] ?? 800;
      const pod = hour >= 7 && hour < 19 ? "d" : "n";
      return {
        dt: time,
        main: { temp: temperature, temp_min: temperature - 0.6, temp_max: temperature + 0.6, humidity: 70 },
        weather: [{ id: code, description: describe(code, language), icon: `01${pod}` }],
        pop: [0, 0.05, 0.2, 0.45, 0.8, 0.3, 0, 0.1][index % 8],
        sys: { pod },
      };
    }),
    city: { timezone: city.timezone },
  };
};

// The seven-day forecast of a mock city
const daily = (city: MockCity, language: string, now: number) => ({
  list: DAILY_CODES.map((code, index) => ({
    dt: localMidnight(city, now) + 12 * HOUR + index * DAY,
    temp: { min: city.temperature - 6 + index, max: city.temperature + 4 + (index % 3) * 2 },
    weather: [{ id: code, description: describe(code, language), icon: "01d" }],
    pop: [0, 0.1, 0.7, 0.2, 0, 0.9, 0.3][index],
  })),
});

// Air quality of a mock city
const air = (city: MockCity) => ({
  list: [{ main: { aqi: city.airQuality }, components: { pm2_5: 8.4, pm10: 14.2, o3: 61.7, no2: 12.9 } }],
});

// Sends a JSON response that is never cached
const send = (response: ServerResponse, status: number, body: unknown) => {
  response.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  response.end(JSON.stringify(body));
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);
  const params = url.searchParams;
  if (url.pathname === "/health") return send(response, 200, { ok: true });
  if (params.get("appid") !== API_KEY) return send(response, 401, { cod: 401, message: "Invalid API key" });

  const language = params.get("lang") ?? "en";
  const now = Math.floor(Date.now() / 1000);

  if (url.pathname === "/geo/1.0/direct") {
    const query = (params.get("q") ?? "").toLocaleLowerCase();
    const found = CITIES.filter((city) =>
      Object.values(city.localNames).some((name) => name.toLocaleLowerCase().startsWith(query)),
    );
    return send(response, 200, found.slice(0, Number(params.get("limit") ?? 5)).map(geocoded));
  }

  const city = nearest(Number(params.get("lat")), Number(params.get("lon")));
  switch (url.pathname) {
    case "/geo/1.0/reverse":
      return send(response, 200, [geocoded(city)]);
    case "/data/2.5/weather":
      return send(response, 200, current(city, language, now));
    case "/data/2.5/forecast":
      return send(response, 200, slots(city, language, now));
    case "/data/2.5/forecast/daily":
      return DAILY_PLAN
        ? send(response, 200, daily(city, language, now))
        : send(response, 401, { cod: 401, message: "Invalid API key" });
    case "/data/2.5/air_pollution":
      return send(response, 200, air(city));
    default:
      return send(response, 404, { cod: 404, message: "Not found" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`OpenWeatherMap mock on http://127.0.0.1:${PORT}\n`);
});
