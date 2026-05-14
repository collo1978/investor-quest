"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { levelProgress } from "@/lib/gameState";
import { companyById } from "@/lib/demoData";
import { useGame } from "@/components/GameProvider";
import { useReadingProgress } from "@/components/gameHooks";

export function HudOverlay() {
  const { state } = useGame();
  const reading = useReadingProgress();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const company = companyById(state.activeCompanyId);
  const lp = levelProgress(state.xp);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-30 flex w-max max-w-[calc(100vw-32px)] flex-col items-end md:top-6 md:right-6">
      <div className="pointer-events-auto w-[260px] max-w-[calc(100vw-32px)] rounded-3xl border border-panel-border bg-[rgba(7,7,18,0.52)] p-3 shadow-glow backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] text-ink-2">HUD</div>
              <div className="mt-1 font-[var(--font-grotesk)] text-sm text-ink-0">
                {company.ticker} · Level {lp.level}
              </div>
              <div className="mt-1 text-[11px] leading-snug text-ink-2">
                <span
                  className="font-semibold"
                  style={{ color: "#F5C547", textShadow: "0 0 12px rgba(245,197,71,0.35)" }}
                >
                  Quiz {state.streaks?.quiz.streak ?? 0}d
                </span>
                <span className="text-ink-2"> · </span>
                <span className="text-ink-2/90">
                  Consistency {state.streaks?.research.streak ?? 0}d
                </span>
                {" · "}XP{" "}
                <span className="font-semibold text-ink-0">{state.xp}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-2.5 py-2 text-right">
              <div className="text-[11px] text-ink-2">Next</div>
              <div className="mt-1 text-[11px] font-semibold text-ink-0">
                {lp.needed - lp.inLevel} XP
              </div>
            </div>
          </div>

          <div className="mt-2">
            <div className="relative h-2.5 overflow-hidden rounded-full border border-panel-border bg-[rgba(255,255,255,0.03)]">
              {mounted ? (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  initial={false}
                  animate={{ width: `${lp.pct}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(59,130,246,0.18), rgba(139,92,246,0.72), rgba(168,85,247,0.65))",
                    boxShadow: "0 0 22px rgba(139,92,246,0.25)"
                  }}
                />
              ) : (
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${lp.pct}%`,
                    background:
                      "linear-gradient(90deg, rgba(59,130,246,0.18), rgba(139,92,246,0.72), rgba(168,85,247,0.65))",
                    boxShadow: "0 0 22px rgba(139,92,246,0.25)"
                  }}
                />
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-ink-2">
              <div>{lp.inLevel}/{lp.needed}</div>
              <div>{Math.round(lp.pct)}%</div>
            </div>
          </div>

          {/* Reading-progress chip — Mark as Read tracking (no XP). */}
          <div className="mt-3 rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-3 py-2">
            <div className="flex items-center justify-between text-[11px] text-ink-2">
              <span className="uppercase tracking-[0.16em]">Reading</span>
              <span className="font-semibold text-ink-0">
                {reading.read}/{reading.total}
                <span className="ml-1.5 text-ink-2">{reading.pct}%</span>
              </span>
            </div>
            <div className="mt-1.5 relative h-1.5 overflow-hidden rounded-full border border-panel-border bg-[rgba(255,255,255,0.03)]">
              {mounted ? (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  initial={false}
                  animate={{
                    width: `${reading.read === 0 ? 0 : Math.max(4, reading.pct)}%`
                  }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(139,92,246,0.30), rgba(139,92,246,0.85), rgba(168,85,247,0.70))",
                    boxShadow:
                      reading.read > 0
                        ? "0 0 14px rgba(139,92,246,0.30)"
                        : "none"
                  }}
                />
              ) : (
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${reading.read === 0 ? 0 : Math.max(4, reading.pct)}%`,
                    background:
                      "linear-gradient(90deg, rgba(139,92,246,0.30), rgba(139,92,246,0.85), rgba(168,85,247,0.70))"
                  }}
                />
              )}
            </div>
          </div>
      </div>
    </div>
  );
}

