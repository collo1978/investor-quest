"use client";

/**
 * QuestMapScene — cinematic image first, interactive hotspots second.
 *
 * The /map experience is intentionally simple at the MVP level:
 *
 *   1) The original cinematic `quest-map.png` artwork is THE visual.
 *   2) Four invisible Link hotspots are layered over the artwork — one
 *      per pillar island. Hotspots show only a subtle hover glow / ring
 *      and a palette-tinted bloom; they never paint over the artwork.
 *   3) Engine wiring (locked / unlocked / active / completed /
 *      in-progress, XP, reading progress) is preserved. Progression
 *      counters live in the left sidebar — the map intentionally has
 *      no overlay HUD so the artwork stays fully immersive.
 *
 * Cinematic polish (added ON TOP of the artwork — never replacing it):
 *   - Ambient particle field drifting in negative space.
 *   - Bridge flow: tiny particles + a wider shimmer pulse travel along
 *     INVISIBLE curved paths that match the energy bridges already drawn
 *     in the artwork. No visible vector lines — the bridges in the image
 *     simply light up as energy flows through them.
 *   - Central "10K reactor" overlay: breathing bloom, three counter-
 *     rotating dashed rings, orbiting motes.
 *   - Per-island hover bloom + thin glowing ring (palette-tinted).
 *   - Click activation: brief radial flash + bridge flow brightens.
 *   - Subtle pointer-driven parallax across three depth layers.
 *
 * Letterbox-aware alignment
 * -------------------------
 * The artwork is rendered at its natural aspect ratio (1024 × 676) and
 * centred inside the stage. A `ResizeObserver` measures the stage and
 * computes the largest letterboxed rectangle that fits — the same box
 * the image renders into. Hotspots, bridge paths, particles, and the
 * reactor core are all positioned in *percentages of that image box*,
 * so they stay glued to the artwork at every viewport size.
 *
 *   ┌──────────────────────────────────────────┐
 *   │   ✦ BUSINESS              ✦ FORCES       │
 *   │           ╲             ╱                │
 *   │            ◉  10K hub                    │
 *   │           ╱             ╲                │
 *   │   ✦ FINANCIALS           ✦ MANAGEMENT    │
 *   └──────────────────────────────────────────┘
 *
 * Engine integration:
 *   • `state.pillars[id].unlocked`             → drives locked vs not.
 *   • `isPillarComplete(state.pillars, id)`    → drives completed.
 *   • `state.activePillarId`                   → drives the active pulse.
 *   • `getPillarReadingProgress(raw, id)`      → drives in-progress + read counts.
 *
 * Hydration safety:
 *   • All "random" values (ambient particle positions, mote angles) are
 *     deterministic constants — there is no `Math.random()` during
 *     render. Pointer-driven parallax is initialised in an effect so SSR
 *     and the first paint match.
 */

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue
} from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/GameProvider";
import { PILLAR_META, type PillarId } from "@/data/pillars";
import { pillarQuestCount } from "@/data/quests/library";
import {
  getPillarReadingProgress,
  isPillarComplete,
  isTenKFinalChallengeUnlocked
} from "@/engine";
import {
  COMPLETED_PALETTE,
  ISLAND_PALETTES,
  type IslandPalette
} from "@/components/map/islandTokens";
import { QUEST_MAP_PATH } from "@/lib/screenAssetUrls";

// ---------------------------------------------------------------------------
// Hotspot map (percentages of the rendered image bounding box).
// ---------------------------------------------------------------------------
// The original quest-map artwork places the four islands in a clean
// quadrant grid around a central 10K hub. These coordinates are tuned to
// the visible silhouettes of each island on `quest-map.png` (1024 × 676)
// and stay glued to them at any viewport because the image box itself
// is letterboxed by the stage at the same aspect ratio.
//
// `cx`/`cy` = centre of the hotspot inside the image box (0–100 %)
// `w`/`h`   = hotspot size as a % of the image box (oval / elliptical)
// ---------------------------------------------------------------------------
type Hotspot = {
  id: PillarId;
  cx: number;
  cy: number;
  w: number;
  h: number;
};

