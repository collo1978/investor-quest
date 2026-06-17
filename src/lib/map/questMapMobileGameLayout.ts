import type { PillarId } from "@/data/pillars";

export type MapHotspotGeom = {
  id: PillarId;
  cx: number;
  cy: number;
  w: number;
  h: number;
};

/** Subtle zoom — portrait art already fills mobile frame. */
export const BANK_MOBILE_MAP_ZOOM = 1.06;

/** Vertical anchor for the scaled map stack (% of stage height). */
export const BANK_MOBILE_MAP_CENTER_Y_PERCENT = 52;

export const BANK_MOBILE_REACTOR_WIDTH_PERCENT = 26;

/** Scale island hit targets on the zoomed map. */
export function scaleHotspotForMobileGame(spot: MapHotspotGeom): MapHotspotGeom {
  const pull = 0.06;
  return {
    ...spot,
    cx: spot.cx + (50 - spot.cx) * pull,
    cy: spot.cy + (50 - spot.cy) * pull,
    w: spot.w * 1.18,
    h: spot.h * 1.18
  };
}

/**
 * Letterbox-fit the map inside the stage (preserves aspect ratio).
 * Zoom is applied separately via CSS scale on the centered wrapper.
 */
export function computeBankMobileImageBox(
  stageWidth: number,
  stageHeight: number,
  aspect: number
): { w: number; h: number } {
  const stageAspect = stageWidth / stageHeight;
  let w: number;
  let h: number;
  if (stageAspect > aspect) {
    h = stageHeight;
    w = h * aspect;
  } else {
    w = stageWidth;
    h = w / aspect;
  }
  return { w: Math.round(w), h: Math.round(h) };
}
