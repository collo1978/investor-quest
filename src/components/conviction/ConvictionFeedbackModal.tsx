"use client";

import { motion } from "framer-motion";

import { XP_ISLAND_COMPLETION } from "@/engine/progression/xpEconomy";

export type ConvictionFeedbackModalProps = {
  pillarTitle: string;
  nextIslandTitle?: string;
  kicker?: string;
  heading?: string;
  body?: string;
  nextUnlockLabel?: string;
  onConfident: () => void;
  onCautious: () => void;
};

export function ConvictionFeedbackModal({
  pillarTitle,
  nextIslandTitle,
  kicker,
  heading,
  body,
  nextUnlockLabel,
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
      className="pointer-events-auto fixed inset-0 z-[400] flex items-center justify-center bg-[rgba(3,3,10,0.78)] px-4 py-10 backdrop-blur-md"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-1/2 h-[min(120vw,900px)] w-[min(120vw,900px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.18),transparent_62%)]"
          animate={{ opacity: [0.5, 0.85, 0.5], scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto relative w-full max-w-lg rounded-3xl border border-[rgba(139,92,246,0.28)] bg-[rgba(10,10,22,0.92)] p-8 shadow-[0_0_60px_rgba(124,58,237,0.22),inset_0_0_0_1px_rgba(255,255,255,0.04)]"
      >
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-2">
          {kicker ?? `${pillarTitle} island · power-up complete`}
        </p>
        <h2
          id="conviction-heading"
          className="mt-3 text-center font-[var(--font-grotesk)] text-xl leading-snug text-ink-0 sm:text-2xl"
        >
          {heading ?? "How strong is your conviction?"}
        </h2>
        <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-1">
          {body ??
            `Your read is logged locally. Choose a pulse — then claim +${XP_ISLAND_COMPLETION} mastery XP and ${nextIslandTitle ? "unlock the bridge ahead." : "advance your expedition."}`}
        </p>

        {nextIslandTitle ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="relative mx-auto mt-6 max-w-sm rounded-2xl border border-[rgba(245,197,71,0.35)] bg-[rgba(245,197,71,0.06)] px-4 py-3 text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[rgba(245,197,71,0.9)]">
              {nextUnlockLabel ?? "Next island unlocked"}
            </p>
            <p className="mt-1 font-[var(--font-grotesk)] text-lg text-ink-0">
              {nextIslandTitle}
            </p>
            <div
              aria-hidden
              className="pointer-events-none relative mx-auto mt-3 flex h-8 max-w-[200px] items-center"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              <motion.span
                className="mx-2 h-0.5 flex-1 rounded-full bg-gradient-to-r from-violet-400 via-amber-300 to-emerald-400"
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
            </div>
          </motion.div>
        ) : null}

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
