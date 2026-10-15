import { describe, expect, it } from "vitest";

import { createRateLimiter } from "./rateLimit";

describe("createRateLimiter", () => {
  it("allows a fixed number of requests per window and key", () => {
    let time = 0;
    const allow = createRateLimiter({ limit: 2, windowMs: 1000, now: () => time });
    expect([allow("a"), allow("a"), allow("a"), allow("b")]).toEqual([true, true, false, true]);
    time = 1000;
    expect(allow("a")).toBe(true);
  });

  it("forgets expired windows once it tracks too many keys", () => {
    let time = 0;
    const allow = createRateLimiter({ limit: 1, windowMs: 10, now: () => time, maxKeys: 2 });
    allow("a");
    allow("b");
    time = 20;
    expect(allow("c")).toBe(true);
    expect(allow("a")).toBe(true);
    expect(allow("a")).toBe(false);
  });

  it("never tracks more keys than allowed, dropping the oldest windows first", () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000, now: () => 0, maxKeys: 2 });
    allow("a");
    allow("b");
    expect(allow("c")).toBe(true);
    expect(allow("b")).toBe(false);
    expect(allow("a")).toBe(true);
  });
});
