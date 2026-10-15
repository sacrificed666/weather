import { createContext } from "react";

import type { Locale } from "./locales";
import type { Messages } from "./messages/en";

export interface I18nValue {
  locale: Locale;
  messages: Messages;
}

export const I18nContext = createContext<I18nValue | null>(null);
