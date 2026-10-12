# 🔎 SEO

Every forecast is a real page with its own address in every language, a descriptive title, share cards and structured data, so a link to `/uk?city=Kyiv` looks right in a search result, a chat or a social feed.

## 🏷️ Metadata

| Field                    | Forecast                                                  | Unknown city or missing page   |
| ------------------------ | --------------------------------------------------------- | ------------------------------ |
| 🏷️ Title                 | `Kyiv: hourly and daily forecast · Weather`               | `City not found · Weather`     |
| 📝 Description           | The city, the temperature and sky now, what the app shows | The app description            |
| 🔗 Canonical             | `/en?lat=50.45&lon=30.52`, or `/en` for the default city  | none                           |
| 🌐 Alternates            | All ten languages and `x-default`                         | none                           |
| 🖼️ Open Graph and X card | The share card of the language, `summary_large_image`     | The share card of the language |
| 🤖 Robots                | `index, follow`, large image previews                     | `noindex, follow`              |

The home page is titled `Weather · Forecast for any city in the world` (`homeTitle()`). Titles never contain the current temperature: a title that changes every hour looks unstable to search engines and in bookmarks, so the weather right now goes into the description instead (`describeForecast()`).

The defaults live in `src/app/[locale]/layout.tsx`, the forecast's metadata in `src/app/[locale]/page.tsx`. Both build their Open Graph and X fields through `social()` in `src/features/seo/model/seo.ts`, so the site name, the language, the alternate languages and the large card are never lost when a page overrides the title. `metadataBase` makes every URL absolute.

> [!IMPORTANT]
> Next.js applies `title.template` only to **child** segments, not to a page in the same folder as the layout. The forecast and the 404 page therefore set `title: { absolute }` through `documentTitle()`, which appends the app name itself.

## 🔗 One address per forecast

| Address                          | Canonical                                   | Why                                                     |
| -------------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| `/uk?city=Kyiv`, `/uk?city=kyiv` | `/uk?lat=50.45&lon=30.52`                   | Names are ambiguous and change case; coordinates do not |
| `/uk?lat=50.4501&lon=30.5234`    | `/uk?lat=50.45&lon=30.52`                   | Coordinates are rounded to about a kilometre            |
| `/uk?lat=49.84&lon=24.03`        | `/uk`                                       | The default city is the home page                       |
| `/UK?city=Kyiv`                  | redirects (`308`) to `/uk?city=Kyiv`        | Languages are lowercase                                 |
| `/?city=Kyiv`                    | redirects (`307`) to the visitor's language | `x-default` for people without a language in the link   |

`forecastSearch()` in `features/places/model/location.ts` builds the query part of the canonical link from the resolved place, so a search, a saved place and the location button all point to the same canonical address.

## 🏙️ Popular cities

Below the forecast the home page links to ten capitals, one for every language of the app (London, Kyiv, Prague, Berlin, Madrid, Paris, Rome, Amsterdam, Warsaw and Lisbon), named in the language of the page. They give search engines and visitors a way into real forecast pages beyond the default city. The list lives in `features/places/model/popular.ts` and is rendered by `PopularPlaces`; the open city is marked with `aria-current="page"`.

## 🌍 Languages

Each language version is a separate page with its own address, title, description and card, see [Localization](./i18n.md).

- 🔗 `<link rel="canonical">` points to the page in its own language.
- 🌐 `<link rel="alternate" hreflang>` lists all ten versions, and `x-default` points to the address without a language, which redirects by cookie or browser language.
- 🏷️ `og:locale` names the language (`uk_UA`), `og:locale:alternate` the other nine.
- 📄 `<html lang>` matches the address, also on the 404 page.

## 🌍 The public address

`siteUrl()` in `src/shared/lib/site.ts` decides the base for every absolute URL:

1. 🌍 `SITE_URL`, when it is set.
2. ▲ `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel sets to the shortest custom domain of the project, `weather.sacrificed.me`, or to the `vercel.app` address before a domain is added.
3. 💻 `http://localhost:<PORT>` for local development.

> [!WARNING]
> `/sitemap.xml` and `/robots.txt` are prerendered during `next build`. Set `SITE_URL` before building on a custom domain, otherwise they keep the address that was known at build time.

## 🖼️ Share cards

`src/app/[locale]/opengraph-image.tsx` draws one 1200 × 630 card per language at build time with `ImageResponse` from `next/og`: the app icon, the name and the description of the app on a sky gradient. The card uses Montserrat from `src/shared/assets/fonts` in the Latin, Latin Extended and Cyrillic subsets, so Ukrainian, Czech and Polish render correctly, and has a translated `alt` text.

> [!NOTE]
> `next/og` reads TTF, OTF and WOFF fonts, but not WOFF2. That is why the share cards use their own WOFF files instead of the WOFF2 files that `next/font` serves to the interface.

## 🗺️ Sitemap and robots

- 🗺️ `/sitemap.xml` lists the home page and the ten popular cities in all ten languages, 110 addresses, each with its `hreflang` alternates. Next.js writes sitemap URLs into the XML as they are, so `sitemap.ts` escapes the `&` between `lat` and `lon` as `&amp;` itself.
- 🤖 `/robots.txt` allows everything except `/api/` and points to the sitemap.
- 🙈 On Vercel preview deployments (`VERCEL_ENV=preview`) robots disallow everything and every page is marked `noindex`, so previews never compete with the real site (`isIndexable()` in `site.ts`).

## 🧩 Structured data

Every forecast includes JSON-LD in its language (`inLanguage`), rendered by `JsonLd` from `features/seo/ui`:

| Type         | Content                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| 🌐 `WebSite` | Name, description and author                                                                                       |
| 📄 `WebPage` | The canonical URL, title, description, language, the time of the forecast as `dateModified`                        |
| 📍 `Place`   | The city as the page's `about`, with `GeoCoordinates` and a `PostalAddress` with the country and region when known |

There is no `SearchAction`: Google retired the sitelinks search box in 2024, so the markup would only add weight.

`serializeJsonLd()` escapes every `<` as `<`, so a city name can never close the script tag.

> [!TIP]
> Validate changes with the [Rich Results Test](https://search.google.com/test/rich-results) or the [Schema Markup Validator](https://validator.schema.org/), and check share cards with the preview of the network you post to.

## 🚫 Pages that should not rank

- 🔎 A search without a match (`/en?city=Atlantis`) and broken coordinates show **City not found** with `noindex, follow`.
- 🚧 A failing weather service shows its error with `noindex, follow`, so a temporary problem never replaces a forecast in the index.
- 🧭 Unknown addresses answer with a real **404** status and a translated page marked `noindex`.

## ⚡ Page experience

- 📄 The page shell, the header and the search are server-rendered HTML; the forecast streams in as soon as the weather arrives.
- 🔤 Montserrat is self-hosted and every script subset is downloaded only when a character needs it.
- 🖼️ Every image has explicit `width` and `height`, and charts are SVG drawn on the server, so nothing shifts when the page loads.
- 🧭 `manifest.webmanifest`, an SVG icon, an Apple touch icon and theme colours for light and dark mode are generated from `src/app`.
- 🚦 A Lighthouse budget in CI keeps performance, accessibility, best practices and SEO in check, see [Testing](./testing.md#-lighthouse-budget).
