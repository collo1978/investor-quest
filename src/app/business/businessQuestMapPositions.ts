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

/** Quest card slots — symmetric orbit around the island (desktop / wide). */
export const BUSINESS_MAP_CARD_POSITIONS: Record<number, CSSProperties> = {
  1: {
    top: "2.5%",
    left: "50%",
    transform: "translateX(-50%)"
  },
  2: {
    top: "34%",
    left: "8%"
  },
  3: {
    top: "34%",
    right: "8%"
  },
  4: {
    top: "62%",
    left: "8%"
  },
  5: {
    top: "58%",
    right: "8%"
  },
  6: {
    top: "78%",
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
    top: "3%",
    left: "50%",
    transform: "translateX(-50%)"
  },
  2: {
    top: "17%",
    left: "1%"
  },
  3: {
    top: "17%",
    right: "1%"
  },
  4: {
    top: "41%",
    left: "1%"
  },
  5: {
    top: "41%",
    right: "1%"
  },
  6: {
    top: "67%",
    left: "50%",
    transform: "translateX(-50%)"
  }
};

/** @deprecated Use BUSINESS_MAP_CARD_POSITIONS_PORTRAIT */
export const BUSINESS_MAP_CARD_POSITIONS_MOBILE =
  BUSINESS_MAP_CARD_POSITIONS_PORTRAIT;

export const BUSINESS_MAP_CARD_WIDTH: CSSProperties = {
  width: "clamp(220px, 18vw, 320px)"
};

/** Portrait — sized in CSS too; this sets the non-portrait fallback for SSR. */
export const BUSINESS_MAP_CARD_WIDTH_PORTRAIT: CSSProperties = {
  width: "clamp(7rem, 31vw, 10.25rem)"
};

/** @see LOCKED_BUSINESS_HUB_TOWER_EMBLEM — same slot for every company logo. */
export const BUSINESS_MAP_COMPANY_LOGO_POSITION: CSSProperties =
  LOCKED_BUSINESS_HUB_TOWER_EMBLEM;

/** Tower anchor when the stage is tall (island center sits higher in the crop). */
export const BUSINESS_MAP_COMPANY_LOGO_POSITION_PORTRAIT: CSSProperties = {
  top: "36%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  height: "clamp(2.65rem, 7.5%, 3.85rem)",
  width: "clamp(2.45rem, 7%, 3.55rem)",
  maxHeight: "68px",
  maxWidth: "64px"
};

/** Crop focus for `biz-quest.webp` on a tall portrait stage. */
export const BUSINESS_HUB_SCENE_OBJECT_POSITION_PORTRAIT = "center 26%" as const;

export const BUSINESS_MAP_AMBIENT_PARTICLES = [
  { left: "22%", top: "20%", size: 3, delay: 0 },
  { left: "68%", top: "16%", size: 2, delay: 0.8 },
  /* Avoid slot 3 (top-right Operations) — was read as false “active” glow */
  { left: "18%", top: "44%", size: 2, delay: 2.2 },
  { left: "50%", top: "10%", size: 2, delay: 1.1 },
  { left: "52%", top: "64%", size: 3, delay: 2.8 },
  { left: "30%", top: "68%", size: 2, delay: 0.4 },
  { left: "66%", top: "70%", size: 2, delay: 1.9 }
] as const;
