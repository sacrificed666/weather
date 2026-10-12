import { describe, expect, it } from "vitest";

import { forecast, view } from "@/test/fixtures";

import { alternates, describeForecast, documentTitle, forecastSchema, homeTitle, serializeJsonLd, social } from "./seo";

const base = new URL("https://weather.example");

describe("documentTitle", () => {
  it("adds the name of the app to the title of a page", () => {
    expect(documentTitle("Lviv 13°", view().t)).toEqual({ absolute: "Lviv 13° · Weather" });
  });
});

describe("alternates", () => {
  it("links every language and a language-neutral default", () => {
    const links = alternates("uk", "?lat=50.45&lon=30.52");
    expect(links.canonical).toBe("/uk?lat=50.45&lon=30.52");
    expect(Object.keys(links.languages)).toEqual([
      "en",
      "uk",
      "cs",
      "de",
      "es",
      "fr",
      "it",
      "nl",
      "pl",
      "pt",
      "x-default",
    ]);
    expect(links.languages.pl).toBe("/pl?lat=50.45&lon=30.52");
    expect(links.languages["x-default"]).toBe("/?lat=50.45&lon=30.52");
    expect(alternates("en").languages["x-default"]).toBe("/");
  });
});

describe("social", () => {
  it("describes the page for Open Graph and X in its language", () => {
    const { t } = view();
    const card = social("uk", t, { title: "Lviv", description: "Rain", url: "/uk" });
    expect(card.openGraph).toMatchObject({ locale: "uk_UA", siteName: "Weather", url: "/uk", type: "website" });
    expect(card.openGraph?.alternateLocale).toHaveLength(9);
    expect(card.twitter).toEqual({ card: "summary_large_image", title: "Lviv", description: "Rain" });
    expect(social("en", t, { title: "Weather", description: "Rain" }).openGraph).not.toHaveProperty("url");
  });
});

describe("describeForecast", () => {
  it("keeps the title stable and puts the weather right now in the description", () => {
    const { t, format } = view();
    expect(describeForecast(forecast, t, format)).toEqual({
      title: "Lviv: hourly and daily forecast",
      description: `Lviv: 13° · Light rain. ${t("app.description")}`,
    });
  });
});

describe("homeTitle", () => {
  it("names the app and what it offers", () => {
    expect(homeTitle(view().t)).toBe("Weather · Forecast for any city in the world");
  });
});

describe("structured data", () => {
  it("escapes markup so that text cannot close the script", () => {
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).toBe(
      '{"name":"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"}',
    );
  });

  it("describes the site and the place of the forecast", () => {
    const { t } = view();
    const schema = forecastSchema(
      forecast,
      { title: "Lviv", description: "Rain", path: "/de?lat=49.84&lon=24.03" },
      base,
      "de",
      t,
    );
    expect(schema).toHaveProperty(["@graph", "0", "@type"], "WebSite");
    expect(schema).toHaveProperty(["@graph", "0", "url"], "https://weather.example/de");
    expect(schema).not.toHaveProperty(["@graph", "0", "potentialAction"]);
    expect(schema).toHaveProperty(["@graph", "1", "url"], "https://weather.example/de?lat=49.84&lon=24.03");
    expect(schema).toHaveProperty(["@graph", "1", "inLanguage"], "de");
    expect(schema).toHaveProperty(["@graph", "1", "about", "geo", "latitude"], 49.84);
    expect(schema).toHaveProperty(["@graph", "1", "about", "address", "addressRegion"], "Lviv Oblast");
  });

  it("leaves out an unknown country and region", () => {
    const { t } = view();
    const place = { ...forecast.place, country: null, region: null };
    const schema = forecastSchema({ ...forecast, place }, { title: "", description: "", path: "/en" }, base, "en", t);
    expect(schema).not.toHaveProperty(["@graph", "1", "about", "address"]);
    const regionless = { ...forecast.place, region: null };
    const partial = forecastSchema(
      { ...forecast, place: regionless },
      { title: "", description: "", path: "/en" },
      base,
      "en",
      t,
    );
    expect(partial).toHaveProperty(["@graph", "1", "about", "address"], {
      "@type": "PostalAddress",
      addressCountry: "UA",
    });
  });
});
