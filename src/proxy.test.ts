import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config, proxy } from "./proxy";

// A request for the proxy
const request = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(new URL(path, "http://localhost"), { headers });

describe("proxy", () => {
  it("adds a fresh nonce-based Content Security Policy to every page", () => {
    const first = proxy(request("/en"));
    const second = proxy(request("/uk?city=Kyiv"));
    const policy = first.headers.get("content-security-policy") ?? "";
    expect(first.status).toBe(200);
    expect(policy).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/u);
    expect(policy).not.toBe(second.headers.get("content-security-policy"));
    expect(second.headers.get("x-middleware-request-x-weather-locale")).toBe("uk");
  });

  it("sends visitors without a language to the one their browser prefers", () => {
    const response = proxy(request("/?city=Kyiv", { "accept-language": "uk-UA,uk;q=0.9,en;q=0.8" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/uk?city=Kyiv");
    expect(response.headers.get("vary")).toBe("Accept-Language, Cookie");
  });

  it("prefers the language chosen earlier", () => {
    const response = proxy(request("/", { "accept-language": "de", cookie: "weather-locale=pl" }));
    expect(response.headers.get("location")).toBe("http://localhost/pl");
  });

  it("keeps the rest of the address", () => {
    const response = proxy(request("/somewhere/else", { cookie: "weather-locale=xx" }));
    expect(response.headers.get("location")).toBe("http://localhost/en/somewhere/else");
  });

  it("lowercases the language permanently", () => {
    const response = proxy(request("/DE?lat=1&lon=2"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/de?lat=1&lon=2");
  });

  it("skips API routes, static files, images and metadata files", () => {
    const [matcher] = config.matcher;
    const pattern = new RegExp(`^${matcher?.source ?? ""}$`, "u");
    const handled = [
      "/",
      "/en",
      "/uk/nowhere",
      "/apiary",
      "/icons-of-the-sky",
      "/apple-icon-x",
      "/robots.txt.bak",
      "/healthz-x",
    ];
    expect(handled.filter((path) => pattern.test(path))).toEqual(handled);
    const skipped = [
      "/api/places",
      "/_next/static/x.js",
      "/icons/weather/rain.svg",
      "/flags/UA",
      "/robots.txt",
      "/sitemap.xml",
      "/manifest.webmanifest",
      "/apple-icon",
      "/icon.svg",
      "/favicon.ico",
      "/healthz",
      "/healthz/ready",
      "/.well-known/security.txt",
      "/offline/uk",
      "/sw.js",
      "/pwa/icon-192.png",
    ];
    expect(skipped.filter((path) => pattern.test(path))).toEqual([]);
  });
});
