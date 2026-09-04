"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 640px)";

function subscribe(callback: () => void) {
  if (typeof window.matchMedia !== "function") return () => undefined;
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSnapshot() {
  return typeof window.matchMedia === "function" && window.matchMedia(QUERY).matches;
}

export function useWideDashboardChart() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
