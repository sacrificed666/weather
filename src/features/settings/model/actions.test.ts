import { beforeEach, describe, expect, it, vi } from "vitest";

const set = vi.hoisted(() => vi.fn<(name: string, value: string, options: object) => void>());
const request = vi.hoisted(() => ({ protocol: "http" }));

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ set }),
  headers: () => Promise.resolve(new Headers({ "x-forwarded-proto": request.protocol })),
}));

const { savePreference } = await import("./actions");

describe("savePreference", () => {
  beforeEach(() => {
    set.mockClear();
    request.protocol = "http";
  });

  it("stores a valid preference in a long-lived, http-only cookie", async () => {
    await savePreference("theme", "dark");
    expect(set).toHaveBeenCalledWith("weather-theme", "dark", {
      path: "/",
      maxAge: 31_536_000,
      sameSite: "lax",
      httpOnly: true,
      secure: false,
    });
  });

  it("marks the cookie secure when the page came over HTTPS", async () => {
    request.protocol = "https";
    await savePreference("units", "imperial");
    expect(set).toHaveBeenCalledWith("weather-units", "imperial", expect.objectContaining({ secure: true }));
  });

  it("ignores unknown preferences and values", async () => {
    await savePreference("theme", "neon");
    await savePreference("units", "dark");
    await Reflect.apply(savePreference, undefined, ["toString", "dark"]);
    await Reflect.apply(savePreference, undefined, ["locale", "uk"]);
    expect(set).not.toHaveBeenCalled();
  });
});
