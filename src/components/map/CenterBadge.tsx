"use client";

/**
 * CenterBadge — the "core power source" of the quest map.
 *
 * Composition (back → front):
 *
 *   beam stack (behind everything):
 *     • far corona (560px) — wide atmospheric breathing halo
 *     • outer beam cone (gold→violet) + mid beam shaft + bright core
 *     • streaming particles up the beam
 *
 *   ring stack (back atmosphere around badge):
 *     • cosmic boundary ring (slow-rotating dashed)
 *     • 3 expanding pulse rings (energy emanating outward)
 *     • outer halo
 *     • drifting dust motes
 *
 *   orbital stack (mid):
 *     • 3 orbital satellites at different radii + angular speeds —
 *       sells "core power source" + fills the middle of the map
 *
 *   emblem stack (foreground):
 *     • rotating outer dashed ring (strength scales with progress)
 *     • counter-rotating tighter rings
 *     • emblem core 180×180 with "10K" wordmark (56px) + subtitle
 *     • sparkle dots around perimeter
 *     • multi-layer pedestal platform beneath
 *
 * Decorative-only — `pointer-events: none`.
 */

import { motion } from "framer-motion";

export type CenterBadgeProps = {
  /** 0..100 — overall island progression across all pillars. */
  overallProgressPct?: number;
  /** Normalised 0..1 position inside the scene container. */
  position?: { x: number; y: number };
  /** Visual size multiplier (1 = original). Used to shrink the hub so
   *  the islands dominate the scene. */
  sizeScale?: number;
};

