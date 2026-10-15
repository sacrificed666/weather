# 🏗️ Architecture

## 🧱 Technology stack

| Area         | Choice                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| ⚛️ UI        | React 19.3 with the React Compiler (automatic memoization)                                           |
| 🧭 Framework | Next.js 16 App Router: server components, server actions, route handlers, `proxy.ts`, Turbopack      |
| 🌦️ Data      | OpenWeatherMap current weather, 5-day / 3-hour forecast, daily forecast, air pollution and geocoding |
| 🌍 i18n      | Ten hand-written message catalogs on top of `Intl` for numbers, units, dates and country names       |
| 🎨 Styling   | Sass modules, CSS custom properties, `color-mix()`, `:has()`, `@starting-style`, native popovers     |
| 🔷 Language  | TypeScript 7 in strict mode with `noUncheckedIndexedAccess`, `verbatimModuleSyntax` and route types  |
| ✅ Quality   | Oxlint (type-aware, React Compiler, Next.js, a11y and layer rules), Oxfmt, Vitest 5, Testing Library |

## 🧭 Layers

The source is organised by **feature**, in four layers. A layer may only import from the layers below it, and Oxlint's `no-restricted-imports` rule enforces this in `.oxlintrc.json`.

```mermaid
flowchart TB
  app["🚀 app<br/>localized routes, 404, API, flags, icons, sitemap, robots, proxy"]
  widgets["🧩 widgets<br/>Header, Footer, Forecast"]
  features["✨ features<br/>forecast, places, preferences, i18n, seo"]
  shared["🧰 shared<br/>api client, lib, ui primitives, styles, fonts"]

  app --> widgets
  app --> features
  app --> shared
  widgets --> features
  widgets --> shared
  features --> shared
```

| Layer       | Folder                    | Contains                                                       | May import             |
| ----------- | ------------------------- | -------------------------------------------------------------- | ---------------------- |
| 🚀 App      | `src/app`, `src/proxy.ts` | Next.js routes and special files                               | everything             |
| 🧩 Widgets  | `src/widgets`             | Page regions that compose several features                     | features, shared       |
| ✨ Features | `src/features`            | One folder per capability with a `model/` and a `ui/`          | other features, shared |
| 🧰 Shared   | `src/shared`              | Domain-agnostic HTTP client, helpers, UI primitives and styles | shared only            |

| Feature            | Model                                                                                                            | UI                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 🌦️ `forecast`      | `getForecast()`, response parsers, daily aggregation, condition icons and skies, insights, domain types          | `CurrentConditions`, `HourlyForecast`, `DailyForecast`, nine detail cards, `Sky`, `LocalClock`, skeleton, error |
| 📍 `places`        | `Place`, URL locations, geocoding, saved and recent places                                                       | `CitySearch`, `LocateButton`, `SavePlaceButton`, `SavedPlaces`                                                  |
| ⚙️ `settings`      | Theme, units and effects in cookies, the `savePreference` server action, the route language, `getLocalization()` | `SettingsMenu`                                                                                                  |
| 📴 `notifications` | `offlinePage()`: the offline page of the service worker with its own CSP                                         | `OfflineNotice`, `ServiceWorker`                                                                                |
| 🌍 `i18n`          | Locales, `negotiateLocale()`, path helpers, message catalogs, `createTranslator()`, `useI18n()`                  | `I18nProvider`                                                                                                  |
| 🔎 `seo`           | `alternates()`, `social()`, `documentTitle()`, `describeForecast()`, JSON-LD schemas, share card assets          | `JsonLd`                                                                                                        |

## 🔀 Request flow

```mermaid
sequenceDiagram
  actor Browser
  participant Proxy as proxy.ts
  participant Layout as app/[locale]/layout.tsx
  participant Page as app/[locale]/page.tsx
  participant Forecast as widgets/Forecast
  participant Model as getForecast()
  participant OWM as OpenWeatherMap

  Browser->>Proxy: GET /?city=Kyiv
  Proxy-->>Browser: 307 /uk?city=Kyiv (cookie or Accept-Language)
  Browser->>Proxy: GET /uk?city=Kyiv
  Proxy->>Proxy: fresh nonce, Content-Security-Policy, x-weather-locale
  Proxy->>Layout: request with the nonce
  Layout->>Layout: getLocalization(): route language, cookies
  Layout-->>Browser: shell: header, search, settings, footer
  Page->>Page: parseLocation(searchParams)
  Page-->>Browser: <Suspense key="city:kyiv"> skeleton
  Page->>Forecast: render the query
  Forecast->>Model: getForecast(query, locale)
  Model->>OWM: geocoding, then weather, forecast, daily, air in parallel
  OWM-->>Model: JSON (cached for 10 minutes)
  Model-->>Forecast: normalized Forecast or a failure
  Forecast-->>Browser: streamed dashboard over its sky
```

