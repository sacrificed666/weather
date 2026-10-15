import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/test/render";

import Sky from "./Sky";

describe("Sky", () => {
  it("exposes the sky to the styles and hides it from assistive technology", () => {
    const { container } = renderWithI18n(<Sky sky="clear-night" />);
    const sky = container.querySelector("[data-sky]");
    expect(sky).toHaveAttribute("data-sky", "clear-night");
    expect(sky).toHaveAttribute("aria-hidden", "true");
  });
});
