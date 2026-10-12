import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WeatherIcon from "./WeatherIcon";

describe("WeatherIcon", () => {
  it("shows still icons when the effects are reduced", () => {
    render(<WeatherIcon name="snow" size={40} label="Snow" animated={false} />);
    const weather = screen.getByRole("img", { name: "Snow" });
    expect(weather).toHaveAttribute("src", "/icons/weather-static/snow.svg");
    expect(weather.closest("picture")).toBeNull();
  });

  it("loads animated icons from the app itself with a still fallback", () => {
    render(<WeatherIcon name="rain" size={48} label="Rain" priority />);
    const weather = screen.getByRole("img", { name: "Rain" });
    expect(weather).toHaveAttribute("src", "/icons/weather/rain.svg");
    expect(weather).toHaveAttribute("loading", "eager");
    expect(weather.parentElement?.querySelector("source")).toHaveAttribute("srcset", "/icons/weather-static/rain.svg");
    expect(weather.parentElement?.querySelector("source")).toHaveAttribute("media", "(prefers-reduced-motion: reduce)");
  });
});
