import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import WindCard from "./WindCard";

describe("WindCard", () => {
  it("describes the wind", () => {
    renderWithI18n(<WindCard {...view()} />);
    expect(screen.getByText("5 m/s")).toBeInTheDocument();
    expect(screen.getByText("9 m/s")).toBeInTheDocument();
    expect(screen.getByText("235° SW")).toBeInTheDocument();
  });

  it("calls a still day calm and hides missing wind details", () => {
    const { forecast } = view();
    renderWithI18n(
      <WindCard {...view({ current: { ...forecast.current, wind: { speed: 0.2, gust: null, direction: null } } })} />,
    );
    expect(screen.getByText("Calm")).toBeInTheDocument();
    expect(screen.queryByText("Gusts")).not.toBeInTheDocument();
    expect(screen.queryByText("Direction")).not.toBeInTheDocument();
  });
});
