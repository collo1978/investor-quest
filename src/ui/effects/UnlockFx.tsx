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
 * Island / pillar unlock FX — bridge moment with cinematic glow.
 */
export function UnlockFx({ triggerKey, title, detail }: UnlockFxProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!triggerKey) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(t);
  }, [triggerKey]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={triggerKey}
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-[16%] z-[60] flex justify-center px-4"
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative max-w-md rounded-3xl border border-[rgba(139,92,246,0.5)] bg-[rgba(7,7,18,0.84)] px-6 py-5 shadow-glow backdrop-blur-xl">
            <motion.div
              className="pointer-events-none absolute -inset-3 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.65, 0] }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 50%, rgba(245,197,71,0.45), rgba(139,92,246,0.35), transparent 72%)",
                filter: "blur(20px)"
              }}
            />
            <div className="relative text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[rgba(245,197,71,0.95)]">
                Next island unlocked
              </div>
              <div className="mt-1 font-[var(--font-grotesk)] text-xl text-ink-0 sm:text-2xl">
                {title ?? "New island"}
              </div>
              {detail ? (
                <div className="mt-1.5 text-[12px] text-ink-1">{detail}</div>
              ) : (
                <div className="mt-1.5 text-[12px] text-ink-1">
                  The bridge is live — step onto the map to continue your expedition.
                </div>
              )}
              <div className="relative mx-auto mt-4 flex h-6 max-w-[180px] items-center justify-center gap-2">
                <motion.span
                  className="h-1 w-8 rounded-full bg-violet-400/80"
                  animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.span
                  className="h-2 w-2 rounded-full bg-amber-300"
                  style={{ boxShadow: "0 0 14px rgba(245,197,71,0.8)" }}
                  animate={{ scale: [0.9, 1.2, 0.9] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.span
                  className="h-1 w-8 rounded-full bg-emerald-400/80"
                  animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
