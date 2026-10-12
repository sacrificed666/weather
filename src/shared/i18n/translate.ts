import type { MessageKey, Messages } from "./messages/en";

export type MessageParams = Readonly<Record<string, string | number>>;

export type Translate = (key: MessageKey, params?: MessageParams) => string;

const PLACEHOLDER = /\{(\w+)\}/gu;

// A text with its placeholders filled; unknown ones stay as they are
const fill = (template: string, params?: MessageParams) =>
  params
    ? template.replaceAll(PLACEHOLDER, (placeholder, name: string) =>
        Object.hasOwn(params, name) ? String(params[name]) : placeholder,
      )
    : template;

// A translate function that fills placeholders
export const createTranslator =
  (messages: Messages): Translate =>
  (key, params) =>
    fill(messages[key], params);

// A translate function over a few texts that shows the key for the rest
export const createFallbackTranslator =
  (messages: Partial<Messages>): Translate =>
  (key, params) =>
    fill(messages[key] ?? key, params);
