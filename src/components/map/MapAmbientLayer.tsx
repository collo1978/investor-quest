"use client";

/**
 * MapAmbientLayer — drifting particles + soft parallax fog overlaid on the
 * static quest-map artwork. Decorative only: full layer is
 * `pointer-events: none` so the underlying island hotspots stay clickable.
 *
 * Hydration-safe: every particle gets its motion parameters from a pre-baked
 * deterministic seed table (no `Math.random()` during render).
 */

import { motion } from "framer-motion";
import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

type ParticleSeed = {
  /** 0..1 starting position on the map (left). */
  x: number;
  /** 0..1 starting position on the map (top). */
  y: number;
  /** Drift radius in px on x axis. */
  driftX: number;
  /** Drift radius in px on y axis. */
  driftY: number;
  /** Loop duration in seconds. */
  duration: number;
  /** Animation start delay (s). */
  delay: number;
  /** Diameter in px. */
  size: number;
  /** Base opacity at the dim end of the breath cycle. */
  opacityLow: number;
  /** Peak opacity at the bright end of the breath cycle. */
  opacityHigh: number;
  /** Tint preset. */
  tone: "violet" | "blue" | "white";
};

const PARTICLE_SEEDS: readonly ParticleSeed[] = [
  { x: 0.08, y: 0.14, driftX: 22, driftY: 18, duration: 14, delay: 0.0, size: 3, opacityLow: 0.18, opacityHigh: 0.55, tone: "violet" },
  { x: 0.22, y: 0.32, driftX: 26, driftY: 14, duration: 16, delay: 1.4, size: 2, opacityLow: 0.14, opacityHigh: 0.45, tone: "blue" },
  { x: 0.41, y: 0.18, driftX: 30, driftY: 22, duration: 18, delay: 2.8, size: 4, opacityLow: 0.20, opacityHigh: 0.60, tone: "violet" },
  { x: 0.62, y: 0.10, driftX: 20, driftY: 26, duration: 13, delay: 0.6, size: 3, opacityLow: 0.16, opacityHigh: 0.50, tone: "white" },
  { x: 0.82, y: 0.20, driftX: 28, driftY: 18, duration: 17, delay: 1.9, size: 3, opacityLow: 0.18, opacityHigh: 0.55, tone: "violet" },
  { x: 0.94, y: 0.36, driftX: 18, driftY: 28, duration: 15, delay: 3.4, size: 2, opacityLow: 0.12, opacityHigh: 0.40, tone: "blue" },
  { x: 0.06, y: 0.52, driftX: 24, driftY: 20, duration: 19, delay: 0.9, size: 3, opacityLow: 0.16, opacityHigh: 0.48, tone: "violet" },
  { x: 0.28, y: 0.62, driftX: 30, driftY: 16, duration: 14, delay: 2.2, size: 4, opacityLow: 0.20, opacityHigh: 0.58, tone: "white" },
  { x: 0.48, y: 0.50, driftX: 22, driftY: 24, duration: 16, delay: 4.0, size: 3, opacityLow: 0.18, opacityHigh: 0.55, tone: "violet" },
  { x: 0.71, y: 0.58, driftX: 26, driftY: 22, duration: 18, delay: 1.1, size: 2, opacityLow: 0.14, opacityHigh: 0.42, tone: "blue" },
  { x: 0.90, y: 0.66, driftX: 20, driftY: 18, duration: 15, delay: 3.2, size: 3, opacityLow: 0.18, opacityHigh: 0.52, tone: "violet" },
  { x: 0.12, y: 0.80, driftX: 28, driftY: 14, duration: 17, delay: 0.4, size: 3, opacityLow: 0.16, opacityHigh: 0.48, tone: "white" },
  { x: 0.34, y: 0.88, driftX: 24, driftY: 20, duration: 14, delay: 2.7, size: 2, opacityLow: 0.14, opacityHigh: 0.40, tone: "blue" },
  { x: 0.56, y: 0.82, driftX: 22, driftY: 24, duration: 19, delay: 1.6, size: 4, opacityLow: 0.20, opacityHigh: 0.60, tone: "violet" },
  { x: 0.78, y: 0.90, driftX: 26, driftY: 18, duration: 16, delay: 3.9, size: 3, opacityLow: 0.18, opacityHigh: 0.54, tone: "violet" },
  { x: 0.96, y: 0.78, driftX: 20, driftY: 22, duration: 18, delay: 2.0, size: 2, opacityLow: 0.14, opacityHigh: 0.44, tone: "blue" }
];

const TONE_BACKGROUND: Record<ParticleSeed["tone"], string> = {
  violet: "radial-gradient(circle, rgba(168,85,247,1) 0%, rgba(139,92,246,0.6) 45%, transparent 70%)",
  blue: "radial-gradient(circle, rgba(96,165,250,1) 0%, rgba(59,130,246,0.55) 45%, transparent 70%)",
  white: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(216,180,254,0.55) 45%, transparent 70%)"
};

export function MapAmbientLayer() {
  const ref = useRef<HTMLDivElement | null>(null);

  // Pointer-driven parallax: only attached client-side so SSR stays
  // deterministic and we avoid `window`-leaks during render.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 90, damping: 18, mass: 0.4 });

  const fogX = useTransform(sx, (v) => v * 14);
  const fogY = useTransform(sy, (v) => v * 14);
  const dustX = useTransform(sx, (v) => v * 6);
  const dustY = useTransform(sy, (v) => v * 6);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      mx.set((px - 0.5) * 2);
      my.set((py - 0.5) * 2);
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    // Bind on the parent <main> so hover anywhere on the map shifts the fog.
    const parent = el.parentElement;
    if (!parent) return;
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, [mx, my]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
    >
      {/* Layered fog — gives the map depth without touching artwork. */}
      <motion.div
        className="absolute inset-[-10%]"
        style={{
          x: fogX,
          y: fogY,
          background:
            "radial-gradient(40% 30% at 30% 25%, rgba(139,92,246,0.10), transparent 65%), radial-gradient(35% 28% at 75% 70%, rgba(96,165,250,0.08), transparent 65%)",
          filter: "blur(28px)"
        }}
      />

      {/* Subtle grid breath — adds parallax depth, very faint. */}
      <motion.div
        className="absolute inset-[-4%] opacity-[0.18]"
        style={{
          x: fogX,
          y: fogY,
          backgroundImage:
            "linear-gradient(to right, rgba(168,85,247,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(168,85,247,0.10) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          maskImage:
            "radial-gradient(70% 65% at 50% 50%, rgba(0,0,0,0.85), transparent 80%)"
        }}
      />

      {/* Drifting particles — deterministic seeds, GPU-friendly transforms. */}
      <motion.div
        className="absolute inset-0"
        style={{ x: dustX, y: dustY }}
      >
        {PARTICLE_SEEDS.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              width: p.size,
              height: p.size,
              background: TONE_BACKGROUND[p.tone],
              filter: "blur(0.5px)",
              willChange: "transform, opacity"
            }}
            initial={false}
            animate={{
              x: [-p.driftX / 2, p.driftX / 2, -p.driftX / 2],
              y: [-p.driftY / 2, p.driftY / 2, -p.driftY / 2],
              opacity: [p.opacityLow, p.opacityHigh, p.opacityLow]
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "loop"
            }}
          />
        ))}
      </motion.div>

      {/* Top + bottom vignette to deepen the map without recoloring the art. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,3,8,0.40) 0%, transparent 18%, transparent 80%, rgba(3,3,8,0.45) 100%)"
        }}
      />
    </div>
  );
}
