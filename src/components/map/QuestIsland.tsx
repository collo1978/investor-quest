"use client";

/**
 * QuestIsland — a single interactive 2D island on the quest map.
 *
 * Architecture:
 *   • Link wrapper owns the click target and routing.
 *   • Inside, a Framer-Motion bob/hover wrapper holds:
 *       - SceneShell  (halo + water + cliff + plateau, palette-driven)
 *       - ThemedScene (per-pillar structure + lighting + FX — picked from
 *         the THEMED_SCENES registry)
 *       - State overlays (completion crown, active pip, progress arc,
 *         locked overlay) — shared, palette-driven.
 *   • Decorative layers are all `pointer-events: none`; only the Link
 *     wrapper is interactive (`pointer-events-auto`).
 *
 * State-driven via `IslandVisualState` and the pillar palette from
 * `islandTokens.ts`. Locked islands skip motion and prevent click navigation.
 */

import { motion } from "framer-motion";
import Link from "next/link";
import type { PillarMeta } from "@/data/pillars";
import {
  IslandLabel,
  type LabelAnchor
} from "@/components/map/IslandLabel";
import {
  type IslandVisualState,
  paletteFor
} from "@/components/map/islandTokens";
import { SceneShell, THEMED_SCENES } from "@/components/map/scenes";

export type QuestIslandProps = {
  meta: PillarMeta;
  /** Normalised 0..1 scene position (x = left, y = top). */
  position: { x: number; y: number };
  state: IslandVisualState;
  /** 0..100 — completion-related glow strength. */
  progressPct: number;
  /** 0..100 — reading progress (cards marked read). */
  readPct: number;
  /** e.g. "3/5". */
  readLabel: string;
  /** PILLAR_ORDER index — staggers float + pulse phase. */
  orderIndex: number;
  /** Which corner to dock the HUD label into (diagonally outward). */
  labelAnchor: LabelAnchor;
  /** Visual scale relative to the base island size (1 = default).
   *  Used to make a hero island physically larger than the others. */
  sizeScale?: number;
};

const BASE_STAGE_HEIGHT_PX = 260;
const BASE_LINK_PX = 360;
const BASE_LINK_PCT = 30;

