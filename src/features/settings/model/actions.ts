"use server";

import { cookies, headers } from "next/headers";

import { isPreferenceValue, PREFERENCE_COOKIES, type PreferenceName } from "./preferences";

const ONE_YEAR = 60 * 60 * 24 * 365;

// Stores a valid setting in a cookie the server reads on every page
export const savePreference = async (name: PreferenceName, value: string) => {
  if (!Object.hasOwn(PREFERENCE_COOKIES, name) || !isPreferenceValue(name, value)) return;
  // Secure over HTTPS only: some browsers drop such cookies on http://localhost
  const secure = (await headers()).get("x-forwarded-proto")?.includes("https") ?? false;
  (await cookies()).set(PREFERENCE_COOKIES[name], value, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
    httpOnly: true,
    secure,
  });
};
