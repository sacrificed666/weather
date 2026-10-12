import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JsonLd from "./JsonLd";

describe("JsonLd", () => {
  it("renders escaped structured data", () => {
    const { container } = render(<JsonLd data={{ "@type": "Thing", name: "<b>" }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).toBe('{"@type":"Thing","name":"\\u003cb>"}');
  });
});
