import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/test/render";

import type { Place } from "../../model/place";
import { SAVED_PLACES_LIMIT, savedPlaces, toggleSavedPlace } from "../../model/storedPlaces";
import SavePlaceButton from "./SavePlaceButton";

const push = vi.hoisted(() => vi.fn<(href: string) => void>());

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const kyiv: Place = { name: "Kyiv", region: "Kyiv City", country: "UA", latitude: 50.45, longitude: 30.52 };
const lviv: Place = { name: "Lviv", region: "Lviv Oblast", country: "UA", latitude: 49.84, longitude: 24.03 };

beforeEach(() => {
  push.mockReset();
});

describe("SavePlaceButton", () => {
  it("saves and unsaves the current place", async () => {
    const { user } = renderWithI18n(<SavePlaceButton place={lviv} />);
    const button = screen.getByRole("button", { name: "Save Lviv" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(savedPlaces.getSnapshot()).toEqual([lviv]);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAccessibleName("Save Lviv");
    await user.click(button);
    expect(savedPlaces.getSnapshot()).toEqual([]);
  });

  it("explains a full list instead of silently ignoring the star", async () => {
    for (let index = 0; index < SAVED_PLACES_LIMIT; index += 1) {
      toggleSavedPlace({ ...kyiv, name: `Place ${index}`, latitude: index });
    }
    const { user } = renderWithI18n(<SavePlaceButton place={lviv} />);
    const button = screen.getByRole("button", { name: "Saved places are full. Remove one to save Lviv" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    await user.click(button);
    expect(savedPlaces.getSnapshot()).toHaveLength(SAVED_PLACES_LIMIT);
    expect(button).toHaveAttribute("aria-pressed", "false");
  });
});
