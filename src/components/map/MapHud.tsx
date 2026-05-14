"use client";

/**
 * MapHud — top floating progression strip on the quest map. Reads its
 * counters from props (the parent scene computes them from engine state).
 */

import { motion } from "framer-motion";

export type MapHudProps = {
  unlockedCount: number;
  totalPillars: number;
  completedCount: number;
  totalRead: number;
  totalQuests: number;
  /** When false, the HUD fades in; lets us hide it during SSR. */
  ready: boolean;
};

export function MapHud({
  unlockedCount,
  totalPillars,
  completedCount,
  totalRead,
  totalQuests,
  ready
}: MapHudProps) {
  return (
    <motion.div
      aria-hidden={!ready}
      initial={false}
      animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : -6 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      // Narrower than before (was w-[min(94%,46rem)]) so the HUD pill stops
      // reaching the top island label chips on smaller viewports. 32rem max
      // = 512px, keeps the pill comfortably inside the central column.
      className="pointer-events-none absolute left-1/2 top-2 z-[100000] w-[min(78%,32rem)] -translate-x-1/2 sm:top-3"
    >
      <div className="rounded-full border border-[rgba(139,92,246,0.28)] bg-[rgba(7,7,18,0.62)] px-3 py-1.5 text-center text-[10.5px] text-ink-2 shadow-glow backdrop-blur-xl">
        <span className="text-ink-2">Tap an island to enter:</span>{" "}
        <span className="font-semibold text-neon-300/90">Business</span>
        {" · "}
        <span className="font-semibold text-neon-300/90">Forces</span>
        {" · "}
        <span className="font-semibold text-neon-300/90">Financials</span>
        {" · "}
        <span className="font-semibold text-neon-300/90">Management</span>
        <span className="mx-3 hidden text-ink-2/40 sm:inline">|</span>
        <span className="hidden sm:inline">
          <Stat value={unlockedCount} of={totalPillars} suffix="unlocked" tone="violet" />
          {completedCount > 0 ? (
            <>
              {" · "}
              <Stat value={completedCount} suffix="complete" tone="gold" />
            </>
          ) : null}
          {" · "}
          <Stat value={totalRead} of={totalQuests} suffix="cards read" tone="violet" />
        </span>
      </div>
    </motion.div>
  );
}

function Stat({
  value,
  of,
  suffix,
  tone
}: {
  value: number;
  of?: number;
  suffix: string;
  tone: "violet" | "gold";
}) {
  const color =
    tone === "gold" ? "rgba(255,229,141,1)" : "rgba(216,180,254,0.95)";
  return (
    <>
      <span style={{ color, fontWeight: 600 }}>{value}</span>
      {typeof of === "number" ? <span className="text-ink-2/85"> of {of}</span> : null}{" "}
      <span className="text-ink-2/85">{suffix}</span>
    </>
  );
}
