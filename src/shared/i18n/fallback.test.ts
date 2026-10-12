import { describe, expect, it } from "vitest";

import { FALLBACK_MESSAGES } from "./fallback";
import { LOCALES } from "./locales";
import { cs } from "./messages/cs";
import { de } from "./messages/de";
import { en, type MessageKey, type Messages } from "./messages/en";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { it as italian } from "./messages/it";
import { nl } from "./messages/nl";
import { pl } from "./messages/pl";
import { pt } from "./messages/pt";
import { uk } from "./messages/uk";

const CATALOG: Readonly<Record<(typeof LOCALES)[number], Messages>> = {
  en,
  uk,
  cs,
  de,
  es,
  fr,
  it: italian,
  nl,
  pl,
  pt,
};

describe("FALLBACK_MESSAGES", () => {
  it.each(LOCALES)("copies the %s catalog word for word", (locale) => {
    const keys = Object.keys(FALLBACK_MESSAGES.en).filter((key): key is MessageKey => Object.hasOwn(en, key));
    expect(FALLBACK_MESSAGES[locale]).toEqual(Object.fromEntries(keys.map((key) => [key, CATALOG[locale][key]])));
  });
});
