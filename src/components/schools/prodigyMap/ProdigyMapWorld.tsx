"use client";

/**
 * Prodigy map world art — a deep-water board with four irregular floating
 * islands, rocky cliff edges, coastline foam, themed environmental props,
 * plank bridges and a detailed central stone hub.
 *
 * Pure SVG + gradients. No raster assets. Every piece is a reusable component.
 * Decorative only (parent applies `pointer-events: none`), so it never
 * interferes with the interactive hotspot/card layer.
 *
 * All trig-derived coordinates are rounded via the svgCoords helpers so SSR
 * and client emit identical attribute strings (hydration-safe).
 */

import type { ReactElement } from "react";
import {
  PRODIGY_LANDMARK_PLACEMENTS,
  PRODIGY_MAP_GUTTER,
  PRODIGY_MAP_NATURAL,
  PRODIGY_MAP_PLAYFIELD
} from "@/lib/schools/schoolsProdigyMapConfig";
import { ellipsePoint, svgCoord } from "@/lib/schools/svgCoords";
import {
  ProdigyBusinessCityLandmark,
  ProdigyFinancialTreasuryLandmark,
  ProdigyHubFortressLandmark,
  ProdigyManagementCitadelLandmark,
  ProdigyRiskStormLandmark
} from "@/components/schools/prodigyMap/ProdigyMapLandmarks";

const { width: CANVAS_W, height: CANVAS_H } = PRODIGY_MAP_NATURAL;
const { width: PLAYFIELD_W, height: PLAYFIELD_H } = PRODIGY_MAP_PLAYFIELD;
const GUTTER_L = PRODIGY_MAP_GUTTER.left;
const PLAYFIELD_HUB = { x: 831, y: 478 } as const;
/** Hub in full-canvas coordinates (for water ripples). */
const CANVAS_HUB = { x: PLAYFIELD_HUB.x + GUTTER_L, y: PLAYFIELD_HUB.y } as const;

/* ------------------------------------------------------------------ *
 * Geometry helpers
 * ------------------------------------------------------------------ */

function edgePoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  dist: number
): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: svgCoord(from.x + (dx / len) * dist),
    y: svgCoord(from.y + (dy / len) * dist)
  };
}

