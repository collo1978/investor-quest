"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { CINEMATIC_FILLER_RE } from "@/lib/quests/humanFirstExplanation";
import { splitIntoSentences } from "@/lib/quests/scannableAnswer";

type Props = {
  paragraphs: string[];
  theme?: PillarQuestTheme;
};

/** Minimal text answer: one headline line + optional single follow-up (no insight boxes). */
export function CompactFlashcardAnswer({ paragraphs, theme }: Props) {
  const { headline, sub } = useMemo(() => {
    const combined = paragraphs
      .map((p) => p.replace(/\n+/g, " ").trim())
      .filter(Boolean)
      .join(" ");
    const sentences = splitIntoSentences(combined).filter(
      (s) => !CINEMATIC_FILLER_RE.test(s)
    );
    return {
      headline: sentences[0] ?? "",
      sub: sentences[1]
    };
  }, [paragraphs]);

  if (!headline) return null;

  return (
    <motion.div
      className="w-full space-y-2.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <p
        className="text-[14px] font-medium leading-snug text-ink-0/94 sm:text-[14.5px]"
        style={theme ? { color: theme.hi } : undefined}
      >
        {headline}
      </p>
      {sub ? (
        <p className="text-[13px] leading-[1.6] text-ink-0/82 sm:text-[13.5px]">{sub}</p>
      ) : null}
    </motion.div>
  );
}
