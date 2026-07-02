import type { PillarId } from "@/data/pillars";
import { XP_ISLAND_COMPLETION } from "@/engine/progression/xpEconomy";
import { TEN_K_ROOKIE_CHALLENGE_XP } from "@/data/quests/tenKRookieFinalChallenge";

/** Island playfield — unchanged 1672×941 artboard (islands stay full size). */
export const PRODIGY_MAP_PLAYFIELD = {
  width: 1672,
  height: 941
} as const;

/** Extra ocean on both sides — symmetric, rendered inside the SVG (not CSS panels). */
export const PRODIGY_MAP_GUTTER = {
  left: 300,
  right: 300
} as const;

/** Full canvas = playfield + side gutters (islands stay centered). */
export const PRODIGY_MAP_NATURAL = {
  width: PRODIGY_MAP_PLAYFIELD.width + PRODIGY_MAP_GUTTER.left + PRODIGY_MAP_GUTTER.right,
  height: PRODIGY_MAP_PLAYFIELD.height
} as const;

/** Percent anchors for outside-edge callout labels on the full canvas. */
export const PRODIGY_MAP_LAYOUT = {
  playfieldLeftPct: (PRODIGY_MAP_GUTTER.left / PRODIGY_MAP_NATURAL.width) * 100,
  playfieldRightPct:
    ((PRODIGY_MAP_GUTTER.left + PRODIGY_MAP_PLAYFIELD.width) / PRODIGY_MAP_NATURAL.width) * 100
} as const;

/** Playfield X → full-canvas horizontal percent (for sign anchor math). */
function prodigyCanvasXPct(playfieldX: number): number {
  return ((PRODIGY_MAP_GUTTER.left + playfieldX) / PRODIGY_MAP_NATURAL.width) * 100;
}

/** Playfield Y → full-canvas vertical percent (island centre line). */
function prodigyCanvasYPct(playfieldY: number): number {
  return (playfieldY / PRODIGY_MAP_PLAYFIELD.height) * 100;
}

/** Card + gap + stem — minimum anchor inset from canvas edge so labels never clip. */
export const PRODIGY_SIGN_ANCHOR_MIN_INSET_PX = 212;

const PRODIGY_SIGN_CANVAS_INSET_PX = PRODIGY_SIGN_ANCHOR_MIN_INSET_PX;

/** Nudge signs toward island centre (playfield px) — symmetric on both sides. */
const PRODIGY_SIGN_INWARD_NUDGE = 40;

function prodigyLeftSignAnchorXPct(playfieldEdgeX: number): number {
  const anchorPx = Math.max(
    PRODIGY_MAP_GUTTER.left + playfieldEdgeX + PRODIGY_SIGN_INWARD_NUDGE,
    PRODIGY_SIGN_CANVAS_INSET_PX
  );
  return (anchorPx / PRODIGY_MAP_NATURAL.width) * 100;
}

function prodigyRightSignAnchorXPct(playfieldEdgeX: number): number {
  const anchorPx = Math.min(
    PRODIGY_MAP_GUTTER.left + playfieldEdgeX - PRODIGY_SIGN_INWARD_NUDGE,
    PRODIGY_MAP_NATURAL.width - PRODIGY_SIGN_CANVAS_INSET_PX
  );
  return (anchorPx / PRODIGY_MAP_NATURAL.width) * 100;
}

/**
 * Outer grass-edge X on the playfield artboard (matches `ProdigyMapWorld` island blobs).
 * Signs attach here with a symmetric inward nudge so labels hug their island.
 */
const PRODIGY_ISLAND_OUTER_EDGE_X = {
  /** business cx 352, rx 320 — grass rim facing the gutter */
  business: 352 - 320 * 0.89,
  /** financial cx 326 */
  financials: 326 - 320 * 0.89,
  /** risk cx 1268 */
  forces: 1268 + 320 * 0.93,
  /** management cx 1254 */
  management: 1254 + 320 * 0.93
} as const;

/** Vertical centre of each island blob (`ProdigyMapWorld` ISLANDS cy + visual offset). */
export const PRODIGY_ISLAND_CENTER_Y = {
  business: 304,
  forces: 300,
  /** Lowered to align with vault / grass mass centre */
  financials: 780,
  management: 770
} as const;

/** Business island grass centre — legacy playfield anchor. */
export const PRODIGY_BUSINESS_ISLAND_PLAYFIELD = { x: 352, y: PRODIGY_ISLAND_CENTER_Y.business } as const;

