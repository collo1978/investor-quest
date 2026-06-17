"use client";

import { motion } from "framer-motion";

const BOTTOM_FOG_PARTICLES = [
  { x: "18%", delay: 0, dur: 9 },
  { x: "42%", delay: 0.8, dur: 11 },
  { x: "68%", delay: 1.4, dur: 10 },
  { x: "82%", delay: 0.3, dur: 12 }
] as const;

/**
 * Bottom-only ambient FX (bank mobile map) — does not cover map edges.
 */
export function QuestMapMobileAtmosphere() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[38%] overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(8,12,32,0.28) 40%, rgba(4,8,24,0.55) 100%)"
        }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[70%] opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 100%, rgba(59,130,246,0.18) 0%, transparent 70%)"
        }}
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      {BOTTOM_FOG_PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute bottom-[12%] rounded-full bg-violet-200/70"
          style={{
            left: p.x,
            width: 2,
            height: 2,
            boxShadow: "0 0 5px rgba(216,180,254,0.6)"
          }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.15, 0.55, 0.15]
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay
          }}
        />
      ))}
    </div>
  );
}
