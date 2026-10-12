import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import DewPointCard from "./DewPointCard";

describe("DewPointCard", () => {
  it("shows the dew point with how the air feels", () => {
    renderWithI18n(<DewPointCard {...view()} />);
    expect(screen.getByRole("heading", { name: "Dew point" })).toBeInTheDocument();
    expect(screen.getByText("9°")).toBeInTheDocument();
    expect(screen.getByText("Comfortable")).toBeInTheDocument();
  });
});
