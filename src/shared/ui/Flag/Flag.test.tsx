import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Flag from "./Flag";

describe("Flag", () => {
  it("loads decorative flags from the app itself", () => {
    render(<Flag country="UA" />);
    const flag = document.querySelector("img[src='/flags/UA']");
    expect(flag).toHaveAttribute("width", "24");
    expect(flag).toHaveAttribute("alt", "");
  });
});
