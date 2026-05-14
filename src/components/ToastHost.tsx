"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/components/GameProvider";

export function ToastHost() {
  const { toasts, actions } = useGame();

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 w-full max-w-sm px-5">
      <AnimatePresence>
        {toasts.map((toast, idx) => {
          const border =
            toast.kind === "level"
              ? "border-[rgba(168,85,247,0.45)]"
              : toast.kind === "unlock"
                ? "border-[rgba(139,92,246,0.35)]"
                : "border-panel-border";

          const titleColor =
            toast.kind === "level"
              ? "text-[rgba(216,180,254,0.95)]"
              : toast.kind === "unlock"
                ? "text-neon-300"
                : "text-ink-0";

          const showBurst = toast.kind !== "xp";

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={[
                "pointer-events-auto relative overflow-hidden rounded-2xl border bg-[rgba(7,7,18,0.88)] p-4 shadow-glow backdrop-blur-xl",
                border
              ].join(" ")}
              style={{ marginTop: idx === 0 ? 0 : 10 }}
            >
              {/* glow burst */}
              {showBurst ? (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full"
                  initial={{ opacity: 0.0, scale: 0.6 }}
                  animate={{ opacity: [0.0, 0.45, 0.0], scale: [0.6, 1.25, 1.6] }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.85), transparent 55%)",
                    filter: "blur(10px)"
                  }}
                />
              ) : null}

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className={["text-sm font-semibold", titleColor].join(" ")}>
                    {toast.title}
                  </div>
                  {toast.detail ? (
                    <div className="mt-1 text-xs text-ink-1">{toast.detail}</div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => actions.dismissToast(toast.id)}
                  className="rounded-lg border border-panel-border bg-[rgba(255,255,255,0.04)] px-2 py-1 text-xs text-ink-1 transition hover:bg-[rgba(255,255,255,0.07)]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

