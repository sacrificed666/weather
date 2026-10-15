# 🏁 Getting started

## 📋 Requirements

| Tool              | Version                                                                      |
| ----------------- | ---------------------------------------------------------------------------- |
| 🟢 Node.js        | **24 or newer**; `.nvmrc` pins `26`, the newest line                         |
| 📦 npm            | 11 or newer (ships with Node 24)                                             |
| 🔑 OpenWeatherMap | A free account and an [API key](https://home.openweathermap.org/api_keys)    |
| 🌐 Browser        | Chrome, Edge or Firefox 111+, Safari 16.4+ (the Next.js 16 browser baseline) |

If you use a version manager, run `nvm use` (or `fnm use`) in the project root.

## 🔑 Environment variables

The app reads these variables on the server:

| Variable                 | Required | Meaning                                                                                             |
| ------------------------ | -------- | --------------------------------------------------------------------------------------------------- |
| `OPENWEATHERMAP_API_KEY` | Required | Your OpenWeatherMap key. It is never sent to the browser                                            |
| `SITE_URL`               | Optional | The public address for canonical links, the sitemap and share cards, for example on a custom domain |
| `OPENWEATHERMAP_API_URL` | Optional | Another OpenWeatherMap-compatible host; the end-to-end tests point it at their mock server          |
| `APP_PORT`               | Optional | Docker only: the port on the host, 3000 by default and 3001 for staging                             |

```bash
cp .env.example .env
```

Paste the key into `.env`. Next.js loads `.env*` files automatically; every `.env*` file except `.env.example` is ignored by Git.

> [!NOTE]
> A brand-new key can take up to two hours to start working. Until then the app shows **The API key was rejected**. Without any key it shows **The weather service is not set up**.

> [!CAUTION]
> Never prefix the key with `NEXT_PUBLIC_`. That would inline it into the JavaScript every visitor downloads.

## 📦 Install and run

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>. It redirects to your browser's language, for example `/en`, and opens Lviv; `/en?city=Tokyo` and `/uk?lat=51.51&lon=-0.13` open any other place in any language.

> [!TIP]
> No key yet? Start the mock server from the end-to-end tests with `node e2e/openweather-api.ts` and run the app with `OPENWEATHERMAP_API_KEY=e2e-key OPENWEATHERMAP_API_URL=http://127.0.0.1:4020 npm run dev`. It knows Lviv, Kyiv, Reykjavik and Bangkok.

### 🐳 In Docker

```bash
docker compose -f compose.yaml -f docker/development.yaml up --watch
```

The same dev server runs in a container on port 3000 with the variables from `.env` (and `.env.local`, if present), and Compose Watch copies every change into it. Staging and production images are described in [Deployment](./deployment.md#-docker).

## 📜 npm scripts

| Script                  | What it does                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `npm run dev`           | 🔥 Starts the Next.js dev server with Turbopack and hot reload                               |
| `npm run build`         | 📦 Type-checks the project and builds the production bundle into `.next/`                    |
| `npm start`             | 👀 Serves the production build                                                               |
| `npm run typecheck`     | 🧠 Generates the route types and runs the TypeScript 7 compiler without emitting             |
| `npm run lint`          | 🧹 Lints with Oxlint, including type-aware, React Compiler, Next.js and a11y rules           |
| `npm run lint:fix`      | 🩹 Applies the automatic Oxlint fixes                                                        |
| `npm run lint:text`     | 🧾 Finds em and en dashes in every text file and says where they are                         |
| `npm run format`        | 🎨 Formats every supported file with Oxfmt                                                   |
| `npm run format:check`  | 🔎 Fails if a file is not formatted                                                          |
| `npm test`              | 👁️ Starts Vitest in watch mode                                                               |
| `npm run test:run`      | 🧪 Runs the whole test suite once                                                            |
| `npm run test:coverage` | 📊 Runs the tests with V8 coverage and enforces the coverage thresholds                      |
| `npm run test:e2e`      | 🎭 Builds the app against the mock API and runs Playwright, axe and Lighthouse               |
| `npm run icons`         | 🌦️ Copies the animated and the still Meteocons the app uses into `public/icons`              |
| `npm run check`         | ✅ Lint, the dash check, format check, type check and tests in one go, run it before pushing |

## 🛠️ make

Every common task has a short `make` command with a coloured summary of what it is doing:

| Command                                               | What it does                                                                                                                                                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make` or `make help`                                 | 📖 Every command, grouped by environment, with coloured **[DEV]**, **[STAGE]** and **[PROD]** tags                                                                                                                                                   |
| `make setup`                                          | 🧰 Installs the packages, creates `.env` from `.env.example`, installs Chromium and WebKit for the tests and turns on the Git hooks                                                                                                                  |
| `make env`                                            | 🔐 Creates the env file of `ENV` from `.env.example` if it is missing, never overwrites one. `make dev` does the same and keeps running; `make dev-up`, `make stage-up` and `make prod-up` create theirs and stop, so you can fill in the keys first |
| `make hooks`                                          | 🪝 Turns on the Git hooks in `.githooks/`: format, lint and dash checks of the staged files, and Conventional Commits for the message                                                                                                                |
| `make doctor`                                         | 🩺 Checks Node.js, npm, Docker, the packages and the env file                                                                                                                                                                                        |
| `make dev`                                            | 🚀 Starts the dev server                                                                                                                                                                                                                             |
| `make dev-mock`                                       | 🧪 Starts the dev server against the mock OpenWeatherMap API, so no key is needed                                                                                                                                                                    |
| `make check` / `make ci`                              | ✅ The checks before pushing / everything CI runs: registry signatures, the changelog, the checks with coverage, the build with its report and the end-to-end tests                                                                                  |
| `make e2e-chromium` · `make e2e-webkit`               | 🎭 The two end-to-end jobs of CI: Chromium with the visual tests and Lighthouse, or WebKit                                                                                                                                                           |
| `make fix`                                            | 🪄 Applies the lint fixes and formats every file                                                                                                                                                                                                     |
| `make dev-up` · `make stage-up` · `make prod-up`      | 🐳 Starts an environment in Docker: development with hot reload, staging and production in the background                                                                                                                                            |
| `make stage-logs` · `make prod-ps` · `make dev-shell` | 📜 Every environment has the same commands: `up`, `down`, `restart`, `logs`, `ps`, `shell`, `open` and `clean`                                                                                                                                       |
| `make status`                                         | 🚦 Shows which environments are running                                                                                                                                                                                                              |
| `make up ENV=…`                                       | 🐳 The same commands for any `ENV`, handy in scripts; production asks before `down`, `restart` and `clean` unless `YES=1`                                                                                                                            |
| `make shared`                                         | 🔗 Compares the files shared with the other two apps when they are checked out next to this one                                                                                                                                                      |
| `make shared-sync`                                    | 🔁 Copies the shared files of this app over the other two after you changed one of them here                                                                                                                                                         |
| `make live` · `make live-lighthouse`                  | 📡 The checks of the monitor against the live site, or the address in `MONITOR_URL`                                                                                                                                                                  |
| `make screenshots`                                    | 📸 Takes the README pictures again from a running app, see [Contributing](./contributing.md#-readme-pictures)                                                                                                                                        |
| `make clean` · `make reset`                           | 🧹 Removes build output and reports / also reinstalls the packages                                                                                                                                                                                   |

> [!NOTE]
> The Makefile needs GNU Make and Bash, which macOS and Linux ship with; on Windows use WSL or the npm scripts above. Colours switch off in pipes and with `NO_COLOR=1`.

## 🗂️ Project layout

```text
weather/
├── .github/
│   ├── ISSUE_TEMPLATE/              Bug report and feature request forms
│   ├── workflows/ci.yml             CI: verify, build with a report, end-to-end tests, Docker image, dependency review
│   ├── workflows/codeql.yml         CodeQL code scanning
│   ├── workflows/release.yml        GitHub release for every version tag
│   ├── dependabot.yml               Weekly npm, GitHub Actions and Docker updates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── SECURITY.md                  How to report vulnerabilities
├── docker/                          Multi-stage Dockerfile and the development, staging and production overlays
├── docs/                            This documentation and its screenshots
├── e2e/                             Playwright specs and the mock OpenWeatherMap API
├── lint/comments.js                 Custom Oxlint rule that keeps comments to one short line
├── public/icons/                    The animated and the still Meteocons the app shows, served as static files
├── scripts/                         Icon sync, README pictures, release notes, the CI coverage summary and the build report
├── src/
│   ├── proxy.ts                     Language redirects, per-request nonce and Content Security Policy
│   ├── app/
│   │   ├── [locale]/                The localized root layout, the forecast page, errors and share cards
│   │   ├── api/places/              Search suggestions for the combobox
│   │   ├── flags/[code]/            Prerendered country flags
│   │   └── …                        Global 404 and error, icons, manifest, sitemap, robots, global styles
│   ├── widgets/                     Header, Footer and the Forecast dashboard
│   ├── features/
│   │   ├── forecast/                OpenWeatherMap orchestration, normalization, conditions; every forecast card
│   │   ├── places/                  Places, locations in the URL, geocoding, saved and recent places; search, locate, star
│   │   ├── settings/                Theme, units and effects in cookies, the route language, the server action; the settings panel and offline notice
│   │   ├── i18n/                    Ten message catalogs, locale matching, path helpers, the translator and its provider
│   │   └── seo/                     Canonical links, social metadata, JSON-LD and the share card assets
│   ├── shared/
│   │   ├── api/                     The OpenWeatherMap HTTP client (server only)
│   │   ├── assets/fonts/            Montserrat for the share cards, under the SIL Open Font License
│   │   ├── lib/                     Formatting, units, time, guards, rate limiting, stored lists, CSP, the public address
│   │   ├── ui/                      Logo, Icon, IconButton, Card, SegmentedControl, Skeleton, WeatherIcon, Flag
│   │   └── styles/                  Design tokens, skies, mixins and the dashboard grid
│   └── test/                        Test setup, fixtures and render helpers
├── CHANGELOG.md                     Every release, newest first
├── Makefile                         make help, setup, dev, checks and Docker commands
├── compose.yaml                     The Docker Compose service shared by every environment
├── next.config.ts                   React Compiler, security headers and experiments
├── playwright.config.ts             Browsers, the mock API and the production server for end-to-end tests
├── vercel.json                      Runs the server functions in Frankfurt
├── vitest.config.ts                 Test environment, aliases and coverage thresholds
├── .dockerignore                    Keeps dependencies, build output and secrets out of the image
├── .oxlintrc.json                   Lint rules and layer boundaries
└── .oxfmtrc.json                    Formatting rules
```

Every feature has a `model/` folder for data and logic and, when it renders something, a `ui/` folder with one folder per component, for example `features/forecast/ui/WindCard/WindCard.tsx` and `WindCard.module.scss`. Tests sit next to the code they cover as `*.test.ts(x)`. The layers and their rules are explained in [Architecture](./architecture.md#-layers).

## 💻 Editor setup

Editor settings are not committed. For the best experience in VS Code, install:

- 🦀 **Oxc**: inline Oxlint diagnostics and Oxfmt formatting on save
- ⚡ **Vitest**: run and debug tests from the editor
- 🎭 **Playwright Test for VS Code**: run end-to-end tests and record locators
- 📝 **EditorConfig**: consistent whitespace settings (`.editorconfig` is part of the repository)

## 👉 Next steps

- ✨ Learn what the app can do in [Features](./features.md).
- 🏗️ Understand how a request becomes a forecast in [Architecture](./architecture.md).
- 🌦️ See how OpenWeatherMap data is fetched and cleaned up in [Weather data](./weather-data.md).
- 🧪 Run the whole suite as described in [Testing](./testing.md).
