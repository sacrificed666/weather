import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TemperatureRange from "./TemperatureRange";

describe("TemperatureRange", () => {
  it("places the day's range and the current temperature on the shared scale", () => {
    const { container } = render(<TemperatureRange low={5} high={15} scaleMin={0} scaleMax={20} current={10} />);
    const bar = container.querySelectorAll("rect")[1];
    expect(bar).toHaveAttribute("x", "25.00%");
    expect(bar).toHaveAttribute("width", "50.00%");
    expect(container.querySelector("circle")).toHaveAttribute("cx", "50.00%");
  });

  it("keeps a range without spread visible and leaves out the current temperature", () => {
    const { container } = render(<TemperatureRange low={20} high={20} scaleMin={0} scaleMax={20} />);
    const bar = container.querySelectorAll("rect")[1];
    expect(bar).toHaveAttribute("x", "96.00%");
    expect(bar).toHaveAttribute("width", "4.00%");
    expect(container.querySelector("circle")).toBeNull();
  });
});