/** Smooth closed organic blob through irregular radius multipliers. */
function blobPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  mults: readonly number[]
): string {
  const n = mults.length;
  const step = 360 / n;
  const pts = mults.map((m, i) => ellipsePoint(cx, cy, rx * m, ry * m, step * i));
  let d = `M ${pts[0].x} ${pts[0].y} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = svgCoord(p1.x + (p2.x - p0.x) / 6);
    const c1y = svgCoord(p1.y + (p2.y - p0.y) / 6);
    const c2x = svgCoord(p2.x - (p3.x - p1.x) / 6);
    const c2y = svgCoord(p2.y - (p3.y - p1.y) / 6);
    d += `C ${c1x} ${c1y} ${c2x} ${c2y} ${svgCoord(p2.x)} ${svgCoord(p2.y)} `;
  }
  return `${d}Z`;
}

/* ------------------------------------------------------------------ *
 * Reusable environment props
 * ------------------------------------------------------------------ */

export function WorldTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="24" ry="7" fill="#0b1f12" opacity="0.28" />
      <rect x="-6" y="-20" width="12" height="26" rx="5" fill="#a16207" stroke="#5c3310" strokeWidth="2.2" />
      <circle cx="0" cy="-40" r="26" fill="#166534" stroke="#14532d" strokeWidth="3" />
      <circle cx="-15" cy="-32" r="18" fill="#22c55e" stroke="#15803d" strokeWidth="2.4" />
      <circle cx="15" cy="-34" r="16" fill="#22c55e" stroke="#15803d" strokeWidth="2.4" />
      <circle cx="-2" cy="-50" r="13" fill="#4ade80" />
      <circle cx="-8" cy="-46" r="5" fill="#bbf7d0" opacity="0.8" />
    </g>
  );
}

export function WorldPine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="20" ry="6" fill="#0b1f12" opacity="0.28" />
      <rect x="-5" y="-10" width="10" height="18" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="2" />
      <path d="M0 -64 L20 -24 L-20 -24 Z" fill="#15803d" stroke="#14532d" strokeWidth="2.4" />
      <path d="M0 -50 L24 -6 L-24 -6 Z" fill="#16a34a" stroke="#14532d" strokeWidth="2.4" />
      <path d="M0 -36 L28 12 L-28 12 Z" fill="#22c55e" stroke="#15803d" strokeWidth="2.4" />
      <path d="M0 -56 L8 -38 L-8 -38 Z" fill="#4ade80" opacity="0.8" />
    </g>
  );
}

export function WorldBush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="5" rx="20" ry="5" fill="#0b1f12" opacity="0.24" />
      <circle cx="-11" cy="-4" r="12" fill="#16a34a" stroke="#15803d" strokeWidth="2.2" />
      <circle cx="11" cy="-4" r="12" fill="#16a34a" stroke="#15803d" strokeWidth="2.2" />
      <circle cx="0" cy="-11" r="15" fill="#22c55e" stroke="#15803d" strokeWidth="2.2" />
      <circle cx="-4" cy="-15" r="6" fill="#86efac" opacity="0.85" />
    </g>
  );
}

export function WorldRock({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="6" rx="22" ry="6" fill="#0b1f12" opacity="0.26" />
      <path d="M-20 6 L-12 -14 L4 -18 L18 -6 L20 6 Z" fill="#94a3b8" stroke="#475569" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M-12 -14 L4 -18 L6 -4 L-6 -2 Z" fill="#cbd5e1" opacity="0.8" />
      <path d="M6 -4 L18 -6 L20 6 L8 6 Z" fill="#64748b" opacity="0.7" />
    </g>
  );
}

export function WorldLamp({
  x,
  y,
  s = 1,
  glow = "#fde68a"
}: {
  x: number;
  y: number;
  s?: number;
  glow?: string;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="9" ry="3" fill="#0b1f12" opacity="0.3" />
      <rect x="-3.5" y="-46" width="7" height="48" rx="3.5" fill="#475569" stroke="#1e293b" strokeWidth="2" />
      <rect x="-7" y="2" width="14" height="5" rx="2.5" fill="#334155" stroke="#1e293b" strokeWidth="1.6" />
      <circle cx="0" cy="-52" r="18" fill={glow} opacity="0.22" />
      <circle cx="0" cy="-52" r="8" fill={glow} stroke="#a16207" strokeWidth="2" className="iq-prodigy-landmark__sparkle" />
      <circle cx="-2.5" cy="-54.5" r="2.5" fill="#fffbeb" opacity="0.9" />
    </g>
  );
}

export function WorldBarrel({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="14" rx="14" ry="4" fill="#0b1f12" opacity="0.3" />
      <rect x="-12" y="-18" width="24" height="32" rx="7" fill="#b45309" stroke="#5c2d0c" strokeWidth="2.4" />
      <rect x="-12" y="-8" width="24" height="4" fill="#451a03" opacity="0.6" />
      <rect x="-12" y="4" width="24" height="4" fill="#451a03" opacity="0.6" />
      <ellipse cx="0" cy="-18" rx="12" ry="4" fill="#d97706" stroke="#5c2d0c" strokeWidth="2" />
      <path d="M-4 -18 L4 -18 L2 -14 L-2 -14 Z" fill="#facc15" />
    </g>
  );
}

export function WorldChest({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="14" rx="22" ry="5" fill="#0b1f12" opacity="0.3" />
      <rect x="-20" y="-4" width="40" height="18" rx="3" fill="#92400e" stroke="#451a03" strokeWidth="2.4" />
      <path d="M-20 -4 Q0 -22 20 -4 Z" fill="#b45309" stroke="#451a03" strokeWidth="2.4" />
      <rect x="-20" y="-4" width="40" height="4" fill="#facc15" opacity="0.85" />
      <rect x="-4" y="0" width="8" height="10" rx="1.5" fill="#fde047" stroke="#a16207" strokeWidth="1.6" />
      <circle cx="0" cy="4" r="1.8" fill="#92400e" />
    </g>
  );
}

export function WorldBanner({
  x,
  y,
  s = 1,
  color = "#6366f1",
  edge = "#4338ca"
}: {
  x: number;
  y: number;
  s?: number;
  color?: string;
  edge?: string;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="7" ry="2.5" fill="#0b1f12" opacity="0.3" />
      <rect x="-2.5" y="-64" width="5" height="66" rx="2.5" fill="#475569" stroke="#1e293b" strokeWidth="1.8" />
      <circle cx="0" cy="-66" r="4" fill="#facc15" stroke="#a16207" strokeWidth="1.4" />
      <path d="M2 -60 L34 -54 L2 -42 Z" fill={color} stroke={edge} strokeWidth="2" strokeLinejoin="round" />
      <path d="M2 -60 L26 -55.5 L2 -47 Z" fill="#fde047" opacity="0.55" />
    </g>
  );
}

export function WorldPlanter({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="12" rx="26" ry="5" fill="#0b1f12" opacity="0.26" />
      <circle cx="-14" cy="-6" r="11" fill="#16a34a" stroke="#15803d" strokeWidth="2.2" />
      <circle cx="0" cy="-10" r="12" fill="#22c55e" stroke="#15803d" strokeWidth="2.2" />
      <circle cx="14" cy="-6" r="11" fill="#16a34a" stroke="#15803d" strokeWidth="2.2" />
      <circle cx="-7" cy="-9" r="3.4" fill="#fef08a" />
      <circle cx="6" cy="-12" r="3.4" fill="#fda4af" />
      <path d="M-22 2 L22 2 L18 14 L-18 14 Z" fill="#a16207" stroke="#5c2d0c" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="-20" y="2" width="40" height="3.5" fill="#fcd34d" opacity="0.7" />
    </g>
  );
}

export function WorldFountain({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="14" rx="34" ry="9" fill="#0b1f12" opacity="0.28" />
      {/* Outer stone basin */}
      <ellipse cx="0" cy="6" rx="32" ry="13" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" />
      <ellipse cx="0" cy="3" rx="27" ry="10" fill="url(#prod-fountain-water)" stroke="#0e7490" strokeWidth="2.4" />
      <ellipse cx="0" cy="1" rx="18" ry="6" fill="#cffafe" opacity="0.7" />
      {/* Tiered centre */}
      <rect x="-4" y="-12" width="8" height="14" rx="3" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
      <ellipse cx="0" cy="-12" rx="13" ry="5" fill="#e2e8f0" stroke="#64748b" strokeWidth="2.2" />
      <ellipse cx="0" cy="-13" rx="9" ry="3.2" fill="url(#prod-fountain-water)" />
      {/* Water jet */}
      <path d="M0 -16 C-4 -26 -4 -30 0 -36 C4 -30 4 -26 0 -16" fill="#a5f3fc" opacity="0.85" className="iq-prodigy-prop-fountain__jet" />
      <circle cx="0" cy="-37" r="2.6" fill="#e0f7ff" className="iq-prodigy-landmark__sparkle" />
      <circle cx="-13" cy="0" r="2" fill="#e0f7ff" opacity="0.8" />
      <circle cx="14" cy="-1" r="2" fill="#e0f7ff" opacity="0.7" />
    </g>
  );
}

export function WorldFlowers({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const blooms: readonly { dx: number; dy: number; c: string }[] = [
    { dx: -10, dy: -2, c: "#fda4af" },
    { dx: 0, dy: -7, c: "#fde047" },
    { dx: 10, dy: -2, c: "#c4b5fd" },
    { dx: -4, dy: 2, c: "#f9a8d4" },
    { dx: 6, dy: 2, c: "#fdba74" }
  ];
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="5" rx="16" ry="4" fill="#0b1f12" opacity="0.2" />
      {blooms.map((b, i) => (
        <g key={`bloom-${i}`}>
          <line x1={b.dx} y1={b.dy} x2={b.dx} y2={b.dy + 6} stroke="#15803d" strokeWidth="1.8" />
          <circle cx={b.dx} cy={b.dy} r="3.4" fill={b.c} stroke="#b45309" strokeWidth="0.8" />
          <circle cx={b.dx} cy={b.dy} r="1.1" fill="#fff7e6" />
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Island data + decor
 * ------------------------------------------------------------------ */

type DecorType =
  | "tree"
  | "pine"
  | "bush"
  | "rock"
  | "lamp"
  | "barrel"
  | "chest"
  | "banner"
  | "planter"
  | "fountain"
  | "flowers";

type DecorItem = { t: DecorType; dx: number; dy: number; s?: number; c?: string };

type IslandArt = {
  id: "business" | "risk" | "financial" | "management";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  mults: readonly number[];
  bridge: { color: string; edge: string };
  glow: string;
  decor: readonly DecorItem[];
};

const ISLANDS: readonly IslandArt[] = [
  {
    id: "business",
    cx: 352,
    cy: 304,
    rx: 320,
    ry: 156,
    mults: [1.0, 0.93, 1.06, 0.9, 1.03, 0.95, 1.07, 0.91, 1.0, 0.96, 1.04, 0.92],
    bridge: { color: "#fbbf24", edge: "#b45309" },
    glow: "#fcd34d",
    decor: [
      { t: "tree", dx: -214, dy: -26, s: 1.1 },
      { t: "tree", dx: -244, dy: 30, s: 0.78 },
      { t: "tree", dx: -132, dy: 104, s: 0.92 },
      { t: "tree", dx: 232, dy: 36, s: 0.95 },
      { t: "planter", dx: 158, dy: 104, s: 0.88 },
      { t: "planter", dx: -64, dy: 122, s: 0.7 },
      { t: "bush", dx: 200, dy: -32, s: 0.95 },
      { t: "bush", dx: -20, dy: 124, s: 0.8 },
      { t: "bush", dx: 96, dy: 120, s: 0.74 },
      { t: "rock", dx: -250, dy: 70, s: 0.82 },
      { t: "rock", dx: 250, dy: 84, s: 0.7 },
      { t: "flowers", dx: -150, dy: 118, s: 1.0 },
      { t: "flowers", dx: 40, dy: 128, s: 0.9 },
      { t: "fountain", dx: 196, dy: 86, s: 0.78 },
      { t: "lamp", dx: 70, dy: 112, s: 0.84, c: "#fde68a" },
      { t: "lamp", dx: -96, dy: 96, s: 0.74, c: "#fde68a" }
    ]
  },
  {
    id: "risk",
    cx: 1268,
    cy: 300,
    rx: 320,
    ry: 156,
    mults: [1.04, 0.92, 1.0, 0.95, 1.07, 0.9, 1.03, 0.94, 1.06, 0.91, 1.0, 0.96],
    bridge: { color: "#fb7185", edge: "#be123c" },
    glow: "#fb7185",
    decor: [
      { t: "pine", dx: 222, dy: -20, s: 1.12 },
      { t: "pine", dx: 250, dy: 38, s: 0.8 },
      { t: "pine", dx: 150, dy: 110, s: 0.9 },
      { t: "rock", dx: 246, dy: 70, s: 1.05 },
      { t: "rock", dx: -160, dy: 116, s: 0.85 },
      { t: "rock", dx: -252, dy: 36, s: 0.78 },
      { t: "rock", dx: 60, dy: 126, s: 0.7 },
      { t: "barrel", dx: -214, dy: 40, s: 0.98 },
      { t: "barrel", dx: -180, dy: 96, s: 0.78 },
      { t: "barrel", dx: 96, dy: 120, s: 0.72 },
      { t: "lamp", dx: -78, dy: 116, s: 0.84, c: "#f87171" },
      { t: "lamp", dx: 40, dy: 112, s: 0.74, c: "#f87171" },
      { t: "lamp", dx: 200, dy: 92, s: 0.72, c: "#f87171" },
      { t: "bush", dx: -30, dy: 126, s: 0.74 }
    ]
  },
  {
    id: "financial",
    cx: 326,
    cy: 760,
    rx: 320,
    ry: 156,
    mults: [1.0, 0.95, 1.05, 0.91, 1.04, 0.93, 1.06, 0.92, 1.0, 0.96, 1.03, 0.9],
    bridge: { color: "#4ade80", edge: "#15803d" },
    glow: "#86efac",
    decor: [
      { t: "tree", dx: -220, dy: 12, s: 1.1 },
      { t: "tree", dx: -246, dy: 64, s: 0.78 },
      { t: "tree", dx: 158, dy: 100, s: 0.92 },
      { t: "tree", dx: 236, dy: 40, s: 0.86 },
      { t: "chest", dx: 200, dy: -22, s: 0.88 },
      { t: "chest", dx: -150, dy: 112, s: 0.7 },
      { t: "bush", dx: -158, dy: 110, s: 0.85 },
      { t: "bush", dx: 30, dy: 124, s: 0.8 },
      { t: "rock", dx: -250, dy: -20, s: 0.8 },
      { t: "rock", dx: 250, dy: 86, s: 0.72 },
      { t: "flowers", dx: -60, dy: 126, s: 1.0 },
      { t: "flowers", dx: 96, dy: 120, s: 0.9 },
      { t: "lamp", dx: 76, dy: -98, s: 0.84, c: "#fde68a" },
      { t: "lamp", dx: -88, dy: 100, s: 0.74, c: "#fde68a" },
      { t: "lamp", dx: 120, dy: 96, s: 0.7, c: "#fde68a" }
    ]
  },
  {
    id: "management",
    cx: 1254,
    cy: 750,
    rx: 320,
    ry: 156,
    mults: [1.05, 0.91, 1.0, 0.96, 1.04, 0.92, 1.06, 0.9, 1.02, 0.95, 1.03, 0.93],
    bridge: { color: "#818cf8", edge: "#4338ca" },
    glow: "#a5b4fc",
    decor: [
      { t: "pine", dx: 224, dy: 8, s: 1.1 },
      { t: "pine", dx: 250, dy: 60, s: 0.78 },
      { t: "tree", dx: -160, dy: 96, s: 0.92 },
      { t: "tree", dx: -244, dy: 30, s: 0.82 },
      { t: "banner", dx: 206, dy: -26, s: 0.92, c: "#6366f1" },
      { t: "banner", dx: -206, dy: -22, s: 0.82, c: "#4f46e5" },
      { t: "planter", dx: -150, dy: 114, s: 0.84 },
      { t: "planter", dx: 150, dy: 110, s: 0.8 },
      { t: "fountain", dx: 30, dy: 124, s: 0.8 },
      { t: "rock", dx: 250, dy: 84, s: 0.74 },
      { t: "rock", dx: -252, dy: 78, s: 0.7 },
      { t: "flowers", dx: -64, dy: 122, s: 1.0 },
      { t: "flowers", dx: 100, dy: 116, s: 0.9 },
      { t: "lamp", dx: -82, dy: -92, s: 0.84, c: "#fde68a" },
      { t: "lamp", dx: 86, dy: -88, s: 0.74, c: "#fde68a" }
    ]
  }
] as const;

function renderDecorItem(item: DecorItem, key: string, cx: number, cy: number) {
  const x = cx + item.dx;
  const y = cy + item.dy;
  const s = item.s ?? 1;
  const propClass = `iq-prodigy-prop iq-prodigy-prop--${item.t}`;
  const wrap = (node: ReactElement) => (
    <g key={key} className={propClass}>
      {node}
    </g>
  );
  switch (item.t) {
    case "tree":
      return wrap(<WorldTree x={x} y={y} s={s} />);
    case "pine":
      return wrap(<WorldPine x={x} y={y} s={s} />);
    case "bush":
      return wrap(<WorldBush x={x} y={y} s={s} />);
    case "rock":
      return wrap(<WorldRock x={x} y={y} s={s} />);
    case "lamp":
      return wrap(<WorldLamp x={x} y={y} s={s} glow={item.c} />);
    case "barrel":
      return wrap(<WorldBarrel x={x} y={y} s={s} />);
    case "chest":
      return wrap(<WorldChest x={x} y={y} s={s} />);
    case "banner":
      return wrap(<WorldBanner x={x} y={y} s={s} color={item.c} />);
    case "planter":
      return wrap(<WorldPlanter x={x} y={y} s={s} />);
    case "fountain":
      return wrap(<WorldFountain x={x} y={y} s={s} />);
    case "flowers":
      return wrap(<WorldFlowers x={x} y={y} s={s} />);
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ *
 * Island base (irregular, layered, rocky cliffs + path)
 * ------------------------------------------------------------------ */

export function ProdigyIslandBase({
  island,
  progressTier = 0
}: {
  island: IslandArt;
  progressTier?: number;
}) {
  const { cx, cy, rx, ry, mults, glow } = island;
  const depth = 92;
  const topPath = blobPath(cx, cy, rx, ry, mults);
  const cliffPath = blobPath(cx, cy + depth, rx, ry, mults);
  const foamPath = blobPath(cx, cy, rx + 16, ry + 12, mults);

  // Jagged rock spikes hanging along the lower coastline.
  const rockAngles = [40, 62, 84, 106, 128, 150];

  // Path from the hub-facing landing toward the island centre.
  const landing = edgePoint({ x: cx, y: cy }, PLAYFIELD_HUB, rx * 0.86);

  return (
    <g
      className={[
        "iq-prodigy-map__island",
        `iq-prodigy-map__island--${island.id}`,
        island.id === "business" && progressTier > 0
          ? `iq-prodigy-map__island--tier-${Math.min(progressTier, 7)}`
          : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Soft water glow around the coastline (layered for depth) */}
      <ellipse cx={cx} cy={cy + depth * 0.45} rx={rx * 1.32} ry={ry * 1.42} fill={glow} opacity="0.1" />
      <ellipse cx={cx} cy={cy + depth * 0.45} rx={rx * 1.16} ry={ry * 1.2} fill={glow} opacity="0.12" />

      {/* Water shadow */}
      <ellipse cx={cx} cy={cy + depth + 30} rx={rx * 1.05} ry={ry * 0.82} fill="#04102e" opacity="0.6" />
      <ellipse cx={cx} cy={cy + depth + 18} rx={rx * 0.92} ry={ry * 0.62} fill="#020a22" opacity="0.45" />

      {/* Coastline foam */}
      <path d={foamPath} fill="none" stroke="#bae6fd" strokeWidth="8" opacity="0.5" />
      <path d={foamPath} fill="none" stroke="#e0f2fe" strokeWidth="2.5" strokeDasharray="3 16" opacity="0.7" />

      {/* Cliff body (extruded rock) */}
      <path d={cliffPath} fill="url(#prod-rock)" stroke="#2a1c12" strokeWidth="3.5" />
      {/* Darker lower cliff band for grounding */}
      <path d={cliffPath} fill="#1a1009" opacity="0.4" transform={`translate(0 ${depth * 0.5})`} />
      {/* Rocky spikes along lower rim */}
      {rockAngles.map((deg) => {
        const p = ellipsePoint(cx, cy, rx, ry, deg);
        const w = 26;
        return (
          <path
            key={`spike-${island.id}-${deg}`}
            d={`M${svgCoord(p.x - w)} ${svgCoord(p.y)} L${svgCoord(p.x)} ${svgCoord(p.y + depth + 22)} L${svgCoord(p.x + w)} ${svgCoord(p.y)} Z`}
            fill="url(#prod-rock)"
            stroke="#33241a"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
        );
      })}
      {/* Cliff shading + cracks */}
      <path d={cliffPath} fill="#1f140d" opacity="0.3" transform={`translate(0 ${depth * 0.32})`} />
      {/* Sunlit upper cliff edge */}
      <path d={topPath} fill="none" stroke="#b8946d" strokeWidth="5" opacity="0.45" transform={`translate(0 ${depth * 0.12})`} />
      <path
        d={`M${cx - rx * 0.5} ${cy + depth * 0.4} l10 40 M${cx - rx * 0.18} ${cy + depth * 0.52} l6 30 M${cx + rx * 0.2} ${cy + depth * 0.5} l-8 34 M${cx + rx * 0.55} ${cy + depth * 0.36} l8 34 M${cx - rx * 0.72} ${cy + depth * 0.34} l6 24`}
        stroke="#241710"
        strokeWidth="3"
        opacity="0.55"
        fill="none"
        strokeLinecap="round"
      />

      {/* Grass top */}
      <path d={topPath} fill="url(#prod-grass)" stroke="#3f6212" strokeWidth="4" />
      {/* Sandy beach rim just inside coast */}
      <path d={blobPath(cx, cy, rx * 0.96, ry * 0.95, mults)} fill="none" stroke="#fde9b8" strokeWidth="6" opacity="0.35" />
      {/* Inner lighter grass */}
      <path d={blobPath(cx, cy - 6, rx * 0.86, ry * 0.82, mults)} fill="#86efac" opacity="0.45" />
      {/* Grass patches for texture */}
      <ellipse cx={cx - rx * 0.4} cy={cy + ry * 0.3} rx={rx * 0.18} ry={ry * 0.16} fill="#15803d" opacity="0.25" />
      <ellipse cx={cx + rx * 0.34} cy={cy - ry * 0.18} rx={rx * 0.16} ry={ry * 0.14} fill="#4ade80" opacity="0.4" />
      <ellipse cx={cx + rx * 0.12} cy={cy + ry * 0.42} rx={rx * 0.2} ry={ry * 0.14} fill="#15803d" opacity="0.2" />
      {/* Top sheen */}
      <ellipse cx={cx - rx * 0.26} cy={cy - ry * 0.46} rx={rx * 0.4} ry={ry * 0.28} fill="#ffffff" opacity="0.12" />

      {/* Stone path from landing to centre */}
      <path
        d={`M${landing.x} ${landing.y} Q${svgCoord((landing.x + cx) / 2)} ${svgCoord((landing.y + cy) / 2 + 8)} ${cx} ${cy + 6}`}
        stroke="#a8896a"
        strokeWidth="26"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d={`M${landing.x} ${landing.y} Q${svgCoord((landing.x + cx) / 2)} ${svgCoord((landing.y + cy) / 2 + 8)} ${cx} ${cy + 6}`}
        stroke="#d6c39a"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${landing.x} ${landing.y} Q${svgCoord((landing.x + cx) / 2)} ${svgCoord((landing.y + cy) / 2 + 8)} ${cx} ${cy + 6}`}
        stroke="#fff7e6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="2 18"
        fill="none"
        opacity="0.6"
      />

      {/* Grass pebbles + texture dots */}
      {[
        [-0.55, 0.5],
        [0.5, 0.5],
        [-0.2, 0.62],
        [0.22, 0.58],
        [0.62, 0.2]
      ].map(([fx, fy], i) => (
        <circle
          key={`pebble-${island.id}-${i}`}
          cx={svgCoord(cx + rx * fx)}
          cy={svgCoord(cy + ry * fy)}
          r={i % 2 ? 4 : 5.5}
          fill="#cbb49a"
          stroke="#9c8463"
          strokeWidth="1.4"
          opacity="0.75"
        />
      ))}

      {/* Stepping stones along the central path */}
      {[0.3, 0.55, 0.78].map((t, i) => {
        const sx = svgCoord(landing.x + (cx - landing.x) * t);
        const sy = svgCoord(landing.y + (cy + 6 - landing.y) * t + 8);
        return <ellipse key={`step-${island.id}-${i}`} cx={sx} cy={sy} rx={11} ry={6} fill="#e7d6b4" stroke="#b89b72" strokeWidth="1.6" />;
      })}

      {/* Strong building shadow (anchors the landmark to the ground) */}
      <ellipse cx={cx} cy={cy - ry * 0.02} rx={rx * 0.46} ry={ry * 0.3} fill="#0b1f12" opacity="0.35" />
      {/* Warm ground glow under the building */}
      <ellipse cx={cx} cy={cy - ry * 0.1} rx={rx * 0.54} ry={ry * 0.46} fill={glow} opacity="0.24" />

      {/* Themed decor */}
      {island.decor.map((item, i) => renderDecorItem(item, `${island.id}-decor-${i}`, cx, cy))}

      {island.id === "business" && progressTier > 0 ? (
        <BusinessIslandProgressFx cx={cx} cy={cy} rx={rx} ry={ry} tier={progressTier} />
      ) : null}
    </g>
  );
}

