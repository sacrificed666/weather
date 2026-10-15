import { describe, expect, it } from "vitest";

import { cs } from "./cs";
import { de } from "./de";
import { en, type MessageKey } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it as italian } from "./it";
import { nl } from "./nl";
import { pl } from "./pl";
import { pt } from "./pt";
import { uk } from "./uk";

// Sorts texts alphabetically
const byText = (a: string, b: string) => a.localeCompare(b);

// The placeholders of a text
const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/gu)].map((match) => match[1] ?? "").toSorted(byText);

const keys = Object.keys(en).filter((key): key is MessageKey => Object.hasOwn(en, key));

describe.each([
  ["uk", uk],
  ["cs", cs],
  ["de", de],
  ["es", es],
  ["fr", fr],
  ["it", italian],
  ["nl", nl],
  ["pl", pl],
  ["pt", pt],
])("%s messages", (_locale, messages) => {
  it("have exactly the English keys", () => {
    expect(Object.keys(messages).toSorted(byText)).toEqual(keys.toSorted(byText));
  });

  it("keep every placeholder of the English text", () => {
    const mismatched = keys.filter((key) => placeholders(messages[key]).join() !== placeholders(en[key]).join());
    expect(mismatched).toEqual([]);
  });

  it("have no empty texts", () => {
    expect(keys.filter((key) => messages[key].trim() === "")).toEqual([]);
  });
});