const HOTSPOTS: ReadonlyArray<Hotspot> = [
  { id: "business",   cx: 22, cy: 32, w: 24, h: 28 },
  { id: "forces",     cx: 78, cy: 32, w: 24, h: 28 },
  { id: "financials", cx: 22, cy: 74, w: 24, h: 28 },
  { id: "management", cx: 78, cy: 74, w: 24, h: 28 }
];

/** Centre of the artwork — where the 10K reactor sits. */
const REACTOR_CENTER = { x: 50, y: 50 } as const;

const IMAGE_NATURAL_W = 1024;
const IMAGE_NATURAL_H = 676;
const IMAGE_ASPECT = IMAGE_NATURAL_W / IMAGE_NATURAL_H;

// ---------------------------------------------------------------------------
// Bridge paths — INVISIBLE curves that approximate the energy bridges
// already drawn into the artwork. These are NEVER stroked / filled; they
// exist only as motion tracks for particles travelling through the
// existing bridges in the image.
//
// Coordinates are % of the image box (matched 1:1 by the parent SVG's
// viewBox="0 0 100 100" + preserveAspectRatio="none"). Each path is a
// gentle quadratic Bézier that bows inward toward the reactor — tune
// the control points to align particles with the actual bridges in the
// artwork if anything ever drifts.
// ---------------------------------------------------------------------------
const BRIDGE_PATHS: Record<PillarId, string> = {
  business:   "M 22 32 Q 32 40 50 50",
  forces:     "M 78 32 Q 68 40 50 50",
  financials: "M 22 74 Q 32 64 50 50",
  management: "M 78 74 Q 68 64 50 50"
};

// ---------------------------------------------------------------------------
// Deterministic ambient particle field
// ---------------------------------------------------------------------------
// Sixteen tiny dust motes scattered across the image box. Each has its
// own slow vertical drift + opacity pulse, with hand-tuned positions
// that hug the negative space around the four islands (sky, ocean,
// horizon) so they never paint over the structures in the artwork.
// All values are constants → no Math.random() during render.
// ---------------------------------------------------------------------------
const AMBIENT_PARTICLES: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  opacity: number;
  drift: number;
  dur: number;
  delay: number;
}> = [
  { x:  6, y: 18, size: 1.4, opacity: 0.55, drift: 6,  dur: 14, delay: 0.0 },
  { x: 14, y:  6, size: 1.0, opacity: 0.40, drift: 4,  dur: 11, delay: 0.6 },
  { x: 38, y:  8, size: 1.6, opacity: 0.60, drift: 7,  dur: 16, delay: 1.4 },
  { x: 50, y: 18, size: 1.0, opacity: 0.40, drift: 5,  dur: 13, delay: 0.3 },
  { x: 62, y:  6, size: 1.4, opacity: 0.55, drift: 6,  dur: 15, delay: 2.0 },
  { x: 92, y: 14, size: 1.2, opacity: 0.45, drift: 4,  dur: 12, delay: 0.8 },
  { x:  4, y: 52, size: 1.0, opacity: 0.40, drift: 6,  dur: 17, delay: 1.2 },
  { x: 50, y: 38, size: 1.4, opacity: 0.45, drift: 4,  dur: 14, delay: 0.5 },
  { x: 50, y: 62, size: 1.4, opacity: 0.45, drift: 4,  dur: 14, delay: 2.6 },
  { x: 96, y: 50, size: 1.0, opacity: 0.40, drift: 5,  dur: 13, delay: 1.6 },
  { x:  8, y: 92, size: 1.4, opacity: 0.55, drift: 7,  dur: 18, delay: 2.4 },
  { x: 36, y: 96, size: 1.0, opacity: 0.40, drift: 4,  dur: 11, delay: 0.4 },
  { x: 50, y: 92, size: 1.2, opacity: 0.50, drift: 5,  dur: 13, delay: 1.0 },
  { x: 66, y: 96, size: 1.0, opacity: 0.40, drift: 6,  dur: 14, delay: 1.8 },
  { x: 94, y: 88, size: 1.4, opacity: 0.55, drift: 7,  dur: 16, delay: 0.9 },
  { x: 28, y: 50, size: 1.2, opacity: 0.45, drift: 4,  dur: 12, delay: 2.2 }
];