/** Quest-progress visuals — banners, blooms, lights (Business Island only). */
function BusinessIslandProgressFx({
  cx,
  cy,
  rx,
  ry,
  tier
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  tier: number;
}) {
  return (
    <g className="iq-prodigy-island-progress-fx pointer-events-none" aria-hidden>
      {tier >= 2 ? (
        <WorldBanner x={cx - 180} y={cy - 40} s={0.9} color="#fbbf24" edge="#b45309" />
      ) : null}
      {tier >= 3 ? <WorldFlowers x={cx + 120} y={cy + 90} s={1.05} /> : null}
      {tier >= 4 ? <WorldLamp x={cx - 90} y={cy + 96} s={0.9} glow="#fde68a" /> : null}
      {tier >= 5 ? <WorldPlanter x={cx + 158} y={cy + 104} s={0.95} /> : null}
      {tier >= 6 ? (
        <ellipse
          cx={cx}
          cy={cy - 20}
          rx={rx * 0.5}
          ry={ry * 0.35}
          fill="rgba(251,191,36,0.12)"
          className="iq-prodigy-island-progress-fx__mastery-glow"
        />
      ) : null}
      {tier >= 7 ? (
        <WorldBanner x={cx + 40} y={cy - 52} s={1.05} color="#fde047" edge="#ca8a04" />
      ) : null}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Plank / stone bridge from hub rim to island landing
 * ------------------------------------------------------------------ */

export function ProdigyBridge({
  from,
  to,
  color,
  edge
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  edge: string;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = svgCoord(Math.hypot(dx, dy));
  const angle = svgCoord((Math.atan2(dy, dx) * 180) / Math.PI);
  const mx = svgCoord((from.x + to.x) / 2);
  const my = svgCoord((from.y + to.y) / 2);
  const half = svgCoord(len / 2);
  const deckH = 46;
  const plankCount = Math.max(3, Math.floor(len / 22));
  const planks = Array.from({ length: plankCount }, (_, i) =>
    svgCoord(-half + 14 + (i * (len - 28)) / (plankCount - 1 || 1))
  );

  return (
    <g transform={`translate(${mx}, ${my}) rotate(${angle})`}>
      {/* Cast shadow */}
      <rect x={-half} y={-deckH / 2 + 8} width={len} height={deckH} rx="14" fill="#04102e" opacity="0.45" />
      {/* Deck edge */}
      <rect x={-half} y={-deckH / 2} width={len} height={deckH} rx="12" fill={edge} />
      {/* Deck fill */}
      <rect x={-half} y={-deckH / 2 + 5} width={len} height={deckH - 10} rx="9" fill={color} />
      {/* Plank seams */}
      {planks.map((px, i) => (
        <line
          key={`plank-${i}`}
          x1={px}
          y1={-deckH / 2 + 5}
          x2={px}
          y2={deckH / 2 - 5}
          stroke={edge}
          strokeWidth="2.4"
          opacity="0.5"
        />
      ))}
      {/* Side rails */}
      <rect x={-half} y={-deckH / 2 - 3} width={len} height="5" rx="2.5" fill="#fff7e6" opacity="0.5" />
      <rect x={-half} y={deckH / 2 - 2} width={len} height="5" rx="2.5" fill="#04102e" opacity="0.35" />
      {/* End lamp posts */}
      {[-half + 16, half - 16].map((px, i) => (
        <g key={`bridge-lamp-${i}`}>
          <circle cx={px} cy={-deckH / 2 - 14} r="11" fill={edge} opacity="0.3" />
          <circle
            cx={px}
            cy={-deckH / 2 - 14}
            r="5.5"
            fill="#fef08a"
            stroke="#a16207"
            strokeWidth="1.8"
            className="iq-prodigy-landmark__sparkle"
          />
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Central stone hub platform
 * ------------------------------------------------------------------ */

export function ProdigyHubPlatform({ cx, cy, r = 145 }: { cx: number; cy: number; r?: number }) {
  const spokes = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const pillars = [45, 135, 225, 315];
  return (
    <g className="iq-prodigy-map__hub-platform">
      {/* Drop shadow */}
      <ellipse cx={cx} cy={cy + 40} rx={r * 1.02} ry={r * 0.42} fill="#04102e" opacity="0.5" />
      {/* Outer stone ring */}
      <circle cx={cx} cy={cy} r={r} fill="url(#prod-hub-stone)" stroke="#4c1d95" strokeWidth="8" />
      {/* Cobble spokes */}
      {spokes.map((deg) => {
        const a = ellipsePoint(cx, cy, r - 8, r - 8, deg);
        const b = ellipsePoint(cx, cy, r - 34, r - 34, deg);
        return (
          <line key={`hub-cobble-${deg}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#6d28d9" strokeWidth="4" opacity="0.5" />
        );
      })}
      {/* Mid dais */}
      <circle cx={cx} cy={cy} r={r - 36} fill="url(#prod-hub-stone-inner)" stroke="#7c3aed" strokeWidth="5" />
      {/* Rune ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r - 64}
        fill="none"
        stroke="#5b21b6"
        strokeWidth="6"
        strokeDasharray="6 20"
        opacity="0.6"
        className="iq-prodigy-landmark__hub-glow"
      />
      <circle cx={cx} cy={cy} r={r - 86} fill="none" stroke="#c4b5fd" strokeWidth="3" opacity="0.75" />
      {/* Glowing core — gold prize light at the centre */}
      <circle cx={cx} cy={cy} r={r - 104} fill="url(#prod-hub-core)" opacity="0.98" className="iq-prodigy-landmark__hub-core" />
      <circle
        cx={cx}
        cy={cy}
        r={r - 92}
        fill="none"
        stroke="#fde047"
        strokeWidth="3.5"
        opacity="0.62"
        className="iq-prodigy-landmark__hub-gold-ring"
      />
      {/* Corner pillars */}
      {pillars.map((deg) => {
        const p = ellipsePoint(cx, cy, r - 18, r - 18, deg);
        return (
          <g key={`hub-pillar-${deg}`}>
            <ellipse cx={p.x} cy={p.y + 10} rx="16" ry="6" fill="#04102e" opacity="0.4" />
            <rect x={svgCoord(p.x - 11)} y={svgCoord(p.y - 30)} width="22" height="40" rx="6" fill="url(#prod-hub-stone)" stroke="#5b21b6" strokeWidth="3" />
            <circle cx={p.x} cy={p.y - 34} r="7" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
            <circle cx={p.x} cy={p.y - 34} r="3" fill="#a78bfa" className="iq-prodigy-landmark__sparkle" />
          </g>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Water backdrop
 * ------------------------------------------------------------------ */

const WATER_SPARKLES: readonly { x: number; y: number; r: number; d: boolean }[] = [
  { x: 150 + GUTTER_L, y: 120, r: 3, d: false },
  { x: 520 + GUTTER_L, y: 90, r: 2.4, d: true },
  { x: 836 + GUTTER_L, y: 150, r: 3.2, d: false },
  { x: 1180 + GUTTER_L, y: 110, r: 2.6, d: true },
  { x: 1540 + GUTTER_L, y: 140, r: 3, d: false },
  { x: 90 + GUTTER_L, y: 470, r: 2.6, d: true },
  { x: 1590 + GUTTER_L, y: 470, r: 2.8, d: false },
  { x: 250 + GUTTER_L, y: 884, r: 2.6, d: false },
  { x: 836 + GUTTER_L, y: 884, r: 3, d: true },
  { x: 1430 + GUTTER_L, y: 884, r: 2.6, d: false },
  /* Left gutter — same star field as the playfield ocean */
  { x: 48, y: 108, r: 2.8, d: false },
  { x: 118, y: 82, r: 2.3, d: true },
  { x: 196, y: 168, r: 2.6, d: false },
  { x: 72, y: 462, r: 2.7, d: true },
  { x: 228, y: 518, r: 2.4, d: false },
  { x: 54, y: 804, r: 2.9, d: false },
  { x: 176, y: 872, r: 2.5, d: true },
  { x: 248, y: 688, r: 2.2, d: false },
  /* Right gutter */
  { x: GUTTER_L + PLAYFIELD_W + 52, y: 104, r: 2.7, d: true },
  { x: GUTTER_L + PLAYFIELD_W + 128, y: 176, r: 2.5, d: false },
  { x: GUTTER_L + PLAYFIELD_W + 204, y: 86, r: 2.4, d: true },
  { x: GUTTER_L + PLAYFIELD_W + 68, y: 468, r: 2.8, d: false },
  { x: GUTTER_L + PLAYFIELD_W + 236, y: 524, r: 2.3, d: true },
  { x: GUTTER_L + PLAYFIELD_W + 44, y: 796, r: 2.9, d: false },
  { x: GUTTER_L + PLAYFIELD_W + 188, y: 864, r: 2.6, d: true },
  { x: GUTTER_L + PLAYFIELD_W + 252, y: 676, r: 2.2, d: false }
];

const WATER_CAUSTICS: readonly { x: number; y: number; s: number }[] = [
  { x: 660 + GUTTER_L, y: 250, s: 1 },
  { x: 1010 + GUTTER_L, y: 250, s: 1.1 },
  { x: 640 + GUTTER_L, y: 700, s: 1.05 },
  { x: 1030 + GUTTER_L, y: 700, s: 1 },
  { x: 836 + GUTTER_L, y: 360, s: 1.2 },
  { x: 836 + GUTTER_L, y: 600, s: 1.1 },
  { x: 430 + GUTTER_L, y: 500, s: 0.9 },
  { x: 1240 + GUTTER_L, y: 500, s: 0.9 },
  { x: 132, y: 318, s: 0.85 },
  { x: 228, y: 612, s: 0.8 },
  { x: GUTTER_L + PLAYFIELD_W + 96, y: 302, s: 0.85 },
  { x: GUTTER_L + PLAYFIELD_W + 184, y: 628, s: 0.8 }
];

function ProdigyWaterBackdrop() {
  return (
    <g>
      <rect width={CANVAS_W} height={CANVAS_H} fill="url(#prod-water)" />
      {/* Concentric ripple bands — span full canvas so gutters share the same water field */}
      <ellipse cx={CANVAS_HUB.x} cy={CANVAS_HUB.y} rx={CANVAS_W * 0.56} ry={CANVAS_H * 0.52} fill="none" stroke="#1d4ed8" strokeWidth="3" opacity="0.16" />
      <ellipse cx={CANVAS_HUB.x} cy={CANVAS_HUB.y} rx={CANVAS_W * 0.44} ry={CANVAS_H * 0.4} fill="none" stroke="#2563eb" strokeWidth="3" opacity="0.14" />
      <ellipse cx={CANVAS_HUB.x} cy={CANVAS_HUB.y} rx={CANVAS_W * 0.3} ry={CANVAS_H * 0.28} fill="none" stroke="#3b82f6" strokeWidth="3" opacity="0.12" />
      {/* Caustic glints */}
      {WATER_CAUSTICS.map((c, i) => (
        <path
          key={`caustic-${i}`}
          d={`M${c.x - 26 * c.s} ${c.y} q${13 * c.s} ${-9 * c.s} ${26 * c.s} 0 q${13 * c.s} ${9 * c.s} ${26 * c.s} 0`}
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.18"
        />
      ))}
      {/* Sparkles */}
      {WATER_SPARKLES.map((s, i) => (
        <circle
          key={`spark-${i}`}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#e0f2fe"
          opacity="0.8"
          className={`iq-prodigy-map__star${s.d ? " iq-prodigy-landmark__sparkle--delay" : ""}`}
        />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Full world
 * ------------------------------------------------------------------ */

export function ProdigyWorldArt({
  businessIslandProgressTier = 0,
  islandHubAmbient = false
}: {
  businessIslandProgressTier?: number;
  islandHubAmbient?: boolean;
} = {}) {
  return (
    <svg
      className="iq-prodigy-map__art"
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <radialGradient id="prod-water" cx="0.5" cy="0.46" r="0.78">
          <stop offset="0%" stopColor="#2f6bf0" />
          <stop offset="50%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#0a1a4f" />
        </radialGradient>
        <linearGradient id="prod-rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ab8763" />
          <stop offset="38%" stopColor="#6b5340" />
          <stop offset="100%" stopColor="#2c1e15" />
        </linearGradient>
        <linearGradient id="prod-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9bf6ab" />
          <stop offset="55%" stopColor="#34d058" />
          <stop offset="100%" stopColor="#1f9e3f" />
        </linearGradient>
        <linearGradient id="prod-fountain-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <radialGradient id="prod-hub-stone" cx="0.4" cy="0.32" r="0.85">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="58%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </radialGradient>
        <radialGradient id="prod-hub-stone-inner" cx="0.42" cy="0.32" r="0.85">
          <stop offset="0%" stopColor="#faf5ff" />
          <stop offset="100%" stopColor="#a78bfa" />
        </radialGradient>
        <radialGradient id="prod-hub-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="32%" stopColor="#fde047" stopOpacity="0.88" />
          <stop offset="58%" stopColor="#c4b5fd" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="prod-vignette" cx="0.5" cy="0.46" r="0.78">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="76%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.45" />
        </radialGradient>
      </defs>

      <ProdigyWaterBackdrop />

      <g transform={`translate(${GUTTER_L}, 0)`}>
        {ISLANDS.map((isle) => (
          <ProdigyIslandBase
            key={`island-${isle.id}`}
            island={isle}
            progressTier={isle.id === "business" ? businessIslandProgressTier : 0}
          />
        ))}

        <g
          transform={`translate(${PLAYFIELD_W * PRODIGY_LANDMARK_PLACEMENTS.business.x}, ${PLAYFIELD_H * PRODIGY_LANDMARK_PLACEMENTS.business.y}) scale(${PRODIGY_LANDMARK_PLACEMENTS.business.scale})`}
        >
          <ProdigyBusinessCityLandmark />
        </g>
        <g
          transform={`translate(${PLAYFIELD_W * PRODIGY_LANDMARK_PLACEMENTS.forces.x}, ${PLAYFIELD_H * PRODIGY_LANDMARK_PLACEMENTS.forces.y}) scale(${PRODIGY_LANDMARK_PLACEMENTS.forces.scale})`}
        >
          <ProdigyRiskStormLandmark />
        </g>
        <g
          transform={`translate(${PLAYFIELD_W * PRODIGY_LANDMARK_PLACEMENTS.financials.x}, ${PLAYFIELD_H * PRODIGY_LANDMARK_PLACEMENTS.financials.y}) scale(${PRODIGY_LANDMARK_PLACEMENTS.financials.scale})`}
        >
          <ProdigyFinancialTreasuryLandmark />
        </g>
        <g
          transform={`translate(${PLAYFIELD_W * PRODIGY_LANDMARK_PLACEMENTS.management.x}, ${PLAYFIELD_H * PRODIGY_LANDMARK_PLACEMENTS.management.y}) scale(${PRODIGY_LANDMARK_PLACEMENTS.management.scale})`}
        >
          <ProdigyManagementCitadelLandmark />
        </g>

        <ProdigyHubPlatform cx={PLAYFIELD_HUB.x} cy={PLAYFIELD_HUB.y} r={102} />
        <g
          transform={`translate(${PLAYFIELD_W * (PRODIGY_LANDMARK_PLACEMENTS.hub.x - 0.047)}, ${PLAYFIELD_H * (PRODIGY_LANDMARK_PLACEMENTS.hub.y - 0.088)}) scale(0.78)`}
        >
          <ProdigyHubFortressLandmark />
        </g>
      </g>

      {islandHubAmbient ? (
        <g className="iq-prodigy-island-ambient pointer-events-none" aria-hidden>
          <ellipse
            cx={CANVAS_W * 0.22}
            cy={CANVAS_H * 0.12}
            rx={CANVAS_W * 0.09}
            ry={CANVAS_H * 0.04}
            fill="#ffffff"
            opacity="0.14"
            className="iq-prodigy-island-ambient__cloud iq-prodigy-island-ambient__cloud--a"
          />
          <ellipse
            cx={CANVAS_W * 0.78}
            cy={CANVAS_H * 0.1}
            rx={CANVAS_W * 0.07}
            ry={CANVAS_H * 0.035}
            fill="#ffffff"
            opacity="0.1"
            className="iq-prodigy-island-ambient__cloud iq-prodigy-island-ambient__cloud--b"
          />
          <circle
            cx={CANVAS_W * 0.18}
            cy={CANVAS_H * 0.22}
            r="3"
            fill="#e0f2fe"
            className="iq-prodigy-island-ambient__spark iq-prodigy-island-ambient__spark--a"
          />
          <circle
            cx={CANVAS_W * 0.82}
            cy={CANVAS_H * 0.18}
            r="2.5"
            fill="#fef08a"
            className="iq-prodigy-island-ambient__spark iq-prodigy-island-ambient__spark--b"
          />
        </g>
      ) : null}

      <rect width={CANVAS_W} height={CANVAS_H} fill="url(#prod-vignette)" />
    </svg>
  );
}
