# 📜 Changelog

All notable changes to Weather are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). How versions are cut is described in [docs/releases.md](./docs/releases.md).

## [Unreleased]

### Changed

- 🔗 Finance shares the common files too: `make shared`, `make shared-sync` and the weekly check cover all four apps, and the live check also reads a health check with a query, such as `/healthz?db=1`.

## [1.0.0] - 2026-10-15

The first release.

### Added

- 🌤️ Current weather with today's high and low, the apparent temperature and the city's own clock.
- 🕒 The next 24 hours in three-hour steps and up to seven days with temperature bars on one shared scale, built from the free 5-day forecast when the API key has no daily plan.
- 📊 A compact dashboard on one grid without empty corners: the current weather with the apparent temperature, the week beside it, the sun's path, wind and air quality in one row, and six even tiles for humidity, dew point, pressure, visibility, precipitation and cloud cover, each with a word that rates the number and a bar on its scale.
- 🔎 City search with suggestions in any language, recent searches, full keyboard control and **Use my location**.
- ⭐ Up to 12 saved places, named in the language of the page, never saved twice, kept in the browser and in sync between tabs.
- 🌌 A sky behind the cards that follows the weather, the time of day and the theme.
- ⚙️ Light, dark and automatic themes, metric and imperial units, and full or reduced effects (reduced by default outside Apple devices), all rendered by the server without a flash.
- 🌍 Ten languages under their own addresses: English, Ukrainian, Czech, German, Spanish, French, Italian, Dutch, Polish and Portuguese, with French no-break spaces and an error page in the language of the address even when the layout fails.
- ♿ WCAG 2.2 AA support: landmarks, a skip link, live regions, a real combobox, reflow down to 320 px, and support for reduced motion, reduced transparency, more contrast and forced colours.
- 🏙️ Links to ten popular capitals on the home page, named in the language of the page.
- 🔎 Stable titles, canonical and `hreflang` links, a share card per language, a sitemap with the popular cities, robots rules and JSON-LD for every forecast.
- 📱 An installable web app with PNG and maskable icons, a browser bar that follows the theme and a notice when the connection drops.
- 🖨️ A printed forecast in dark text on white in any theme, without the controls.
- 📴 A page of its own in every language when a page cannot load offline, which reloads itself once the connection is back.
- 🛡️ A nonce-based Content Security Policy, a server-only API key, validated input and a rate-limited search endpoint.
- 🧪 Unit tests, end-to-end tests against a mock OpenWeatherMap API in Chrome and Safari's WebKit, visual tests, axe checks and a Lighthouse budget in CI.
- 📜 Server logs for a rejected key, a full quota or an unreachable OpenWeatherMap, never with the key, one calm line for a key without the daily forecast and every failed request with the reference the error screen shows; a setting that cannot be saved falls back to the saved one.
- ▲ Vercel deployments with the server functions in Frankfurt, close to the visitors in Europe.
- 🐳 Docker images for development, staging and production: a multi-stage Dockerfile, a Compose overlay per environment, a non-root standalone server without Linux capabilities and with resource limits, environment files passed to the build as secrets and a `/healthz` endpoint for health checks; every release also publishes the production image to GitHub Packages for amd64 and arm64 with provenance and an SBOM.
- 📡 A `security.txt` for private reports and a monitor that checks the live site every hour and its Lighthouse scores every week.
- 🪝 Git hooks and CI checks for formatting, one-line comments, em and en dashes, Conventional Commits and pull request titles.
- 🛠️ A Makefile with a coloured, grouped `make help`: setup that creates `.env` from `.env.example`, the dev server, checks, end-to-end tests, every Docker environment and a sync of the files the three apps share.

[Unreleased]: https://github.com/sacrificed666/weather/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/sacrificed666/weather/releases/tag/v1.0.0
