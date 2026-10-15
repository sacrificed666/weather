import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Icon from "./Icon";

describe("Icon", () => {
  it("draws decorative outlined icons in the requested size", () => {
    const { container } = render(<Icon name="search" size={32} />);
    const icon = container.querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("fill", "none");
    expect(icon).toHaveAttribute("stroke", "currentColor");
    expect(icon).toHaveAttribute("width", "32");
  });
});
