import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import HourlyForecast from "./HourlyForecast";

describe("HourlyForecast", () => {
  it("starts with now and lists the next hours with their chance of rain", () => {
    renderWithI18n(<HourlyForecast {...view()} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(within(items[0]!).getByText("Now")).toBeInTheDocument();
    expect(within(items[1]!).getByText("18:00")).toBeInTheDocument();
    expect(within(items[1]!).getByText("40% chance of precipitation")).toBeInTheDocument();
    expect(within(items[2]!).queryByText(/chance/u)).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Broken clouds" })).toBeInTheDocument();
  });
});
