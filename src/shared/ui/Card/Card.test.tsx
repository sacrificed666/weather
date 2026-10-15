import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Card from "./Card";

describe("Card", () => {
  it("names cards after their heading", () => {
    render(
      <Card title="Wind" icon="wind">
        <p>Calm</p>
      </Card>,
    );
    expect(screen.getByRole("region", { name: "Wind" })).toHaveTextContent("Calm");
  });
});