// ---------------------------------------------------------------------------
// Reactor orbiting motes — each rotates around the centre at a different
// radius and speed so the system feels alive but not metronomic.
// ---------------------------------------------------------------------------
const REACTOR_MOTES: ReadonlyArray<{
  startAngle: number;
  /** Orbital radius — % of the reactor box width. */
  radius: number;
  /** Mote diameter in px. */
  size: number;
  /** One full revolution duration, seconds. */
  dur: number;
  reverse?: boolean;
}> = [
  { startAngle:   0, radius: 38, size: 3,   dur: 14 },
  { startAngle: 120, radius: 38, size: 2.5, dur: 14 },
  { startAngle: 240, radius: 38, size: 3,   dur: 14 },
  { startAngle:  60, radius: 56, size: 2,   dur: 22, reverse: true },
  { startAngle: 180, radius: 56, size: 2.5, dur: 22, reverse: true },
  { startAngle: 300, radius: 56, size: 2,   dur: 22, reverse: true }
];

type IslandModel = {
  id: PillarId;
  title: string;
  route: (typeof PILLAR_META)[number]["route"];
  unlocked: boolean;
  completed: boolean;
  active: boolean;
  inProgress: boolean;
  progressPct: number;
  readPct: number;
  readLabel: string;
  totalQuests: number;
};

