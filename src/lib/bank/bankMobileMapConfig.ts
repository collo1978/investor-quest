import type { PillarId } from "@/data/pillars";

/** Bank mobile preview map art (`public/logos/mobile-map.png`). */
export const BANK_MOBILE_MAP_PATH = "/logos/mobile-map.png";

/** Portrait map intrinsic ratio (1080×1920). */
export const BANK_MOBILE_MAP_NATURAL_W = 1080;
export const BANK_MOBILE_MAP_NATURAL_H = 1920;
export const BANK_MOBILE_MAP_ASPECT =
  BANK_MOBILE_MAP_NATURAL_W / BANK_MOBILE_MAP_NATURAL_H;

export type BankMobileMapHotspot = {
  id: PillarId;
  cx: number;
  cy: number;
  w: number;
  h: number;
};

/**
 * Hotspot ellipses tuned for `mobile-map.png` (portrait hub layout).
 * Management TL · Forces TR · Financials BL · Business BR · 10K center.
 */
export const BANK_MOBILE_MAP_HOTSPOTS: readonly BankMobileMapHotspot[] = [
  // Business island is the top-left building (NVIDIA tower).
  { id: "business", cx: 26, cy: 24, w: 30, h: 24 },
  { id: "forces", cx: 74, cy: 24, w: 30, h: 24 },
  { id: "financials", cx: 28, cy: 76, w: 32, h: 26 },
  { id: "management", cx: 72, cy: 76, w: 32, h: 26 }
];

export const BANK_MOBILE_REACTOR_CENTER = { x: 50, y: 50 } as const;
