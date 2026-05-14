"use client";

/**
 * MapAtmosphere — global atmospheric washes that bind the four quadrants
 * into a single cinematic world.
 *
 * Renders four large soft-radial gradients in each map quadrant, tinted
 * with the pillar's themed accent. Each quadrant glow gently breathes so
 * the world feels alive even between explicit FX. Heavily blurred + low
 * opacity so islands remain the hero — these are just *atmosphere*.
 *
 * Also renders mid-world fog bands and a thin "lighting spill" gradient
 * sweeping diagonally across the scene.
 *
 * Decorative-only (`pointer-events: none`).
 */

import { motion } from "framer-motion";

export function MapAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[3] overflow-hidden rounded-3xl"
    >
      {/* (a) Quadrant ambient washes — themed glow in each corner. */}
      {QUADRANT_GLOWS.map((q, i) => (
        <motion.div
          key={i}
          className="absolute h-[60%] w-[55%] rounded-full"
          style={{
            left: q.left,
            top: q.top,
            transform: q.transform,
            background: `radial-gradient(60% 60% at 50% 50%, ${q.color} 0%, transparent 70%)`,
            filter: "blur(50px)",
            mixBlendMode: "screen"
          }}
          initial={false}
          animate={{ opacity: [0.45, 0.78, 0.45], scale: [0.95, 1.05, 0.95] }}
          transition={{
            duration: q.duration,
            delay: i * 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror"
          }}
        />
      ))}

      {/* (b) Diagonal lighting spill — soft sweeping highlight. */}
      <motion.div
        className="absolute -inset-[20%]"
        style={{
          background:
            "linear-gradient(135deg, transparent 35%, rgba(216,180,254,0.10) 50%, transparent 65%)",
          mixBlendMode: "screen"
        }}
        initial={false}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* (c) Connecting fog band — runs across the middle of the world. */}
      <motion.div
        className="absolute inset-x-0 top-[40%] h-[30%]"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 50%, rgba(168,85,247,0.14) 0%, rgba(245,197,71,0.08) 35%, transparent 78%)",
          filter: "blur(28px)",
          mixBlendMode: "screen"
        }}
        initial={false}
        animate={{ opacity: [0.6, 0.95, 0.6] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* (d) Vertical world spine — soft column of light through the centre. */}
      <motion.div
        className="absolute left-1/2 top-0 h-full w-[14%] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(245,197,71,0.12) 35%, rgba(168,85,247,0.10) 65%, transparent 100%)",
          filter: "blur(28px)",
          mixBlendMode: "screen"
        }}
        initial={false}
        animate={{ opacity: [0.55, 0.85, 0.55] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />
    </div>
  );
}

// Themed quadrant glows positioned over each pillar's area of the map.
const QUADRANT_GLOWS: ReadonlyArray<{
  left: string;
  top: string;
  transform: string;
  color: string;
  duration: number;
}> = [
  // Business top-left (warm violet/gold).
  {
    left: "0%",
    top: "0%",
    transform: "translate(-15%, -15%)",
    color: "rgba(168,85,247,0.38)",
    duration: 10
  },
  // Forces top-right (stormy red/orange).
  {
    left: "100%",
    top: "0%",
    transform: "translate(-85%, -15%)",
    color: "rgba(244,114,182,0.34)",
    duration: 11
  },
  // Financials bottom-left (vault green).
  {
    left: "0%",
    top: "100%",
    transform: "translate(-15%, -85%)",
    color: "rgba(52,211,153,0.34)",
    duration: 12
  },
  // Management bottom-right (executive blue).
  {
    left: "100%",
    top: "100%",
    transform: "translate(-85%, -85%)",
    color: "rgba(125,211,252,0.34)",
    duration: 9
  }
];
