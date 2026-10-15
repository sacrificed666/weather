import { describe, expect, it } from "vitest";

import { clamp, isRecord, readArray, readNumber, readRecord, readString } from "./guards";

describe("guards", () => {
  const source = { count: 3, infinite: Infinity, name: "  Lviv ", blank: " ", list: [1], nested: { ok: true } };

  it("recognises plain records only", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord("text")).toBe(false);
  });

  it("reads finite numbers", () => {
    expect(readNumber(source, "count")).toBe(3);
    expect(readNumber(source, "infinite")).toBeNull();
    expect(readNumber(source, "name")).toBeNull();
    expect(readNumber(null, "count")).toBeNull();
  });

  it("reads trimmed non-empty strings", () => {
    expect(readString(source, "name")).toBe("Lviv");
    expect(readString(source, "blank")).toBeNull();
    expect(readString(source, "count")).toBeNull();
  });

  it("reads arrays and nested records", () => {
    expect(readArray(source, "list")).toEqual([1]);
    expect(readArray(source, "nested")).toEqual([]);
    expect(readRecord(source, "nested")).toEqual({ ok: true });
    expect(readRecord(source, "list")).toBeNull();
  });

  it("clamps numbers into a range", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
});
