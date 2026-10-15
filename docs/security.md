# 🛡️ Security

Weather is a small Next.js server with no accounts and no database. Its valuable asset is the **OpenWeatherMap API key**, and its attack surface is what reaches the server: URL parameters, the search endpoint, the preference cookies, and the data returned by OpenWeatherMap.

To report a vulnerability, follow the [security policy](../.github/SECURITY.md).

## 🗺️ Trust boundaries

```mermaid
flowchart LR
  subgraph Browser["🌐 Browser"]
    URL["URL parameters<br/>city, lat, lon"]
    Search["/api/places?q="]
    Cookies[(Preference cookies)]
    Storage[(localStorage<br/>saved and recent places)]
  end

  subgraph Server["🖥️ Next.js server"]
    Parse["parseLocation()<br/>lengths and ranges"]
    Limit["Same-origin check<br/>30 searches / minute"]
    Prefs["isPreferenceValue()"]
    Client["fetchOpenWeather()<br/>server-only, key from env"]
    Normalize["normalize.ts<br/>guards, clamps"]
  end

  OWM["☁️ OpenWeatherMap"]

  URL --> Parse --> Client
  Search --> Limit --> Client
  Cookies --> Prefs
  Client --> OWM
  OWM --> Normalize
  Storage -. "parsePlace()" .-> Browser
```

## 🔑 The API key

- 🖥️ The key is read from `process.env.OPENWEATHERMAP_API_KEY` in `shared/api/openWeather.ts`, which imports `server-only`. Importing it from a client component breaks the build, and the variable has no `NEXT_PUBLIC_` prefix, so Next.js never inlines it into JavaScript.
- 🚫 The browser never calls OpenWeatherMap; responses are rendered on the server or passed through `/api/places` without the key.
- 🗃️ Responses are cached for 10 minutes (weather), 30 minutes (air quality) and 7 days (geocoding), which keeps the number of calls per key low even with many visitors.

## 🧱 Content Security Policy

`src/proxy.ts` runs for every page request with a language in its address, creates a random **nonce** and sends this policy (built by `shared/lib/contentSecurityPolicy.ts`):

| Directive                                               | Value                               | Why                                                                          |
| ------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------- |
| `default-src`                                           | `'self'`                            | 🔒 Nothing is loaded from other origins                                      |
| `script-src`                                            | `'self' 'nonce-…' 'strict-dynamic'` | 🚫 Only Next.js's own scripts, which receive the nonce automatically         |
| `style-src`                                             | `'self' 'nonce-…'`                  | 🎨 Only the bundled stylesheets and Next.js's nonced styles                  |
| `style-src-attr`                                        | `'unsafe-inline'`                   | 🧩 React's streaming briefly hides SVG fragments with `style="display:none"` |
| `img-src`                                               | `'self' data: blob:`                | 🖼️ Meteocons, flags and icons are served by the app itself                   |
| `font-src`, `connect-src`, `manifest-src`, `worker-src` | `'self'`                            | 📡 Only the app's own files and endpoints                                    |
| `object-src`                                            | `'none'`                            | 🧩 No plugins                                                                |
| `base-uri`, `form-action`                               | `'self'`                            | 🧭 No base tag or form hijacking                                             |
| `frame-ancestors`                                       | `'none'`                            | 🪟 The app cannot be framed                                                  |

The development server additionally allows `'unsafe-eval'` and inline styles, which React's debugging and hot reload need. Nonces require dynamic rendering, which the page uses anyway because it depends on cookies and the URL.

The app has no inline scripts of its own: the theme is known on the server from the cookie, so there is no theme script to allow. The JSON-LD block is a `<script type="application/ld+json">`, a data block that browsers never execute, so the policy does not apply to it.

> [!IMPORTANT]
> Keep `script-src` free of `'unsafe-inline'` and `'unsafe-eval'` in production. If a feature seems to need either, it is the feature that has to change.

> [!NOTE]
> The offline page at `/offline/{locale}` has a policy of its own: `default-src 'none'` with the SHA-256 hashes of its one style block and its one script, which reloads the page when the connection returns. It loads nothing and can run nothing else, so the service worker can show it without any other file.

## 📨 Other headers

`next.config.ts` adds to every response:

| Header                       | Value                                                                 |
| ---------------------------- | --------------------------------------------------------------------- |
| `X-Content-Type-Options`     | `nosniff`                                                             |
| `X-Frame-Options`            | `DENY`                                                                |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                                     |
| `Permissions-Policy`         | camera, microphone, payment and USB off; geolocation for the app only |
| `Cross-Origin-Opener-Policy` | `same-origin`                                                         |
| `Strict-Transport-Security`  | Two years, in production                                              |

Icons and flags additionally get `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`, so an SVG opened on its own cannot run anything, and a week of browser cache. API responses are sent with `Cache-Control: no-store`. The `X-Powered-By` header is off.

`scripts/build-report.mjs` fails the CI build when one of these headers or the proxy disappears, and `e2e/security.spec.ts` checks them on the running server, together with a fresh nonce for every request and the absence of console errors and `securitypolicyviolation` events while the app is used.

## 🔎 The search endpoint

