"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { ConfettiBurst } from "@/ui/effects/ConfettiBurst";

export type LevelUpFxProps = {
  /** When this changes (e.g. new level number), the effect fires once. */
  triggerKey: number | null;
  detail?: string;
};

/**
 * Level-up FX — badge activation moment with soft burst.
 */
export function LevelUpFx({ triggerKey, detail }: LevelUpFxProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (triggerKey == null) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2200);
    return () => window.clearTimeout(t);
  }, [triggerKey]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={triggerKey ?? "lvl-fx"}
          aria-hidden
          className="pointer-events-none fixed left-1/2 top-[26%] z-[60] -translate-x-1/2"
          initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative overflow-hidden rounded-3xl border border-[rgba(168,85,247,0.55)] bg-[rgba(7,7,18,0.88)] px-8 py-5 shadow-glow backdrop-blur-xl">
            <ConfettiBurst triggerKey={triggerKey} count={18} />
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
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-neon-300">
                Investor level up
              </div>
              <div className="mt-1 font-[var(--font-grotesk)] text-2xl text-ink-0">
                {detail ?? "New level reached"}
              </div>
              <p className="mt-2 text-[12px] text-ink-1">
                Your expedition tier just climbed — new trails feel within reach.
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
