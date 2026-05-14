"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Pillar } from "@/lib/demoData";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";

export function QuestModal({
  open,
  onClose,
  pillar,
  locked,
  completedQuestSlugs,
  onCompleteQuest
}: {
  open: boolean;
  onClose: () => void;
  pillar: Pillar | null;
  locked: boolean;
  completedQuestSlugs: string[];
  onCompleteQuest: (questId: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && pillar ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[min(920px,calc(100vw-28px))] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Pillar quests"
          >
            <div className="relative overflow-hidden rounded-[28px] border border-[rgba(139,92,246,0.35)] bg-[rgba(7,7,18,0.92)] shadow-glow backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.16)] via-transparent to-[rgba(59,130,246,0.06)]" />

              <div className="relative flex items-start justify-between gap-4 border-b border-panel-border p-5">
                <div>
                  <div className="text-xs text-ink-2">Island</div>
                  <div className="mt-2 font-[var(--font-grotesk)] text-2xl text-ink-0">
                    {pillar.title}
                  </div>
                  <div className="mt-2 text-sm text-ink-1">{pillar.subtitle}</div>
                </div>

                <div className="flex items-center gap-2">
                  {locked ? (
                    <span className="rounded-full border border-panel-border bg-panel px-2 py-1 text-xs text-ink-2">
                      Locked
                    </span>
                  ) : (
                    <span className="rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.10)] px-2 py-1 text-xs text-neon-300">
                      Unlocked
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-panel-border bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-ink-1 transition hover:bg-[rgba(255,255,255,0.07)]"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="relative p-5">
                {locked ? (
                  <GlassCard className="p-6">
                    <div className="text-sm text-ink-2">Encrypted pillar</div>
                    <div className="mt-2 text-xl font-semibold text-ink-0">
                      Complete the previous island to unlock
                    </div>
                    <div className="mt-2 text-sm text-ink-1">
                      Your next objective is glowing on the map. Clear it to
                      decrypt this track.
                    </div>
                  </GlassCard>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pillar.quests.map((q) => {
                      const done = completedQuestSlugs.includes(q.id);
                      return (
                        <GlassCard
                          key={q.id}
                          className={[
                            "p-5 transition",
                            done
                              ? "border-[rgba(139,92,246,0.35)]"
                              : "border-panel-border"
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs text-ink-2">Quest</div>
                              <div className="mt-2 text-lg font-semibold text-ink-0">
                                {q.title}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-ink-2">XP</div>
                              <div className="mt-1 text-sm font-semibold text-neon-300">
                                +{q.xp}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 text-sm text-ink-1">{q.prompt}</div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <NeonButton
                              onClick={() => onCompleteQuest(q.id)}
                              disabled={done}
                            >
                              {done ? "Completed" : "Complete"}
                            </NeonButton>

                            <div
                              className={[
                                "text-xs",
                                done ? "text-neon-300" : "text-ink-2"
                              ].join(" ")}
                            >
                              {done ? "✓ Cleared" : "Pending"}
                            </div>
                          </div>

                          {done ? (
                            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full border border-[rgba(139,92,246,0.25)] bg-[rgba(255,255,255,0.03)]">
                              <motion.div
                                className="h-full w-full"
                                initial={{ opacity: 0.2 }}
                                animate={{ opacity: [0.25, 0.6, 0.25] }}
                                transition={{
                                  duration: 2.2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                style={{
                                  background:
                                    "linear-gradient(90deg, rgba(139,92,246,0.20), rgba(139,92,246,0.75), rgba(168,85,247,0.60))"
                                }}
                              />
                            </div>
                          ) : null}
                        </GlassCard>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

