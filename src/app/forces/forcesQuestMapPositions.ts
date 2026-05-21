import type { CSSProperties } from "react";

import { LOCKED_FORCES_HUB_ROCKET_EMBLEM } from "@/lib/hub/lockedCompanyEmblemPositions";

export const FORCES_SCENE_STYLE: CSSProperties = {
  position: "relative",
  width: "min(92vw, 1600px)",
  aspectRatio: "16 / 9",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "visible"
};

/** Rocket island — four quadrant category slots. */
export const FORCES_MAP_CARD_POSITIONS: Record<number, CSSProperties> = {
  1: { top: "22%", left: "6%" },
  2: { top: "22%", right: "6%" },
  3: { top: "58%", left: "6%" },
  4: { top: "58%", right: "6%" }
};

export const FORCES_MAP_CARD_WIDTH: CSSProperties = {
  width: "clamp(220px, 18vw, 320px)"
};

/**
 * Alias of {@link LOCKED_FORCES_HUB_ROCKET_EMBLEM} — do not define coords here.
 * All `/forces` hub logos share that locked anchor (filters only vary per company).
 */
export const FORCES_MAP_COMPANY_LOGO_POSITION: CSSProperties =
  LOCKED_FORCES_HUB_ROCKET_EMBLEM;

export const FORCES_MAP_AMBIENT_PARTICLES = [
  { left: "12%", top: "18%", size: 3, delay: 0 },
  { left: "86%", top: "20%", size: 2, delay: 0.6 },
  { left: "14%", top: "62%", size: 2, delay: 1.2 },
  { left: "84%", top: "64%", size: 3, delay: 1.8 },
  { left: "50%", top: "38%", size: 2, delay: 0.9 },
  { left: "48%", top: "12%", size: 2, delay: 2.2 },
  { left: "28%", top: "42%", size: 2, delay: 1.5 },
  { left: "72%", top: "44%", size: 2, delay: 2.6 }
] as const;
