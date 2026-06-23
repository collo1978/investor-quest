import type { CSSProperties } from "react";

import { LOCKED_BUSINESS_HUB_TOWER_EMBLEM } from "@/lib/hub/lockedCompanyEmblemPositions";

/**
 * Master scene — all overlays use % of this box (never viewport edges).
 * Desktop / tablet landscape: wide 16:9 cinematic canvas.
 */
export const BUSINESS_SCENE_STYLE: CSSProperties = {
  position: "relative",
  width: "100%",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "visible"
};

/**
 * Portrait phones — tall stage that fills the viewport (not a shrunk 16:9 strip).
 * Height is finalized in CSS (`min(86dvh, …)`) so cards and art share one tall box.
 */
export const BUSINESS_SCENE_STYLE_PORTRAIT: CSSProperties = {
  position: "relative",
  width: "100%",
  aspectRatio: "10 / 14",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "visible"
};

/** Quest card slots — staggered path 1→7; left/right pairs with clear vertical gaps (desktop). */
export const BUSINESS_MAP_CARD_POSITIONS: Record<number, CSSProperties> = {
  /** Top left — WHAT NVIDIA DOES */
  1: {
    top: "4%",
    left: "4%"
  },
  /** Top right — WHAT'S NVIDIA'S PRODUCT SEGMENTS? (inset left of progress HUD) */
  2: {
    top: "4%",
    right: "24%"
  },
  /** Middle right — HOW NVIDIA STAYS AHEAD */
  3: {
    top: "26%",
    right: "4%"
  },
  /** Lower right — HOW NVIDIA SELLS AND MARKETS */
  4: {
    top: "48%",
    right: "4%"
  },
  /** Middle left — WHO MAKES NVIDIA'S CHIPS? */
  5: {
    top: "26%",
    left: "4%"
  },
  /** Lower left — HOW TOUGH IS THIS INDUSTRY? */
  6: {
    top: "48%",
    left: "4%"
  },
  /** Bottom center — WHO IS NVIDIA COMPETING AGAINST? */
  7: {
    top: "72%",
    left: "50%",
    transform: "translateX(-50%)"
  }
};

/**
 * Portrait orbit — cards spread on a tall canvas (same world, recomposed for iPhone).
 * Slots sit on the island path from crown → flanks → lower ring → base.
 */
export const BUSINESS_MAP_CARD_POSITIONS_PORTRAIT: Record<number, CSSProperties> = {
  1: {
    top: "2%",
    left: "1%"
  },
  2: {
    top: "18%",
    left: "1%"
  },
  3: {
    top: "22%",
    right: "1%"
  },
  4: {
    top: "40%",
    right: "1%"
  },
  5: {
    top: "36%",
    left: "1%"
  },
  6: {
    top: "40%",
    left: "1%"
  },
  7: {
    top: "58%",
    left: "50%",
    transform: "translateX(-50%)"
  }
};

/** @deprecated Use BUSINESS_MAP_CARD_POSITIONS_PORTRAIT */
export const BUSINESS_MAP_CARD_POSITIONS_MOBILE =
  BUSINESS_MAP_CARD_POSITIONS_PORTRAIT;

export const BUSINESS_MAP_CARD_WIDTH: CSSProperties = {
  width: "clamp(260px, 17vw, 390px)"
};

/** Slot 7 — final mission; slightly larger than the orbit cards. */
export const BUSINESS_MAP_FINALE_CARD_WIDTH: CSSProperties = {
  width: "clamp(295px, 19.5vw, 445px)"
};

export function resolveBusinessMapCardWidth(orderNumber: number): CSSProperties {
  return orderNumber === 7 ? BUSINESS_MAP_FINALE_CARD_WIDTH : BUSINESS_MAP_CARD_WIDTH;
}

/** Portrait — sized in CSS too; this sets the non-portrait fallback for SSR. */
export const BUSINESS_MAP_CARD_WIDTH_PORTRAIT: CSSProperties = {
  width: "clamp(7rem, 31vw, 10.25rem)"
};

/** @see LOCKED_BUSINESS_HUB_TOWER_EMBLEM — same slot for every company logo. */
export const BUSINESS_MAP_COMPANY_LOGO_POSITION: CSSProperties =
  LOCKED_BUSINESS_HUB_TOWER_EMBLEM;

/** Tower anchor when the stage is tall (island center sits higher in the crop). */
export const BUSINESS_MAP_COMPANY_LOGO_POSITION_PORTRAIT: CSSProperties = {
  top: "34%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  height: "clamp(2.25rem, 6.4%, 3.25rem)",
  width: "clamp(2.1rem, 5.9%, 3rem)",
  maxHeight: "56px",
  maxWidth: "52px"
};

/** Crop focus for `biz-quest.webp` on a tall portrait stage. */
export const BUSINESS_HUB_SCENE_OBJECT_POSITION_PORTRAIT = "center 26%" as const;

export const BUSINESS_MAP_AMBIENT_PARTICLES = [
  { left: "28%", top: "22%", size: 3, delay: 0 },
  { left: "62%", top: "20%", size: 2, delay: 0.8 },
  { left: "24%", top: "42%", size: 2, delay: 2.2 },
  { left: "50%", top: "14%", size: 2, delay: 1.1 },
  { left: "50%", top: "58%", size: 3, delay: 2.8 },
  { left: "34%", top: "60%", size: 2, delay: 0.4 },
  { left: "58%", top: "62%", size: 2, delay: 1.9 }
] as const;
