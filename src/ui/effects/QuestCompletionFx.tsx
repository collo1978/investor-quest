"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { ConfettiBurst } from "@/ui/effects/ConfettiBurst";

export type QuestCompletionFxProps = {
  /** Unique key per completion event. */
  triggerKey: string | null;
  xpGained?: number;
};

/**
 * Quest completion FX: floating XP pulse with light confetti.
 * Decorative only — progress / state are owned by the engine layer.
 */
export function QuestCompletionFx({
  triggerKey,
  xpGained
}: QuestCompletionFxProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!triggerKey) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 1800);
    return () => window.clearTimeout(t);
  }, [triggerKey]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={triggerKey}
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-[10%] z-[55] flex justify-center"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative overflow-hidden rounded-full border border-[rgba(139,92,246,0.4)] bg-[rgba(7,7,18,0.82)] px-5 py-2 shadow-glow backdrop-blur-xl">
            <ConfettiBurst triggerKey={triggerKey} count={14} className="opacity-80" />
            <motion.span
              className="relative text-xs font-bold uppercase tracking-[0.18em] text-neon-300"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              ✦ {typeof xpGained === "number" ? `+${xpGained} XP secured` : "Quest mastery"}
            </motion.span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
