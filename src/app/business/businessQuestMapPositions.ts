import type { CSSProperties } from "react";

import { LOCKED_BUSINESS_HUB_TOWER_EMBLEM } from "@/lib/hub/lockedCompanyEmblemPositions";

/**
 * Master scene — all overlays use % of this box (never viewport edges).
 * @see BusinessQuestMap scene container
 */
export const BUSINESS_SCENE_STYLE: CSSProperties = {
  position: "relative",
  width: "min(92vw, 1600px)",
  aspectRatio: "16 / 9",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "visible"
};

/** Quest card slots — symmetric orbit around the island. */
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
    top: "62%",
    right: "8%"
  }
};

export const BUSINESS_MAP_CARD_WIDTH: CSSProperties = {
  width: "clamp(220px, 18vw, 320px)"
};

/** @see LOCKED_BUSINESS_HUB_TOWER_EMBLEM — same slot for every company logo. */
export const BUSINESS_MAP_COMPANY_LOGO_POSITION: CSSProperties =
  LOCKED_BUSINESS_HUB_TOWER_EMBLEM;

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
