"use client";

import { motion } from "framer-motion";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";

type Props = {
  text: string;
  theme: PillarQuestTheme;
  label?: string;
};

export function VisualAnswerNarration({
  text,
  theme,
  label = "What this shows"
}: Props) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mt-3.5 rounded-lg border border-white/[0.08] bg-black/30 px-3.5 py-3 sm:px-4 sm:py-3.5"
      style={{ borderColor: theme.borderSoft }}
    >
      <p
        className="text-[9px] font-bold uppercase tracking-[0.18em]"
        style={{ color: theme.hi }}
      >
        {label}
      </p>
      <p className="mt-2 text-[13px] leading-[1.68] text-ink-0/92 sm:text-[13.5px]">
        {trimmed}
      </p>
    </motion.div>
  );
}
