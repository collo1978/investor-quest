"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export type ConfettiBurstProps = {
  /** Change to fire a new burst. */
  triggerKey: string | number | null;
  /** Particle count (capped for performance). */
  count?: number;
  className?: string;
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
function buildParticles(count: number, seed: number): Particle[] {
  const n = Math.min(Math.max(count, 8), 36);
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    const t = (seed + i * 17) % 97;
    const u = (seed + i * 31) % 89;
    out.push({
      id: i,
      x: ((t / 97) * 2 - 1) * 140,
      y: -20 - (u % 40),
      rot: (t * 4 + u * 3) % 360,
      color: PALETTE[i % PALETTE.length],
      delay: (i % 7) * 0.04,
      size: 4 + (i % 3)
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
  className = ""
}: ConfettiBurstProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const seed = useMemo(
    () => (typeof triggerKey === "number" ? triggerKey : String(triggerKey ?? "").length),
    [triggerKey]
  );
  const particles = useMemo(
    () => buildParticles(count, seed),
    [count, seed, active]
  );

  useEffect(() => {
    if (triggerKey == null || reduceMotion) return;
    setActive(true);
    const t = window.setTimeout(() => setActive(false), 2200);
    return () => window.clearTimeout(t);
  }, [triggerKey, reduceMotion]);

  if (!active || reduceMotion) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {particles.map((p) => (
        <motion.span
          key={`${triggerKey}-${p.id}`}
          className="absolute left-1/2 top-[38%] rounded-[1px]"
          style={{
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
            y: [p.y, p.y + 120 + (p.id % 5) * 18],
            rotate: p.rot + 180,
            scale: [0.6, 1, 0.85]
          }}
          transition={{
            duration: 1.35,
            delay: p.delay,
            ease: [0.22, 0.9, 0.28, 1]
          }}
        />
      ))}
    </div>
  );
}
