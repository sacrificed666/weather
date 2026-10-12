import { ImageResponse } from "next/og";

import { OG_FONTS, OG_SIZE, readAppIcon } from "@/features/seo/og/assets";
import { getMessages } from "@/shared/i18n/catalog";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@/shared/i18n/locales";
import { createTranslator } from "@/shared/i18n/translate";

export const size = OG_SIZE;

export const contentType = "image/png";

// One share card per language
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

// Translations for the language of the card
const translatorFor = async (params: Promise<{ locale: string }>) => {
  const { locale } = await params;
  return createTranslator(getMessages(isLocale(locale) ? locale : DEFAULT_LOCALE));
};

// Alt text of the share card in the page language
export const generateImageMetadata = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const t = await translatorFor(params);
  return [{ id: "card", alt: `${t("app.name")}: ${t("app.description")}`, size, contentType }];
};

// Share card with the logo, the name and the description
const OpenGraphImage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const t = await translatorFor(params);
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 56,
        width: "100%",
        height: "100%",
        padding: "0 96px",
        color: "#ffffff",
        fontFamily: "Montserrat",
        background: "linear-gradient(160deg, #0a2a5e 0%, #164e93 55%, #2f73bd 100%)",
      }}
    >
      <img src={await readAppIcon()} width={260} height={260} alt="" />
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 700 }}>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -3 }}>{t("app.name")}</div>
        <div style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.35, color: "rgba(255, 255, 255, 0.84)" }}>
          {t("app.description")}
        </div>
      </div>
    </div>,
    { ...size, fonts: OG_FONTS },
  );
};

export default OpenGraphImage;
