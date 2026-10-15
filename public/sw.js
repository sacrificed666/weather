// Shows a page of the site instead of a browser error when a page cannot load
const CACHE = "offline-v1";
const DAY = 24 * 60 * 60 * 1000;
const LOCALE = /^\/([a-z]{2})(?:\/|$)/u;

// The address of the offline page in a language
const pageOf = (locale) => `/offline/${locale}`;

// The language at the start of an address, or null
const localeOf = (url) => LOCALE.exec(new URL(url).pathname)?.[1] ?? null;

// Keeps the offline page of a language, refreshed at most once a day
const remember = async (locale) => {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(pageOf(locale));
  if (cached && Date.now() - Date.parse(cached.headers.get("date") ?? "") < DAY) return;
  await cache.add(pageOf(locale));
};

// The offline page in the language of the address, the browser or any kept one
const fallback = async (url) => {
  const cache = await caches.open(CACHE);
  const locales = [localeOf(url), self.navigator.language.slice(0, 2).toLowerCase()].filter(Boolean);
  const pages = await Promise.all(locales.map((locale) => cache.match(pageOf(locale))));
  const [first] = await cache.keys();
  return pages.find(Boolean) ?? (first && (await cache.match(first))) ?? Response.error();
};

// Takes over right away instead of waiting for every tab to close
self.addEventListener("install", () => self.skipWaiting());

// Drops older caches, starts page loads early and keeps the pages of open tabs
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      const old = names.filter((name) => name.startsWith("offline-") && name !== CACHE);
      await Promise.all(old.map((name) => caches.delete(name)));
      await self.registration.navigationPreload?.enable();
      await self.clients.claim();
      const tabs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const locales = new Set(tabs.map((tab) => localeOf(tab.url)).filter(Boolean));
      await Promise.allSettled([...locales].map(remember));
    })(),
  );
});

// Loads pages from the network, and the offline page without one
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    (async () => {
      try {
        const response = (await event.preloadResponse) ?? (await fetch(event.request));
        const locale = localeOf(event.request.url);
        if (locale) event.waitUntil(remember(locale).catch(() => {}));
        return response;
      } catch {
        return fallback(event.request.url);
      }
    })(),
  );
});
