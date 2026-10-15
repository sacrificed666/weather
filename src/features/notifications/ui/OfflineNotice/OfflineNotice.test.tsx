import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/test/render";

import OfflineNotice from "./OfflineNotice";

const offline = vi.hoisted(() => ({ value: false }));

vi.mock("next/offline", () => ({ useOffline: () => offline.value }));

describe("OfflineNotice", () => {
  it("keeps the live region and fills it only while offline", () => {
    offline.value = false;
    const { rerender } = renderWithI18n(<OfflineNotice />);
    const region = screen.getByRole("status");
    expect(region).toBeEmptyDOMElement();
    offline.value = true;
    rerender(<OfflineNotice />);
    expect(screen.getByRole("status")).toBe(region);
    expect(region).toHaveTextContent("You are offline. The forecast will refresh when you are back online.");
    offline.value = false;
    rerender(<OfflineNotice />);
    expect(region).toBeEmptyDOMElement();
  });
});
