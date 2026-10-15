import { describe, expect, it } from "vitest";

import { contentSecurityPolicy } from "./contentSecurityPolicy";

describe("contentSecurityPolicy", () => {
  it("allows only nonced scripts and same-origin resources in production", () => {
    const policy = contentSecurityPolicy("abc", false);
    expect(policy).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(policy).toContain("style-src 'self' 'nonce-abc'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).not.toContain("style-src 'self' 'unsafe-inline'");
    expect(policy).toContain("style-src-attr 'unsafe-inline'");
  });

  it("relaxes scripts and styles for the development server", () => {
    const policy = contentSecurityPolicy("abc", true);
    expect(policy).toContain("'unsafe-eval'");
    expect(policy).toContain("style-src 'self' 'unsafe-inline'");
  });
});
