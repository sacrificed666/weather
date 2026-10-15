import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FALLBACK_MESSAGES } from "@/shared/i18n/fallback";
import { LOCALES } from "@/shared/i18n/locales";
import { createFallbackTranslator } from "@/shared/i18n/translate";
import { t } from "@/test/fixtures";
import { renderWithI18n } from "@/test/render";

import ForecastError from "./ForecastError";

const refresh = vi.hoisted(() => vi.fn<() => void>());

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

describe("ForecastError", () => {
  it("explains a missing city without offering a retry", () => {
    renderWithI18n(<ForecastError kind="not-found" t={t} home="/uk" />);
    expect(screen.getByRole("alert")).toHaveTextContent("City not found");
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to the forecast" })).toHaveAttribute("href", "/uk");
  });

  it("refreshes the page to retry", async () => {
    const { user } = renderWithI18n(<ForecastError kind="unavailable" t={t} home="/en" />);
    expect(screen.getByRole("heading", { name: "The weather service is unavailable" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("uses a custom retry when one is given", async () => {
    const retry = vi.fn<() => void>();
    const { user } = renderWithI18n(
      <ForecastError kind="unexpected" t={t} home="/en" digest="1234567890" onRetry={retry} />,
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Error reference: 1234567890")).toBeInTheDocument();
  });

  it.each([
    ["missing-key", "The weather service is not set up"],
    ["invalid-key", "The API key was rejected"],
    ["rate-limited", "Too many requests"],
  ] as const)("explains %s", (kind, title) => {
    renderWithI18n(<ForecastError kind={kind} t={t} home="/en" />);
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  });

  it.each(LOCALES)("needs no text beyond the %s fallback for an unexpected error", (locale) => {
    const fallback = createFallbackTranslator(FALLBACK_MESSAGES[locale]);
    renderWithI18n(
      <ForecastError kind="unexpected" t={fallback} home={`/${locale}`} digest="42" onRetry={vi.fn<() => void>()} />,
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(/error\./u);
  });
});
