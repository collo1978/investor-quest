"use client";

/**
 * SceneShell — the shared "floating island" foundation for every pillar.
 *
 * This file is the single source of truth for the quest-map COMPOSITION
 * SYSTEM. Every visible element on the map belongs to one of four tiers,
 * with the percentages below as hard contracts the themed scenes must
 * obey:
 *
 *   ───────────────────────────────────────────────────────────────────
 *   TIER 1 — ISLAND WORLD (this file)
 *     IslandTerrain SVG       w-[100%]  h-[70%]  bottom-[-12%]
 *       → lit platform top    AT 58% from stage bottom
 *       → underside extends   from -12% to 58%, tip drops below stage
 *
 *   TIER 2 — STRUCTURE (children rendered in *Scene.tsx)
 *     Plant line              bottom-[58%]
 *     Height range            22%–28% of stage
 *     Width  range            20%–50% of stage
 *     MUST fit cleanly inside the stage (no top clipping).
 *
 *   TIER 3 — SURFACE_FX (themed scene)
 *     Bottom edge             bottom-[58%]  (on platform top)
 *     Width range             92%–96% of stage
 *     Height range            8%–18% of stage
 *
 *   TIER 4 — STATUS_UI (themed scene)
 *     Decorative floating readouts (e.g. Management's holo panels).
 *     Height range            6%–14% of stage.
 *     Must NEVER become as visually heavy as the structure itself.
 *   ───────────────────────────────────────────────────────────────────
 *
 * Vertical contract (% from bottom of stage):
 *
 *           100% ┐
 *                │   sky / status UI (Tier 4)
 *            86% │
 *                │   STRUCTURE (Tier 2)
 *            58% ┘ ← structure base / platform top
 *                │
 *            58%–~-12%  ISLAND BODY (Tier 1) — cliff face + rocky underside
 *            -12% .. -22%  drop-shadow + water reflection + fog
 *
 * z-index stack (back → front):
 *
 *   z-[0]  ambient back glow (compact, anchored below stage)
 *   z-[1]  water reflection, deep drop shadow, underside themed glow
 *   z-[2]  IslandTerrain SVG (the big floating land mass)
 *   z-[3]  surface motes + floating debris below the island
 *   z-[4]  plateau lit wash (subtle glow on platform top)
 *   z-[5]  contact shadow under structure base
 *   z-[6]  themed structure + surface details (children)
 *   z-[7]  foreground fog wisp drifting in front of the cliff base
 */

import { motion } from "framer-motion";
import type { IslandPalette } from "@/components/map/islandTokens";

export type SceneShellProps = {
  palette: IslandPalette;
  motionOn: boolean;
  /** 0-based island index — staggers per-island animation phase. */
  orderIndex: number;
  /** Whether the island is locked — dims halo + reflection. */
  locked: boolean;
  children?: React.ReactNode;
};

