import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import AirQualityCard from "./AirQualityCard";

describe("AirQualityCard", () => {
  it("rates the air quality and lists known pollutants", () => {
    renderWithI18n(<AirQualityCard {...view()} />);
    expect(screen.getByText("Fair")).toBeInTheDocument();
    expect(screen.getByText("Acceptable for most people.")).toBeInTheDocument();
    expect(screen.getByText("Index 2 of 5")).toBeInTheDocument();
    expect(screen.getByText("PM2.5")).toBeInTheDocument();
    expect(screen.queryByText("NO₂")).not.toBeInTheDocument();
  });

  it("explains missing air quality data", () => {
    renderWithI18n(<AirQualityCard {...view({ airQuality: null })} />);
    expect(screen.getByText("No air quality data for this place.")).toBeInTheDocument();
  });
});