/** Target island occupancy — land fills 85–90% of viewport, thin ocean rim. */
export const PRODIGY_BUSINESS_ISLAND_VIEWPORT_FILL = 0.875;

/** Fine-tune after bbox fit (keep total ≤ ~90% to avoid cropping land). */
export const PRODIGY_BUSINESS_ISLAND_ZOOM_BOOST = 1.028;

/** Corporate HQ entrance — second camera beat before opening a quest. */
export const PRODIGY_BUSINESS_HQ_VIEWPORT_FILL = 0.78;

/** HQ cluster is the camera target — not UI, not island centroid. */
export const PRODIGY_BUSINESS_ISLAND_FRAME_ANCHOR = { x: 0.5, y: 0.5 } as const;

/** Approx local bounds of {@link ProdigyBusinessCityLandmark} (viewBox units). */
const PRODIGY_BUSINESS_LANDMARK_LOCAL_BOUNDS = {
  x0: 6,
  x1: 250,
  y0: -44,
  y1: 182
} as const;

/** Full island framing bbox in canvas viewBox coords (grass, cliffs, HQ, small ocean pad). */
export function prodigyBusinessIslandViewBbox(): {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
} {
  const cx = 352;
  const cy = PRODIGY_ISLAND_CENTER_Y.business;
  const rx = 320;
  const ry = 156;
  const blobMax = 1.07;
  const gutter = PRODIGY_MAP_GUTTER.left;

  const blob = {
    x0: gutter + cx - rx * blobMax,
    x1: gutter + cx + rx * blobMax,
    y0: cy - ry * blobMax,
    y1: cy + ry * blobMax
  };

  /** Cliff extrusion + rock spikes below the grass rim (`ProdigyIslandBase`). */
  const cliffDepth = 92;
  const cliffSpikePad = 24;
  const cliffBottom = blob.y1 + cliffDepth + cliffSpikePad;

  const lm = PRODIGY_LANDMARK_PLACEMENTS.business;
  const lmX = gutter + PRODIGY_MAP_PLAYFIELD.width * lm.x;
  const lmY = PRODIGY_MAP_PLAYFIELD.height * lm.y;
  const lmScale = lm.scale;

  const landmark = {
    x0: lmX + PRODIGY_BUSINESS_LANDMARK_LOCAL_BOUNDS.x0 * lmScale,
    x1: lmX + PRODIGY_BUSINESS_LANDMARK_LOCAL_BOUNDS.x1 * lmScale,
    y0: lmY + PRODIGY_BUSINESS_LANDMARK_LOCAL_BOUNDS.y0 * lmScale,
    y1: lmY + PRODIGY_BUSINESS_LANDMARK_LOCAL_BOUNDS.y1 * lmScale
  };

  const oceanPad = 2;
  /** Small water rim below cliff spikes. */
  const waterWakePad = 6;

  return {
    x0: Math.min(blob.x0, landmark.x0) - oceanPad,
    x1: Math.max(blob.x1, landmark.x1) + oceanPad,
    y0: Math.min(blob.y0, landmark.y0) - oceanPad,
    y1: Math.max(cliffBottom, landmark.y1) + oceanPad + waterWakePad
  };
}

/**
 * Island-room camera bbox — full land mass (grass, decor, cliffs, HQ).
 * Crops only invisible SVG padding; leaves a thin ocean rim at the viewport edge.
 */
export function prodigyBusinessIslandCameraBbox(): {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
} {
  const cx = 352;
  const cy = PRODIGY_ISLAND_CENTER_Y.business;
  const rx = 320;
  const ry = 156;
  const gutter = PRODIGY_MAP_GUTTER.left;
  /** Full grass rim — includes trees, paths, outer decor. */
  const blobMax = 1.05;

  const cliffDepth = 92;
  const cliffSpikePad = 14;
  const grassBottom = cy + ry * blobMax;
  const cliffBottom = grassBottom + cliffDepth + cliffSpikePad;

  const lm = PRODIGY_LANDMARK_PLACEMENTS.business;
  const lmX = gutter + PRODIGY_MAP_PLAYFIELD.width * lm.x;
  const lmY = PRODIGY_MAP_PLAYFIELD.height * lm.y;
  const lmScale = lm.scale;
  const hqBody = {
    x0: lmX + 28 * lmScale,
    x1: lmX + 228 * lmScale,
    y0: lmY + -8 * lmScale,
    y1: lmY + 178 * lmScale
  };

  /** ~2–3 canvas units = thin ocean border only. */
  const oceanRim = 2;

  return {
    x0: Math.min(gutter + cx - rx * blobMax, hqBody.x0) - oceanRim,
    x1: Math.max(gutter + cx + rx * blobMax, hqBody.x1) + oceanRim,
    y0: cy - ry * blobMax - oceanRim,
    y1: Math.max(cliffBottom, hqBody.y1) + oceanRim + 4
  };
}

