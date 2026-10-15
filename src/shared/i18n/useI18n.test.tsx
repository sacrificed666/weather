import { render, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import I18nProvider from "./I18nProvider";
import { uk } from "./messages/uk";
import { useI18n } from "./useI18n";

// The Ukrainian catalog around a component
const UkrainianProvider = ({ children }: { children: ReactNode }) => (
  <I18nProvider locale="uk" messages={uk}>
    {children}
  </I18nProvider>
);

// Shows one translated text
const Probe = () => <p>{useI18n().t("app.name")}</p>;

describe("useI18n", () => {
  it("translates with the provided messages", () => {
    const { result } = renderHook(() => useI18n(), { wrapper: UkrainianProvider });
    expect(result.current.locale).toBe("uk");
    expect(result.current.intlLocale).toBe("uk-UA");
    expect(result.current.t("app.name")).toBe("Погода");
  });

  it("fails loudly outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => null);
    expect(() => render(<Probe />)).toThrow("useI18n must be used inside I18nProvider");
  });
});