// ===========================================================================
// QuestMapScene
// ===========================================================================
export function QuestMapScene() {
  const { state, raw } = useGame();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [imageBox, setImageBox] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0
  });
  const [clickedId, setClickedId] = useState<PillarId | null>(null);

  // Compute the largest letterboxed rectangle of IMAGE_ASPECT that fits
  // inside the stage. Kept in sync with viewport / orientation changes
  // via ResizeObserver so all overlays stay glued to the artwork.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const compute = () => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const stageAspect = r.width / r.height;
      let w: number;
      let h: number;
      if (stageAspect > IMAGE_ASPECT) {
        h = r.height;
        w = h * IMAGE_ASPECT;
      } else {
        w = r.width;
        h = w / IMAGE_ASPECT;
      }
      setImageBox({ w: Math.round(w), h: Math.round(h) });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // -------------------------------------------------------------------------
  // Pointer-driven parallax — three depth layers
  // -------------------------------------------------------------------------
  // Pointer position is mapped to -1..1 across the stage, then spring-
  // damped so motion is buttery, never twitchy. Three `useTransform`
  // multipliers produce three depth layers:
  //   • Image  → ~4px max  (very subtle, the artwork is the hero)
  //   • Beams + reactor → ~10px max
  //   • Ambient particles → ~16px max  (closest to camera)
  // The result is a faint cinematic drift, never enough to make the
  // hotspots feel like they're "slipping" off the islands.
  // -------------------------------------------------------------------------
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 22, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 70, damping: 22, mass: 0.5 });

  const imgPx = useTransform(sx, (v) => v * 4);
  const imgPy = useTransform(sy, (v) => v * 4);
  const midPx = useTransform(sx, (v) => v * 10);
  const midPy = useTransform(sy, (v) => v * 10);
  const fgPx = useTransform(sx, (v) => v * 16);
  const fgPy = useTransform(sy, (v) => v * 16);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [mx, my]);

  // -------------------------------------------------------------------------
  // Engine-derived island models
  // -------------------------------------------------------------------------
  const islands = useMemo<IslandModel[]>(() => {
    return PILLAR_META.map((meta) => {
      const ps = state.pillars[meta.id];
      const total = pillarQuestCount(meta.id);
      const completedCount = ps?.completedQuestSlugs.length ?? 0;
      const progressPct = total > 0 ? (completedCount / total) * 100 : 0;
      const reading = getPillarReadingProgress(raw, meta.id);
      const unlocked = !!ps?.unlocked;
      const completed = isPillarComplete(state.pillars, meta.id);
      const active = state.activePillarId === meta.id && unlocked;
      const inProgress =
        !completed && (reading.read > 0 || progressPct > 0) && unlocked;
      return {
        id: meta.id,
        title: meta.title,
        route: meta.route,
        unlocked,
        completed,
        active,
        inProgress,
        progressPct,
        readPct: reading.pct,
        readLabel: `${reading.read}/${total}`,
        totalQuests: total
      };
    });
  }, [state.pillars, state.activePillarId, raw]);

  const overallProgressPct = useMemo(() => {
    if (islands.length === 0) return 0;
    return islands.reduce((sum, i) => sum + i.progressPct, 0) / islands.length;
  }, [islands]);

  const tenKUnlocked = useMemo(() => isTenKFinalChallengeUnlocked(raw), [raw]);
  const activeProg = raw.companies[raw.activeCompanyId];
  const tenKMastered = activeProg?.tenKRookieChallenge != null;
  const futureArcTeaser = activeProg?.futureArcRevealedAt != null;

  /** Brief activation flash + beam pulse when a hotspot is clicked. The
   * underlying <Link> still handles navigation; this is purely cinematic.
   * 380ms is short enough to play through the Next.js page transition
   * without delaying it. */
  const handleHotspotClick = (id: PillarId) => {
    setClickedId(id);
    window.setTimeout(() => setClickedId(null), 380);
  };

  const hasBox = imageBox.w > 0 && imageBox.h > 0;

  return (
    <div
      ref={stageRef}
      className="absolute inset-0 overflow-hidden rounded-3xl bg-[#05050F]"
      data-quest-map-scene
    >
      {/* Soft ambient wash behind the artwork so letterbox bands never
          read as flat black. Decorative; never blocks pointer events. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 95% at 50% 35%, rgba(40,22,90,0.65) 0%, rgba(14,8,42,0.85) 45%, rgba(4,2,18,1) 80%)"
        }}
      />

      {/* Image box — letterboxed to image aspect ratio. All overlays
          (particles, beams, reactor, hotspots) live inside so they stay
          aligned with the artwork at every viewport size. */}
      {hasBox ? (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: imageBox.w, height: imageBox.h }}
          data-quest-map-image-box
        >
          {futureArcTeaser ? (
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[5%] z-[6] -translate-x-1/2"
            >
              <span
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{
                  borderColor: "rgba(245,197,71,0.45)",
                  background: "rgba(8,7,4,0.72)",
                  color: "rgba(255,229,141,0.95)",
                  boxShadow: "0 0 28px rgba(245,197,71,0.35)"
                }}
              >
                Next expedition — bridge calibrating
              </span>
            </div>
          ) : null}

          {/* (0) Artwork — the hero. Very subtle parallax drift. */}
          <motion.img
            src={QUEST_MAP_PATH}
            alt="Quest Map"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
            style={{ x: imgPx, y: imgPy }}
          />

          {/* (1) Ambient particle field — drifts gently behind beams. */}
          <AmbientParticles parallaxX={fgPx} parallaxY={fgPy} />

          {/* (2) Bridge flow — particles travelling through the EXISTING
              bridges in the artwork. No visible lines, only light moving
              along invisible curved paths. */}
          <BridgeFlows
            islands={islands}
            clickedId={clickedId}
            parallaxX={midPx}
            parallaxY={midPy}
          />

          {/* (3) Central 10K reactor — rings + bloom + orbiting motes. */}
          <ReactorCore
            overallProgressPct={overallProgressPct}
            tenKUnlocked={tenKUnlocked}
            tenKMastered={tenKMastered}
            center={REACTOR_CENTER}
            parallaxX={midPx}
            parallaxY={midPy}
          />

          <TenKCenterPortal
            center={REACTOR_CENTER}
            unlocked={tenKUnlocked}
            mastered={tenKMastered}
            parallaxX={midPx}
            parallaxY={midPy}
          />

          {/* (4) Hotspots — top layer, only interactive surface. */}
          {HOTSPOTS.map((spot) => {
            const island = islands.find((i) => i.id === spot.id);
            if (!island) return null;
            return (
              <QuestMapHotspot
                key={spot.id}
                spot={spot}
                island={island}
                onActivate={handleHotspotClick}
                clicked={clickedId === spot.id}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// ===========================================================================
// AmbientParticles — slow drifting dust motes
// ===========================================================================
function AmbientParticles({
  parallaxX,
  parallaxY
}: {
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
}) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ x: parallaxX, y: parallaxY, mixBlendMode: "screen" }}
    >
      {AMBIENT_PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "rgba(216,180,254,0.95)",
            boxShadow:
              p.size >= 1.4
                ? "0 0 5px rgba(216,180,254,0.85), 0 0 1.5px rgba(255,255,255,0.95)"
                : "0 0 3px rgba(216,180,254,0.7)",
            opacity: p.opacity
          }}
          initial={false}
          animate={{
            y: [-p.drift, p.drift, -p.drift],
            opacity: [p.opacity, p.opacity * 1.6, p.opacity]
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror"
          }}
        />
      ))}
    </motion.div>
  );
}

