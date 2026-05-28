"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import {
  INVESTOR_RUNGS,
  investorLadderProgress,
  type InvestorRung,
  type InvestorTierId
} from "@/data/progression/investorLadder";
import { formatAnalyticsNumber } from "@/lib/analytics/formatDisplay";

const GOLD = "#F5C547";
const GOLD_DIM = "rgba(245, 197, 71, 0.35)";
const VIOLET = "#C4B5FD";

type RungVisual = "locked" | "current" | "completed";

function rungVisual(xp: number, r: InvestorRung, peak: InvestorRung): RungVisual {
  if (r.xp === peak.xp) return "current";
  if (xp >= r.xp) return "completed";
  return "locked";
}

function TierMilestone({
  tier,
  isFirst
}: {
  tier: InvestorTierId;
  isFirst?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 pl-[3.25rem] pr-1",
        isFirst ? "pb-2 pt-0" : "py-3"
      ].join(" ")}
    >
      <div
        className="flex h-7 w-7 shrink-0 rotate-45 rounded-md border"
        style={{
          borderColor: "rgba(245,197,71,0.55)",
          background:
            "linear-gradient(135deg, rgba(245,197,71,0.2), rgba(139,92,246,0.12))",
          boxShadow: "0 0 18px rgba(168,85,247,0.35)"
        }}
        aria-hidden
      />
      <span
        className="text-[11px] font-bold uppercase tracking-[0.26em]"
        style={{ color: GOLD, textShadow: `0 0 20px ${GOLD_DIM}` }}
      >
        {tier}
      </span>
      <div
        className="h-px min-w-[2rem] flex-1 bg-gradient-to-r from-violet-500/45 to-transparent"
        aria-hidden
      />
    </div>
  );
}

export function InvestorLadder({ xp }: { xp: number }) {
  const ordered = useMemo(
    () => [...INVESTOR_RUNGS].sort((a, b) => b.xp - a.xp),
    []
  );
  const prog = investorLadderProgress(xp);
  const peak = INVESTOR_RUNGS[prog.rank - 1] ?? INVESTOR_RUNGS[0];

  return (
    <div className="relative pl-1">
      <div
        aria-hidden
        className="pointer-events-none absolute left-[22px] top-10 bottom-10 w-[3px] rounded-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(245,197,71,0.65) 0%, rgba(168,85,247,0.5) 42%, rgba(91,33,182,0.22) 100%)",
          boxShadow:
            "0 0 28px rgba(168,85,247,0.45), 0 0 14px rgba(245,197,71,0.25)"
        }}
      />
      <div className="relative z-[1] flex flex-col gap-2" role="list">
        {ordered.map((r, i) => {
          const prev = ordered[i - 1];
          const showTier = !prev || prev.tier !== r.tier;
          const vis = rungVisual(xp, r, peak);
          const isLocked = vis === "locked";
          const isCurrent = vis === "current";
          const isDone = vis === "completed";

          const row = (
            <motion.div
              key={`${r.tier}-${r.xp}-${r.title}`}
              role="listitem"
              className={[
                "relative flex items-center gap-4 rounded-2xl border px-3 py-3 pl-2 transition-shadow duration-300",
                isLocked
                  ? "border-white/10 bg-black/20 opacity-[0.42] saturate-[0.55]"
                  : "border-white/10 bg-black/30",
                isDone ? "shadow-[0_0_20px_rgba(52,211,153,0.12)]" : "",
                isCurrent
                  ? "border-amber-300/40 shadow-[0_0_28px_rgba(245,197,71,0.22)]"
                  : ""
              ].join(" ")}
              style={
                isCurrent
                  ? {
                      background:
                        "linear-gradient(125deg, rgba(245,197,71,0.12), rgba(139,92,246,0.08), rgba(7,7,18,0.92))"
                    }
                  : isDone
                    ? {
                        background:
                          "linear-gradient(125deg, rgba(52,211,153,0.08), rgba(7,7,18,0.88))"
                      }
                    : undefined
              }
              whileHover={
                isLocked
                  ? undefined
                  : { y: -2, transition: { type: "spring", stiffness: 420, damping: 26 } }
              }
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="flex w-11 shrink-0 flex-col items-center justify-center pt-0.5">
                <div className="relative flex h-4 w-4 items-center justify-center">
                  <div
                    className="relative z-[1] h-3.5 w-3.5 rounded-full border-2"
                    style={{
                      borderColor: isLocked
                        ? "rgba(255,255,255,0.12)"
                        : isCurrent
                          ? GOLD
                          : "rgba(52,211,153,0.75)",
                      background: isLocked
                        ? "rgba(0,0,0,0.5)"
                        : isCurrent
                          ? "rgba(245,197,71,0.35)"
                          : "rgba(52,211,153,0.25)",
                      boxShadow: isCurrent
                        ? "0 0 16px rgba(245,197,71,0.65)"
                        : isDone
                          ? "0 0 12px rgba(52,211,153,0.45)"
                          : "none"
                    }}
                    aria-hidden
                  />
                  {isCurrent ? (
                    <motion.span
                      className="pointer-events-none absolute inset-0 rounded-full"
                      style={{
                        border: `1px solid ${GOLD_DIM}`,
                        boxShadow: `0 0 22px ${GOLD_DIM}`
                      }}
                      animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.35, 1] }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      aria-hidden
                    />
                  ) : null}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={[
                    "font-[var(--font-grotesk)] text-[15px] font-semibold leading-snug",
                    isLocked ? "text-ink-2" : "text-ink-0"
                  ].join(" ")}
                >
                  {r.title}
                </p>
                <p
                  className="mt-0.5 text-[12px] tabular-nums tracking-wide text-ink-2"
                  style={!isLocked ? { color: VIOLET } : undefined}
                >
                  {formatAnalyticsNumber(r.xp)} XP threshold
                </p>
              </div>
              <div className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em]">
                {isLocked ? (
                  <span className="text-ink-2">Locked</span>
                ) : isCurrent ? (
                  <span style={{ color: GOLD }}>You are here</span>
                ) : (
                  <span className="text-emerald-300/90">Cleared</span>
                )}
              </div>
            </motion.div>
          );

          return (
            <div key={`wrap-${r.tier}-${r.xp}`} className="flex flex-col gap-2">
              {showTier ? (
                <TierMilestone tier={r.tier} isFirst={i === 0} />
              ) : null}
              {row}
            </div>
          );
        })}
      </div>
    </div>
  );
}
