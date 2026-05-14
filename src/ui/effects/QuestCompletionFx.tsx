"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export type QuestCompletionFxProps = {
  /** Unique key per completion event. */
  triggerKey: string | null;
  xpGained?: number;
};

/**
 * Subtle completion FX: short XP pulse near top-center. Decorative only;
 * progress / state are owned by the engine layer.
 */
export function QuestCompletionFx({
  triggerKey,
  xpGained
}: QuestCompletionFxProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!triggerKey) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 1400);
    return () => window.clearTimeout(t);
  }, [triggerKey]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={triggerKey}
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-[12%] z-[55] flex justify-center"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(7,7,18,0.75)] px-4 py-1.5 text-xs font-semibold text-neon-300 shadow-glow backdrop-blur-xl">
            ✦ {typeof xpGained === "number" ? `+${xpGained} XP` : "Quest complete"}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