export function QuestIsland({
  meta,
  position,
  state,
  progressPct,
  readPct,
  readLabel,
  orderIndex,
  labelAnchor,
  sizeScale
}: QuestIslandProps) {
  const pal = paletteFor(meta.id, state);
  const locked = state === "locked";
  const completed = state === "completed";
  const active = state === "active";
  const inProgress = state === "inProgress";
  const motionOn = !locked;

  const scale = Math.max(0.6, Math.min(2.0, sizeScale ?? 1));
  const stageHeight = Math.round(BASE_STAGE_HEIGHT_PX * scale);
  const linkWidth = `min(${(BASE_LINK_PCT * scale).toFixed(2)}%, ${Math.round(BASE_LINK_PX * scale)}px)`;

  const floatDelay = orderIndex * 0.55;
  const ThemedScene = THEMED_SCENES[meta.id];

  return (
    <Link
      href={locked ? "#" : meta.route}
      aria-disabled={locked}
      aria-label={`${meta.title} island (${state})`}
      data-pillar-id={meta.id}
      prefetch={!locked}
      scroll
      onClick={(e) => {
        if (locked) e.preventDefault();
      }}
      className={[
        "group pointer-events-auto absolute block focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/75",
        locked ? "cursor-not-allowed" : "cursor-pointer"
      ].join(" ")}
      style={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        transform: "translate(-50%, -50%)",
        width: linkWidth
      }}
    >
      <motion.div
        className="relative w-full"
        initial={false}
        animate={motionOn ? { y: [-4, 4, -4] } : { y: 0 }}
        transition={{
          duration: 5.4,
          delay: floatDelay,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
        whileHover={!locked ? { scale: 1.035 } : undefined}
        whileTap={!locked ? { scale: 0.97 } : undefined}
      >
        {/* === Island stage =================================================== */}
        <div className="relative w-full" style={{ height: `${stageHeight}px` }}>
          {/* Shared shell + themed scene */}
          <SceneShell
            palette={pal}
            motionOn={motionOn}
            orderIndex={orderIndex}
            locked={locked}
          >
            <ThemedScene
              palette={pal}
              motionOn={motionOn}
              orderIndex={orderIndex}
            />
          </SceneShell>

          {/* Hover lighting wash — fades in on hover/focus. */}
          <span
            aria-hidden
            className={[
              "pointer-events-none absolute left-1/2 top-1/2 h-[180%] w-[180%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300 ease-out",
              locked
                ? ""
                : "group-hover:opacity-100 group-focus-visible:opacity-100"
            ].join(" ")}
            style={{
              background: `radial-gradient(circle at 50% 45%, ${pal.halo} 0%, transparent 60%)`,
              filter: "blur(34px)",
              mixBlendMode: "screen"
            }}
          />

          {/* Completion crown — rotating dashed ring for cleared islands. */}
          {completed ? (
            <motion.svg
              aria-hidden
              viewBox="0 0 100 100"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2"
              initial={false}
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
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
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(245,197,71,0.40)"
                strokeWidth="0.8"
                strokeDasharray="2 14"
                strokeLinecap="round"
              />
            </motion.svg>
          ) : null}

          {/* Active "you are here" pip. */}
          {active ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[2%] -translate-x-1/2"
              initial={false}
              animate={{ y: [0, -3, 0], opacity: [0.65, 1, 0.65] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "mirror"
              }}
            >
              <span
                className="block h-2.5 w-2.5 rounded-full"
                style={{
                  background: "rgba(216,180,254,1)",
                  boxShadow:
                    "0 0 18px rgba(168,85,247,0.95), 0 0 4px rgba(255,255,255,0.95)"
                }}
              />
            </motion.div>
          ) : null}

          {/* In-progress arc — strokes a partial ring around the island. */}
          {inProgress && !completed ? (
            <ProgressArc readPct={readPct} hi={pal.hi} />
          ) : null}

          {/* Locked overlay — flat lock glyph + dim wash. */}
          {locked ? (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "radial-gradient(60% 70% at 50% 60%, rgba(7,7,18,0.6) 0%, rgba(7,7,18,0.85) 100%)",
                  backdropFilter: "blur(1px)"
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2"
              >
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border"
                  style={{
                    borderColor: "rgba(255,255,255,0.25)",
                    background: "rgba(7,7,18,0.85)",
                    color: "rgba(220,220,232,0.8)",
                    boxShadow: "0 0 18px rgba(0,0,0,0.5)"
                  }}
                >
                  <LockGlyph className="h-4 w-4" />
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* === Holographic HUD chip ============================================
            Decorative-only; absolutely anchored diagonally outward from the
            island so it never covers the structure. */}
        <IslandLabel
          title={meta.title}
          state={state}
          readLabel={readLabel}
          progressPct={Math.max(progressPct, readPct)}
          anchor={labelAnchor}
        />
      </motion.div>
    </Link>
  );
}

/** Thin SVG ring around the island that fills proportionally with read %. */
function ProgressArc({ readPct, hi }: { readPct: number; hi: string }) {
  const clamped = Math.max(0, Math.min(100, readPct));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 rotate-[-90deg]"
      aria-hidden
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="2"
      />
      <motion.circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={hi}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        initial={false}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
        style={{ filter: `drop-shadow(0 0 6px ${hi})` }}
      />
    </svg>
  );
}

function LockGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="3" y="7" width="10" height="6.5" rx="1.5" />
      <path d="M5.5 7V5.2A2.5 2.5 0 0 1 8 2.7v0a2.5 2.5 0 0 1 2.5 2.5V7" />
    </svg>
  );
}
