"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let saving = false;

// Registers a component to hear when saving starts or ends
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Tells every subscriber whether a setting is being saved
export const publishSaving = (value: boolean) => {
  if (saving === value) return;
  saving = value;
  for (const listener of listeners) listener();
};

// Whether a setting is being saved
export const useSaving = () =>
  useSyncExternalStore(
    subscribe,
    () => saving,
    () => false,
  );
