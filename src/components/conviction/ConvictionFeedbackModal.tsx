"use client";

import { motion } from "framer-motion";

export type ConvictionFeedbackModalProps = {
  pillarTitle: string;
  onConfident: () => void;
  onCautious: () => void;
};

export function ConvictionFeedbackModal({
  pillarTitle,
  onConfident,
  onCautious
}: ConvictionFeedbackModalProps) {
  return (
    <motion.div
      role="dialog"
      aria-modal
      aria-labelledby="conviction-heading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-auto fixed inset-0 z-[400] flex items-center justify-center bg-[rgba(3,3,10,0.72)] px-4 py-10 backdrop-blur-md"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[min(120vw,900px)] w-[min(120vw,900px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.14),transparent_62%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto relative w-full max-w-lg rounded-3xl border border-[rgba(139,92,246,0.28)] bg-[rgba(10,10,22,0.92)] p-8 shadow-[0_0_60px_rgba(124,58,237,0.22),inset_0_0_0_1px_rgba(255,255,255,0.04)]"
      >
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-2">
          {pillarTitle} cleared
        </p>
        <h2
          id="conviction-heading"
          className="mt-3 text-center font-[var(--font-grotesk)] text-xl leading-snug text-ink-0 sm:text-2xl"
        >
          How do you feel about this company?
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfident}
            className="group relative flex flex-col items-center gap-3 rounded-2xl border border-[rgba(52,211,153,0.35)] bg-[rgba(16,185,129,0.08)] px-4 py-6 text-center transition hover:border-[rgba(52,211,153,0.65)] hover:bg-[rgba(16,185,129,0.14)] hover:shadow-[0_0_40px_rgba(52,211,153,0.35)]"
          >
            <span
              aria-hidden
              className="text-5xl transition group-hover:animate-pulse sm:text-6xl"
              style={{ filter: "drop-shadow(0 0 18px rgba(52,211,153,0.55))" }}
            >
              👍
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">
              Confident
            </span>
            <span className="text-xs leading-relaxed text-ink-1">
              I understand this business and feel positive about it.
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCautious}
            className="group relative flex flex-col items-center gap-3 rounded-2xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.06)] px-4 py-6 text-center transition hover:border-[rgba(251,146,60,0.55)] hover:bg-[rgba(248,113,113,0.1)] hover:shadow-[0_0_40px_rgba(251,146,60,0.28)]"
          >
            <span
              aria-hidden
              className="text-5xl transition group-hover:animate-pulse sm:text-6xl"
              style={{ filter: "drop-shadow(0 0 18px rgba(251,146,60,0.45))" }}
            >
              👎
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-orange-200">
              Cautious
            </span>
            <span className="text-xs leading-relaxed text-ink-1">
              I still have concerns or low conviction.
            </span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
