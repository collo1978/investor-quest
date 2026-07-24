/**
 * Schools UI breakpoints — intentionally designed per device class, not scaled desktop.
 *
 * Mobile:  < md  (< 768px)  phones, portrait-first
 * Tablet:  md → lg          iPad / touch hybrid
 * Desktop: lg+  (≥ 1024px)  full widescreen
 */
export const SCHOOLS_DEVICE = {
  mobileOnly: "md:hidden",
  tabletOnly: "hidden md:flex lg:hidden",
  desktopOnly: "hidden lg:flex"
} as const;