export function SceneShell({
  palette,
  motionOn,
  orderIndex,
  locked,
  children
}: SceneShellProps) {
  const pulseDelay = orderIndex * 0.42;
  return (
    <>
      {/* z-[0] Ambient back glow — anchored to the LOWER half of the stage
          so it never bleeds above the structure. Compact (90% × 60%). */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-[-12%] z-[0] h-[60%] w-[90%] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(60% 60% at 50% 75%, ${palette.halo} 0%, transparent 75%)`,
          filter: "blur(22px)"
        }}
        initial={false}
        animate={
          motionOn
            ? { scale: [1, 1.06, 1], opacity: [0.35, 0.65, 0.35] }
            : { scale: 1, opacity: 0.12 }
        }
        transition={{
          duration: 4.8,
          delay: pulseDelay,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* === z-[1] Underside / deep depth (BELOW the island floor) ========== */}
      {/* Wide water reflection beneath the entire island silhouette. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-[-22%] z-[1] h-[36%] w-[140%] -translate-x-1/2 rounded-[50%]"
        style={{
          background: `radial-gradient(60% 80% at 50% 40%, ${palette.shadow} 0%, transparent 78%)`,
          filter: "blur(18px)",
          opacity: locked ? 0.4 : 0.9
        }}
      />

      {/* Deep underside drop shadow — sells "this island is hanging in air". */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-[-16%] z-[1] h-[18%] w-[96%] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 30%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.46) 50%, transparent 90%)",
          filter: "blur(16px)",
          opacity: locked ? 0.5 : 0.92
        }}
      />

      {/* Themed underside atmospheric glow — light bleeds from the mass. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-[-12%] z-[1] h-[24%] w-[108%] -translate-x-1/2 rounded-[50%]"
        style={{
          background: `radial-gradient(60% 80% at 50% 35%, ${palette.accent} 0%, ${palette.halo} 35%, transparent 80%)`,
          filter: "blur(20px)",
          mixBlendMode: "screen",
          opacity: locked ? 0.18 : 0.6
        }}
        initial={false}
        animate={
          motionOn
            ? { opacity: [0.45, 0.78, 0.45], scaleY: [0.94, 1.05, 0.94] }
            : { opacity: 0.18 }
        }
        transition={{
          duration: 5.4,
          delay: pulseDelay + 0.4,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* Water-line catchlight on the platform underside. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-[-4%] z-[1] h-[2px] w-[72%] -translate-x-1/2 rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${palette.hi} 50%, transparent 100%)`,
          filter: "blur(1.5px)",
          mixBlendMode: "screen"
        }}
        initial={false}
        animate={
          motionOn
            ? { opacity: [0.35, 0.85, 0.35], scaleX: [0.92, 1, 0.92] }
            : { opacity: 0.18 }
        }
        transition={{
          duration: 5,
          delay: pulseDelay + 1,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* === z-[2] Terrain mass — THE HERO ================================= */}
      <IslandTerrain
        palette={palette}
        locked={locked}
        orderIndex={orderIndex}
      />

      {/* === z-[3] Floating debris + under motes ============================ */}
      <FloatingDebris
        palette={palette}
        locked={locked}
        orderIndex={orderIndex}
        motionOn={motionOn}
      />
      <UnderMotes
        palette={palette}
        locked={locked}
        orderIndex={orderIndex}
        motionOn={motionOn}
      />

      {/* === z-[4] Subtle palette wash on the platform top ================= */}
      {/* SINGLE LAYER (no more stacked plateau / lit-shelf / platform-ring
          which were reading as a "tiny cap" on top of the structure). A
          soft palette-tinted wash painted on the IslandTerrain's lit top.
          The IslandTerrain SVG already paints its own bright rim — this
          just gently colours the wider top so the platform reads as
          "alive" rather than dead stone. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-[42%] z-[4] h-[18%] w-[88%] -translate-x-1/2 rounded-[50%]"
        style={{
          background: `radial-gradient(55% 80% at 50% 65%, ${palette.accent} 0%, ${palette.halo} 45%, transparent 85%)`,
          filter: "blur(14px)",
          mixBlendMode: "screen",
          opacity: locked ? 0.16 : 0.6
        }}
        initial={false}
        animate={
          motionOn
            ? { opacity: [0.42, 0.7, 0.42] }
            : { opacity: 0.18 }
        }
        transition={{
          duration: 3.8,
          delay: pulseDelay,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* === z-[5] Contact shadow under the structure ======================= */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-[55%] z-[5] h-[3.5%] w-[46%] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 50%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)",
          filter: "blur(4px)",
          opacity: locked ? 0.42 : 0.92
        }}
      />

      {/* === z-[6] Themed scene structure =================================== */}
      <div className="pointer-events-none absolute inset-0 z-[6]">{children}</div>

      {/* === z-[7] Foreground fog wisp drifting in front of cliff base ===== */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-[-8%] z-[7] h-[18%] w-[130%] -translate-x-1/2"
        style={{
          background: `radial-gradient(60% 100% at 50% 50%, ${palette.halo} 0%, transparent 70%)`,
          filter: "blur(16px)",
          mixBlendMode: "screen",
          opacity: locked ? 0.18 : 0.52
        }}
        initial={false}
        animate={
          motionOn
            ? { x: [-8, 8, -8], opacity: [0.35, 0.58, 0.35] }
            : { x: 0, opacity: 0.18 }
        }
        transition={{
          duration: 8,
          delay: pulseDelay + 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />
    </>
  );
}

/**
 * IslandTerrain — the floating-island foundation.
 *
 * KEY DESIGN RULES (lessons from previous iterations):
 *   1.  viewBox aspect ratio MATCHES the element aspect ratio. The stage
 *       is 360×260 (BASE_LINK_PX × BASE_STAGE_HEIGHT_PX) and this element
 *       fills 100%×70% of stage = 360×182 (AR ~1.98). ViewBox is 200×100
 *       (AR 2.00). With `preserveAspectRatio="xMidYMin meet"` there is
 *       essentially no letterbox or stretching — the silhouette renders
 *       at its designed proportions.
 *   2.  The path fills a substantial area of the viewBox (top to bottom)
 *       so the floating-island silhouette is unmistakably an "island",
 *       not a thin "cap" band.
 *   3.  The lit top edge of the SVG content sits AT the structure plant
 *       line (`bottom-[58%]` of stage) so structures clearly stand ON the
 *       island.
 *
 * Layout: 100% wide × 70% tall, anchored at bottom-[-12%]. Element spans
 * -12% .. 58% from stage bottom. Lit top edge at 58% = structure base.
 *
 * Path zones (viewBox 200×100):
 *   y=0..3     flat wide lit top edge (full width)
 *   y=3..14    thick platform shelf (subtle inward, almost full width)
 *   y=14..45   cliff face (sides taper from ~95% to ~55% width)
 *   y=45..82   rocky jagged underside (taper from 55% to 15% width)
 *   y=82..100  pointed underside tip (descending into fog below stage)
 */
function IslandTerrain({
  palette,
  locked,
  orderIndex
}: {
  palette: IslandPalette;
  locked: boolean;
  orderIndex: number;
}) {
  const uid = `terrain-${orderIndex}`;
  const path =
    "M 0 0 " +
    "L 200 0 " +
    "L 200 4 " +
    "L 198 10 " +
    "L 194 18 " +
    "L 188 28 " +
    "L 180 38 " +
    "L 172 46 " +
    "L 178 50 " +
    "L 166 54 " +
    "L 172 58 " +
    "L 156 62 " +
    "L 162 66 " +
    "L 144 70 " +
    "L 150 74 " +
    "L 132 76 " +
    "L 138 80 " +
    "L 122 82 " +
    "L 114 86 " +
    "L 120 90 " +
    "L 106 92 " +
    "L 110 96 " +
    "L 100 100 " +
    "L 90 96 " +
    "L 94 92 " +
    "L 80 90 " +
    "L 86 86 " +
    "L 78 82 " +
    "L 62 80 " +
    "L 68 76 " +
    "L 50 74 " +
    "L 56 70 " +
    "L 38 66 " +
    "L 44 62 " +
    "L 28 58 " +
    "L 34 54 " +
    "L 22 50 " +
    "L 28 46 " +
    "L 20 38 " +
    "L 12 28 " +
    "L 6 18 " +
    "L 2 10 " +
    "L 0 4 " +
    "L 0 0 Z";
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 100"
      preserveAspectRatio="xMidYMin meet"
      className="pointer-events-none absolute left-1/2 bottom-[-12%] z-[2] h-[70%] w-[100%] -translate-x-1/2"
      style={{
        filter: `drop-shadow(0 18px 26px rgba(0,0,0,0.82))`,
        opacity: locked ? 0.82 : 1
      }}
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={palette.hi} stopOpacity="0.98" />
          <stop offset="8%" stopColor={palette.mid} stopOpacity="0.98" />
          <stop offset="40%" stopColor={palette.deep} stopOpacity="0.98" />
          <stop offset="100%" stopColor="#020208" stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id={`${uid}-shade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="18%" stopColor="rgba(0,0,0,0.04)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0.35)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
        </linearGradient>
        <radialGradient id={`${uid}-rim`} cx="50%" cy="0%" r="62%">
          <stop offset="0%" stopColor={palette.light} stopOpacity="0.92" />
          <stop offset="100%" stopColor={palette.hi} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-edgehi`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={palette.light} stopOpacity="1" />
          <stop offset="60%" stopColor={palette.hi} stopOpacity="0.7" />
          <stop offset="100%" stopColor={palette.mid} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Main body. */}
      <path
        d={path}
        fill={`url(#${uid}-body)`}
        stroke={palette.deep}
        strokeWidth="0.4"
      />
      {/* Top-down shading — darkens the cliff face. */}
      <path d={path} fill={`url(#${uid}-shade)`} />
      {/* Lit platform surface band — the bright, lit top of the island
          where structures plant. This is the "platform" the user sees
          their structure standing on, so it has to be visually present
          (height 7 of viewBox = ~13px on a normal stage). */}
      <rect x="0" y="0" width="200" height="7" fill={`url(#${uid}-edgehi)`} />
      {/* White inner glow on the lit surface — sells the "hot lit deck"
          read so structures clearly stand on a glowing platform. */}
      <ellipse
        cx="100"
        cy="2"
        rx="98"
        ry="4"
        fill={`url(#${uid}-rim)`}
        opacity="1"
      />
      {/* Crisp bright top edge line. */}
      <rect
        x="2"
        y="0"
        width="196"
        height="0.8"
        fill={palette.light}
        opacity="0.9"
      />
      {/* Cliff rock fissures — diagonal highlights catching light. */}
      <g opacity="0.28">
        <line x1="40" y1="10" x2="48" y2="36" stroke={palette.hi} strokeWidth="0.5" />
        <line x1="160" y1="10" x2="152" y2="36" stroke={palette.hi} strokeWidth="0.5" />
        <line x1="64" y1="22" x2="70" y2="48" stroke={palette.hi} strokeWidth="0.4" />
        <line x1="136" y1="22" x2="130" y2="48" stroke={palette.hi} strokeWidth="0.4" />
        <line x1="88" y1="28" x2="92" y2="56" stroke={palette.hi} strokeWidth="0.35" />
        <line x1="112" y1="28" x2="108" y2="56" stroke={palette.hi} strokeWidth="0.35" />
      </g>
      {/* Rocky chunks on the underside. */}
      <g opacity="0.55">
        <ellipse cx="150" cy="56" rx="6" ry="2.6" fill={palette.deep} />
        <ellipse cx="50" cy="56" rx="6" ry="2.6" fill={palette.deep} />
        <ellipse cx="128" cy="72" rx="4" ry="2" fill={palette.deep} />
        <ellipse cx="72" cy="72" rx="4" ry="2" fill={palette.deep} />
        <ellipse cx="100" cy="86" rx="3" ry="1.6" fill={palette.deep} />
      </g>
    </svg>
  );
}

