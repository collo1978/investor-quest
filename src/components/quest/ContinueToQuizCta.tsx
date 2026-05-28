"use client";

import { motion } from "framer-motion";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { CONTINUE_TO_QUIZ_SUMMARY_CTA } from "@/lib/quests/quizFlowCopy";

type Props = {
  onClick: () => void;
  theme: PillarQuestTheme;
  cardsTotal?: number;
};

/**
 * High-intent handoff from reading → quiz (momentum, not a flat link).
 */
export function ContinueToQuizCta({ onClick, theme, cardsTotal }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-8 flex max-w-2xl flex-col items-center"
    >
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          boxShadow: [
            `0 0 24px -8px ${theme.glow}`,
            `0 0 36px -4px ${theme.glow}`,
            `0 0 24px -8px ${theme.glow}`
          ]
        }}
        transition={{
          boxShadow: { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative overflow-hidden rounded-full border px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] transition"
        style={{
          borderColor: theme.border,
          background: `linear-gradient(135deg, ${theme.glowSoft}, rgba(0,0,0,0.35))`,
          color: theme.hi
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `linear-gradient(105deg, transparent 35%, ${theme.hi}22 50%, transparent 65%)`
          }}
        />
        <span className="relative">{CONTINUE_TO_QUIZ_SUMMARY_CTA}</span>
      </motion.button>
    </motion.div>
  );
}
