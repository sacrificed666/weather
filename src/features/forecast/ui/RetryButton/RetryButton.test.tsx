import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import RetryButton from "./RetryButton";

const refresh = vi.hoisted(() => vi.fn<() => void>());

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

describe("RetryButton", () => {
  it("reloads the forecast from the server by default", async () => {
    render(<RetryButton label="Try again" />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("runs the given retry instead", async () => {
    const onRetry = vi.fn<() => void>();
    render(<RetryButton label="Try again" onRetry={onRetry} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(refresh).not.toHaveBeenCalled();
  });
});
