import "./globals.scss";
import type { Metadata, Viewport } from "next";

import { documentTitle } from "@/features/seo/model/seo";
import { themeColorFor } from "@/features/settings/model/preferences";
import { getEffects, getPreferences, getRequestLocalization } from "@/features/settings/model/server";
import { homeHref } from "@/shared/i18n/locales";
import Icon from "@/shared/ui/Icon/Icon";
import Logo from "@/shared/ui/Logo/Logo";

import { montserrat } from "./fonts";

import styles from "./not-found.module.scss";

// Keeps the not found page out of search results
export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getRequestLocalization();
  return { title: documentTitle(t("notFound.title"), t), robots: { index: false, follow: true } };
};

const LIGHT = "(prefers-color-scheme: light)";
const DARK = "(prefers-color-scheme: dark)";

// Browser colours that follow the theme picked in the settings
export const generateViewport = async (): Promise<Viewport> => {
  const { theme } = await getPreferences();
  return {
    colorScheme: "light dark",
    viewportFit: "cover",
    themeColor: [
      { media: LIGHT, color: themeColorFor(theme, LIGHT) },
      { media: DARK, color: themeColorFor(theme, DARK) },
    ],
  };
};

// Not found page for addresses outside any language
const GlobalNotFound = async () => {
  const [{ locale, preferences, t }, effects] = await Promise.all([getRequestLocalization(), getEffects()]);
  return (
    <html lang={locale} className={montserrat.variable} data-theme={preferences.theme} data-effects={effects.level}>
      <body>
        <main className={styles.page}>
          <a className={styles.brand} href={homeHref(locale)}>
            <Logo className={styles.logo} />
            {t("app.name")}
          </a>
          <section className={styles.notFound} aria-labelledby="not-found-title">
            <span className={styles.badge}>
              <Icon name="pin" size={28} />
            </span>
            <h1 className={styles.title} id="not-found-title">
              {t("notFound.title")}
            </h1>
            <p className={styles.text}>{t("notFound.text")}</p>
            <a className={styles.link} href={homeHref(locale)}>
              {t("error.home")}
            </a>
          </section>
        </main>
      </body>
    </html>
  );
};

export default GlobalNotFound;
