"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export type ConfettiBurstProps = {
  /** Change to fire a new burst. */
  triggerKey: string | number | null;
  /** Particle count (capped for performance). */
  count?: number;
  className?: string;
  /** How long the burst layer stays mounted (ms). */
  activeDurationMs?: number;
  /** Per-particle fall animation duration (seconds). */
  particleDurationSec?: number;
  /** Stagger particle starts up to this many seconds. */
  maxParticleDelaySec?: number;
  /** Horizontal spread in px (half-width). */
  spreadX?: number;
  /** Vertical fall distance in px. */
  fallDistance?: number;
  /** Vertical origin as % from top of container. */
  originTopPct?: number;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  rot: number;
  color: string;
  delay: number;
  size: number;
};

const PALETTE = [
  "rgba(245,197,71,0.95)",
  "rgba(168,85,247,0.9)",
  "rgba(34,197,139,0.9)",
  "rgba(96,165,250,0.85)",
  "rgba(251,191,36,0.9)"
];

/** Deterministic offsets — safe for client-only mount (no render randomness). */
function buildParticles(
  count: number,
  seed: number,
  maxDelaySec: number,
  spreadX: number,
  _fallDistance: number
): Particle[] {
  const n = Math.min(Math.max(count, 8), 56);
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    const t = (seed + i * 17) % 97;
    const u = (seed + i * 31) % 89;
    const delaySpread = maxDelaySec > 0 ? (i % 13) * (maxDelaySec / 12) : 0;
    const lane = i % 3;
    const xSpread = spreadX * (0.85 + lane * 0.12);
    out.push({
      id: i,
      x: ((t / 97) * 2 - 1) * xSpread,
      y: -10 - (u % 40) + (lane - 1) * 8,
      rot: (t * 4 + u * 3) % 360,
      color: PALETTE[i % PALETTE.length],
      delay: delaySpread,
      size: 4 + (i % 5)
    });
  }
  return out;
}

/**
 * Lightweight confetti burst for quest pass / island moments.
 * Decorative only — pointer-events none.
 */
export function ConfettiBurst({
  triggerKey,
  count = 24,
  className = "",
  activeDurationMs = 2200,
  particleDurationSec = 1.35,
  maxParticleDelaySec = 0.28,
  spreadX = 160,
  fallDistance = 140,
  originTopPct = 38
}: ConfettiBurstProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const seed = useMemo(
    () => (typeof triggerKey === "number" ? triggerKey : String(triggerKey ?? "").length),
    [triggerKey]
  );
  const particles = useMemo(
    () => buildParticles(count, seed, maxParticleDelaySec, spreadX, fallDistance),
    [count, seed, active, maxParticleDelaySec, spreadX, fallDistance]
  );

  useEffect(() => {
    if (triggerKey == null || reduceMotion) return;
    setActive(true);
    const t = window.setTimeout(() => setActive(false), activeDurationMs);
    return () => window.clearTimeout(t);
  }, [triggerKey, reduceMotion, activeDurationMs]);

  if (!active || reduceMotion) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {particles.map((p) => (
        <motion.span
          key={`${triggerKey}-${p.id}`}
          className="absolute left-1/2 rounded-[1px]"
          style={{
            top: `${originTopPct}%`,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`
          }}
          initial={{
            opacity: 0,
            x: 0,
            y: 0,
            rotate: p.rot,
            scale: 0.6
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: p.x,
            y: [p.y, p.y + fallDistance + (p.id % 6) * 22],
            rotate: p.rot + 220,
            scale: [0.6, 1.05, 0.9]
          }}
          transition={{
            duration: particleDurationSec,
            delay: p.delay,
            ease: [0.22, 0.9, 0.28, 1]
          }}
        />
      ))}
    </div>
  );
}
