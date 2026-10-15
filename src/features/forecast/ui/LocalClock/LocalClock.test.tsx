import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NOW } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import LocalClock from "./LocalClock";

describe("LocalClock", () => {
  it("shows the date and time of the place and keeps ticking", () => {
    vi.useFakeTimers({ now: (NOW + 60) * 1000 });
    renderWithI18n(<LocalClock timezoneOffset={10_800} renderedAt={NOW + 60} />);
    expect(screen.getByText("Friday 3 October, 17:01")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("Friday 3 October, 17:02")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
