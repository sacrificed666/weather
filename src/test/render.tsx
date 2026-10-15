import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";

import I18nProvider from "@/shared/i18n/I18nProvider";
import type { Locale } from "@/shared/i18n/locales";
import { en } from "@/shared/i18n/messages/en";
import { uk } from "@/shared/i18n/messages/uk";

// Renders a component inside the translations of a language
export const renderWithI18n = (ui: ReactElement, locale: Extract<Locale, "en" | "uk"> = "en") => {
  // The translations around the element
  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider locale={locale} messages={locale === "uk" ? uk : en}>
      {children}
    </I18nProvider>
  );
  return { user: userEvent.setup(), ...render(ui, { wrapper }) };
};
