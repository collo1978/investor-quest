"use client";

import { useSyncExternalStore } from "react";

/**
 * Business island hub breakpoints — separate layouts per device class.
 *
 * Mobile:  < md  (< 768px)
 * Tablet:  md → lg
 * Desktop: lg+  (≥ 1024px) — cinematic scene + orbit cards
 */
export type BusinessHubBreakpoint = "mobile" | "tablet" | "desktop";

export function getBusinessHubBreakpoint(): BusinessHubBreakpoint {
  if (typeof window === "undefined") return "mobile";

  const w = window.innerWidth;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const maxTablet = window.matchMedia("(max-width: 1023px)").matches;

  // Touch / PWA: never use desktop orbit below 1280px even if viewport is mis-reported wide
  if (maxTablet || (coarsePointer && w < 1280)) {
    if (w >= 768) return "tablet";
    return "mobile";
  }

  return "desktop";
}

function subscribeBusinessHubBreakpoint(onChange: () => void): () => void {
  const queries = [
    window.matchMedia("(min-width: 768px)"),
    window.matchMedia("(min-width: 1024px)"),
    window.matchMedia("(max-width: 1023px)"),
    window.matchMedia("(pointer: coarse)")
  ];
  const handler = () => onChange();
  for (const mq of queries) {
    mq.addEventListener("change", handler);
  }
  return () => {
    for (const mq of queries) {
      mq.removeEventListener("change", handler);
    }
  };
}

/** Mount exactly one hub layout — desktop scene never hydrates on phones. */
export function useBusinessHubBreakpoint(): BusinessHubBreakpoint {
  return useSyncExternalStore(
    subscribeBusinessHubBreakpoint,
    getBusinessHubBreakpoint,
    () => "mobile"
  );
}
