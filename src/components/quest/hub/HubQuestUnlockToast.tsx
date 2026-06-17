"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = {
  visible: boolean;
};

/** Short island-level burst when a new quest slot unlocks. */
export function HubQuestUnlockToast({ visible }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="hub-unlock-toast"
          role="status"
          aria-live="polite"
          aria-label="Quest unlocked"
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={
            reduceMotion
              ? { duration: 0.2 }
              : { type: "spring", stiffness: 380, damping: 28 }
          }
          className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] flex justify-center px-4"
        >
          <div
            className="inline-flex items-center gap-2.5 rounded-full border px-4 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-5 sm:py-2.5"
            style={{
              borderColor: "rgba(245,197,71,0.55)",
              background: "rgba(8,7,4,0.88)",
              boxShadow:
                "0 12px 40px rgba(0,0,0,0.55), 0 0 28px rgba(245,197,71,0.22)"
            }}
          >
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-[13px]"
              style={{
                borderColor: "rgba(245,197,71,0.5)",
                background: "rgba(245,197,71,0.12)",
                color: "#F5C547"
              }}
            >
              ✦
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[rgba(255,248,230,0.96)] sm:text-[12px]">
              Quest unlocked
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
