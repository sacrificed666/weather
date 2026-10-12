export const LOCALES = ["en", "uk", "cs", "de", "es", "fr", "it", "nl", "pl", "pt"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "weather-locale";

export const LOCALE_HEADER = "x-weather-locale";

export interface LocaleInfo {
  name: string;
  intl: string;
  flag: string;
  openGraph: string;
  openWeather: string;
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  en: { name: "English", intl: "en-GB", flag: "GB", openGraph: "en_GB", openWeather: "en" },
  uk: { name: "Українська", intl: "uk-UA", flag: "UA", openGraph: "uk_UA", openWeather: "uk" },
  cs: { name: "Čeština", intl: "cs-CZ", flag: "CZ", openGraph: "cs_CZ", openWeather: "cz" },
  de: { name: "Deutsch", intl: "de-DE", flag: "DE", openGraph: "de_DE", openWeather: "de" },
  es: { name: "Español", intl: "es-ES", flag: "ES", openGraph: "es_ES", openWeather: "es" },
  fr: { name: "Français", intl: "fr-FR", flag: "FR", openGraph: "fr_FR", openWeather: "fr" },
  it: { name: "Italiano", intl: "it-IT", flag: "IT", openGraph: "it_IT", openWeather: "it" },
  nl: { name: "Nederlands", intl: "nl-NL", flag: "NL", openGraph: "nl_NL", openWeather: "nl" },
  pl: { name: "Polski", intl: "pl-PL", flag: "PL", openGraph: "pl_PL", openWeather: "pl" },
  pt: { name: "Português", intl: "pt-PT", flag: "PT", openGraph: "pt_PT", openWeather: "pt" },
};

// Whether a value is a supported language
export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

// The home page in a language
export const homeHref = (locale: Locale): `/${Locale}` => `/${locale}`;

// The language an address starts with, or the default one
export const localeFromPath = (pathname: string): Locale => {
  const [, first] = pathname.split("/");
  return isLocale(first) ? first : DEFAULT_LOCALE;
};

// The same address in another language
export const switchLocale = (pathname: string, locale: Locale) => {
  const [, first = "", ...rest] = pathname.split("/");
  const tail = isLocale(first) ? rest : [first, ...rest];
  return ["", locale, ...tail.filter(Boolean)].join("/");
};

interface WeightedLanguage {
  language: string;
  weight: number;
}

// Languages of an Accept-Language header with their weights
const parseAcceptLanguage = (header: string): WeightedLanguage[] =>
  header
    .split(",")
    .map((part) => {
      const [tag = "", ...parameters] = part.trim().split(";");
      const quality = parameters.map((parameter) => parameter.trim()).find((parameter) => parameter.startsWith("q="));
      const weight = quality ? Number.parseFloat(quality.slice(2)) : 1;
      return { language: tag.trim().toLowerCase().split("-")[0] ?? "", weight: Number.isFinite(weight) ? weight : 0 };
    })
    .filter((entry) => entry.language !== "" && entry.weight > 0)
    .toSorted((a, b) => b.weight - a.weight);

// The best supported language for an Accept-Language header
export const negotiateLocale = (acceptLanguage: string | null | undefined): Locale => {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const match = parseAcceptLanguage(acceptLanguage).find((entry) => isLocale(entry.language));
  return match && isLocale(match.language) ? match.language : DEFAULT_LOCALE;
};
