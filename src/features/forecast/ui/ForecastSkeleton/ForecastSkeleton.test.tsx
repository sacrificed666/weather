import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/test/render";

import ForecastSkeleton from "./ForecastSkeleton";

describe("ForecastSkeleton", () => {
  it("announces that the forecast is loading", () => {
    renderWithI18n(<ForecastSkeleton label="Loading the forecast…" />);
    expect(screen.getByRole("status", { name: "Loading the forecast…" })).toHaveAttribute("aria-busy", "true");
  });
});