// ===========================================================================
// BridgeFlows — energy travelling through the artwork's EXISTING bridges
// ===========================================================================
// The original quest-map artwork already has glowing bridges drawn into
// the image. Instead of stroking SVG lines over the top (which always
// reads as "UI lines on an image"), we put particles + a wider shimmer
// pulse on INVISIBLE motion paths whose curves approximate the painted
// bridges. With `mix-blend-mode: screen`, the moving light only ever
// *adds* to whatever is already in the artwork — so the bridges in the
// image appear to come alive as energy flows through them.
//
// Nothing is stroked or filled in this layer apart from small (≤1 px in
// viewBox units) glowing dots. There are no visible vector lines.
//
// State-driven appearance per bridge:
//   • locked      → no flow at all (bridge stays as-painted)
//   • unlocked    → faint violet flow
//   • inProgress  → gentle violet flow + shimmer pulses
//   • active      → brighter violet flow, faster cadence
//   • completed   → gold flow, fastest cadence
//   • clicked     → group opacity briefly snaps to 1 (activation)
// ===========================================================================
function BridgeFlows({
  islands,
  clickedId,
  parallaxX,
  parallaxY
}: {
  islands: IslandModel[];
  clickedId: PillarId | null;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
}) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        x: parallaxX,
        y: parallaxY,
        mixBlendMode: "screen",
        // Tiny circles can shave off at the edges otherwise.
        overflow: "visible"
      }}
    >
      <defs>
        {(Object.keys(BRIDGE_PATHS) as PillarId[]).map((id) => (
          <path
            key={id}
            id={`qm-bridge-${id}`}
            d={BRIDGE_PATHS[id]}
            fill="none"
            stroke="none"
          />
        ))}
      </defs>

      {islands.map((island) => {
        // Locked bridges stay completely silent — the artwork shows them
        // as-painted, no flow, so progression has a clear visual reward
        // when an island unlocks.
        if (!island.unlocked) return null;
        return (
          <BridgeFlow
            key={island.id}
            island={island}
            clicked={clickedId === island.id}
          />
        );
      })}
    </motion.svg>
  );
}

function BridgeFlow({
  island,
  clicked
}: {
  island: IslandModel;
  clicked: boolean;
}) {
  const completed = island.completed;
  const active = island.active;
  const inProgress = island.inProgress;

  // Palette: gold once cleared, soft violet everywhere else. Both blend
  // cleanly with the violet/gold bridges painted into the artwork.
  const color = completed
    ? "rgba(255,229,141,1)"
    : "rgba(216,180,254,1)";

  // Steady-state opacity for the whole flow group.
  const baseOpacity = completed
    ? 0.95
    : active
    ? 0.85
    : inProgress
    ? 0.7
    : 0.5;

  // Time for a particle to traverse the full bridge (s). Faster as the
  // pillar gets more "alive". Tuned to feel like a slow current — never
  // a stream of arrows.
  const flowDuration = completed ? 3.4 : active ? 4.4 : inProgress ? 5.6 : 6.8;
  // Shimmer (wider, occasional bloom) is slower than the small particles
  // so the two cadences don't sync up and feel mechanical.
  const shimmerDuration = flowDuration * 1.7;

  const pathHref = `#qm-bridge-${island.id}`;

  return (
    <motion.g
      initial={false}
      animate={{ opacity: clicked ? 1 : baseOpacity }}
      transition={{ duration: clicked ? 0.18 : 0.4, ease: "easeOut" }}
    >
      {/* Three small bright particles staggered along the bridge.
          Negative `begin` puts each one at a different phase of the
          loop so the flow looks continuous from first frame. */}
      {[0, 0.34, 0.67].map((phase, i) => (
        <circle
          key={`p-${i}`}
          r={i === 1 ? 0.55 : 0.4}
          fill={color}
          opacity={i === 1 ? 1 : 0.85}
          style={{
            filter: `drop-shadow(0 0 0.8px ${color}) drop-shadow(0 0 0.3px rgba(255,255,255,0.95))`
          }}
        >
          <animateMotion
            dur={`${flowDuration}s`}
            repeatCount="indefinite"
            begin={`-${(phase * flowDuration).toFixed(2)}s`}
            rotate="auto"
          >
            <mpath href={pathHref} />
          </animateMotion>
        </circle>
      ))}

      {/* Wider shimmer pulse — fades in for the middle 60 % of its
          journey and fades out at both ends, so it looks like a wave of
          energy washing through the bridge rather than a UFO crossing
          the screen. */}
      <circle
        r="0.95"
        fill={color}
        opacity={0}
        style={{
          filter: `blur(0.4px) drop-shadow(0 0 1.4px ${color})`
        }}
      >
        <animateMotion
          dur={`${shimmerDuration}s`}
          repeatCount="indefinite"
          begin="0s"
        >
          <mpath href={pathHref} />
        </animateMotion>
        <animate
          attributeName="opacity"
          dur={`${shimmerDuration}s`}
          repeatCount="indefinite"
          values="0; 0; 0.65; 0.65; 0"
          keyTimes="0; 0.18; 0.45; 0.72; 1"
        />
      </circle>
    </motion.g>
  );
}

