"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export type FallingConfettiRainProps = {
  /** Change to start a new rain session. */
  triggerKey: string | number | null;
  /** How long the rain layer stays mounted (ms). */
  durationMs?: number;
  /** Number of confetti pieces. */
  count?: number;
  className?: string;
};

type Piece = {
  id: number;
  leftPct: number;
  delaySec: number;
  fallSec: number;
  driftX: number;
  rot: number;
  size: number;
  color: string;
  round: boolean;
};

const PALETTE = [
  "#F5C547",
  "#A855F7",
  "#22C58B",
  "#60A5FA",
  "#FBBF24",
  "#F472B6",
  "#34D399"
];

/** Deterministic rain — safe for client mount (no render randomness). */
function buildPieces(count: number, seed: number): Piece[] {
  const n = Math.min(Math.max(count, 24), 120);
  const out: Piece[] = [];
  for (let i = 0; i < n; i++) {
    const t = (seed + i * 19) % 97;
    const u = (seed + i * 29) % 89;
    const v = (seed + i * 41) % 83;
    out.push({
      id: i,
      leftPct: 2 + (t / 97) * 96,
      delaySec: (i % 24) * 0.14,
      fallSec: 2.6 + (u % 6) * 0.35,
      driftX: ((v % 17) - 8) * 6,
      rot: (t * 5 + u * 3) % 360,
      size: 7 + (i % 6),
      color: PALETTE[i % PALETTE.length],
      round: i % 4 === 0
    });
  }
  return out;
}

/**
 * Full-viewport confetti rain — pieces drift down from the top.
 * Decorative only; use inside a fixed inset-0 portal wrapper.
 */
export function FallingConfettiRain({
  triggerKey,
  durationMs = 5200,
  count = 72,
  className = ""
}: FallingConfettiRainProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const seed = useMemo(
    () =>
      typeof triggerKey === "number"
        ? triggerKey
        : String(triggerKey ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0),
    [triggerKey]
  );
  const pieces = useMemo(
    () => buildPieces(count, seed),
    [count, seed]
  );

  useEffect(() => {
    if (triggerKey == null || reduceMotion) {
      setActive(false);
      return;
    }
    setActive(true);
    const t = window.setTimeout(() => setActive(false), durationMs);
    return () => {
      window.clearTimeout(t);
      setActive(false);
    };
  }, [triggerKey, reduceMotion, durationMs]);

  if (!active || reduceMotion) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {pieces.map((p) => (
        <motion.span
          key={`${triggerKey}-${p.id}`}
          className="absolute will-change-transform"
          style={{
            left: `${p.leftPct}%`,
            top: 0,
            width: p.round ? p.size : p.size * 0.65,
            height: p.round ? p.size : p.size * 1.45,
            borderRadius: p.round ? "9999px" : "1px",
            background: p.color,
            boxShadow: `0 0 10px ${p.color}88`
          }}
          initial={{
            opacity: 0,
            y: "-8vh",
            x: 0,
            rotate: p.rot,
            scale: 0.85
          }}
          animate={{
            opacity: [0, 1, 1, 1, 0],
            y: ["-8vh", "108vh"],
            x: [0, p.driftX * 0.35, p.driftX],
            rotate: [p.rot, p.rot + 180, p.rot + 420],
            scale: [0.85, 1, 1, 0.95]
          }}
          transition={{
            duration: p.fallSec,
            delay: p.delaySec,
            ease: [0.12, 0.65, 0.22, 1],
            times: [0, 0.08, 0.75, 0.92, 1]
          }}
        />
      ))}
    </div>
  );
}
