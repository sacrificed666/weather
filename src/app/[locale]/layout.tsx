import "@/app/globals.scss";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import OfflineNotice from "@/features/notifications/ui/OfflineNotice/OfflineNotice";
import ServiceWorker from "@/features/notifications/ui/ServiceWorker/ServiceWorker";
import { social } from "@/features/seo/model/seo";
import { themeColorFor } from "@/features/settings/model/preferences";
import { getEffects, getLocalization, getPreferences } from "@/features/settings/model/server";
import I18nProvider from "@/shared/i18n/I18nProvider";
import { isLocale, LOCALES } from "@/shared/i18n/locales";
import { isIndexable, SITE, siteUrl } from "@/shared/lib/site";
import Footer from "@/widgets/Footer/Footer";
import Header from "@/widgets/Header/Header";

import { montserrat } from "../fonts";

import styles from "./layout.module.scss";

export const dynamicParams = false;

// Prerenders the shell of every language
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

// Site-wide metadata in the page language
export const generateMetadata = async (): Promise<Metadata> => {
  const { locale, t } = await getLocalization();
  const name = t("app.name");
  const description = t("app.description");
  return {
    metadataBase: siteUrl(),
    title: { default: name, template: `%s · ${name}` },
    description,
    applicationName: name,
    keywords: [...SITE.keywords],
    authors: [{ name: SITE.author.name, url: SITE.author.url }],
    creator: SITE.author.name,
    publisher: SITE.author.name,
    category: "weather",
    ...social(locale, t, { title: name, description }),
    robots: isIndexable()
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
      : { index: false, follow: false },
    formatDetection: { telephone: false, address: false, email: false },
  };
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

// The document shell: theme, effects, header, content and footer
const LocaleLayout = async ({ children, params }: LayoutProps<"/[locale]">) => {
  if (!isLocale((await params).locale)) notFound();
  const [{ locale, preferences, messages, t }, effects] = await Promise.all([getLocalization(), getEffects()]);
  return (
    <html lang={locale} className={montserrat.variable} data-theme={preferences.theme} data-effects={effects.level}>
      <body>
        <I18nProvider locale={locale} messages={messages}>
          <a className="skip-link" href="#forecast">
            {t("app.skip")}
          </a>
          <Header locale={locale} preferences={preferences} effects={effects} t={t} />
          <main className={styles.main} id="forecast" tabIndex={-1}>
            {children}
          </main>
          <Footer t={t} />
          <OfflineNotice />
          <ServiceWorker />
        </I18nProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
