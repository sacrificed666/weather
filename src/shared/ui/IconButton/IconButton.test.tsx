import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import IconButton from "./IconButton";

describe("IconButton", () => {
  it("labels icon buttons and shows a spinner while busy", async () => {
    const onClick = vi.fn<() => void>();
    const { rerender } = render(<IconButton icon="locate" label="Locate" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Locate" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<IconButton icon="locate" label="Locate" busy />);
    expect(screen.getByRole("button", { name: "Locate" })).toHaveAttribute("aria-busy", "true");
  });
});