- 🧊 **Server components by default.** The forecast cards are synchronous server components that receive `{ forecast, t, format }` as props; they ship no JavaScript. Only interactive parts are client components: search, location, the star, saved places, settings, the clock, the retry button and the offline notice.
- 🌊 **Streaming.** The layout and the page shell render at once; the forecast streams into a `Suspense` boundary. The boundary is keyed by the location (`locationKey()`), so opening another city shows the skeleton, while changing a setting keeps the current dashboard on screen until the new one is ready.
- 🔗 **The URL is the state.** The language is the first segment and the place lives in the query (`/uk?city=Kyiv` or `/uk?lat=50.45&lon=30.52`), so the back button, bookmarks and sharing work without client state. Search and location only call `router.push()` inside a transition.
- 🏷️ **Metadata.** `generateMetadata()` names the tab after the city (`Kyiv: hourly and daily forecast · Weather`), puts the weather right now into the description, adds the canonical and `hreflang` links and keeps failures out of the index. It calls `getForecast()` with the same arguments as the page, and Next.js deduplicates the identical `fetch` calls within the request. See [SEO](./seo.md).
- 🧩 **Structured data.** The `Forecast` widget renders JSON-LD for the site, the page and the place next to the dashboard, so it streams in with the forecast.

> [!NOTE]
> Without JavaScript the streamed dashboard stays hidden, because React moves it into place with a small script. The header, the search form and the title still work, and every search submits to a new address.

## 🗺️ Routes

| Route                            | Kind                       | Purpose                                                                       |
| -------------------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| `/[locale]`                      | Dynamic page               | The forecast for `?city=`, `?lat=&lon=` or the default city, in ten languages |
| `/[locale]/opengraph-image/card` | Metadata image (SSG)       | The share card of each language, generated with `next/og` at build time       |
| `/api/places?q=&lang=`           | Route handler              | Search suggestions for the combobox, rate-limited, same-origin only           |
| `/flags/[code]`                  | Static route handler (SSG) | 265 country flags from `country-flag-icons`, prerendered at build time        |
| `/icons/weather/*.svg`           | Static files               | The Meteocons the app uses                                                    |
| `/icon.svg`, `/apple-icon`       | Metadata files             | App icons                                                                     |
| `/manifest.webmanifest`          | Metadata file              | Name, colours and icons for installing the app                                |
| `/sitemap.xml`, `/robots.txt`    | Metadata files             | Every language of the home page, crawling rules                               |
| Anything else                    | `global-not-found.tsx`     | **Page not found** with status 404, in the language of the address            |

`[locale]/layout.tsx` is the root layout: it renders `<html lang>` from the address, and `dynamicParams = false` limits the segment to the ten languages. `error.tsx` catches unexpected rendering errors below the layout, offers **Try again** (`retry()`) and shows the error's digest as a reference; `global-error.tsx` covers the layout itself, in the language of the address and with its own copy of the five texts it needs (see [Internationalization](./i18n.md#️-server-and-client)).

### 🧭 Languages in the address

`src/proxy.ts` runs before every page and does three things:

| Request                     | Answer                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `/uk?city=Kyiv`             | Passes on with a fresh nonce, the Content Security Policy and an `x-weather-locale: uk` header                                      |
| `/UK?city=Kyiv`             | `308` to `/uk?city=Kyiv`                                                                                                            |
| `/?city=Kyiv`, `/somewhere` | `307` to the saved language (`weather-locale` cookie) or the best match for `Accept-Language`, with `Vary: Accept-Language, Cookie` |

Server components read the language with `locale()` from `next/root-params` through `currentLocale()`, so it never has to be passed down.

