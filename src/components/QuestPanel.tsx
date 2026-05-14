"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { PillarId, Quest } from "@/lib/demoData";
import { NeonButton } from "@/components/NeonButton";
import { useEffect, useRef } from "react";
import { QuestMiniGames } from "@/components/QuestMiniGames";

const CHECKLIST = [
  { key: "evidence", label: "Add at least 2 evidence bullets" },
  { key: "numbers", label: "Write 1 key metric or assumption" },
  { key: "risk", label: "Note 1 risk / disconfirming signal" }
] as const;

export function QuestPanel({
  open,
  onClose,
  pillarId,
  quest,
  done,
  notes,
  checklist,
  mini,
  onChangeNotes,
  onToggleChecklist,
  onPatchMini,
  onComplete
}: {
  open: boolean;
  onClose: () => void;
  pillarId: PillarId;
  quest: Quest | null;
  done: boolean;
  notes: string;
  checklist: Record<string, boolean>;
  mini?: any;
  onChangeNotes: (notes: string) => void;
  onToggleChecklist: (key: string) => void;
  onPatchMini: (patch: any) => void;
  onComplete: () => void;
}) {
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // focus notes for fast journaling
    window.setTimeout(() => notesRef.current?.focus(), 0);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && quest ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="fixed inset-y-0 right-0 z-50 w-full max-w-[520px] border-l border-panel-border bg-[rgba(7,7,18,0.92)] backdrop-blur-xl"
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Quest details"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-panel-border p-5">
                <div>
                  <div className="text-xs text-ink-2">
                    {pillarId.toUpperCase()} · {quest.xp} XP
                  </div>
                  <div className="mt-2 text-xl font-semibold text-ink-0">
                    {quest.title}
                  </div>
                  <div className="mt-2 text-sm text-ink-1">{quest.prompt}</div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-panel-border bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-ink-1 transition hover:bg-[rgba(255,255,255,0.07)]"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-auto p-5">
                <div className="rounded-2xl border border-panel-border bg-panel p-4 shadow-glow">
                  <div className="text-sm font-semibold text-ink-0">
                    Research notes
                  </div>
                  <textarea
                    ref={notesRef}
                    value={notes}
                    onChange={(e) => onChangeNotes(e.target.value)}
                    placeholder="Write your thesis, evidence, and key questions…"
                    className="mt-3 min-h-[180px] w-full resize-none rounded-xl border border-panel-border bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-ink-0 outline-none ring-neon-400/50 focus:ring-2"
                  />
                  <div className="mt-3 text-xs text-ink-2">
                    Saved locally per quest.
                  </div>
                </div>

                <div className="mt-4">
                  <QuestMiniGames
                    title={quest.title}
                    mini={mini}
                    onPatchMini={(patch) => onPatchMini(patch)}
                    onBonusXp={(amount, reason) => onPatchMini({ __awardXp: { amount, reason } })}
                    onTouchStreak={() => onPatchMini({ __touchStreak: true })}
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-panel-border bg-panel p-4 shadow-glow">
                  <div className="text-sm font-semibold text-ink-0">
                    Evidence checklist
                  </div>
                  <div className="mt-3 grid gap-2">
                    {CHECKLIST.map((item) => {
                      const checked = !!checklist[item.key];
                      return (
                        <label
                          key={item.key}
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-3 py-2"
                        >
                          <div className="text-sm text-ink-1">
                            {item.label}
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggleChecklist(item.key)}
                            className="h-4 w-4 accent-[#8B5CF6]"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 text-xs text-ink-2">
                  Suggested artifact:{" "}
                  <span className="text-ink-0">{quest.artifact}</span>
                </div>
              </div>

              <div className="border-t border-panel-border p-5">
                <div className="flex flex-wrap gap-2">
                  <NeonButton onClick={onComplete} disabled={done}>
                    {done ? "Completed" : "Complete quest"}
                  </NeonButton>
                  <NeonButton variant="ghost" onClick={onClose}>
                    Back
                  </NeonButton>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

