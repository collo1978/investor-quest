"use client";

import { useSyncExternalStore } from "react";

/** True below Tailwind `md` (768px) — tighter card slots + widths. */
export function getBusinessHubNarrowViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

function subscribeNarrow(onChange: () => void): () => void {
  const mq = window.matchMedia("(max-width: 767px)");
  const handler = () => onChange();
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}

export function useBusinessHubNarrowViewport(): boolean {
  return useSyncExternalStore(
    subscribeNarrow,
    getBusinessHubNarrowViewport,
    () => false
  );
}
