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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        "pointer-events-none absolute bottom-[4%] left-1/2 z-[35] w-[min(92%,20rem)] -translate-x-1/2 sm:bottom-[5%]",
        "max-sm:right-3 max-sm:bottom-3 max-sm:left-auto max-sm:w-[min(88vw,18rem)] max-sm:translate-x-0",
        className
      ].join(" ")}
    >
      <div className="pointer-events-auto rounded-2xl border border-[rgba(245,197,71,0.35)] bg-[rgba(8,7,14,0.92)] px-3.5 py-2.5 text-left shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_24px_rgba(139,92,246,0.18)] backdrop-blur-md sm:text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(245,197,71,0.9)]">
          {pendingConviction ? "Bridge charging" : "Next island unlocked"}
        </p>
        <p className="mt-0.5 font-[var(--font-grotesk)] text-[14px] font-semibold leading-snug text-ink-0 sm:text-[15px]">
          {pendingConviction
            ? `Chart conviction on ${pillarById(pillarId).title} to power the trail`
            : `${nextMeta.title} is ready`}
        </p>
        {!reduceMotion ? (
          <div
            aria-hidden
            className="pointer-events-none relative mx-auto mt-1.5 hidden h-4 max-w-[140px] items-center justify-center gap-2 sm:flex"
          >
            <motion.span
              className="h-1 w-8 rounded-full bg-violet-400/70"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-amber-300"
              style={{ boxShadow: "0 0 10px rgba(245,197,71,0.75)" }}
              animate={{ scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="h-1 w-8 rounded-full bg-emerald-400/70"
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
            className="mt-1.5 inline-block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neon-300 underline-offset-4 hover:underline sm:mt-2 sm:text-[11px]"
          >
            Enter {nextMeta.title} →
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}
