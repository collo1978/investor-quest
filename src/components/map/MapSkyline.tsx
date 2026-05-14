"use client";

/**
 * MapSkyline — far-distance city silhouette behind everything.
 *
 * Provides "world depth" by suggesting a distant horizon beyond the four
 * islands. Heavily blurred + low opacity so it never competes with the
 * foreground composition — pure atmospheric perspective.
 *
 * Renders on top of `OceanBackdrop` (z-0) and beneath `MapAmbientLayer`
 * (z-5). Fully `pointer-events: none`.
 */

import { motion } from "framer-motion";

export function MapSkyline() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[58%] overflow-hidden"
    >
      {/* Far skyline band — heavy blur, very low opacity. */}
      <svg
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-[18%] h-[36%] w-full"
        style={{ filter: "blur(6px)", opacity: 0.42 }}
      >
        <defs>
          <linearGradient id="skylineFar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(76,29,149,0.55)" />
            <stop offset="100%" stopColor="rgba(2,2,12,0)" />
          </linearGradient>
        </defs>
        <path
          d="M0 60 L0 48 L4 48 L4 42 L8 42 L8 46 L12 46 L12 38 L16 38 L16 44 L20 44 L20 40 L24 40 L24 36 L28 36 L28 44 L32 44 L32 34 L36 34 L36 40 L40 40 L40 46 L44 46 L44 32 L48 32 L48 38 L52 38 L52 28 L56 28 L56 34 L60 34 L60 30 L64 30 L64 36 L70 36 L70 26 L74 26 L74 32 L78 32 L78 24 L82 24 L82 30 L88 30 L88 22 L92 22 L92 30 L96 30 L96 26 L100 26 L100 32 L104 32 L104 22 L108 22 L108 28 L112 28 L112 24 L116 24 L116 32 L120 32 L120 28 L124 28 L124 34 L128 34 L128 28 L132 28 L132 36 L136 36 L136 30 L140 30 L140 36 L144 36 L144 32 L148 32 L148 38 L152 38 L152 34 L156 34 L156 40 L160 40 L160 36 L164 36 L164 42 L168 42 L168 38 L172 38 L172 44 L176 44 L176 40 L180 40 L180 46 L184 46 L184 42 L188 42 L188 48 L194 48 L194 44 L200 44 L200 60 Z"
          fill="url(#skylineFar)"
        />
      </svg>

      {/* Far skyline window pin-pricks — tiny dots of warm light. */}
      <div
        className="absolute inset-x-0 top-[20%] h-[34%]"
        style={{ opacity: 0.45, filter: "blur(0.6px)" }}
      >
        {SKYLINE_WINDOWS.map((w, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${w.x}%`,
              top: `${w.y}%`,
              width: w.size,
              height: w.size,
              background: w.color,
              boxShadow: `0 0 4px ${w.color}`
            }}
            initial={false}
            animate={{ opacity: [w.opacity * 0.7, w.opacity, w.opacity * 0.7] }}
            transition={{
              duration: 3 + (i % 4) * 0.5,
              delay: (i * 0.13) % 3,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
          />
        ))}
      </div>

      {/* Horizon fog band — softens transition between sky + skyline. */}
      <div
        className="absolute inset-x-0 top-[28%] h-[24%]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(168,85,247,0.18) 35%, rgba(168,85,247,0.12) 65%, transparent 100%)",
          filter: "blur(8px)",
          mixBlendMode: "screen"
        }}
      />

      {/* Surface fog — wraps the bottom of the scene. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 110%, rgba(2,2,12,0.65) 0%, rgba(2,2,12,0.25) 50%, transparent 100%)"
        }}
      />
    </div>
  );
}

const SKYLINE_WINDOWS: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}> = [
  { x: 6, y: 60, size: 1.1, color: "rgba(255,229,141,0.95)", opacity: 0.85 },
  { x: 12, y: 50, size: 0.8, color: "rgba(216,180,254,0.9)", opacity: 0.7 },
  { x: 18, y: 64, size: 1.0, color: "rgba(255,229,141,0.85)", opacity: 0.75 },
  { x: 25, y: 46, size: 0.9, color: "rgba(255,229,141,0.95)", opacity: 0.8 },
  { x: 31, y: 56, size: 1.2, color: "rgba(216,180,254,0.95)", opacity: 0.85 },
  { x: 38, y: 40, size: 0.9, color: "rgba(255,229,141,0.85)", opacity: 0.75 },
  { x: 44, y: 50, size: 1.1, color: "rgba(255,229,141,0.9)", opacity: 0.8 },
  { x: 56, y: 36, size: 1.0, color: "rgba(216,180,254,0.9)", opacity: 0.8 },
  { x: 62, y: 48, size: 1.2, color: "rgba(255,229,141,0.95)", opacity: 0.9 },
  { x: 68, y: 38, size: 0.9, color: "rgba(216,180,254,0.85)", opacity: 0.7 },
  { x: 74, y: 56, size: 1.0, color: "rgba(255,229,141,0.9)", opacity: 0.8 },
  { x: 80, y: 44, size: 0.8, color: "rgba(255,229,141,0.85)", opacity: 0.75 },
  { x: 86, y: 60, size: 1.1, color: "rgba(216,180,254,0.95)", opacity: 0.85 },
  { x: 92, y: 50, size: 0.9, color: "rgba(255,229,141,0.9)", opacity: 0.78 }
];