/** HQ entrance focal point in canvas viewBox units (pan target, not scale driver). */
export function prodigyBusinessHqFocalPoint(): { x: number; y: number } {
  const gutter = PRODIGY_MAP_GUTTER.left;
  const lm = PRODIGY_LANDMARK_PLACEMENTS.business;
  const lmX = gutter + PRODIGY_MAP_PLAYFIELD.width * lm.x;
  const lmY = PRODIGY_MAP_PLAYFIELD.height * lm.y;
  const s = lm.scale;
  return { x: lmX + 128 * s, y: lmY + 142 * s };
}

export type ProdigyIslandCameraFrame = {
  scale: number;
  x: number;
  y: number;
};

/**
 * Scale + pan the Prodigy canvas so Business Island fills the stage.
 * Camera is world-only: tight art bbox, HQ-centred, UI does not influence framing.
 */
export function computeProdigyBusinessIslandCamera(
  stage: { width: number; height: number },
  canvas: { width: number; height: number },
  fillRatio: number = PRODIGY_BUSINESS_ISLAND_VIEWPORT_FILL,
  canvasOffset?: { left: number; top: number }
): ProdigyIslandCameraFrame {
  if (stage.width <= 0 || stage.height <= 0 || canvas.width <= 0 || canvas.height <= 0) {
    return { scale: 1, x: 0, y: 0 };
  }

  const bbox = prodigyBusinessIslandCameraBbox();
  const sx = canvas.width / PRODIGY_MAP_NATURAL.width;
  const sy = canvas.height / PRODIGY_MAP_NATURAL.height;

  const ix0 = bbox.x0 * sx;
  const iy0 = bbox.y0 * sy;
  const ix1 = bbox.x1 * sx;
  const iy1 = bbox.y1 * sy;
  const iw = Math.max(ix1 - ix0, 1);
  const ih = Math.max(iy1 - iy0, 1);

  const hqFocus = prodigyBusinessHqFocalPoint();
  const hqCx = hqFocus.x * sx;
  const hqCy = hqFocus.y * sy;

  const canvasLeft = canvasOffset?.left ?? (stage.width - canvas.width) / 2;
  const canvasTop = canvasOffset?.top ?? (stage.height - canvas.height) / 2;
  const originX = canvasLeft + canvas.width / 2;
  const originY = canvasTop + canvas.height / 2;

  const focusX = canvasLeft + hqCx;
  const focusY = canvasTop + hqCy;

  const scale =
    Math.min((stage.width * fillRatio) / iw, (stage.height * fillRatio) / ih) *
    PRODIGY_BUSINESS_ISLAND_ZOOM_BOOST;

  const frameX = stage.width * PRODIGY_BUSINESS_ISLAND_FRAME_ANCHOR.x;
  const frameY = stage.height * PRODIGY_BUSINESS_ISLAND_FRAME_ANCHOR.y;

  return {
    scale,
    x: frameX - originX - scale * (focusX - originX),
    y: frameY - originY - scale * (focusY - originY)
  };
}

/** HQ entrance plaza — camera push when Enter Quest is pressed. */
export function prodigyBusinessHqEntranceViewBbox(): {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
} {
  const gutter = PRODIGY_MAP_GUTTER.left;
  const lm = PRODIGY_LANDMARK_PLACEMENTS.business;
  const lmX = gutter + PRODIGY_MAP_PLAYFIELD.width * lm.x;
  const lmY = PRODIGY_MAP_PLAYFIELD.height * lm.y;
  const s = lm.scale;
  const pad = 10;
  const local = { x0: 72, y0: 48, x1: 184, y1: 182 };

  return {
    x0: lmX + local.x0 * s - pad,
    x1: lmX + local.x1 * s + pad,
    y0: lmY + local.y0 * s - pad,
    y1: lmY + local.y1 * s + pad
  };
}

