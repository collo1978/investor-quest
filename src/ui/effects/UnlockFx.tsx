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
 * Island / pillar unlock FX — lightweight toast (does not cover map hero / quest cards).
 */
export function UnlockFx({ triggerKey, title, detail }: UnlockFxProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!triggerKey) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2800);
    return () => window.clearTimeout(t);
  }, [triggerKey]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={triggerKey}
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 right-4 z-[60] max-w-[min(100vw-2rem,22rem)] max-md:bottom-[calc(var(--mobile-nav-h,128px)+1rem)] sm:right-6"
          initial={{ opacity: 0, x: 24, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 16, y: 8, scale: 0.97 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative rounded-2xl border border-[rgba(139,92,246,0.45)] bg-[rgba(7,7,18,0.92)] px-4 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_24px_rgba(139,92,246,0.22)] backdrop-blur-xl">
            <motion.div
              className="pointer-events-none absolute -inset-1 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              style={{
                background:
                  "radial-gradient(80% 80% at 100% 100%, rgba(245,197,71,0.35), transparent 70%)",
                filter: "blur(12px)"
              }}
            />
            <div className="relative text-left">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(245,197,71,0.95)]">
                Next island unlocked
              </div>
              <div className="mt-0.5 font-[var(--font-grotesk)] text-[17px] font-semibold leading-snug text-ink-0">
                {title ?? "New island"}
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-1">
                {detail ??
                  "It's on the map — tap when you're ready to keep going."}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