export function CenterBadge({
  overallProgressPct = 0,
  position = { x: 0.5, y: 0.5 },
  sizeScale = 1
}: CenterBadgeProps) {
  const litStrength = Math.max(0, Math.min(1, overallProgressPct / 100));

  return (
    <div
      className="pointer-events-none absolute z-[18]"
      style={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        transform: `translate(-50%, -50%) scale(${sizeScale})`,
        transformOrigin: "center center"
      }}
      aria-hidden
    >
      {/* === Beam stack (background) ======================================= */}
      {/* (z-0) Outer beam — wide gold-to-violet cone going upward. */}
      <motion.div
        className="absolute left-1/2 bottom-[50%] h-[380px] w-[160px] -translate-x-1/2 origin-bottom"
        style={{
          background:
            "linear-gradient(to top, rgba(255,229,141,0.6) 0%, rgba(245,197,71,0.45) 14%, rgba(168,85,247,0.25) 55%, transparent 100%)",
          filter: "blur(18px)",
          mixBlendMode: "screen",
          clipPath: "polygon(35% 100%, 65% 100%, 100% 0%, 0% 0%)"
        }}
        initial={false}
        animate={{ opacity: [0.55, 0.95, 0.55], scaleY: [0.95, 1.05, 0.95] }}
        transition={{
          duration: 4.4,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* (z-0.5) Mid beam — narrower brighter shaft. */}
      <motion.div
        className="absolute left-1/2 bottom-[50%] h-[330px] w-[48px] -translate-x-1/2 origin-bottom"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.75) 0%, rgba(255,229,141,0.6) 35%, transparent 100%)",
          filter: "blur(7px)",
          mixBlendMode: "screen",
          clipPath: "polygon(38% 100%, 62% 100%, 100% 0%, 0% 0%)"
        }}
        initial={false}
        animate={{ opacity: [0.6, 0.95, 0.6], scaleY: [0.95, 1.08, 0.95] }}
        transition={{
          duration: 3.6,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* (z-1) Beam core — narrowest brightest streak. */}
      <motion.div
        className="absolute left-1/2 bottom-[50%] h-[280px] w-[12px] -translate-x-1/2 origin-bottom rounded-full"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,229,141,0.9) 35%, transparent 100%)",
          filter: "blur(3px)",
          mixBlendMode: "screen"
        }}
        initial={false}
        animate={{ opacity: [0.6, 1, 0.6], scaleY: [0.95, 1.08, 0.95] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* (z-1.5) Beam particles — small motes streaming up the beam. */}
      {BEAM_PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `calc(50% + ${p.xOffset}px)`,
            bottom: "50%",
            width: p.size,
            height: p.size,
            background: "rgba(255,229,141,1)",
            boxShadow: "0 0 10px rgba(245,197,71,1)",
            mixBlendMode: "screen"
          }}
          initial={false}
          animate={{
            y: [0, -210, -290],
            opacity: [0, 0.95, 0],
            scale: [0.5, 1, 0.3]
          }}
          transition={{
            duration: p.duration,
            delay: (i * 0.35) % p.duration,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}

      {/* === Atmospheric corona ============================================ */}
      {/* (z-1.8) Far corona — very wide soft halo. */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.22) 0%, rgba(245,197,71,0.14) 40%, transparent 78%)",
          filter: "blur(48px)"
        }}
        initial={false}
        animate={{ scale: [1, 1.06, 1], opacity: [0.55, 0.95, 0.55] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* (z-2) Outer halo — strong gold/violet bloom. */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(245,197,71,0.42) 0%, rgba(168,85,247,0.26) 35%, transparent 65%)",
          filter: "blur(36px)"
        }}
        initial={false}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* (z-2.1) Expanding pulse rings — 3 staggered energy pulses. */}
      {PULSE_RINGS.map((r, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            width: r.size,
            height: r.size,
            borderColor: r.color,
            borderWidth: r.thickness,
            boxShadow: `0 0 18px ${r.color}, inset 0 0 12px ${r.color}`
          }}
          initial={false}
          animate={{ scale: [0.85, 1.85], opacity: [0.9, 0] }}
          transition={{
            duration: r.duration,
            delay: i * (r.duration / 3),
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}

      {/* (z-2.2) Cosmic boundary ring — slow rotating dashed. */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2"
        initial={false}
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="rgba(168,85,247,0.38)"
          strokeWidth="0.4"
          strokeDasharray="0.5 4"
        />
      </motion.svg>

      {/* (z-2.4) Drifting dust motes — atmospheric. */}
      {DUST_MOTES.map((d, i) => (
        <motion.span
          key={i}
          className="absolute h-[2.5px] w-[2.5px] rounded-full"
          style={{
            left: `calc(50% + ${d.x}px)`,
            top: `calc(50% + ${d.y}px)`,
            background: "rgba(255,229,141,0.95)",
            boxShadow: "0 0 10px rgba(245,197,71,0.95)"
          }}
          initial={false}
          animate={{
            x: [0, d.driftX, 0],
            y: [0, d.driftY, 0],
            opacity: [0, 0.9, 0]
          }}
          transition={{
            duration: d.duration,
            delay: (i * 0.7) % d.duration,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror"
          }}
        />
      ))}

      {/* === Orbital satellites ============================================ */}
      {ORBITS.map((o, i) => (
        <OrbitalSatellite
          key={i}
          radius={o.radius}
          duration={o.duration}
          reverse={o.reverse}
          color={o.color}
          glowColor={o.glowColor}
          size={o.size}
          trail={o.trail}
        />
      ))}

      {/* === Badge stack (foreground) ===================================== */}
      <div className="relative h-[260px] w-[260px]">
        {/* (a) Rotating outer dashed ring — strength scales with overall progress. */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          initial={false}
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={`rgba(245,197,71,${0.4 + litStrength * 0.5})`}
            strokeWidth="1.4"
            strokeDasharray="3 9"
            strokeLinecap="round"
          />
          {/* Cardinal direction tick marks. */}
          {[0, 90, 180, 270].map((deg) => (
            <line
              key={deg}
              x1="50"
              y1="2"
              x2="50"
              y2="6"
              stroke={`rgba(255,229,141,${0.4 + litStrength * 0.5})`}
              strokeWidth="1.2"
              strokeLinecap="round"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
        </motion.svg>

        {/* (b) Counter-rotating tighter rings. */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          initial={false}
          animate={{ rotate: -360 }}
          transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgba(216,180,254,0.75)"
            strokeWidth="0.9"
            strokeDasharray="1.5 6"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="34"
            fill="none"
            stroke="rgba(255,229,141,0.38)"
            strokeWidth="0.5"
            strokeDasharray="0.6 5"
            strokeLinecap="round"
          />
        </motion.svg>

        {/* (c) Emblem core. */}
        <motion.div
          className="absolute left-1/2 top-1/2 flex h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
          style={{
            borderColor: "rgba(245,197,71,0.7)",
            background:
              "radial-gradient(circle at 50% 35%, rgba(245,197,71,0.46) 0%, rgba(139,92,246,0.24) 45%, rgba(7,7,18,0.94) 85%)",
            boxShadow:
              "0 0 50px rgba(245,197,71,0.55), inset 0 0 32px rgba(168,85,247,0.32), inset 0 0 0 1px rgba(255,255,255,0.16)"
          }}
          initial={false}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror"
          }}
        >
          {/* Inner ring detail — extra premium layering. */}
          <span
            className="absolute inset-3 rounded-full"
            style={{
              border: "1px solid rgba(255,229,141,0.25)",
              boxShadow: "inset 0 0 18px rgba(168,85,247,0.18)"
            }}
          />
          <div className="text-center">
            <div
              className="font-[var(--font-grotesk)] text-[56px] font-bold leading-none tracking-[0.04em]"
              style={{
                color: "rgba(255,229,141,1)",
                textShadow:
                  "0 0 22px rgba(245,197,71,0.95), 0 0 8px rgba(255,255,255,0.7)"
              }}
            >
              10K
            </div>
            <div
              className="mt-2 text-[10px] font-semibold uppercase tracking-[0.36em]"
              style={{ color: "rgba(216,180,254,0.85)" }}
            >
              SEC Filing
            </div>
            {/* Tiny status bar under subtitle. */}
            <div className="mx-auto mt-2 h-[3px] w-[60%] overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
              <div
                className="h-full"
                style={{
                  width: `${Math.max(4, overallProgressPct)}%`,
                  background:
                    "linear-gradient(90deg, rgba(168,85,247,0.95) 0%, rgba(245,197,71,1) 100%)",
                  boxShadow: "0 0 10px rgba(245,197,71,0.85)"
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* (d) Sparkle dots around the emblem core. */}
        {SPARKLE_DOTS.map((s, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              background: "rgba(255,229,141,0.95)",
              boxShadow: "0 0 14px rgba(245,197,71,0.95)"
            }}
            initial={false}
            animate={{ opacity: [0.2, 1.0, 0.2], scale: [0.6, 1.3, 0.6] }}
            transition={{
              duration: 2.6 + (i % 3) * 0.4,
              delay: (i * 0.25) % 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
          />
        ))}
      </div>

      {/* === Platform stack (beneath) ===================================== */}
      {/* (z-3) Pedestal halo — wide gold base wash on water. */}
      <div
        className="absolute left-1/2 top-[calc(50%+100px)] h-[52px] w-[340px] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 35%, rgba(255,229,141,0.75) 0%, rgba(245,197,71,0.5) 40%, rgba(168,85,247,0.22) 75%, transparent 100%)",
          filter: "blur(14px)",
          mixBlendMode: "screen"
        }}
      />

      {/* (z-3b) Pedestal body — semi-solid dais disc. */}
      <div
        className="absolute left-1/2 top-[calc(50%+114px)] h-[26px] w-[240px] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 30%, rgba(255,229,141,0.96) 0%, rgba(245,197,71,0.8) 45%, rgba(120,70,30,0.5) 85%, transparent 100%)",
          boxShadow:
            "0 8px 30px rgba(245,197,71,0.5), inset 0 -4px 8px rgba(0,0,0,0.45), inset 0 1.5px 3px rgba(255,255,255,0.75)"
        }}
      />

      {/* (z-3c) Pedestal rim catchlight. */}
      <div
        className="absolute left-1/2 top-[calc(50%+117px)] h-[4px] w-[160px] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(255,250,220,1) 50%, transparent 100%)",
          opacity: 0.95
        }}
      />

      {/* (z-3d) Water reflection — pedestal mirrored downward. */}
      <div
        className="absolute left-1/2 top-[calc(50%+128px)] h-[16px] w-[200px] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 50%, rgba(245,197,71,0.55) 0%, rgba(168,85,247,0.18) 50%, transparent 100%)",
          filter: "blur(6px)",
          mixBlendMode: "screen",
          opacity: 0.55
        }}
      />
    </div>
  );
}

