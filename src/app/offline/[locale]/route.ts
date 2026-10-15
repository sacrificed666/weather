import { offlinePage } from "@/features/notifications/model/offlinePage";
import { getMessages } from "@/shared/i18n/catalog";
import { isLocale, LOCALES } from "@/shared/i18n/locales";
import { createTranslator } from "@/shared/i18n/translate";

export const dynamicParams = false;

// Prerenders the offline page in every language
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

// The page the service worker shows when another page cannot load offline
export const GET = async (_request: Request, { params }: RouteContext<"/offline/[locale]">) => {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response(null, { status: 404 });
  const t = createTranslator(getMessages(locale));
  const { html, policy } = offlinePage({
    lang: locale,
    name: t("app.name"),
    title: t("offline.title"),
    message: t("offline.message"),
    retry: t("error.retry"),
    light: {
      background: "#dbe5f1",
      surface: "#f4f7fb",
      text: "rgb(10 18 36 / 0.94)",
      muted: "rgb(10 18 36 / 0.74)",
      accent: "#0062cc",
      onAccent: "#ffffff",
    },
    dark: {
      background: "#0a1020",
      surface: "#121a2c",
      text: "rgb(255 255 255 / 0.96)",
      muted: "rgb(232 238 252 / 0.78)",
      accent: "#6cb6ff",
      onAccent: "#04162c",
    },
  });
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": policy,
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
};