`GET /api/places?q=` is the only endpoint that reaches OpenWeatherMap on demand, so it is guarded:

- 🌐 Requests whose `Sec-Fetch-Site` is not `same-origin` are rejected with `403`, so other websites cannot use the app as a free geocoding proxy from their visitors' browsers.
- 📏 Queries shorter than two characters return no places without a call; longer than 80 characters are rejected with `400`.
- 🚦 Each client address may search 30 times a minute (`createRateLimiter()`), then gets `429` with `Retry-After: 60`. The address comes from `X-Forwarded-For` or `X-Real-IP`, so run the app behind a proxy that sets them; the limiter keeps at most 10,000 addresses in memory: it forgets expired ones first and then the oldest, so a flood of new addresses can never grow the map.
- 🧼 Results go through `parsePlace()` before they are returned.

> [!WARNING]
> The limiter lives in the memory of one server process. A single Docker container counts every search, but Vercel runs several instances side by side and starts new ones, so there each instance counts on its own and the limit is a soft one. For a hard limit, add a rate limiting rule for `/api/places` in the Vercel Firewall, see [Deployment](./deployment.md#-vercel).

## ✅ Input validation

| Input                  | Protection                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| 🧭 Language segment    | Must be one of the ten languages; anything else is redirected or answered with a 404             |
| 🔗 `?lat=&lon=`        | Must both be numbers within ±90 and ±180; rounded to two decimals                                |
| 🔗 `?city=`            | Trimmed, at most 80 characters; sent to OpenWeatherMap as a URL parameter, never interpolated    |
| 🍪 Cookies             | Each value is checked against its allowed list; anything else falls back to the default          |
| ⚡ Server action       | `savePreference()` checks the name with `Object.hasOwn` and the value with `isPreferenceValue()` |
| ☁️ OpenWeatherMap JSON | Read field by field with type guards; numbers must be finite, ranges are clamped                 |
| 💾 `localStorage`      | Parsed with `JSON.parse` in a `try`, every entry rebuilt by `parsePlace()`, lists capped         |

React escapes every string it renders. The only `dangerouslySetInnerHTML` is the JSON-LD block, and `serializeJsonLd()` escapes every `<` as `\u003c` first, so a city name such as `</script><script>…` stays inside the JSON. City names and condition descriptions from OpenWeatherMap are otherwise plain text.

> [!CAUTION]
> Never pass anything but the output of `serializeJsonLd()` to `dangerouslySetInnerHTML`. `JSON.stringify()` alone does not escape `<`, and a string from OpenWeatherMap could end the script tag.

## 🍪 Cookies and privacy

- The theme, units and effects cookies are written by the server action: `HttpOnly`, `SameSite=Lax`, `Secure` when the request came over HTTPS (a proxy in front of a Docker image should send `X-Forwarded-Proto: https`). The language cookie is written by the language links in the browser with `SameSite=Lax` (and `Secure` over HTTPS), because it only tells the proxy where to redirect. Each contains one value from a fixed list, and anything else is ignored.
- Saved and recent places never leave the browser.
- Your position is rounded to about a kilometre before it becomes part of the URL, and the app asks for it only when you press **Use my location**.
- There are no analytics, no third-party scripts and no requests from the browser to other origins.

## 🔗 Supply chain and CI

- 📦 `npm ci` installs exactly what `package-lock.json` describes, and `npm audit signatures` verifies registry signatures and provenance.
- 🛡️ The dependency review action blocks pull requests that add dependencies with high-severity advisories.
- 🔬 CodeQL scans the TypeScript code and the workflows with the `security-extended` queries on every push, pull request and weekly.
- 🔐 Workflows run with a read-only token and do not persist credentials.
- 🤖 Dependabot proposes npm, GitHub Actions and Docker updates every Monday.
- ⏳ Dependabot waits before it proposes a new version: 3 days for npm patches, 7 for minor and 14 for major releases, and 7 days for actions and Docker images, so a compromised release is usually pulled before it reaches the project.
- 🏷️ Every release publishes its Docker image to GitHub Packages with SLSA provenance (`mode=max`) and an SBOM attached by BuildKit, so anyone can check how and from what the image was built.
- 📮 `/.well-known/security.txt` (RFC 9116) points to private advisories with an expiry one year after each request, and the monitor checks that it stays valid.
- 📌 Every GitHub Action is pinned to a full commit SHA with its version in a comment, and the Docker base images are pinned by digest, so a moved tag can never change what runs; Dependabot updates both.
- 🐳 Docker images run as the unprivileged `node` user, `.dockerignore` keeps every `.env*` file out of the build context, and the environment file reaches the build only as a BuildKit secret, so the key never lands in an image layer. Staging and production drop every Linux capability, forbid privilege escalation and get memory, CPU and process limits.

## ☑️ Checklist for contributors

- [ ] Keep anything that needs the API key in server-only modules.
- [ ] Route every new input through a parser that checks types, lengths and ranges.
- [ ] Do not add requests from the browser to other origins; serve assets from the app.
- [ ] Never render HTML strings; keep `script-src` free of `'unsafe-inline'`.
- [ ] Run `npm run test:e2e`; the security spec fails on any console error or Content Security Policy violation.