/**
 * Orbital satellite — a small glowing orb that orbits the centre at a given
 * radius and angular speed. Uses a rotating wrapper whose CSS centre is the
 * orbit centre, with the orb pinned to the top of the wrapper.
 */
function OrbitalSatellite({
  radius,
  duration,
  reverse,
  color,
  glowColor,
  size,
  trail
}: {
  radius: number;
  duration: number;
  reverse: boolean;
  color: string;
  glowColor: string;
  size: number;
  trail: number;
}) {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <motion.div
        className="relative"
        style={{ width: radius * 2, height: radius * 2 }}
        initial={false}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {/* Orb. */}
        <span
          className="absolute rounded-full"
          style={{
            top: -size / 2,
            left: "50%",
            marginLeft: -size / 2,
            width: size,
            height: size,
            background: color,
            boxShadow: `0 0 ${glowSize(size)}px ${glowColor}, 0 0 ${glowSize(
              size
            ) * 2}px ${glowColor}`
          }}
        />
        {/* Short comet trail behind the orb. */}
        <span
          className="absolute rounded-full"
          style={{
            top: -trail / 2,
            left: "50%",
            marginLeft: -size / 2,
            width: size,
            height: trail,
            background: `linear-gradient(to bottom, ${color} 0%, transparent 100%)`,
            opacity: 0.55,
            filter: "blur(1.5px)"
          }}
        />
      </motion.div>
    </div>
  );
}

