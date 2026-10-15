import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NOW, view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import SunPath from "./SunPath";

describe("SunPath", () => {
  it("shows sunrise, sunset and the length of the day", () => {
    renderWithI18n(<SunPath {...view()} />);
    expect(screen.getByText("07:32")).toBeInTheDocument();
    expect(screen.getByText("19:01")).toBeInTheDocument();
    expect(screen.getByText("11 hrs 29 mins of daylight")).toBeInTheDocument();
  });

  it("explains polar days and nights", () => {
    const { forecast } = view();
    renderWithI18n(<SunPath {...view({ current: { ...forecast.current, sunrise: null, sunset: null } })} />);
    expect(screen.getByText("The sun does not rise or set today.")).toBeInTheDocument();
  });

  it("does not draw the sun at night", () => {
    const { container } = renderWithI18n(<SunPath {...view({ generatedAt: NOW + 10 * 3600 })} />);
    expect(container.querySelector("circle")).toBeNull();
  });
});
