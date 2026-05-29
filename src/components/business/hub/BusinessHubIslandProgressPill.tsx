"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  pct: number;
  compact?: boolean;
};

/** Compact island progress for mobile/tablet hub pickers. */
export function BusinessHubIslandProgressPill({ pct, compact = false }: Props) {
  const value = Math.max(0, Math.min(100, Math.round(pct)));
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={[
        "flex items-center gap-2.5 rounded-full border border-[rgba(245,197,71,0.32)]",
        "bg-[rgba(8,7,4,0.9)] shadow-[0_4px_20px_rgba(0,0,0,0.45)] backdrop-blur-md",
        compact ? "px-3 py-1.5" : "px-3.5 py-2"
      ].join(" ")}
      role="status"
      aria-label={`Island progress ${value} percent`}
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[rgba(255,229,141,0.55)]">
        Island
      </span>
      <span className="font-[var(--font-grotesk)] text-sm font-bold tabular-nums text-[rgba(255,229,141,0.96)]">
        {value}%
      </span>
      <span
        className="h-1.5 w-16 overflow-hidden rounded-full bg-black/50 sm:w-20"
        aria-hidden
      >
        <span
          className="block h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-300 to-amber-100"
          style={{ width: `${value}%` }}
        />
      </span>
    </motion.div>
  );
}