/** HQ cluster bbox — main tower + entrance plaza (canvas viewBox units). */
export function prodigyBusinessHqViewBbox(): {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
} {
  const gutter = PRODIGY_MAP_GUTTER.left;
  const lm = PRODIGY_LANDMARK_PLACEMENTS.business;
  const lmX = gutter + PRODIGY_MAP_PLAYFIELD.width * lm.x;
  const lmY = PRODIGY_MAP_PLAYFIELD.height * lm.y;
  const lmScale = lm.scale;
  const hqLocal = { x0: 28, y0: -8, x1: 228, y1: 178 };
  const pad = 14;

  return {
    x0: lmX + hqLocal.x0 * lmScale - pad,
    x1: lmX + hqLocal.x1 * lmScale + pad,
    y0: lmY + hqLocal.y0 * lmScale - pad,
    y1: lmY + hqLocal.y1 * lmScale + pad
  };
}

/** Focal point as % of full prodigy canvas (for transform-origin) — HQ entrance. */
export function prodigyBusinessIslandFocalPct(): { x: number; y: number } {
  const focus = prodigyBusinessHqFocalPoint();
  return {
    x: (focus.x / PRODIGY_MAP_NATURAL.width) * 100,
    y: (focus.y / PRODIGY_MAP_NATURAL.height) * 100
  };
}

/** Zoom into the corporate HQ before quest navigation. */
export function computeProdigyBusinessHqCamera(
  stage: { width: number; height: number },
  canvas: { width: number; height: number },
  fillRatio: number = PRODIGY_BUSINESS_HQ_VIEWPORT_FILL,
  canvasOffset?: { left: number; top: number }
): ProdigyIslandCameraFrame {
  if (stage.width <= 0 || stage.height <= 0 || canvas.width <= 0 || canvas.height <= 0) {
    return { scale: 1, x: 0, y: 0 };
  }

  const bbox = prodigyBusinessHqEntranceViewBbox();
  const sx = canvas.width / PRODIGY_MAP_NATURAL.width;
  const sy = canvas.height / PRODIGY_MAP_NATURAL.height;

  const ix0 = bbox.x0 * sx;
  const iy0 = bbox.y0 * sy;
  const ix1 = bbox.x1 * sx;
  const iy1 = bbox.y1 * sy;
  const iw = Math.max(ix1 - ix0, 1);
  const ih = Math.max(iy1 - iy0, 1);

  const focus = prodigyBusinessHqFocalPoint();
  const icx = focus.x * sx;
  const icy = focus.y * sy;

  const canvasLeft = canvasOffset?.left ?? (stage.width - canvas.width) / 2;
  const canvasTop = canvasOffset?.top ?? (stage.height - canvas.height) / 2;
  const originX = canvasLeft + canvas.width / 2;
  const originY = canvasTop + canvas.height / 2;

  const islandCenterX = canvasLeft + icx;
  const islandCenterY = canvasTop + icy;

  const scale = Math.min(
    (stage.width * fillRatio) / iw,
    (stage.height * fillRatio) / ih
  );

  const frameX = stage.width * 0.5;
  const frameY = stage.height * 0.5;

  return {
    scale,
    x: frameX - originX - scale * (islandCenterX - originX),
    y: frameY - originY - scale * (islandCenterY - originY)
  };
}

/** 0–7 visual tier for Business Island progress (quests completed). */
export function resolveBusinessIslandProgressTier(
  completedCards: number,
  totalCards: number
): number {
  if (totalCards <= 0) return 0;
  if (completedCards >= totalCards) return 7;
  return Math.max(0, Math.min(6, completedCards));
}

export const PRODIGY_MAP_TITLE = "NVIDIA 10-K REALM";

export type ProdigySignPlacement = "below" | "above" | "left" | "right";

export type ProdigyIslandMeta = {
  id: PillarId;
  label: string;
  subtitle: string;
  land: string;
  landEdge: string;
  path: string;
  glow: string;
  xpReward: number;
  /** Label anchor — island grass edge X + centre Y (percent of full canvas). */
  x: number;
  y: number;
  /** Sign extends away from the landmark (and away from the hub). */
  signPlacement: ProdigySignPlacement;
};

