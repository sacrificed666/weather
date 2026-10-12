import { describe, expect, it, vi } from "vitest";

import { createStoredList } from "./storedList";

// Keeps numbers only
const parseNumber = (value: unknown) => (typeof value === "number" ? value : null);

describe("createStoredList", () => {
  it("reads, validates and caps stored items", () => {
    localStorage.setItem("numbers", JSON.stringify([1, "two", 3, 4]));
    const list = createStoredList("numbers", { parse: parseNumber, limit: 2 });
    expect(list.getSnapshot()).toEqual([1, 3]);
    expect(list.getSnapshot()).toBe(list.getSnapshot());
  });

  it("keeps the first of the entries that describe the same item", () => {
    localStorage.setItem("numbers", JSON.stringify([1, 11, 2, 21, 3]));
    const list = createStoredList("numbers", { parse: parseNumber, limit: 5, isSame: (a, b) => a % 10 === b % 10 });
    expect(list.getSnapshot()).toEqual([1, 2, 3]);
  });

  it("falls back to an empty list for missing or corrupted data", () => {
    const list = createStoredList("numbers", { parse: parseNumber, limit: 5 });
    expect(list.getSnapshot()).toEqual([]);
    localStorage.setItem("numbers", "{not json");
    expect(list.getSnapshot()).toEqual([]);
    localStorage.setItem("numbers", JSON.stringify({ length: 1 }));
    expect(list.getSnapshot()).toEqual([]);
    expect(list.getServerSnapshot()).toEqual([]);
  });

  it("writes items and notifies subscribers", () => {
    const list = createStoredList("numbers", { parse: parseNumber, limit: 2 });
    const listener = vi.fn<() => void>();
    const unsubscribe = list.subscribe(listener);
    list.replace([5, 6, 7]);
    expect(localStorage.getItem("numbers")).toBe("[5,6]");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    list.replace([1]);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("follows changes made in other tabs", () => {
    const list = createStoredList("numbers", { parse: parseNumber, limit: 2 });
    const listener = vi.fn<() => void>();
    const unsubscribe = list.subscribe(listener);
    window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    window.dispatchEvent(new StorageEvent("storage", { key: "numbers" }));
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("keeps working when storage is unavailable", () => {
    const list = createStoredList("numbers", { parse: parseNumber, limit: 2 });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const listener = vi.fn<() => void>();
    list.subscribe(listener);
    list.replace([1]);
    expect(list.getSnapshot()).toEqual([]);
    expect(listener).not.toHaveBeenCalled();
  });
});
