import "server-only";
import { cookies, headers } from "next/headers";
import { locale as rootLocale } from "next/root-params";
import { cache } from "react";

import { getMessages } from "@/shared/i18n/catalog";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_INFO,
  LOCALE_HEADER,
  negotiateLocale,
  type Locale,
} from "@/shared/i18n/locales";
import { createTranslator } from "@/shared/i18n/translate";
import { createFormatter } from "@/shared/lib/format";
import { isUnitSystem } from "@/shared/lib/units";

import {
  DEFAULT_PREFERENCES,
  isEffects,
  isTheme,
  PREFERENCE_COOKIES,
  resolveEffects,
  type EffectsState,
  type Preferences,
} from "./preferences";

export const getPreferences = cache(async (): Promise<Preferences> => {
  const cookieStore = await cookies();
  const theme = cookieStore.get(PREFERENCE_COOKIES.theme)?.value;
  const units = cookieStore.get(PREFERENCE_COOKIES.units)?.value;
  const effects = cookieStore.get(PREFERENCE_COOKIES.effects)?.value;
  return {
    theme: isTheme(theme) ? theme : DEFAULT_PREFERENCES.theme,
    units: isUnitSystem(units) ? units : DEFAULT_PREFERENCES.units,
    effects: isEffects(effects) ? effects : DEFAULT_PREFERENCES.effects,
  };
});

export const getEffects = cache(async (): Promise<EffectsState> => {
  const [preferences, requestHeaders] = await Promise.all([getPreferences(), headers()]);
  const userAgent = requestHeaders.get("user-agent");
  return { level: resolveEffects(preferences.effects, userAgent), device: resolveEffects("auto", userAgent) };
});

export const currentLocale = cache(async (): Promise<Locale> => {
  const value = await rootLocale();
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

// The language of a request outside the localized routes
export const requestLocale = async (): Promise<Locale> => {
  const [requestHeaders, cookieStore] = await Promise.all([headers(), cookies()]);
  const routed = requestHeaders.get(LOCALE_HEADER);
  if (isLocale(routed)) return routed;
  const saved = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(saved) ? saved : negotiateLocale(requestHeaders.get("accept-language"));
};

// Language, settings, messages, translator and formatter
const localize = async (locale: Locale) => {
  const preferences = await getPreferences();
  const messages = getMessages(locale);
  return {
    locale,
    preferences,
    messages,
    t: createTranslator(messages),
    format: createFormatter(LOCALE_INFO[locale].intl, preferences.units),
  };
};

export const getLocalization = cache(async () => localize(await currentLocale()));

export const getRequestLocalization = cache(async () => localize(await requestLocale()));
