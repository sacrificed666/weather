import "server-only";
import type { Locale } from "./locales";
import { cs } from "./messages/cs";
import { de } from "./messages/de";
import { en, type Messages } from "./messages/en";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { it } from "./messages/it";
import { nl } from "./messages/nl";
import { pl } from "./messages/pl";
import { pt } from "./messages/pt";
import { uk } from "./messages/uk";

const catalog: Record<Locale, Messages> = { en, uk, cs, de, es, fr, it, nl, pl, pt };

// The messages of a language
export const getMessages = (locale: Locale): Messages => catalog[locale];
