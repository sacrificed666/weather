import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import PrecipitationCard from "./PrecipitationCard";

describe("PrecipitationCard", () => {
  it("shows the precipitation of the last hour", () => {
    renderWithI18n(<PrecipitationCard {...view()} />);
    expect(screen.getByText("0.4 mm")).toBeInTheDocument();
  });
});
