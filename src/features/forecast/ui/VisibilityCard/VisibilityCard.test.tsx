import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { view } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import VisibilityCard from "./VisibilityCard";

describe("VisibilityCard", () => {
  it("shows visibility only when it is known", () => {
    const { forecast } = view();
    const { container } = renderWithI18n(
      <VisibilityCard {...view({ current: { ...forecast.current, visibility: null } })} />,
    );
    expect(container).toBeEmptyDOMElement();
    renderWithI18n(<VisibilityCard {...view()} />);
    expect(screen.getByText("10 km")).toBeInTheDocument();
    expect(screen.getByText("Clear view")).toBeInTheDocument();
  });
});
