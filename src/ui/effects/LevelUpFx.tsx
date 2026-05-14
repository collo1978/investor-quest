"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export type LevelUpFxProps = {
  /** When this changes (e.g. new level number), the effect fires once. */
  triggerKey: number | null;
  detail?: string;
};

/**
 * Subtle level-up FX: a single-shot soft burst with a label. Lives in
 * the UI layer; engine emits RewardEvent of kind "level-up" which the
 * provider feeds in via `triggerKey`.
 */
export function LevelUpFx({ triggerKey, detail }: LevelUpFxProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (triggerKey == null) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 1800);
    return () => window.clearTimeout(t);
  }, [triggerKey]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={triggerKey ?? "lvl-fx"}
          aria-hidden
          className="pointer-events-none fixed left-1/2 top-[28%] z-[60] -translate-x-1/2"
          initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative rounded-3xl border border-[rgba(168,85,247,0.55)] bg-[rgba(7,7,18,0.82)] px-7 py-5 shadow-glow backdrop-blur-xl">
            <motion.div
              className="pointer-events-none absolute -inset-1 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              style={{
                background:
                  "radial-gradient(40% 40% at 50% 50%, rgba(139,92,246,0.65), transparent 70%)",
                filter: "blur(18px)"
              }}
            />
            <div className="relative text-center">
              <div className="text-[11px] uppercase tracking-[0.18em] text-neon-300">
                Level up
              </div>
              <div className="mt-1 font-[var(--font-grotesk)] text-2xl text-ink-0">
                {detail ?? "New level reached"}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
