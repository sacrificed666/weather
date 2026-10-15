import type { Metadata } from "next";

import type { Forecast } from "@/features/forecast/model/types";
import { homeHref, LOCALE_INFO, LOCALES, type Locale } from "@/shared/i18n/locales";
import type { Translate } from "@/shared/i18n/translate";
import type { Formatter } from "@/shared/lib/format";
import { SITE } from "@/shared/lib/site";

export type Schema = Readonly<Record<string, unknown>>;

export interface Alternates {
  canonical: string;
  languages: Record<string, string>;
}

export interface SocialPage {
  title: string;
  description: string;
  url?: string;
}

export interface PageDescription {
  title: string;
  description: string;
}

// A page title that ends with the app name
export const documentTitle = (title: string, t: Translate) => ({ absolute: `${title} · ${t("app.name")}` });

// Canonical and hreflang links of a page in every language
export const alternates = (locale: Locale, search = ""): Alternates => ({
  canonical: `${homeHref(locale)}${search}`,
  languages: {
    ...Object.fromEntries(LOCALES.map((entry) => [entry, `${homeHref(entry)}${search}`])),
    "x-default": `/${search}`,
  },
});

// Open Graph and Twitter metadata of a page
export const social = (locale: Locale, t: Translate, page: SocialPage): Pick<Metadata, "openGraph" | "twitter"> => ({
  openGraph: {
    type: "website",
    siteName: t("app.name"),
    locale: LOCALE_INFO[locale].openGraph,
    alternateLocale: LOCALES.filter((entry) => entry !== locale).map((entry) => LOCALE_INFO[entry].openGraph),
    title: page.title,
    description: page.description,
    ...(page.url === undefined ? {} : { url: page.url }),
  },
  twitter: { card: "summary_large_image", title: page.title, description: page.description },
});

// The title of the home page: the app and what it offers
export const homeTitle = (t: Translate) => `${t("app.name")} · ${t("app.tagline")}`;

// A stable title for search results and a description with the weather right now
export const describeForecast = ({ place, current }: Forecast, t: Translate, format: Formatter): PageDescription => {
  const summary = `${format.temperature(current.temperature)} · ${format.sentence(current.condition.description)}`;
  return {
    title: t("seo.placeTitle", { place: place.name }),
    description: `${place.name}: ${summary}. ${t("app.description")}`,
  };
};

// JSON-LD that cannot close the script tag it sits in
export const serializeJsonLd = (data: Schema) => JSON.stringify(data).replaceAll("<", "\\u003c");

// The schema.org id of the site in a language
const websiteId = (base: URL, locale: Locale) => new URL(`${homeHref(locale)}#website`, base).href;

// The site as a schema.org WebSite
const website = (base: URL, locale: Locale, t: Translate): Schema => {
  const home = new URL(homeHref(locale), base).href;
  return {
    "@type": "WebSite",
    "@id": websiteId(base, locale),
    name: t("app.name"),
    url: home,
    description: t("app.description"),
    inLanguage: locale,
    author: { "@type": "Person", name: SITE.author.name, url: SITE.author.url },
  };
};

// A place as a schema.org Place with coordinates
const place = ({ name, region, country, latitude, longitude }: Forecast["place"]): Schema => ({
  "@type": "Place",
  name,
  ...(country === null
    ? {}
    : {
        address: {
          "@type": "PostalAddress",
          addressCountry: country,
          ...(region === null ? {} : { addressRegion: region }),
        },
      }),
  geo: { "@type": "GeoCoordinates", latitude, longitude },
});

// Structured data of a forecast page
export const forecastSchema = (
  forecast: Forecast,
  page: PageDescription & { path: string },
  base: URL,
  locale: Locale,
  t: Translate,
): Schema => {
  const url = new URL(page.path, base).href;
  return {
    "@context": "https://schema.org",
    "@graph": [
      website(base, locale, t),
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: page.title,
        description: page.description,
        inLanguage: locale,
        dateModified: new Date(forecast.generatedAt * 1000).toISOString(),
        isPartOf: { "@id": websiteId(base, locale) },
        about: place(forecast.place),
      },
    ],
  };
};
