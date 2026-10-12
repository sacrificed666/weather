import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { t } from "@/test/fixtures";

import PopularPlaces from "./PopularPlaces";

describe("PopularPlaces", () => {
  it("links to the forecast of every popular city in the page language", () => {
    render(<PopularPlaces locale="de" t={t} current={null} />);
    expect(screen.getByRole("navigation", { name: "Popular cities" })).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(10);
    expect(screen.getByRole("link", { name: "Kiew" })).toHaveAttribute("href", "/de?lat=50.45&lon=30.52");
    expect(screen.getByRole("link", { name: "Warschau" })).not.toHaveAttribute("aria-current");
  });

  it("marks the city whose forecast is open", () => {
    render(<PopularPlaces locale="en" t={t} current="52.23,21.01" />);
    expect(screen.getByRole("link", { name: "Warsaw" })).toHaveAttribute("aria-current", "page");
  });
});