function glowSize(orbSize: number): number {
  return Math.max(6, orbSize * 1.8);
}

// 3 expanding pulse rings emanating from the centre.
const PULSE_RINGS = [
  {
    size: 280,
    thickness: 2,
    color: "rgba(245,197,71,0.55)",
    duration: 4.2
  },
  {
    size: 280,
    thickness: 1.5,
    color: "rgba(168,85,247,0.55)",
    duration: 5.4
  },
  {
    size: 280,
    thickness: 1.2,
    color: "rgba(216,180,254,0.45)",
    duration: 6.4
  }
] as const;

// 3 orbital satellites at different radii + speeds (deterministic).
const ORBITS = [
  {
    radius: 130,
    duration: 14,
    reverse: false,
    color: "rgba(255,229,141,1)",
    glowColor: "rgba(245,197,71,0.95)",
    size: 8,
    trail: 28
  },
  {
    radius: 160,
    duration: 22,
    reverse: true,
    color: "rgba(216,180,254,1)",
    glowColor: "rgba(168,85,247,0.95)",
    size: 6,
    trail: 22
  },
  {
    radius: 190,
    duration: 30,
    reverse: false,
    color: "rgba(255,250,220,1)",
    glowColor: "rgba(255,229,141,0.95)",
    size: 5,
    trail: 16
  }
] as const;

// Deterministic dust positions — drift around the badge atmosphere.
const DUST_MOTES = [
  { x: -180, y: -50, driftX: 14, driftY: -8, duration: 7 },
  { x: 160, y: -70, driftX: -12, driftY: 6, duration: 8 },
  { x: 140, y: 100, driftX: -16, driftY: -10, duration: 6.5 },
  { x: -130, y: 110, driftX: 16, driftY: -6, duration: 7.5 },
  { x: -200, y: 40, driftX: 20, driftY: 10, duration: 9 },
  { x: 190, y: 40, driftX: -18, driftY: -8, duration: 8.5 },
  { x: 0, y: -150, driftX: 10, driftY: 12, duration: 7.8 },
  { x: 0, y: 160, driftX: -10, driftY: -14, duration: 6.2 }
] as const;

const BEAM_PARTICLES = [
  { xOffset: -12, size: 2.4, duration: 3.8 },
  { xOffset: 4, size: 1.8, duration: 4.2 },
  { xOffset: 14, size: 2.2, duration: 3.4 },
  { xOffset: -4, size: 2.0, duration: 4.0 },
  { xOffset: -18, size: 1.6, duration: 4.4 },
  { xOffset: 10, size: 1.8, duration: 3.6 }
] as const;

const SPARKLE_DOTS = [
  { x: 18, y: 22 },
  { x: 82, y: 22 },
  { x: 50, y: 6 },
  { x: 18, y: 78 },
  { x: 82, y: 78 },
  { x: 50, y: 94 },
  { x: 8, y: 50 },
  { x: 92, y: 50 }
] as const;
