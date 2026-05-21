"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import type { RelatableAnswerSections } from "@/lib/quests/questAnswerFormat";
import {
  buildScannableBeats,
  splitAnchorHighlights,
  type ScannableAnswerBeat
} from "@/lib/quests/scannableAnswer";

type Props = {
  sections: RelatableAnswerSections;
  compact?: boolean;
  theme?: PillarQuestTheme;
};

function AnswerLine({
  text,
  theme,
  className,
  emphasizeAnchors = true
}: {
  text: string;
  theme?: PillarQuestTheme;
  className: string;
  emphasizeAnchors?: boolean;
}) {
  const spans = useMemo(
    () => (emphasizeAnchors ? splitAnchorHighlights(text) : [{ text, highlight: false }]),
    [text, emphasizeAnchors]
  );
  const hi = theme?.hi ?? "rgba(245, 197, 71, 0.95)";

  return (
    <p className={className}>
      {spans.map((span, i) =>
        span.highlight ? (
          <span key={i} className="font-semibold" style={{ color: hi }}>
            {span.text}
          </span>
        ) : (
          <span key={i}>{span.text}</span>
        )
      )}
    </p>
  );
}

function AnalogyLine({
  text,
  theme,
  className
}: {
  text: string;
  theme?: PillarQuestTheme;
  className: string;
}) {
  const accent = theme?.whyHi ?? "#C4B5FD";

  return (
    <p
      className={`${className} border-l-[3px] pl-3 font-medium text-ink-0`}
      style={{ borderColor: accent }}
    >
      {text}
    </p>
  );
}

function BeatLines({
  beat,
  theme,
  lineClass
}: {
  beat: ScannableAnswerBeat;
  theme?: PillarQuestTheme;
  lineClass: string;
}) {
  if (beat.kind === "analogy") {
    return (
      <AnalogyLine
        text={beat.sentences.join(" ")}
        theme={theme}
        className={lineClass}
      />
    );
  }

  return (
    <>
      {beat.sentences.map((sentence, i) => (
        <AnswerLine
          key={i}
          text={sentence}
          theme={theme}
          className={lineClass}
        />
      ))}
    </>
  );
}

/**
 * Scannable quest answer — short lines, soft analogy accent, full-width flow.
 */
export function RelatableQuestAnswer({ sections, compact, theme }: Props) {
  const beats = useMemo(
    () => buildScannableBeats(sections.paragraphs),
    [sections.paragraphs]
  );

  const lineClass = compact
    ? "text-[14.5px] leading-[1.75] text-ink-0/94 sm:text-[15px]"
    : "text-[15px] leading-[1.78] text-ink-0/95 sm:text-[15.5px]";

  if (!beats.length) return null;

  return (
    <motion.div
      className="w-full space-y-3.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {beats.map((beat, i) => (
        <BeatLines key={i} beat={beat} theme={theme} lineClass={lineClass} />
      ))}
    </motion.div>
  );
}
