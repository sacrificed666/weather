import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { forecast, view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import Forecast from "./Forecast";

const getForecast = vi.hoisted(() => vi.fn<(...args: unknown[]) => Promise<unknown>>());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn<(href: string) => void>(), refresh: vi.fn<() => void>() }),
  usePathname: () => "/en",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/features/forecast/model/getForecast", () => ({ getForecast }));
vi.mock("@/features/settings/model/server", async () => {
  const { view: createView } = await import("@/test/fixtures");
  const { t: translate, format } = createView();
  return {
    getLocalization: () =>
      Promise.resolve({
        locale: "en",
        preferences: { theme: "system", units: "metric", effects: "auto" },
        t: translate,
        format,
      }),
    getEffects: () => Promise.resolve({ level: "full", device: "full" }),
  };
});

describe("Forecast", () => {
  beforeEach(() => {
    getForecast.mockReset();
  });

  it("renders every section of the forecast over a matching sky", async () => {
    getForecast.mockResolvedValue({ ok: true, forecast });
    const { container } = renderWithI18n(await Forecast({ query: { kind: "city", name: "Lviv" } }));
    expect(getForecast).toHaveBeenCalledWith({ kind: "city", name: "Lviv" }, "en");
    const schema: unknown = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')?.textContent ?? "",
    );
    expect(schema).toHaveProperty(["@graph", "1", "@type"], "WebPage");
    expect(schema).toHaveProperty(["@graph", "1", "url"], "http://localhost:3000/en?lat=49.84&lon=24.03");
    expect(schema).toHaveProperty(["@graph", "1", "about", "name"], "Lviv");
    expect(container.querySelector("[data-sky]")).toHaveAttribute("data-sky", "rain");
    for (const name of [
      "Hourly forecast",
      "2-day forecast",
      "Air quality",
      "Sun",
      "Wind",
      "Humidity",
      "Pressure",
      "Cloud cover",
    ]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
  });

  it("shows the failure reported by the service", async () => {
    getForecast.mockResolvedValue({ ok: false, failure: "rate-limited" });
    renderWithI18n(await Forecast({ query: { kind: "city", name: "Lviv" } }));
    expect(screen.getByRole("heading", { name: "Too many requests" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to the forecast" })).toHaveAttribute("href", "/en");
  });

  it("treats an invalid query as an unknown city", async () => {
    renderWithI18n(await Forecast({ query: null }));
    expect(getForecast).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "City not found" })).toBeInTheDocument();
    expect(view().forecast.place.name).toBe("Lviv");
  });
});
