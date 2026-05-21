"use client";

/**
 * QuestMapScene — cinematic image first, interactive hotspots second.
 *
 * The /map experience is intentionally simple at the MVP level:
 *
 *   1) The cinematic `final-quest-map.png` artwork is THE visual.
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
 *   - Per-island hover bloom + thin ring (palette); state glows (active,
 *     completion crown, in-progress).
 *   - Click activation: brief radial flash + bridge flow brightens.
 *   - Subtle pointer-driven parallax across three depth layers.
 *
 * Letterbox-aware alignment
 * -------------------------
 * The artwork is rendered at its natural aspect ratio (1402 × 1122) and
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
import { MapForcesRocketEmblem } from "@/components/map/MapForcesRocketEmblem";
import { companyById, type CompanyId } from "@/data/companies";
import { PILLAR_META, type PillarId } from "@/data/pillars";
import { resolveCompanyLogoUrl } from "@/lib/business/buildBusinessHubCards";
import { pillarQuestCount } from "@/data/quests/library";
import {
  getPillarReadingProgress,
  isPillarComplete,
  isTenKFinalChallengeUnlocked
} from "@/engine";
import {
  COMPLETED_PALETTE,
  QUEST_MAP_HOVER,
  questMapBridgeColor,
  type QuestMapHoverAccent
} from "@/components/map/islandTokens";
import { QUEST_MAP_AVIF_PATH, QUEST_MAP_PATH } from "@/lib/screenAssetUrls";

// ---------------------------------------------------------------------------
// Hotspot map (percentages of the rendered image bounding box).
// ---------------------------------------------------------------------------
// `final-quest-map.png` places the four islands in a quadrant around
// the central 10K hub (wider canvas than the legacy map). Percent coords are
// tuned to the island masses + baked-in hex labels; tweak if art changes.
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

/** Ellipses cover island + badge — kept tight so hover glow hugs the art. */
const HOTSPOTS: ReadonlyArray<Hotspot> = [
  { id: "business",   cx: 23, cy: 33, w: 23, h: 29 },
  { id: "forces",     cx: 77, cy: 33, w: 23, h: 29 },
  { id: "financials", cx: 23, cy: 67, w: 23, h: 28 },
  { id: "management", cx: 77, cy: 67, w: 23, h: 28 }
];

/**
 * Top-row art has hex titles at the bottom of the island — lift the enter
 * CTA onto the structure so it does not cover BUSINESS / FORCES signs.
 */
function enterCtaLayout(pillarId: PillarId): string {
  if (pillarId === "business" || pillarId === "forces") {
    return "top-[28%] -translate-x-1/2";
  }
  return "top-1/2 -translate-x-1/2 -translate-y-1/2";
}

/**
 * Locked-island lock chip — centred on the rocky mass; top row sits higher
 * so it does not sit on the baked-in hex “BUSINESS / FORCES” plaques.
 */
function lockBadgeLayout(pillarId: PillarId): string {
  if (pillarId === "business" || pillarId === "forces") {
    return "left-1/2 top-[33%] -translate-x-1/2 -translate-y-1/2";
  }
  return "left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2";
}

/** Centre of the artwork — where the 10K reactor sits. */
const REACTOR_CENTER = { x: 50, y: 50 } as const;

const IMAGE_NATURAL_W = 1402;
const IMAGE_NATURAL_H = 1122;
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
  business:   "M 23 33 Q 36 42 50 50",
  forces:     "M 77 33 Q 64 42 50 50",
  financials: "M 23 67 Q 36 58 50 50",
  management: "M 77 67 Q 64 58 50 50"
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

