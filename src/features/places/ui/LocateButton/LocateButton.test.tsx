import { act, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/test/render";

import LocateButton from "./LocateButton";

const push = vi.hoisted(() => vi.fn<(href: string) => void>());

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeEach(() => {
  push.mockReset();
});

// A position the browser reports
const position = (latitude: number, longitude: number): GeolocationPosition => ({
  timestamp: 0,
  coords: {
    latitude,
    longitude,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    toJSON: () => ({}),
  },
  toJSON: () => ({}),
});

// An error of the geolocation API
const positionError = (code: number): GeolocationPositionError => ({
  code,
  message: "",
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
});

// Replaces the geolocation of the browser
const stubGeolocation = (getCurrentPosition: Geolocation["getCurrentPosition"]) => {
  const geolocation: Geolocation = {
    getCurrentPosition,
    watchPosition: vi.fn<Geolocation["watchPosition"]>(),
    clearWatch: vi.fn<Geolocation["clearWatch"]>(),
  };
  vi.stubGlobal("navigator", Object.assign(Object.create(navigator), { geolocation }));
};

describe("LocateButton", () => {
  it("opens the forecast for the current position", async () => {
    stubGeolocation((success) => success(position(50.4501, 30.5234)));
    const { user } = renderWithI18n(<LocateButton />);
    await user.click(screen.getByRole("button", { name: "Use my location" }));
    expect(push).toHaveBeenCalledWith("/en?lat=50.45&lon=30.52");
  });

  it("explains a blocked permission and hides the message after a while", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    stubGeolocation((_success, failure) => failure?.(positionError(1)));
    const { user } = renderWithI18n(<LocateButton />);
    await user.click(screen.getByRole("button", { name: "Use my location" }));
    expect(screen.getByRole("status")).toHaveTextContent("Location access is blocked in your browser.");
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    await waitFor(() => expect(screen.getByRole("status", { hidden: true })).not.toBeVisible());
    vi.useRealTimers();
  });

  it("explains other failures", async () => {
    stubGeolocation((_success, failure) => failure?.(positionError(2)));
    const { user } = renderWithI18n(<LocateButton />);
    await user.click(screen.getByRole("button", { name: "Use my location" }));
    expect(screen.getByRole("status")).toHaveTextContent("Your location could not be determined.");
  });

  it("explains a browser without geolocation", async () => {
    vi.stubGlobal("navigator", {});
    const { user } = renderWithI18n(<LocateButton />);
    await user.click(screen.getByRole("button", { name: "Use my location" }));
    expect(screen.getByRole("status")).toHaveTextContent("Your location could not be determined.");
  });
});
