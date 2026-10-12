import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import DailyForecast from "./DailyForecast";

describe("DailyForecast", () => {
  it("lists the days with readable ranges", () => {
    renderWithI18n(<DailyForecast {...view()} />);
    expect(screen.getByRole("heading", { name: "2-day forecast" })).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
    expect(screen.getByText("from 6° to 18°")).toBeInTheDocument();
    expect(screen.getByText("80% chance of precipitation")).toBeInTheDocument();
  });
});
