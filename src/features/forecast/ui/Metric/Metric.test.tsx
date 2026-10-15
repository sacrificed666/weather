import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Metric from "./Metric";

describe("Metric", () => {
  it("shows the value with its unit, the note and a filled meter", () => {
    const { container } = render(
      <Metric value="12" unit="km/h" share={0.5}>
        Light breeze
      </Metric>,
    );
    expect(container).toHaveTextContent("12 km/h");
    expect(container).toHaveTextContent("Light breeze");
    expect(container.querySelectorAll("rect")[1]).toHaveAttribute("width", "50.0%");
  });

  it("keeps a tiny share visible and leaves an empty meter empty", () => {
    const { container, rerender } = render(
      <Metric value="0.1" share={0.001}>
        Calm
      </Metric>,
    );
    expect(container.querySelectorAll("rect")[1]).toHaveAttribute("width", "4.0%");
    rerender(
      <Metric value="0" share={0}>
        Calm
      </Metric>,
    );
    expect(container.querySelectorAll("rect")).toHaveLength(1);
  });
});
