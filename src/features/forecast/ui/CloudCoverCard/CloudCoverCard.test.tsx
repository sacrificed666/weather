import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import CloudCoverCard from "./CloudCoverCard";

describe("CloudCoverCard", () => {
  it("shows the cloud cover with a short description", () => {
    renderWithI18n(<CloudCoverCard {...view()} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("Mostly cloudy")).toBeInTheDocument();
  });
});
