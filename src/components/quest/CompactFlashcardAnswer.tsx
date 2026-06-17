"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { CINEMATIC_FILLER_RE } from "@/lib/quests/humanFirstExplanation";
import { splitIntoSentences } from "@/lib/quests/scannableAnswer";
import { inferTakeawayFromParagraphs } from "@/lib/quests/takeawayAnswer";

type Props = {
  paragraphs: string[];
  theme?: PillarQuestTheme;
  /** Explicit hero takeaway (preferred when available). */
  takeaway?: string | null;
  /** Supporting context beneath the takeaway. */
  supporting?: string | null;
  /** Post-reveal focal emphasis — larger hero takeaway, brighter contrast. */
  emphasized?: boolean;
};

/** Hero takeaway + supporting explanation for flashcard answers. */
export function CompactFlashcardAnswer({
  paragraphs,
  theme,
  takeaway,
  supporting,
  emphasized = false
}: Props) {
  const { hero, support } = useMemo(() => {
    if (takeaway?.trim()) {
      return {
        hero: takeaway.trim(),
        support: supporting?.trim() || null
      };
    }

    const inferred = inferTakeawayFromParagraphs(paragraphs);
    if (inferred?.takeaway) {
      return {
        hero: inferred.takeaway,
        support: inferred.supporting
      };
    }

    const combined = paragraphs
      .map((p) => p.replace(/\n+/g, " ").trim())
      .filter(Boolean)
      .join(" ");
    const sentences = splitIntoSentences(combined).filter(
      (s) => !CINEMATIC_FILLER_RE.test(s)
    );

    return {
      hero: sentences[0] ?? "",
      support: sentences.length > 1 ? sentences.slice(1, 3).join(" ") : null
    };
  }, [paragraphs, takeaway, supporting]);

  if (!hero) return null;

  return (
    <motion.div
      className={emphasized ? "w-full space-y-3.5" : "w-full space-y-2.5"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <p
        className={
          emphasized
            ? "text-[18px] font-semibold leading-[1.52] sm:text-[19px] sm:leading-[1.55]"
            : "text-[15px] font-semibold leading-[1.48] sm:text-[16px]"
        }
        style={
          theme
            ? {
                color: theme.hi,
                textShadow: emphasized ? `0 0 26px ${theme.glowSoft}` : `0 0 16px ${theme.glowSoft}`
              }
            : undefined
        }
      >
        {hero}
      </p>
      {support ? (
        <p
          className={
            emphasized
              ? "text-[14.5px] font-normal leading-[1.72] text-ink-0 sm:text-[15px] sm:leading-[1.76]"
              : "text-[13.5px] font-normal leading-[1.65] text-ink-0/90 sm:text-[14px]"
          }
        >
          {support}
        </p>
      ) : null}
    </motion.div>
  );
}