> [!IMPORTANT]
> With the root layout inside a dynamic segment, a `notFound()` thrown by a page cannot fall back to a root `not-found.tsx`, and Next.js answers with an empty error shell. Unknown addresses are therefore left unmatched and rendered by `global-not-found.tsx`, which reads the language from the `x-weather-locale` header the proxy sets, then from the cookie and `Accept-Language`.

## 🗂️ Domain model

```mermaid
classDiagram
  class Forecast {
    Place place
    number generatedAt
    number timezoneOffset
    CurrentWeather current
    HourlyForecast[] hourly
    DailyForecast[] daily
    AirQuality airQuality
  }
  class Place {
    string name
    string region
    string country
    number latitude
    number longitude
  }
  class CurrentWeather {
    number time
    Condition condition
    number temperature
    number feelsLike
    number humidity
    number pressure
    number visibility
    number cloudiness
    number precipitation
    Wind wind
    number sunrise
    number sunset
  }
  class Condition {
    number code
    string description
    boolean daytime
  }
  Forecast --> Place
  Forecast --> CurrentWeather
  Forecast --> "0..8" HourlyForecast
  Forecast --> "0..7" DailyForecast
  Forecast --> "0..1" AirQuality
  CurrentWeather --> Condition
```

- 📏 **Metric inside.** Every value is stored in metric units (°C, m/s, hPa, m, mm) and converted only when it is formatted, so one cached response serves every unit system.
- 🕰️ **Unix seconds and an offset.** Times are UTC seconds; `timezoneOffset` is the city's offset in seconds. `toLocalDate()` shifts a timestamp and formatting always uses `timeZone: "UTC"`, so the server, the browser and the tests agree regardless of their own time zone.
- 🧭 **Codes, not words.** A `Condition` keeps the OpenWeatherMap code; icons and skies are derived from it, never from the localized description.

The full path from OpenWeatherMap JSON to these types is described in [Weather data](./weather-data.md).

## ⚙️ Preferences

```mermaid
sequenceDiagram
  actor User
  participant Menu as SettingsMenu (client)
  participant Action as savePreference (server action)
  participant Next as Next.js
  User->>Menu: chooses Dark
  Menu->>Menu: document.documentElement.dataset.theme = "dark"
  Menu->>Menu: useOptimistic marks Dark as selected
  Menu->>Action: savePreference("theme", "dark")
  Action->>Action: validate name and value
  Action->>Next: cookies().set("weather-theme", "dark")
  Next-->>Menu: re-rendered layout and page in one round trip
```

| Cookie            | Values                                         | Default                              |
| ----------------- | ---------------------------------------------- | ------------------------------------ |
| `weather-theme`   | `system`, `light`, `dark`                      | `system`                             |
| `weather-units`   | `metric`, `imperial`                           | `metric`                             |
| `weather-effects` | `auto`, `full`, `reduced`                      | `auto`                               |
| `weather-locale`  | `en`, `uk`, `de`, `es`, `fr`, `it`, `nl`, `pl` | The best match for `Accept-Language` |

- 🍪 Theme, units and effects are saved by the server action in `HttpOnly`, `SameSite=Lax` cookies, `Secure` when the page came over HTTPS, for a year. Next.js fills in `x-forwarded-proto` when no proxy sends it, so a plain `http://localhost` keeps its settings in browsers that refuse secure cookies there. Unknown names and values are ignored, so a crafted request cannot store anything else.
- 🌍 The language is the address. The language links in the settings point to the same place in another language and write `weather-locale` in the browser when clicked, so the next visit to an address without a language opens it. The proxy only reads the cookie to redirect; a shared `/de` link never changes it.
- 🖥️ `getPreferences()`, `currentLocale()`, `getLocalization()` and `getEffects()` are wrapped in React's `cache()`, so the layout, the page and the metadata read them once per request.
- 🎨 Because the server knows the theme, `<html data-theme>` is correct in the first byte: there is no inline theme script and no flash.
- ⚡ `getEffects()` resolves the effects level from the `weather-effects` cookie and the request's `User-Agent` (Auto means Full on Apple devices and Reduced elsewhere), writes it to `<html data-effects>` and tells the `Forecast` widget and the header whether `WeatherIcon` should load the animated or the still Meteocons. See [Design system](./design.md#-effects-and-performance).

## ⭐ Saved and recent places