/** CSS `left` / `top` for island callout zones — clamps anchors so cards stay on-canvas. */
export function prodigyZoneAnchorStyle(island: Pick<ProdigyIslandMeta, "x" | "y" | "signPlacement">): {
  left: string;
  top: string;
} {
  const inset = `${PRODIGY_SIGN_ANCHOR_MIN_INSET_PX}px`;
  let left: string;
  if (island.signPlacement === "left") {
    left = `max(${island.x}%, ${inset})`;
  } else if (island.signPlacement === "right") {
    left = `min(${island.x}%, calc(100% - ${inset}))`;
  } else {
    left = `${island.x}%`;
  }
  return { left, top: `${island.y}%` };
}

export type ProdigyHubMeta = {
  label: string;
  subtitle: string;
  accent: string;
  accentEdge: string;
  glow: string;
  xpReward: number;
  x: number;
  y: number;
};

export const PRODIGY_MAP_ISLANDS: readonly ProdigyIslandMeta[] = [
  {
    id: "business",
    label: "Business Island",
    subtitle: "How do they make money?",
    land: "#fef08a",
    landEdge: "#ca8a04",
    path: "#fbbf24",
    glow: "rgba(251,191,36,0.45)",
    xpReward: XP_ISLAND_COMPLETION,
    x: prodigyLeftSignAnchorXPct(PRODIGY_ISLAND_OUTER_EDGE_X.business),
    y: prodigyCanvasYPct(PRODIGY_ISLAND_CENTER_Y.business),
    signPlacement: "left"
  },
  {
    id: "forces",
    label: "Risk Island",
    subtitle: "What are the threats?",
    land: "#fecdd3",
    landEdge: "#e11d48",
    path: "#fb7185",
    glow: "rgba(244,63,94,0.42)",
    xpReward: XP_ISLAND_COMPLETION,
    x: prodigyRightSignAnchorXPct(PRODIGY_ISLAND_OUTER_EDGE_X.forces),
    y: prodigyCanvasYPct(PRODIGY_ISLAND_CENTER_Y.forces),
    signPlacement: "right"
  },
  {
    id: "financials",
    label: "Financial Island",
    subtitle: "Are they financially strong?",
    land: "#bbf7d0",
    landEdge: "#15803d",
    path: "#4ade80",
    glow: "rgba(74,222,128,0.4)",
    xpReward: XP_ISLAND_COMPLETION,
    x: prodigyLeftSignAnchorXPct(PRODIGY_ISLAND_OUTER_EDGE_X.financials),
    y: prodigyCanvasYPct(PRODIGY_ISLAND_CENTER_Y.financials),
    signPlacement: "left"
  },
  {
    id: "management",
    label: "Management Island",
    subtitle: "Would you trust them?",
    land: "#c7d2fe",
    landEdge: "#4338ca",
    path: "#818cf8",
    glow: "rgba(129,140,248,0.42)",
    xpReward: XP_ISLAND_COMPLETION,
    x: prodigyRightSignAnchorXPct(PRODIGY_ISLAND_OUTER_EDGE_X.management),
    y: prodigyCanvasYPct(PRODIGY_ISLAND_CENTER_Y.management),
    signPlacement: "right"
  }
] as const;

export const PRODIGY_MAP_HUB: ProdigyHubMeta = {
  label: "",
  subtitle: "Final Challenge",
  accent: "#e9d5ff",
  accentEdge: "#7c3aed",
  glow: "rgba(167,139,250,0.55)",
  xpReward: TEN_K_ROOKIE_CHALLENGE_XP,
  x: 50,
  y: 42
};

export const PRODIGY_MAP_ROADS: readonly { islandId: PillarId; d: string }[] = [
  { islandId: "business", d: "M50 49 C42 40 30 28 20 20" },
  { islandId: "forces", d: "M50 49 C58 40 70 28 80 20" },
  { islandId: "financials", d: "M50 49 C42 58 30 68 20 74" },
  { islandId: "management", d: "M50 49 C58 58 70 68 80 74" }
] as const;

export const PRODIGY_LANDMARK_PLACEMENTS = {
  business: { x: 0.0956, y: 0.0222, scale: 1.4 },
  forces: { x: 0.644, y: 0.005, scale: 1.4 },
  financials: { x: 0.077, y: 0.5158, scale: 1.4 },
  management: { x: 0.6371, y: 0.4958, scale: 1.4 },
  hub: { x: 0.5, y: 0.49, scale: 0.55 }
} as const;
