import type { CSSProperties } from "react";

import { LOCKED_FINANCIALS_HUB_SAFE_EMBLEM } from "@/lib/hub/lockedCompanyEmblemPositions";

/** Master scene — overlays use % of this box (never viewport edges). */
export const FINANCIALS_SCENE_STYLE: CSSProperties = {
  position: "relative",
  width: "min(92vw, 1600px)",
  aspectRatio: "16 / 9",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "visible"
};

/** Financials vault island — left column + right column slots. */
export const FINANCIALS_MAP_CARD_POSITIONS: Record<number, CSSProperties> = {
  1: { top: "24%", left: "6%" },
  2: { top: "48%", left: "6%" },
  3: { top: "72%", left: "6%" },
  4: { top: "24%", right: "6%" },
  5: { top: "56%", right: "6%" }
};

export const FINANCIALS_MAP_CARD_WIDTH: CSSProperties = {
  width: "clamp(220px, 18vw, 320px)"
};

/** @see LOCKED_FINANCIALS_HUB_SAFE_EMBLEM — same slot for every company logo. */
export const FINANCIALS_MAP_COMPANY_LOGO_POSITION: CSSProperties =
  LOCKED_FINANCIALS_HUB_SAFE_EMBLEM;

export const FINANCIALS_MAP_AMBIENT_PARTICLES = [
  { left: "14%", top: "18%", size: 3, delay: 0 },
  { left: "12%", top: "52%", size: 2, delay: 0.9 },
  { left: "16%", top: "78%", size: 3, delay: 1.7 },
  { left: "84%", top: "22%", size: 2, delay: 0.5 },
  { left: "86%", top: "58%", size: 3, delay: 1.4 },
  { left: "50%", top: "38%", size: 2, delay: 2.1 },
  { left: "48%", top: "62%", size: 2, delay: 2.6 }
] as const;
