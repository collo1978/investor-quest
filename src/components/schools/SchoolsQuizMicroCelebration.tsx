"use client";

import { motion } from "framer-motion";

type Props = {
  message: string;
};

/**
 * Inline wrong-answer feedback (Schools flow) — sits below the card, never over the question.
 */
export function SchoolsQuizMicroCelebration({ message }: Props) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="mt-4 text-center text-[13px] font-semibold"
      style={{ color: "rgba(244,180,180,0.95)" }}
      aria-live="polite"
    >
      {message}
    </motion.p>
  );
}
