import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import HumidityCard from "./HumidityCard";

describe("HumidityCard", () => {
  it("shows the humidity with its level", () => {
    renderWithI18n(<HumidityCard {...view()} />);
    expect(screen.getByText("78%")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});
