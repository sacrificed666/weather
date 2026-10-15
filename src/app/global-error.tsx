"use client";

import "./globals.scss";
import { usePathname } from "next/navigation";

import ForecastError from "@/features/forecast/ui/ForecastError/ForecastError";
import { FALLBACK_MESSAGES } from "@/shared/i18n/fallback";
import { homeHref, localeFromPath } from "@/shared/i18n/locales";
import { createFallbackTranslator } from "@/shared/i18n/translate";

import { montserrat } from "./fonts";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

// Last resort when even the layout fails, in the language of the address
const GlobalError = ({ error, retry }: GlobalErrorProps) => {
  const locale = localeFromPath(usePathname());
  const t = createFallbackTranslator(FALLBACK_MESSAGES[locale]);
  return (
    <html lang={locale} className={montserrat.variable} data-theme="system">
      <body>
        <ForecastError kind="unexpected" t={t} home={homeHref(locale)} digest={error.digest} onRetry={retry} />
      </body>
    </html>
  );
};

export default GlobalError;
