# ❓ FAQ

### 🔑 Do I need a paid OpenWeatherMap plan?

No. The free plan covers current weather, the 5-day / 3-hour forecast, air pollution and geocoding. The 7-day daily forecast is part of paid plans; without it the app builds the week from the three-hour forecast and shows five or six days. See [Weather data](./weather-data.md#️-daily-forecast-on-a-free-key).

### ⏳ The app says "The API key was rejected". What now?

Check that `OPENWEATHERMAP_API_KEY` is set without quotes or spaces and restart the server. A key created in the last couple of hours may simply not be active yet.

### 🌡️ How do I switch to Fahrenheit?

Open **Settings** (the sliders button) and choose **°F, mph**. Pressure switches to inHg, distances to miles and precipitation to inches. The choice is remembered in a cookie.

### 🐢 Why does the sky stand still on my computer?

On Windows, Linux and Android the app starts with **Reduced** effects: the sky and the weather icons stand still and no glass is blurred, because blurring the moving sky behind every card and control made scrolling stutter on many of these devices. Apple devices get the **Full** effects.

> [!TIP]
> Open **Settings** and choose **Effects: Full** to bring the moving sky back on a fast computer, or **Reduced** to calm it down on any device.

### 🗣️ Why are some descriptions or city names not translated?

Descriptions come from OpenWeatherMap in the language you choose, and place names from its geocoding database, which has local names for many but not all places. The region (for example "Lviv Oblast") is only available in English.

### 📍 Why does "Use my location" not work?

The browser must allow the page to read your location, and only does so over HTTPS or on `localhost`. If you blocked it once, allow it again in the site settings next to the address bar.

### ⭐ Where are my saved places?

In your browser's `localStorage`, on this device only. They sync between tabs but not between browsers or devices. Clearing the site data removes them.

### 🔗 Can I link to a city?

Yes. Every forecast has its own address, for example `/en?city=Tokyo` or `/uk?lat=49.84&lon=24.03`. The language travels with the link; the theme and units of the person who opens it are their own. A link without a language, such as `/?city=Tokyo`, opens in the language of whoever clicks it.

### 🌍 Why did the address change to `/en` or `/uk`?

Every language has its own address, so search engines can show the right one and a shared link opens in the language it was shared in. The first visit to `/` redirects to the language you chose before or, the first time, to your browser's language.

### 🕰️ Which time zone are the times in?

Always the city's own: the clock, the hourly forecast, sunrise, sunset and "Updated at" use the offset reported by OpenWeatherMap, wherever you are.

> [!NOTE]
> OpenWeatherMap reports only the offset in effect right now. In the days before a city changes its clocks, the forecast hours after the change appear one hour off until the change has happened.

### 🔄 How fresh is the data?

OpenWeatherMap updates current conditions about every ten minutes, and the app caches each response for ten minutes (air quality for thirty). "Updated at" shows the time of the observation.

### 📴 What happens offline?

A notice appears at the bottom of the page. The forecast you already see stays on screen, and Next.js retries navigations and saved settings automatically when the connection returns.

If you open or reload a page without a connection, the service worker answers with a small **No connection** page in your language that reloads itself when the connection returns. It never stores forecasts, so an old forecast is never shown as the current one.

### 🧪 Can I try the app without an API key?

Yes. Run the mock server from the end-to-end tests with `node e2e/openweather-api.ts` and start the app with `OPENWEATHERMAP_API_KEY=e2e-key OPENWEATHERMAP_API_URL=http://127.0.0.1:4020 npm run dev`. It knows Lviv, Kyiv, Reykjavik and Bangkok.

### 🔎 Why is my preview deployment not in search results?

On purpose: Vercel previews send `noindex` and a robots file that disallows everything, so only production competes in search results. See [SEO](./seo.md#️-sitemap-and-robots).

### 🌍 Can I add a language?

Yes: add a message file and a few lines in `locales.ts`. See [Localization](./i18n.md#-adding-a-language).

### 🖼️ Where do the icons come from?

Weather icons are [Meteocons](https://bas.dev/work/meteocons) by Bas Milius, served by the app itself. Interface icons are based on [Lucide](https://lucide.dev) and flags come from [country-flag-icons](https://gitlab.com/catamphetamine/country-flag-icons).

> [!TIP]
> Did not find your question? Open an issue with the forms in the repository; for anything security-related, follow the [security policy](../.github/SECURITY.md) instead.

### 🐳 Can I run it in Docker?

Yes. `docker compose -f compose.yaml -f docker/development.yaml up --watch` starts the dev server in a container with the variables from `.env`, and `docker/staging.yaml` and `docker/production.yaml` build the small production image for a server. See [Deployment](./deployment.md#-docker).