// ===========================================================================
// ReactorCore — central 10K hub overlay (purely decorative)
// ===========================================================================
// Stack (back → front):
//   (a) breathing radial bloom
//   (b) three counter-rotating dashed rings
//   (c) six orbiting motes at two radii
//
// Width is 18% of the image box → ~184px on a 1024px-wide box, scaling
// down on smaller viewports. All animations are `repeat: Infinity` with
// easing tuned for "alive but not metronomic".
// ===========================================================================
function ReactorCore({
  center,
  overallProgressPct,
  tenKUnlocked,
  tenKMastered,
  parallaxX,
  parallaxY
}: {
  center: { x: number; y: number };
  overallProgressPct: number;
  tenKUnlocked: boolean;
  tenKMastered: boolean;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
}) {
  const energized = overallProgressPct > 0 || tenKUnlocked;
  const ringAccent = tenKMastered
    ? "rgba(255,229,141,0.95)"
    : energized
      ? "rgba(255,229,141,0.72)"
      : "rgba(216,180,254,0.55)";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: `${center.x}%`,
        top: `${center.y}%`,
        width: "18%",
        aspectRatio: "1 / 1",
        translateX: "-50%",
        translateY: "-50%",
        x: parallaxX,
        y: parallaxY
      }}
    >
      {/* (a) Breathing bloom — wide soft glow that scales 0.96 ↔ 1.03. */}
      <motion.div
        className="absolute inset-[-40%] rounded-full"
        style={{
          background: tenKMastered
            ? "radial-gradient(circle, rgba(255,229,141,0.55) 0%, rgba(168,85,247,0.38) 32%, transparent 70%)"
            : "radial-gradient(circle, rgba(255,229,141,0.40) 0%, rgba(168,85,247,0.30) 32%, transparent 70%)",
          filter: "blur(10px)",
          mixBlendMode: "screen"
        }}
        initial={false}
        animate={{
          opacity: tenKMastered ? [0.65, 1, 0.65] : [0.55, 0.95, 0.55],
          scale: tenKMastered ? [0.98, 1.08, 0.98] : [0.96, 1.04, 0.96]
        }}
        transition={{
          duration: 4.6,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* (b1) Slow outer ring — CW. */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0"
        initial={false}
        animate={{ rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="rgba(216,180,254,0.45)"
          strokeWidth="0.5"
          strokeDasharray="3 5"
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>

      {/* (b2) Middle ring — CCW, faster. */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0"
        initial={false}
        animate={{ rotate: -360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke={ringAccent}
          strokeWidth="0.4"
          strokeDasharray="2 8"
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>

      {/* (b3) Inner ring — CW, fastest. */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0"
        initial={false}
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="50"
          cy="50"
          r="24"
          fill="none"
          stroke="rgba(216,180,254,0.7)"
          strokeWidth="0.5"
          strokeDasharray={energized ? "4 4" : "1 6"}
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>

      {/* (c) Orbiting motes. Each mote sits at `radius%` along the +x
          axis of a 0-sized origin pinned at the reactor centre; the
          origin rotates linearly so the mote traces a perfect circle. */}
      {REACTOR_MOTES.map((m, i) => (
        <OrbitingMote key={i} mote={m} />
      ))}
    </motion.div>
  );
}

function OrbitingMote({
  mote
}: {
  mote: (typeof REACTOR_MOTES)[number];
}) {
  const end = mote.startAngle + (mote.reverse ? -360 : 360);
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ rotate: [mote.startAngle, end] }}
      transition={{
        duration: mote.dur,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <span
        className="absolute rounded-full"
        style={{
          left: `${50 + mote.radius}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: mote.size,
          height: mote.size,
          background: "rgba(255,255,255,1)",
          boxShadow:
            "0 0 6px rgba(216,180,254,0.95), 0 0 2px rgba(255,255,255,0.95)"
        }}
      />
    </motion.div>
  );
}

// ===========================================================================
// TenKCenterPortal — interactive hit surface over the reactor (above art,
// below island hotspots). Decorative reactor remains pointer-events: none.
// ===========================================================================
function TenKCenterPortal({
  center,
  unlocked,
  mastered,
  parallaxX,
  parallaxY
}: {
  center: { x: number; y: number };
  unlocked: boolean;
  mastered: boolean;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
}) {
  if (!unlocked) return null;
  return (
    <motion.div
      className="absolute z-[5]"
      style={{
        left: `${center.x}%`,
        top: `${center.y}%`,
        width: "18%",
        aspectRatio: "1 / 1",
        translateX: "-50%",
        translateY: "-50%",
        x: parallaxX,
        y: parallaxY
      }}
    >
      <Link
        href="/map/final-challenge"
        prefetch
        scroll
        aria-label={
          mastered
            ? "10-K Rookie final challenge — cleared. Enter to replay."
            : "Enter the 10-K Rookie final challenge at the reactor core"
        }
        className="group relative flex h-full w-full cursor-pointer items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/75"
        style={{
          boxShadow: mastered
            ? "0 0 46px rgba(255,229,141,0.55), inset 0 0 0 1px rgba(245,197,71,0.35)"
            : "0 0 32px rgba(245,197,71,0.38), inset 0 0 0 1px rgba(245,197,71,0.22)"
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[12%] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,229,141,0.28), transparent 68%)",
            mixBlendMode: "screen"
          }}
        />
        <span className="sr-only">10-K Rookie final challenge</span>
      </Link>
    </motion.div>
  );
}

// ===========================================================================
// QuestMapHotspot — invisible interactive surface over each island
// ===========================================================================
// Default state:   completely invisible.
// Hover / focus:   palette-tinted radial bloom + thin glowing ring.
// Active pillar:   slow palette pulse (so the player knows where they "are").
// Completed:       gold dashed crown rotating around the island.
// In-progress:     very faint persistent halo (whisper-soft signal).
// Locked:          subtle dim wash + cursor-not-allowed.
// Clicked:         momentary radial flash + scale pulse on the link wrapper.
//
// All decorative layers carry `pointer-events: none`; only the outer
// Link receives clicks — never blocking taps on adjacent UI.
// ===========================================================================
function QuestMapHotspot({
  spot,
  island,
  onActivate,
  clicked
}: {
  spot: Hotspot;
  island: IslandModel;
  onActivate: (id: PillarId) => void;
  clicked: boolean;
}) {
  const palette: IslandPalette = island.completed
    ? COMPLETED_PALETTE
    : ISLAND_PALETTES[spot.id];
  const locked = !island.unlocked;
  const completed = island.completed;
  const active = island.active;
  const inProgress = island.inProgress;

  return (
    <motion.div
      className="absolute z-[10]"
      style={{
        left: `${spot.cx - spot.w / 2}%`,
        top: `${spot.cy - spot.h / 2}%`,
        width: `${spot.w}%`,
        height: `${spot.h}%`
      }}
      initial={false}
      animate={{ scale: clicked ? [1, 1.06, 1] : 1 }}
      transition={{
        duration: 0.36,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <Link
        href={locked ? "#" : island.route}
        aria-disabled={locked}
        aria-label={`${island.title} island${
          locked
            ? " (locked)"
            : completed
            ? " (completed)"
            : active
            ? " (current)"
            : inProgress
            ? " (in progress)"
            : ""
        }`}
        data-pillar-id={spot.id}
        prefetch={!locked}
        scroll
        onClick={(e) => {
          if (locked) {
            e.preventDefault();
            return;
          }
          onActivate(spot.id);
        }}
        className={[
          "group relative block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/75 focus-visible:ring-offset-0",
          locked ? "cursor-not-allowed" : "cursor-pointer"
        ].join(" ")}
        style={{ borderRadius: "50%" }}
      >
        {/* Active "you are here" pulse — visible whenever active, soft
            enough to never compete with the artwork. */}
        {active ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-[10%] rounded-full"
            style={{
              border: `1px solid ${palette.hi}`,
              boxShadow: `0 0 22px ${palette.halo}`
            }}
            initial={false}
            animate={{
              opacity: [0.4, 0.9, 0.4],
              scale: [0.95, 1.05, 0.95]
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
          />
        ) : null}

        {/* Completed crown — slow gold dashed ring around the island. */}
        {completed ? (
          <motion.svg
            aria-hidden
            viewBox="0 0 100 100"
            className="pointer-events-none absolute -inset-[6%]"
            initial={false}
            animate={{ rotate: 360 }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(245,197,71,0.85)"
              strokeWidth="1.2"
              strokeDasharray="4 7"
              strokeLinecap="round"
            />
          </motion.svg>
        ) : null}

        {/* In-progress whisper — very faint persistent halo. Drops out
            for completed (gold crown takes over) and for active (the
            pulse takes over). */}
        {inProgress && !completed && !active ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-[12%] rounded-full"
            style={{
              background: `radial-gradient(circle at 50% 55%, ${palette.halo} 0%, transparent 70%)`,
              filter: "blur(14px)",
              mixBlendMode: "screen"
            }}
            initial={false}
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
          />
        ) : null}

        {/* Hover bloom — soft palette wash, only on hover/focus. */}
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 ease-out",
            locked
              ? ""
              : "group-hover:opacity-100 group-focus-visible:opacity-100"
          ].join(" ")}
          style={{
            background: `radial-gradient(circle at 50% 55%, ${palette.halo} 0%, transparent 65%)`,
            filter: "blur(18px)",
            mixBlendMode: "screen"
          }}
        />

        {/* Hover ring — thin glowing outline that scales up on hover. */}
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute inset-[14%] rounded-full border opacity-0 transition-all duration-300 ease-out",
            locked
              ? ""
              : "group-hover:opacity-100 group-focus-visible:opacity-100 group-hover:scale-[1.06]"
          ].join(" ")}
          style={{
            borderColor: palette.hi,
            boxShadow: `0 0 28px ${palette.halo}, inset 0 0 22px ${palette.halo}`
          }}
        />

        {/* Activation flash — radial burst that fires on click and fades
            with the page transition. Uses a key so framer-motion remounts
            it on every click for a clean replay. */}
        {clicked ? (
          <motion.span
            key="activation-flash"
            aria-hidden
            className="pointer-events-none absolute -inset-[20%] rounded-full"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.15, 1.6] }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{
              background: `radial-gradient(circle, ${palette.hi} 0%, ${palette.halo} 35%, transparent 70%)`,
              filter: "blur(10px)",
              mixBlendMode: "screen"
            }}
          />
        ) : null}

        {/* Locked overlay — desaturate the island silhouette so the
            locked-vs-unlocked affordance reads at a glance. */}
        {locked ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 55%, rgba(7,7,18,0.55), rgba(7,7,18,0.12) 70%, transparent 100%)",
              mixBlendMode: "multiply"
            }}
          />
        ) : null}

        {/* Screen-reader title — anchored at the hotspot centre so
            VoiceOver / NVDA users hear the island name when focused. */}
        <span className="sr-only">{island.title}</span>
      </Link>
    </motion.div>
  );
}
