import { describe, expect, it } from "vitest";

import { currentYear, localDayKey, localHour, toLocalDate } from "./time";

describe("time", () => {
  it("shifts timestamps into the place's local time", () => {
    expect(toLocalDate(1_759_482_000, 10_800).toISOString()).toBe("2025-10-03T12:00:00.000Z");
    expect(localHour(1_759_482_000, -18_000)).toBe(4);
  });

  it("builds day keys that change at local midnight", () => {
    expect(localDayKey(1_759_532_400, 0)).toBe("2025-10-03");
    expect(localDayKey(1_759_532_400, 10_800)).toBe("2025-10-04");
  });

  it("returns the current year", () => {
    expect(currentYear()).toBe(new Date().getFullYear());
  });
});
