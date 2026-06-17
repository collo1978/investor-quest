import type { PillarId } from "@/data/pillars";

/** Desktop / widescreen map art (`public/logos/desktop-map.png`). */
export const DESKTOP_MAP_PATH = "/logos/desktop-map.png";

/** 16:9 desktop map (1920×1080). */
export const DESKTOP_MAP_NATURAL_W = 1920;
export const DESKTOP_MAP_NATURAL_H = 1080;
export const DESKTOP_MAP_ASPECT =
  DESKTOP_MAP_NATURAL_W / DESKTOP_MAP_NATURAL_H;

export type DesktopMapHotspot = {
  id: PillarId;
  cx: number;
  cy: number;
  w: number;
  h: number;
};

/**
 * Hotspot ellipses tuned for `desktop-map.png` (16:9 hub layout).
 * Business TL · Forces TR · Financials BL · Management BR · 10K center.
 */
export const DESKTOP_MAP_HOTSPOTS: readonly DesktopMapHotspot[] = [
  { id: "business", cx: 24, cy: 32, w: 22, h: 28 },
  { id: "forces", cx: 76, cy: 32, w: 22, h: 28 },
  { id: "financials", cx: 24, cy: 68, w: 24, h: 30 },
  { id: "management", cx: 76, cy: 68, w: 24, h: 30 }
];

export const DESKTOP_REACTOR_CENTER = { x: 50, y: 50 } as const;