/** Overall campaign progress — top-right inside the letterboxed map artwork. */
function QuestMapOverallProgressHud({ progressPct }: { progressPct: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(progressPct)));

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="pointer-events-none absolute right-2 top-2 z-[25] w-[min(9rem,32vw)] sm:right-3 sm:top-3 sm:w-36"
      role="status"
      aria-label={`Quest map progress ${pct} percent`}
    >
      <motion.div
        className="rounded-xl border border-[rgba(139,92,246,0.45)] bg-[rgba(8,6,18,0.85)] px-3 py-2.5 shadow-[0_0_24px_rgba(139,92,246,0.22),0_10px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
        initial={false}
        animate={
          pct >= 100
            ? {
                boxShadow: [
                  "0 0 24px rgba(139,92,246,0.32), 0 10px 32px rgba(0,0,0,0.5)",
                  "0 0 36px rgba(168,85,247,0.45), 0 10px 32px rgba(0,0,0,0.5)",
                  "0 0 24px rgba(139,92,246,0.32), 0 10px 32px rgba(0,0,0,0.5)"
                ]
              }
            : undefined
        }
        transition={
          pct >= 100
            ? { duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
            : undefined
        }
      >
        <motion.div className="mb-1.5 flex justify-end">
          <span
            className="font-[var(--font-grotesk)] text-base font-bold tabular-nums leading-none text-[rgba(216,180,254,0.98)] sm:text-lg"
            style={{ textShadow: "0 0 14px rgba(168,85,247,0.55)" }}
          >
            {pct}%
          </span>
        </motion.div>
        <motion.div
          className="relative h-2 overflow-hidden rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.32) 100%)",
            boxShadow:
              "inset 0 1px 2px rgba(0,0,0,0.65), inset 0 -1px 0 rgba(255,255,255,0.06)"
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/[0.1]"
          />
          <motion.div
            className="relative h-full rounded-full"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                "linear-gradient(90deg, rgba(109,40,217,0.9) 0%, rgba(168,85,247,1) 48%, rgba(192,132,252,1) 100%)",
              boxShadow:
                "0 0 12px rgba(168,85,247,0.5), inset 0 1px 0 rgba(255,255,255,0.35)"
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

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
    const raf = requestAnimationFrame(() => compute());
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
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

  const company = companyById(state.activeCompanyId as CompanyId);
  const companyLogo = resolveCompanyLogoUrl(company, company.companyLogoUrl);
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
          <QuestMapOverallProgressHud progressPct={overallProgressPct} />

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

          {companyLogo ? (
            <MapForcesRocketEmblem
              logoUrl={companyLogo}
              companyName={company.name}
            />
          ) : null}

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
                parallaxX={imgPx}
                parallaxY={imgPy}
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
//   • unlocked    → faint pillar-tinted flow
//   • inProgress  → brighter pillar flow + shimmer pulses
//   • active      → brightest pillar flow, faster cadence
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
  // Plain `<svg>` root + `motion.g` was avoided: Framer `motion.*` inside
  // SVG alongside SMIL (`animateMotion` / `mpath`) has triggered broken
  // client chunks in dev (`__webpack_modules__[moduleId] is not a function`).
  // Parallax stays on `motion.svg`; bridge opacity uses CSS on `<g>`.
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
        pointerEvents: "none",
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

  const color = questMapBridgeColor(island.id, completed);

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
    <g
      style={{
        opacity: clicked ? 1 : baseOpacity,
        transition: `opacity ${clicked ? 0.18 : 0.4}s ease-out`
      }}
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
    </g>
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
      className="pointer-events-none absolute z-[5]"
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
        className="group relative flex h-full w-full cursor-pointer items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/75 pointer-events-auto touch-manipulation"
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
// Default state:   completely invisible (no DOM HUD over the artwork).
// Bridge flows:    pillar-tinted energy (see BridgeFlow).
// Center CTA:      large "Enter …" button on each island.
// Hover / focus:   glow behind CTA.
// Active pillar:   slow palette pulse (so the player knows where they "are").
// Completed:       gold dashed crown rotating around the island.
// In-progress:     very faint persistent halo (whisper-soft signal).
// Locked:          subtle dim wash + cursor-not-allowed.
// Clicked:         momentary radial flash + scale pulse on the link wrapper.
//
// All decorative layers carry `pointer-events: none`; only the outer
// Link receives clicks — never blocking taps on adjacent UI.
// ===========================================================================
function questMapHoverAccent(
  pillarId: PillarId,
  completed: boolean
): QuestMapHoverAccent {
  if (completed) {
    return {
      hi: COMPLETED_PALETTE.hi,
      halo: COMPLETED_PALETTE.halo,
      labelBg: "rgba(12, 10, 4, 0.9)",
      labelText: "rgba(255, 241, 198, 0.98)"
    };
  }
  return QUEST_MAP_HOVER[pillarId];
}

/** Lock badge — readable size, pillar-tuned placement on island art. */
function MapIslandLockGlyph({ pillarId }: { pillarId: PillarId }) {
  return (
    <motion.div
      aria-hidden
      className={[
        "pointer-events-none absolute z-[9] inline-flex justify-center",
        lockBadgeLayout(pillarId)
      ].join(" ")}
      initial={false}
      animate={{ opacity: [0.9, 1, 0.9] }}
      transition={{
        duration: 3.2,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "mirror"
      }}
    >
      <div
        className="rounded-xl border border-[rgba(196,181,253,0.42)] bg-[rgba(10,9,22,0.78)] px-2.5 py-2 backdrop-blur-[3px]"
        style={{
          boxShadow:
            "0 0 20px rgba(139,92,246,0.35), 0 10px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)"
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="block h-[22px] w-[22px] sm:h-6 sm:w-6"
          fill="none"
          stroke="rgba(236,233,252,0.95)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M7 11V8a5 5 0 0110 0v3" />
          <rect
            x="5"
            y="11"
            width="14"
            height="10"
            rx="2"
            stroke="rgba(210,195,255,0.98)"
          />
          <rect
            x="11"
            y="15.5"
            width="2"
            height="2.75"
            rx="0.35"
            fill="rgba(236,233,252,0.42)"
            stroke="none"
          />
        </svg>
      </div>
    </motion.div>
  );
}

function QuestMapHotspot({
  spot,
  island,
  onActivate,
  clicked,
  parallaxX,
  parallaxY
}: {
  spot: Hotspot;
  island: IslandModel;
  onActivate: (id: PillarId) => void;
  clicked: boolean;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
}) {
  const accent = questMapHoverAccent(spot.id, island.completed);
  const locked = !island.unlocked;
  const completed = island.completed;
  const active = island.active;
  const inProgress = island.inProgress;
  return (
    <motion.div
      className="pointer-events-none absolute z-[20]"
      style={{
        left: `${spot.cx - spot.w / 2}%`,
        top: `${spot.cy - spot.h / 2}%`,
        width: `${spot.w}%`,
        height: `${spot.h}%`,
        x: parallaxX,
        y: parallaxY
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
          "group relative block h-full w-full pointer-events-auto touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[color:var(--map-focus)]",
          locked ? "cursor-not-allowed" : "cursor-pointer"
        ].join(" ")}
        style={{
          borderRadius: "50%",
          ["--map-focus" as string]: accent.hi
        }}
      >
        {/* Locked — light wash only; island silhouette stays recognizable. */}
        {locked ? (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(185deg,rgba(8,10,22,0.05)_0%,rgba(6,8,18,0.22)_52%,rgba(5,7,16,0.34)_100%)] mix-blend-multiply"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 top-[35%] z-[2] bg-[linear-gradient(to_top,rgba(4,6,16,0.42)_0%,transparent_100%)] opacity-70"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-[8%] inset-y-[12%] z-[2] rounded-2xl shadow-[inset_0_10px_40px_rgba(0,0,0,0.28),inset_0_-4px_20px_rgba(0,0,0,0.18)]"
            />
            <MapIslandLockGlyph pillarId={spot.id} />
          </>
        ) : null}

        {/* Unlocked baseline — no ring; state reads from progress + washes below. */}

        {/* Active pillar — bottom-plane glow */}
        {active ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-x-[10%] bottom-[6%] top-[52%] z-[1] rounded-2xl"
            style={{
              background: `linear-gradient(to top, color-mix(in srgb, ${accent.halo} 55%, transparent) 0%, transparent 92%)`,
              mixBlendMode: "screen",
              filter: "blur(1px)"
            }}
            initial={false}
            animate={{ opacity: [0.42, 0.65, 0.42] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
          />
        ) : null}

        {/* Completed — gold datum line */}
        {completed ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-[14%] right-[14%] top-[72%] z-[1] h-px origin-center rounded-full"
            initial={false}
            animate={{ opacity: [0.5, 0.92, 0.5], scaleX: [0.96, 1, 0.96] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(245,197,71,0.65) 20%, rgba(255,229,141,1) 50%, rgba(245,197,71,0.65) 80%, transparent 100%)",
              boxShadow:
                "0 0 12px rgba(245,197,71,0.45), 0 0 32px rgba(245,197,71,0.25)"
            }}
          />
        ) : null}

        {/* In-progress — soft bottom wash */}
        {inProgress && !completed && !active ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-x-[12%] bottom-[8%] top-[48%] z-[1] rounded-2xl"
            style={{
              background: `linear-gradient(to top, color-mix(in srgb, ${accent.halo} 35%, transparent) 0%, transparent 100%)`,
              mixBlendMode: "screen"
            }}
            initial={false}
            animate={{ opacity: [0.2, 0.38, 0.2] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
          />
        ) : null}

        {/* Hover / focus — edge wash only (no radial disc). */}
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute inset-x-[6%] top-[16%] bottom-[6%] rounded-2xl opacity-0 transition-opacity duration-250 ease-out",
            locked
              ? "group-hover:opacity-40 group-focus-visible:opacity-40"
              : "group-hover:opacity-100 group-focus-visible:opacity-100"
          ].join(" ")}
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${accent.halo}18 55%, color-mix(in srgb, ${accent.hi} 22%, transparent) 100%)`,
            mixBlendMode: "screen"
          }}
        />
        {!locked ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-[8%] bottom-[6%] top-[58%] rounded-2xl opacity-0 transition-opacity duration-250 ease-out group-hover:opacity-55 group-focus-visible:opacity-55"
            style={{
              boxShadow: `inset 0 -18px 36px color-mix(in srgb, ${accent.hi} 28%, transparent)`,
              mixBlendMode: "screen"
            }}
          />
        ) : null}

        {!locked ? (
          <span
            aria-hidden
            className={[
              "pointer-events-none absolute left-1/2 z-[6] max-w-[92%]",
              enterCtaLayout(spot.id),
              "rounded-2xl border-2 px-4 py-2.5 text-center font-[var(--font-grotesk)] text-[11px] font-bold uppercase leading-tight tracking-[0.14em] shadow-xl backdrop-blur-md transition-[opacity,transform,box-shadow] duration-250 ease-out",
              "sm:px-6 sm:py-3 sm:text-[13px] sm:tracking-[0.16em] md:px-7 md:py-3.5 md:text-[15px]",
              "opacity-88 group-hover:scale-[1.06] group-hover:opacity-100 group-focus-visible:scale-[1.06] group-focus-visible:opacity-100"
            ].join(" ")}
            style={{
              borderColor: accent.hi,
              background: accent.labelBg,
              color: accent.labelText,
              boxShadow: `0 0 28px ${accent.halo}, 0 6px 20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)`
            }}
          >
            {`Enter ${island.title}`}
          </span>
        ) : null}

        {/* Activation flash — quick vertical flare on tap */}
        {clicked ? (
          <motion.span
            key="activation-flash"
            aria-hidden
            className="pointer-events-none absolute inset-[10%] rounded-3xl"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: [0, 1, 0], scale: [0.98, 1.02, 1.05] }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{
              background: `linear-gradient(180deg, transparent 10%, ${accent.hi}22 60%, ${accent.halo}18 100%)`,
              mixBlendMode: "screen"
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
