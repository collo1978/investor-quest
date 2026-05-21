"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { useGame } from "@/components/GameProvider";
import { nextPillarId, pillarById, type PillarId } from "@/data/pillars";
import { isPillarComplete } from "@/engine";

type Props = {
  pillarId: PillarId;
  className?: string;
};

/**
 * Shown on an island hub when the pillar is cleared and the next island is playable.
 */
export function HubTrailBridgeBeacon({ pillarId, className = "" }: Props) {
  const { state } = useGame();
  const reduceMotion = useReducedMotion();
  const pillarState = state.pillars[pillarId];
  const nextId = nextPillarId(pillarId);

  if (!nextId || !pillarState) return null;

  const cleared = isPillarComplete(state.pillars, pillarId);
  const nextUnlocked = state.pillars[nextId]?.unlocked ?? false;
  const pendingConviction = state.pendingConvictionQueue.some(
    (q) => q.completedPillarId === pillarId
  );

  if (!cleared && !pendingConviction) return null;
  if (!nextUnlocked && !pendingConviction) return null;

  const nextMeta = pillarById(nextId);
  const href = pendingConviction ? undefined : nextMeta.route;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        "pointer-events-none absolute left-1/2 top-3 z-[30] w-[min(92%,22rem)] -translate-x-1/2",
        className
      ].join(" ")}
    >
      <div className="pointer-events-auto rounded-2xl border border-[rgba(245,197,71,0.35)] bg-[rgba(8,7,14,0.88)] px-4 py-3 text-center shadow-[0_0_40px_rgba(139,92,246,0.22)] backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[rgba(245,197,71,0.9)]">
          {pendingConviction ? "Bridge charging" : "Next island unlocked"}
        </p>
        <p className="mt-1 font-[var(--font-grotesk)] text-[15px] text-ink-0">
          {pendingConviction
            ? `Chart conviction on ${pillarById(pillarId).title} to power the trail`
            : `${nextMeta.title} is ready`}
        </p>
        {!reduceMotion ? (
          <div
            aria-hidden
            className="pointer-events-none relative mx-auto mt-2 flex h-5 max-w-[160px] items-center justify-center gap-2"
          >
            <motion.span
              className="h-1 w-10 rounded-full bg-violet-400/70"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="h-2 w-2 rounded-full bg-amber-300"
              style={{ boxShadow: "0 0 12px rgba(245,197,71,0.75)" }}
              animate={{ scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="h-1 w-10 rounded-full bg-emerald-400/70"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.15
              }}
            />
          </div>
        ) : null}
        {href ? (
          <Link
            href={href}
            className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-neon-300 underline-offset-4 hover:underline"
          >
            Enter {nextMeta.title} →
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}
