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