function FloatingDebris({
  palette,
  locked,
  orderIndex,
  motionOn
}: {
  palette: IslandPalette;
  locked: boolean;
  orderIndex: number;
  motionOn: boolean;
}) {
  if (locked) return null;
  const phase = orderIndex * 0.5;
  return (
    <>
      {DEBRIS_SEEDS.map((d, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute z-[3] rounded-full"
          style={{
            left: `${d.x}%`,
            bottom: `${d.y}%`,
            width: d.size,
            height: d.size * 0.6,
            background: `radial-gradient(50% 60% at 50% 35%, ${palette.mid} 0%, ${palette.deep} 80%)`,
            boxShadow: `0 2px 4px rgba(0,0,0,0.6), 0 0 8px ${palette.halo}`,
            opacity: 0.82
          }}
          initial={false}
          animate={
            motionOn
              ? { y: [0, -3, 0], opacity: [0.6, 0.92, 0.6] }
              : { y: 0, opacity: 0.5 }
          }
          transition={{
            duration: d.duration,
            delay: (phase + i * 0.4) % d.duration,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror"
          }}
        />
      ))}
    </>
  );
}

function UnderMotes({
  palette,
  locked,
  orderIndex,
  motionOn
}: {
  palette: IslandPalette;
  locked: boolean;
  orderIndex: number;
  motionOn: boolean;
}) {
  if (locked || !motionOn) return null;
  const phase = orderIndex * 0.7;
  return (
    <>
      {MOTE_SEEDS.map((m, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute z-[3] rounded-full"
          style={{
            left: `${m.x}%`,
            bottom: `${m.y}%`,
            width: m.size,
            height: m.size,
            background: palette.light,
            boxShadow: `0 0 6px ${palette.light}`
          }}
          initial={false}
          animate={{
            y: [0, -16, 0],
            opacity: [0, 0.85, 0]
          }}
          transition={{
            duration: m.duration,
            delay: (phase + i * 0.45) % m.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </>
  );
}

const DEBRIS_SEEDS: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  duration: number;
}> = [
  { x: 18, y: -3, size: 6, duration: 4.8 },
  { x: 78, y: -5, size: 7, duration: 5.6 },
  { x: 50, y: -8, size: 5, duration: 4.2 },
  { x: 32, y: -11, size: 4, duration: 5.2 },
  { x: 64, y: -10, size: 4.5, duration: 4.6 }
];

const MOTE_SEEDS: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  duration: number;
}> = [
  { x: 22, y: -2, size: 1.1, duration: 3.4 },
  { x: 34, y: -4, size: 0.9, duration: 4.2 },
  { x: 46, y: -2, size: 1.3, duration: 3.8 },
  { x: 56, y: -5, size: 0.9, duration: 4.0 },
  { x: 68, y: -1, size: 1.2, duration: 3.6 },
  { x: 80, y: -4, size: 1.0, duration: 4.4 },
  { x: 28, y: -8, size: 0.8, duration: 4.6 },
  { x: 72, y: -8, size: 0.8, duration: 4.0 }
];
