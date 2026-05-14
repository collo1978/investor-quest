"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export type UnlockFxProps = {
  /** A unique key per unlock event; changing it triggers a one-shot animation. */
  triggerKey: string | null;
  title?: string;
  detail?: string;
};

/**
 * Reusable island/pillar unlock FX. Subtle premium glow with a single
 * line of context. Engine emits "pillar-unlocked" RewardEvents that the
 * provider routes here via `triggerKey`.
 */
export function UnlockFx({ triggerKey, title, detail }: UnlockFxProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!triggerKey) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2200);
    return () => window.clearTimeout(t);
  }, [triggerKey]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={triggerKey}
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-[18%] z-[60] flex justify-center"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative rounded-3xl border border-[rgba(139,92,246,0.45)] bg-[rgba(7,7,18,0.78)] px-6 py-4 shadow-glow backdrop-blur-xl">
            <motion.div
              className="pointer-events-none absolute -inset-2 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.55, 0] }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 50%, rgba(139,92,246,0.55), transparent 70%)",
                filter: "blur(18px)"
              }}
            />
            <div className="relative text-center">
              <div className="text-[11px] uppercase tracking-[0.18em] text-neon-300">
                Unlocked
              </div>
              <div className="mt-1 font-[var(--font-grotesk)] text-xl text-ink-0">
                {title ?? "New island"}
              </div>
              {detail ? (
                <div className="mt-1 text-[12px] text-ink-1">{detail}</div>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
