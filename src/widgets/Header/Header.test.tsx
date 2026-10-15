import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { t } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import Header from "./Header";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn<(href: string) => void>(), refresh: vi.fn<() => void>() }),
  usePathname: () => "/en",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Header", () => {
  it("links home and offers search, location and settings", () => {
    renderWithI18n(
      <Header
        locale="en"
        preferences={{ theme: "system", units: "metric", effects: "auto" }}
        effects={{ level: "reduced", device: "reduced" }}
        t={t}
      />,
    );
    const brand = screen.getByRole("link", { name: "Weather" });
    expect(brand).toHaveAttribute("href", "/en");
    expect(brand.querySelector("svg linearGradient")).toBeInTheDocument();
    expect(document.querySelector('search form[action="/en"]')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Use my location" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });
});
