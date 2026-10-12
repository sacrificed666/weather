import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import CurrentConditions from "./CurrentConditions";

describe("CurrentConditions", () => {
  it("shows the place, the temperature and today's range", () => {
    renderWithI18n(<CurrentConditions {...view()} />);
    expect(screen.getByRole("heading", { level: 1, name: "Lviv" })).toBeInTheDocument();
    expect(screen.getByText("Lviv Oblast, Ukraine")).toBeInTheDocument();
    expect(screen.getByText("13°")).toBeInTheDocument();
    expect(screen.getByText("Light rain")).toBeInTheDocument();
    expect(screen.getByText("H: 18°")).toBeInTheDocument();
    expect(screen.getByText("L: 6°")).toBeInTheDocument();
    expect(screen.getByText("Feels like 11°")).toBeInTheDocument();
    expect(screen.getByText("Updated at 17:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Lviv" })).toBeInTheDocument();
  });

  it("works for places without a region, country or daily forecast", () => {
    renderWithI18n(
      <CurrentConditions
        {...view({ place: { name: "Ocean", region: null, country: null, latitude: 0, longitude: 0 }, daily: [] })}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Ocean" })).toBeInTheDocument();
    expect(screen.queryByText(/^H:/u)).not.toBeInTheDocument();
  });

  it("never shows tomorrow's range as today's when the forecast starts tomorrow", () => {
    const [, tomorrow] = view().forecast.daily;
    renderWithI18n(<CurrentConditions {...view({ daily: tomorrow ? [tomorrow] : [] })} />);
    expect(screen.queryByText("H: 21°")).not.toBeInTheDocument();
    expect(screen.getByText("Feels like 11°")).toBeInTheDocument();
  });
});
