"use client";

import { motion } from "framer-motion";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";

type Props = {
  text: string;
  theme?: PillarQuestTheme;
};

/** Investor takeaway — plain line below the answer, full width. */
export function QuestInvestorTakeaway({ text, theme }: Props) {
  const accent = theme?.whyHi ?? "#C4B5FD";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-2/75"
        style={{ color: accent }}
      >
        Why it matters
      </p>
      <p className="mt-2 text-[14.5px] leading-[1.72] text-ink-0/90 sm:text-[15px]">
        {text}
      </p>
    </motion.div>
  );
}
