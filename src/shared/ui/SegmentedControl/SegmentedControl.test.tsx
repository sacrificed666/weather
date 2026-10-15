import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SegmentedControl from "./SegmentedControl";

describe("SegmentedControl", () => {
  it("switches segments like radio buttons", async () => {
    const onChange = vi.fn<(value: string) => void>();
    render(
      <SegmentedControl
        label="Units"
        name="units"
        value="metric"
        onChange={onChange}
        options={[
          { value: "metric", label: "Metric" },
          { value: "imperial", label: "Imperial", icon: "ruler" },
        ]}
      />,
    );
    expect(screen.getByRole("group", { name: "Units" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Metric" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Imperial" }));
    expect(onChange).toHaveBeenCalledWith("imperial");
  });
});
