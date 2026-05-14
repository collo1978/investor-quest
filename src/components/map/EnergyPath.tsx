"use client";

/**
 * EnergyPath — a single beam that connects an island to the centre badge.
 *
 * Rendered inside a parent SVG (`<svg viewBox="0 0 1000 1000"
 * preserveAspectRatio="none">`). All decorative, so the parent wrapper is
 * `pointer-events: none`.
 *
 * Visual layers (back to front):
 *   1. Soft underglow stroke (always-on, brightness scales with progress).
 *   2. Crisp dashed base trail with slow flow (only when source is unlocked).
 *   3. Bright comet dash that runs along the path while the source is
 *      partially or fully complete — brighter the higher `progressPct`.
 *
 * The path colour interpolates from violet (0% progress) to gold (100%)
 * so a "progression spreading" feel emerges naturally as the player
 * works through an island.
 */

import { motion } from "framer-motion";

type Point = { x: number; y: number };

export type EnergyPathProps = {
  /** Island endpoint in normalised 0..1 scene coordinates. */
  from: Point;
  /** Centre endpoint in normalised 0..1 scene coordinates. */
  to: Point;
  /** Whether the source pillar is open for play. */
  unlocked: boolean;
  /** 0..100 — drives base brightness + flow speed. */
  progressPct: number;
  /** Stable id for keys + per-path animation phase. */
  id: string;
};

/** Linear interpolation of two hex/rgb colours via numeric channels. */
function lerpAccent(progressPct: number): { hi: string; soft: string; glow: string } {
  const t = Math.max(0, Math.min(1, progressPct / 100));
  // Violet → Gold ramp.
  const r = Math.round(168 + (245 - 168) * t);
  const g = Math.round(85 + (197 - 85) * t);
  const b = Math.round(247 + (71 - 247) * t);
  return {
    hi: `rgba(${r},${g},${b},0.95)`,
    soft: `rgba(${r},${g},${b},0.40)`,
    glow: `rgba(${r},${g},${b},0.65)`
  };
}

export function EnergyPath({
  from,
  to,
  unlocked,
  progressPct,
  id
}: EnergyPathProps) {
  // Convert normalised 0..1 to viewBox 0..1000.
  const x1 = from.x * 1000;
  const y1 = from.y * 1000;
  const x2 = to.x * 1000;
  const y2 = to.y * 1000;

  // Soft mid-curve toward the centre. The control point sits slightly
  // off-axis so the beam reads as a graceful arc rather than a straight
  // ruler line.
  const midX = (x1 + x2) / 2 + (y1 < y2 ? 30 : -30);
  const midY = (y1 + y2) / 2 + (x1 < x2 ? 30 : -30);
  const d = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

  const accent = lerpAccent(progressPct);
  const isCold = !unlocked;
  const isEnergised = unlocked && progressPct > 0;
  const isComplete = progressPct >= 100;

  // Stagger the per-path phase using the id hash so paths don't move in
  // lockstep. Hashing keeps the value deterministic (SSR-safe).
  const idSeed = id
    .split("")
    .reduce((s, c) => (s * 31 + c.charCodeAt(0)) | 0, 0);
  const phase = Math.abs(idSeed % 1000) / 1000;
  const flowDuration = 6.5 - (progressPct / 100) * 2.5; // faster when more progress.

  return (
    <g aria-hidden>
      {/* (1) Soft underglow — wide & blurred, weakly visible even when cold. */}
      <path
        d={d}
        stroke={isCold ? "rgba(139,92,246,0.10)" : accent.glow}
        strokeWidth={isCold ? 4 : isComplete ? 14 : 10}
        fill="none"
        strokeLinecap="round"
        opacity={isCold ? 0.45 : 0.55 + (progressPct / 100) * 0.35}
        style={{ filter: "blur(4px)" }}
      />

      {/* (2) Crisp dashed base trail — slow drift while unlocked. */}
      {unlocked ? (
        <motion.path
          d={d}
          stroke={accent.soft}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="2 10"
          initial={false}
          animate={{ strokeDashoffset: [0, -240] }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "linear",
            delay: phase * 2
          }}
        />
      ) : null}

      {/* (2b) Subtle idle pulse — always-on for unlocked paths, even with
          no progress. A faint comet drifts toward the centre so the map
          always feels alive and points the player at the 10K hub. */}
      {unlocked ? (
        <motion.path
          d={d}
          stroke={accent.glow}
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 290"
          opacity={0.55}
          initial={false}
          animate={{ strokeDashoffset: [0, -298] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: phase * 1.4
          }}
          style={{ filter: "blur(0.6px)" }}
        />
      ) : null}

      {/* (3) Bright comet dash — only when there's progress. */}
      {isEnergised ? (
        <>
          <motion.path
            d={d}
            stroke={accent.hi}
            strokeWidth={isComplete ? 3.2 : 2.4}
            fill="none"
            strokeLinecap="round"
            opacity={0.78}
            initial={false}
            animate={{ opacity: isComplete ? [0.85, 1, 0.85] : [0.55, 0.95, 0.55] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror",
              delay: phase * 1.5
            }}
          />
          {/* First comet — primary. */}
          <motion.path
            d={d}
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={isComplete ? 2.2 : 1.6}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={isComplete ? "20 200" : "14 220"}
            initial={false}
            animate={{ strokeDashoffset: [0, -234] }}
            transition={{
              duration: flowDuration,
              repeat: Infinity,
              ease: [0.45, 0, 0.55, 1],
              delay: phase * 1.2
            }}
          />
          {/* Second comet — chases the first, only on completed paths. */}
          {isComplete ? (
            <motion.path
              d={d}
              stroke="rgba(255,229,141,0.92)"
              strokeWidth={1.6}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="12 280"
              initial={false}
              animate={{ strokeDashoffset: [0, -292] }}
              transition={{
                duration: flowDuration * 1.2,
                repeat: Infinity,
                ease: [0.45, 0, 0.55, 1],
                delay: phase * 1.2 + flowDuration * 0.45
              }}
              style={{ filter: "drop-shadow(0 0 4px rgba(245,197,71,0.85))" }}
            />
          ) : null}
        </>
      ) : null}
    </g>
  );
}
