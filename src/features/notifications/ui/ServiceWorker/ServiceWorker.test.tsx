import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ServiceWorker from "./ServiceWorker";

const register = vi.fn<(url: string) => Promise<unknown>>();

describe("ServiceWorker", () => {
  beforeEach(() => {
    register.mockReset().mockResolvedValue({});
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: { register } });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, "serviceWorker");
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("stays away from development and tests", () => {
    render(<ServiceWorker />);
    expect(register).not.toHaveBeenCalled();
  });

  it("registers the worker in production once the page has loaded", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    render(<ServiceWorker />);
    expect(register).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("load"));
    expect(register).toHaveBeenCalledExactlyOnceWith("/sw.js");
  });

  it("registers right away when the page has already loaded", () => {
    vi.stubEnv("NODE_ENV", "production");
    register.mockRejectedValue(new Error("Refused"));
    render(<ServiceWorker />);
    expect(register).toHaveBeenCalledExactlyOnceWith("/sw.js");
  });
});
