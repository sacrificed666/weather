import type { MetadataRoute } from "next";

import { placeSearch } from "@/features/places/model/place";
import { POPULAR_PLACES } from "@/features/places/model/popular";
import { alternates } from "@/features/seo/model/seo";
import { homeHref, LOCALES } from "@/shared/i18n/locales";
import { siteUrl } from "@/shared/lib/site";

// An absolute address escaped for XML, which Next.js leaves to the app
const xmlUrl = (href: string, base: URL) => new URL(href, base).href.replaceAll("&", "&amp;");

// One entry per language for an address, each linking the other languages
const localized = (search: string, base: URL, priority: number): MetadataRoute.Sitemap => {
  const languages = Object.fromEntries(
    Object.entries(alternates("en", search).languages).map(([language, href]) => [language, xmlUrl(href, base)]),
  );
  return LOCALES.map((locale) => ({
    url: xmlUrl(`${homeHref(locale)}${search}`, base),
    changeFrequency: "hourly",
    priority,
    alternates: { languages },
  }));
};

// Sitemap with the home page and the popular cities in every language
const sitemap = (): MetadataRoute.Sitemap => {
  const base = siteUrl();
  return [...localized("", base, 1), ...POPULAR_PLACES.flatMap((place) => localized(placeSearch(place), base, 0.8))];
};

export default sitemap;