Saved and recent places are browser-only state in `localStorage` (`weather/saved-places`, up to 12, and `weather/recent-places`, up to 5). `createStoredList()` in `shared/lib/storedList.ts` turns a key into an external store for `useSyncExternalStore`:

- 🛡️ every read goes through `parsePlace()`, so broken or edited storage falls back to an empty list;
- 🌍 a place keeps its `local_names` for the ten languages, and `placeName()` picks the one of the page;
- 👯 `isSamePlace()` treats places of one country within 25 km that share a name as one, so the list drops duplicates on read and the star recognises a city saved from another search or from the location button;
- 🔄 the `storage` event keeps tabs in sync;
- 🖥️ the server snapshot is always empty, so hydration never mismatches and the chips appear right after it;
- 🚫 blocked storage (private modes) simply disables the feature.

## 🕰️ The live clock

`LocalClock` subscribes to a 15-second interval through `useSyncExternalStore` and re-renders only when the minute changes. The server passes `generatedAt` as the initial snapshot, and `suppressHydrationWarning` absorbs the rare case where the minute changes between the server render and hydration.

## 🗺️ Component map

```text
LocaleLayout                 app/[locale]/layout.tsx, <html lang data-theme>
├── I18nProvider             The messages of the current language for client components
├── Header
│   ├── CitySearch           Combobox with suggestions from /api/places and recent places
│   ├── LocateButton         Geolocation → /{language}?lat=&lon=
│   └── SettingsMenu         Popover with theme, units and links to every language
├── main
│   └── Page
│       ├── SavedPlaces      Chips from localStorage
│       └── Suspense         Keyed by the location, ForecastSkeleton as fallback
│           └── Forecast     Async server widget
│               ├── JsonLd               WebSite, WebPage and Place
│               ├── Sky                  Fixed background for the condition
│               ├── CurrentConditions    Place, LocalClock, SavePlaceButton, temperature
│               ├── HourlyForecast
│               ├── DailyForecast        TemperatureRange per day
│               ├── SunPath              Sunrise, sunset and the arc of the day
│               ├── WindCard, AirQualityCard
│               └── Details              Humidity, DewPoint, Pressure, Visibility, Precipitation, CloudCover
├── Footer                   Author, version, credits and the source code
├── OfflineNotice            next/offline
└── ServiceWorker            Registers public/sw.js once the page has loaded
```

## 🛠️ Tooling decisions

- ⚛️ **React Compiler** is enabled with `reactCompiler: true`, so components are written without `useMemo` or `useCallback`. Unit tests run the plain source; the end-to-end tests and Lighthouse check the compiled build. Oxlint enables the matching rules (`purity`, `refs`, `immutability`, `set-state-in-effect` and others).
- 🔷 **TypeScript 7** checks the project with the native compiler; `next build` runs the project's own `tsc`, and Oxlint's type-aware rules use `oxlint-tsgolint`.
- 🧩 **Sass modules** keep styles next to their component. Turbopack resolves the `@/` alias inside `@use`, so every module imports tokens with `@use "@/shared/styles/mixins" as *`.
- 🤖 **No agent files.** `agentRules: false` keeps `next dev` from adding AI agent instruction files to the repository.
- 📜 **`src/instrumentation.ts`** logs every failed request through `onRequestError` with the digest the error screen shows as its reference, the route pattern, the method and the revalidation reason. It never logs the address or the cookies, because a forecast address can hold the visitor's coordinates.
- 📴 **Offline detection** uses the experimental `useOffline` flag of Next.js 16.3, which also retries navigations and server actions once the connection is back.
- 🛟 **A service worker of about fifty lines** in `public/sw.js` instead of a PWA library: it only answers page loads that fail without a network, with the prerendered `/offline/{locale}` page in the language of the address. It keeps nothing else, so it can never show an old forecast or hold back a new deployment.
- 🧭 **Global 404** uses the experimental `globalNotFound` flag, the recommended way to answer unmatched addresses when the root layout lives in a dynamic segment.
- 🛰️ **Configurable API address.** `OPENWEATHERMAP_API_URL` points the server at another OpenWeatherMap-compatible host; the end-to-end tests use it for their mock server.

> [!TIP]
> The documentation bundled with the installed Next.js version lives in `node_modules/next/dist/docs/`. It is the reference for APIs such as `next/root-params`, `global-not-found` and `proxy.ts`, which are newer than most tutorials.
