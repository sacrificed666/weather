import { describe, expect, it, vi } from "vitest";

import { log } from "./log";

describe("log", () => {
  it("names the app and adds the context as JSON", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    log.warn("Slow answer", { path: "/geo/1.0/direct", status: 429 });
    log.error("Broken");
    log.info("Ready");
    expect(warn).toHaveBeenCalledWith('[weather] Slow answer {"path":"/geo/1.0/direct","status":429}');
    expect(error).toHaveBeenCalledWith("[weather] Broken");
    expect(info).toHaveBeenCalledWith("[weather] Ready");
  });
});
