"use client";

import { useSyncExternalStore } from "react";

/**
 * Business island hub breakpoints — separate layouts per device class.
 *
 * Mobile:  < md  (< 768px)
 * Tablet:  md → lg
 * Desktop: lg+  (≥ 1024px) — cinematic scene + orbit cards
 */
export const BUSINESS_HUB_DEVICE = {
  mobileOnly: "md:hidden",
  tabletOnly: "hidden md:flex lg:hidden",
  desktopOnly: "hidden lg:block"
} as const;

export type BusinessHubBreakpoint = "mobile" | "tablet" | "desktop";

export function getBusinessHubBreakpoint(): BusinessHubBreakpoint {
  if (typeof window === "undefined") return "mobile";
  if (window.matchMedia("(min-width: 1024px)").matches) return "desktop";
  if (window.matchMedia("(min-width: 768px)").matches) return "tablet";
  return "mobile";
}

function subscribeBusinessHubBreakpoint(onChange: () => void): () => void {
  const md = window.matchMedia("(min-width: 768px)");
  const lg = window.matchMedia("(min-width: 1024px)");
  const handler = () => onChange();
  md.addEventListener("change", handler);
  lg.addEventListener("change", handler);
  return () => {
    md.removeEventListener("change", handler);
    lg.removeEventListener("change", handler);
  };
}

/** Mount only the active hub layout (avoids zero-width carousel measure in hidden DOM). */
export function useBusinessHubBreakpoint(): BusinessHubBreakpoint {
  return useSyncExternalStore(
    subscribeBusinessHubBreakpoint,
    getBusinessHubBreakpoint,
    () => "mobile"
  );
}
