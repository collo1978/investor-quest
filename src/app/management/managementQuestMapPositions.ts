import type { CSSProperties } from "react";

/**
 * Master scene — all overlays use % of this box (never viewport edges).
 * @see ManagementQuestMap scene container
 */
export const MANAGEMENT_SCENE_STYLE: CSSProperties = {
  position: "relative",
  width: "min(92vw, 1600px)",
  aspectRatio: "16 / 9",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "visible"
};

/** Management boardroom island — symmetric executive slots. */
export const MANAGEMENT_MAP_CARD_POSITIONS: Record<number, CSSProperties> = {
  1: {
    top: "18%",
    left: "5%"
  },
  2: {
    top: "18%",
    right: "5%"
  },
  3: {
    top: "56%",
    left: "5%"
  },
  4: {
    top: "56%",
    right: "5%"
  },
  5: {
    bottom: "6%",
    left: "50%",
    transform: "translateX(-50%)"
  }
};

export const MANAGEMENT_MAP_CARD_WIDTH: CSSProperties = {
  width: "clamp(220px, 18vw, 320px)"
};

export const MANAGEMENT_MAP_AMBIENT_PARTICLES = [
  { left: "10%", top: "22%", size: 3, delay: 0 },
  { left: "88%", top: "20%", size: 2, delay: 0.7 },
  { left: "12%", top: "58%", size: 2, delay: 1.4 },
  { left: "86%", top: "60%", size: 3, delay: 2.0 },
  { left: "50%", top: "12%", size: 2, delay: 0.9 },
  { left: "48%", top: "78%", size: 3, delay: 1.8 },
  { left: "34%", top: "42%", size: 2, delay: 2.5 },
  { left: "66%", top: "44%", size: 2, delay: 1.1 }
] as const;
