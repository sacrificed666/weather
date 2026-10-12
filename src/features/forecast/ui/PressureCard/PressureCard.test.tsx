import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import PressureCard from "./PressureCard";

describe("PressureCard", () => {
  it("shows pressure in the selected units", () => {
    const imperial = { ...view(), format: { ...view().format, units: "imperial" as const, pressure: () => "29.8" } };
    renderWithI18n(<PressureCard {...view()} />);
    expect(screen.getByText("1,009")).toBeInTheDocument();
    expect(screen.getByText("hPa")).toBeInTheDocument();
    expect(screen.getByText("Normal")).toBeInTheDocument();
    renderWithI18n(<PressureCard {...imperial} />);
    expect(screen.getByText("inHg")).toBeInTheDocument();
  });
});
