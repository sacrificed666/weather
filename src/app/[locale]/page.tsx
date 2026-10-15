import type { Metadata } from "next";
import { Suspense } from "react";

import { getForecast } from "@/features/forecast/model/getForecast";
import ForecastSkeleton from "@/features/forecast/ui/ForecastSkeleton/ForecastSkeleton";
import { forecastSearch, isDefaultLocation, locationKey, parseLocation } from "@/features/places/model/location";
import { placeKey } from "@/features/places/model/place";
import PopularPlaces from "@/features/places/ui/PopularPlaces/PopularPlaces";
import SavedPlaces from "@/features/places/ui/SavedPlaces/SavedPlaces";
import { alternates, describeForecast, documentTitle, homeTitle, social } from "@/features/seo/model/seo";
import { getLocalization } from "@/features/settings/model/server";
import Forecast from "@/widgets/Forecast/Forecast";

const hidden = { index: false, follow: true } as const;

// Title, description and links for the place in the address
export const generateMetadata = async ({ searchParams }: PageProps<"/[locale]">): Promise<Metadata> => {
  const query = parseLocation(await searchParams);
  const { locale, t, format } = await getLocalization();
  const result = query ? await getForecast(query, locale) : null;
  if (!query || !result) return { title: documentTitle(t("error.notFound.title"), t), robots: hidden };
  if (!result.ok) {
    const title = result.failure === "not-found" ? t("error.notFound.title") : t("error.unavailable.title");
    return { title: documentTitle(title, t), robots: hidden };
  }

  const page = describeForecast(result.forecast, t, format);
  const links = alternates(locale, forecastSearch(query, result.forecast.place));
  const home = isDefaultLocation(query);
  return {
    title: home ? { absolute: homeTitle(t) } : documentTitle(page.title, t),
    description: page.description,
    alternates: links,
    ...social(locale, t, { ...page, title: home ? homeTitle(t) : page.title, url: links.canonical }),
  };
};

// Saved places, the forecast of the address or of Lviv, popular cities
const Page = async ({ searchParams }: PageProps<"/[locale]">) => {
  const query = parseLocation(await searchParams);
  const { locale, t } = await getLocalization();
  return (
    <>
      <SavedPlaces position={query?.kind === "coordinates" ? query : null} />
      <Suspense key={locationKey(query)} fallback={<ForecastSkeleton label={t("loading.forecast")} />}>
        <Forecast query={query} />
      </Suspense>
      <PopularPlaces locale={locale} t={t} current={query?.kind === "coordinates" ? placeKey(query) : null} />
    </>
  );
};

export default Page;
