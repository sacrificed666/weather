import { describe, expect, it, vi } from "vitest";

import { onRequestError } from "./instrumentation";

const request = { path: "/en?lat=49.84&lon=24.03", method: "GET", headers: { cookie: "theme=dark" } };
const context = {
  routerKind: "App Router",
  routePath: "/[locale]",
  routeType: "render",
  revalidateReason: "stale",
} as const;

describe("onRequestError", () => {
  it("logs the digest, the method and the route pattern, never the address or cookies", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    await onRequestError(Object.assign(new Error("Boom"), { digest: "123" }), request, context);
    expect(error).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('A request failed {"digest":"123","method":"GET","route":"/[locale]"'),
    );
    const line = String(error.mock.calls[0]?.[0]);
    expect(line).toContain('"revalidate":"stale"');
    expect(line).toContain('"message":"Boom"');
    expect(line).not.toContain("lat=");
    expect(line).not.toContain("theme");
  });

  it("logs values that are not errors as text", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    await onRequestError("Plain", request, context);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('"digest":null'));
    expect(error).toHaveBeenCalledWith(expect.stringContaining('"message":"Plain"'));
  });
});
