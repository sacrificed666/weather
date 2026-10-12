import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { jsonResponse } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import type { Place } from "../../model/place";
import { recentPlaces, rememberPlace } from "../../model/storedPlaces";
import CitySearch from "./CitySearch";

const push = vi.hoisted(() => vi.fn<(href: string) => void>());

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const kyiv: Place = { name: "Kyiv", region: "Kyiv City", country: "UA", latitude: 50.45, longitude: 30.52 };
const lviv: Place = { name: "Lviv", region: "Lviv Oblast", country: "UA", latitude: 49.84, longitude: 24.03 };

beforeEach(() => {
  push.mockReset();
});

describe("CitySearch", () => {
  it("suggests cities and opens the one picked with the keyboard", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ places: [kyiv, lviv, { name: 1 }] }));
    vi.stubGlobal("fetch", fetchMock);
    const { user } = renderWithI18n(<CitySearch />);
    const input = screen.getByRole("combobox", { name: "Search for a city" });

    await user.type(input, "Ky");
    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["KyivKyiv City, Ukraine", "LvivLviv Oblast, Ukraine"]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/places?q=Ky&lang=en",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(screen.getByText("Suggestions: 2")).toBeInTheDocument();

    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}");
    expect(input).toHaveAttribute("aria-activedescendant", options[0]?.id);
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Enter}");

    expect(push).toHaveBeenCalledWith("/en?lat=50.45&lon=30.52");
    expect(recentPlaces.getSnapshot()).toEqual([kyiv]);
    expect(input).toHaveValue("");
  });

  it("opens a city by name when nothing is selected", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ places: [] })));
    const { user } = renderWithI18n(<CitySearch />);
    await user.type(screen.getByRole("combobox"), "Atlantis");
    expect(await screen.findByText("No cities match “Atlantis”.")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(push).toHaveBeenCalledWith("/en?city=Atlantis");
  });

  it("opens a suggestion on click", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ places: [lviv] })));
    const { user } = renderWithI18n(<CitySearch />);
    await user.type(screen.getByRole("combobox"), "Lv");
    await user.click(await screen.findByRole("option", { name: /Lviv/u }));
    expect(push).toHaveBeenCalledWith("/en?lat=49.84&lon=24.03");
  });

  it("explains when the search fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ error: "rate-limited" }, 429)));
    const { user } = renderWithI18n(<CitySearch />);
    await user.type(screen.getByRole("combobox"), "Lviv");
    expect(await screen.findByText("Search is unavailable right now.")).toBeInTheDocument();
  });

  it("explains when the network is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const { user } = renderWithI18n(<CitySearch />);
    await user.type(screen.getByRole("combobox"), "Lviv");
    expect(await screen.findByText("Search is unavailable right now.")).toBeInTheDocument();
  });

  it("shows recent places for an empty query and can forget them", async () => {
    rememberPlace(lviv);
    const { user } = renderWithI18n(<CitySearch />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: /Lviv/u })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear recent searches" }));
    expect(recentPlaces.getSnapshot()).toEqual([]);
  });

  it("closes with Escape, then clears the text", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ places: [lviv] })));
    const { user } = renderWithI18n(<CitySearch />);
    const input = screen.getByRole("combobox");
    await user.type(input, "Lv");
    await screen.findByRole("option");
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("");
  });

  it("clears the text with the clear button and closes when focus leaves", async () => {
    const { user } = renderWithI18n(
      <>
        <CitySearch />
        <button type="button">Elsewhere</button>
      </>,
    );
    const input = screen.getByRole("combobox");
    await user.type(input, "L");
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});
