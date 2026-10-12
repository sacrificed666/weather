import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { t } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import Footer from "./Footer";

describe("Footer", () => {
  it("credits the data, the icons and the author and shows the version", () => {
    renderWithI18n(<Footer t={t} />);
    expect(screen.getByRole("link", { name: /^OpenWeatherMap/ })).toHaveAttribute("href", "https://openweathermap.org");
    expect(screen.getByRole("link", { name: /^Meteocons/ })).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: /^Source code/ })).toHaveAttribute(
      "href",
      "https://github.com/sacrificed666/weather",
    );
    expect(screen.getByRole("link", { name: /^v1\.0\.0/ })).toHaveAttribute(
      "href",
      "https://github.com/sacrificed666/weather/blob/main/CHANGELOG.md",
    );
    expect(screen.getAllByRole("link")).toHaveLength(4);
    expect(screen.getByText(`© ${new Date().getFullYear()} Illia Movchko`, { exact: false })).toBeInTheDocument();
  });

  it("tells screen readers that the links open a new tab", () => {
    renderWithI18n(<Footer t={t} />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveTextContent("(opens in a new tab)");
    }
  });
});
