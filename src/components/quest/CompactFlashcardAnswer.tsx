"use client";



import { motion } from "framer-motion";

import { useMemo } from "react";



import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";

import { CINEMATIC_FILLER_RE } from "@/lib/quests/humanFirstExplanation";

import { inferLessonLayout, type LessonLayoutParts } from "@/lib/quests/lessonAnswer";

import { splitIntoSentences } from "@/lib/quests/scannableAnswer";

import type { ScannableSupportChunk, SegmentPanel } from "@/lib/quests/scannableTakeawayBody";

import {
  inferTakeawayFromParagraphs,
  isEmojiSectionHeadline
} from "@/lib/quests/takeawayAnswer";



type Props = {

  paragraphs: string[];

  theme?: PillarQuestTheme;

  takeaway?: string | null;

  supporting?: string | null;

  supportChunks?: ScannableSupportChunk[];

  lesson?: LessonLayoutParts;

  emphasized?: boolean;

};



function SupportDot({ theme, large = false }: { theme?: PillarQuestTheme; large?: boolean }) {

  return (

    <span

      aria-hidden

      className={

        large

          ? "mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full"

          : "mt-[0.45em] h-1 w-1 shrink-0 rounded-full"

      }

      style={{

        background: theme?.hi ?? "rgba(245,197,71,0.85)",

        boxShadow: theme ? `0 0 10px ${theme.glowSoft}` : undefined

      }}

    />

  );

}



function formatSegmentTitle(title: string): string {

  const match = title.match(/^(\p{Extended_Pictographic}+\s*)(.*)$/u);

  if (match) {

    return `${match[1]}${match[2].trim().toUpperCase()}`;

  }

  return title.trim().toUpperCase();

}



function SegmentGridPanel({

  segments,

  theme,

  emphasized

}: {

  segments: [SegmentPanel, SegmentPanel];

  theme?: PillarQuestTheme;

  emphasized?: boolean;

}) {

  const bulletClass = emphasized

    ? "text-[13.5px] leading-[1.45] text-ink-0/90 sm:text-[14px]"

    : "text-[13px] leading-[1.42] text-ink-0/88 sm:text-[13.5px]";



  return (

    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">

      {segments.map((segment) => (

        <div

          key={segment.title}

          className="flex min-h-0 flex-col rounded-xl border px-3.5 py-4 sm:px-4 sm:py-5"

          style={{

            borderColor: theme?.borderSoft ?? "rgba(245, 197, 71, 0.18)",

            background: theme

              ? `linear-gradient(155deg, ${theme.glowSoft} 0%, rgba(8, 10, 18, 0.42) 58%, rgba(0, 0, 0, 0.28) 100%)`

              : "rgba(0, 0, 0, 0.24)",

            boxShadow: theme

              ? `inset 0 1px 0 ${theme.rim}, 0 10px 28px rgba(0, 0, 0, 0.22)`

              : undefined

          }}

        >

          <h3

            className={

              emphasized

                ? "text-[17px] font-extrabold leading-[1.2] tracking-[0.03em] sm:text-[18px]"

                : "text-[16px] font-extrabold leading-[1.2] tracking-[0.03em] sm:text-[17px]"

            }

            style={

              theme

                ? {

                    color: theme.hi,

                    textShadow: `0 0 22px ${theme.glowSoft}`

                  }

                : { color: "#F5C547" }

            }

          >

            {formatSegmentTitle(segment.title)}

          </h3>

          <ul className="mt-4 space-y-1 sm:mt-5">

            {segment.items.map((item) => (

              <li key={item} className={`flex gap-2 ${bulletClass}`}>

                <SupportDot theme={theme} />

                <span className="min-w-0 flex-1">{item}</span>

              </li>

            ))}

          </ul>

        </div>

      ))}

    </div>

  );

}



function LessonFocusPanel({

  title,

  bullets,

  theme,

  emphasized

}: {

  title: string;

  bullets: string[];

  theme?: PillarQuestTheme;

  emphasized?: boolean;

}) {

  const bulletClass = emphasized

    ? "text-[14px] leading-[1.5] text-ink-0/92 sm:text-[14.5px]"

    : "text-[13.5px] leading-[1.48] text-ink-0/90 sm:text-[14px]";



  return (

    <div

      className="rounded-xl border px-4 py-3 sm:px-5 sm:py-3.5"

      style={{

        borderColor: theme?.whyGlow ?? "rgba(168, 85, 247, 0.35)",

        background: theme

          ? `linear-gradient(160deg, ${theme.whyWash} 0%, rgba(8, 10, 18, 0.5) 100%)`

          : "rgba(88, 28, 135, 0.12)",

        boxShadow: theme ? `inset 0 1px 0 rgba(255,255,255,0.06)` : undefined

      }}

    >

      <p

        className={

          emphasized

            ? "text-[15px] font-bold leading-[1.35] text-ink-0 sm:text-[16px]"

            : "text-[14.5px] font-bold leading-[1.35] text-ink-0 sm:text-[15px]"

        }

        style={theme ? { color: theme.whyHi } : undefined}

      >

        {title}

      </p>

      <ul className="mt-3 space-y-1 sm:mt-3.5">

        {bullets.map((item) => (

          <li key={item} className={`flex gap-2.5 ${bulletClass}`}>

            <SupportDot theme={theme} large />

            <span className="min-w-0 flex-1">{item}</span>

          </li>

        ))}

      </ul>

    </div>

  );

}



function LessonClosingLine({
  text,
  emphasized
}: {
  text: string;
  emphasized?: boolean;
}) {
  return (
    <p
      className={
        emphasized
          ? "text-[15px] font-semibold leading-[1.68] text-ink-0 sm:text-[15.5px] sm:leading-[1.72]"
          : "text-[14.5px] font-semibold leading-[1.65] text-ink-0 sm:text-[15px]"
      }
    >
      {text}
    </p>
  );
}

function LessonMiddleChunks({

  chunks,

  theme,

  emphasized

}: {

  chunks: ScannableSupportChunk[];

  theme?: PillarQuestTheme;

  emphasized?: boolean;

}) {

  if (!chunks.length) return null;



  return (

    <div className="space-y-4">

      {chunks.map((chunk, index) => {

        if (chunk.kind === "segmentGrid") {

          return (

            <SegmentGridPanel

              key={`segment-grid-${index}`}

              segments={chunk.segments}

              theme={theme}

              emphasized={emphasized}

            />

          );

        }

        return null;

      })}

    </div>

  );

}



function LessonFlashcardLayout({

  headline,

  lesson,

  theme,

  emphasized

}: {

  headline: string;

  lesson: LessonLayoutParts;

  theme?: PillarQuestTheme;

  emphasized?: boolean;

}) {

  const introClass = emphasized

    ? "text-[15px] font-normal leading-[1.68] text-ink-0 sm:text-[15.5px] sm:leading-[1.72]"

    : "text-[14.5px] font-normal leading-[1.65] text-ink-0/94 sm:text-[15px]";



  const hasFocus = Boolean(lesson.focusTitle && lesson.focusBullets.length > 0);

  const hasMiddle = lesson.middleChunks.length > 0;
  const showYellowHeadline = Boolean(
    headline.trim() && !isEmojiSectionHeadline(headline)
  );

  return (

    <motion.div

      className={emphasized ? "w-full space-y-6 sm:space-y-7" : "w-full space-y-5 sm:space-y-6"}

      initial={{ opacity: 0 }}

      animate={{ opacity: 1 }}

      transition={{ duration: 0.2 }}

    >

      {showYellowHeadline ? (
      <h2

        className={

          emphasized

            ? "text-[20px] font-extrabold leading-[1.3] sm:text-[22px] sm:leading-[1.28]"

            : "text-[18px] font-extrabold leading-[1.32] sm:text-[20px]"

        }

        style={

          theme

            ? {

                color: theme.hi,

                textShadow: `0 0 28px ${theme.glowSoft}`

              }

            : { color: "#F5C547" }

        }

      >

        {headline}

      </h2>
      ) : null}



      {lesson.intro ? <p className={introClass}>{lesson.intro}</p> : null}



      {hasMiddle ? (

        <LessonMiddleChunks

          chunks={lesson.middleChunks}

          theme={theme}

          emphasized={emphasized}

        />

      ) : null}



      {hasFocus ? (

        <LessonFocusPanel

          title={lesson.focusTitle!}

          bullets={lesson.focusBullets}

          theme={theme}

          emphasized={emphasized}

        />

      ) : null}



      {lesson.closing ? (

        <LessonClosingLine text={lesson.closing} emphasized={emphasized} />

      ) : null}

    </motion.div>

  );

}



/** Lesson-style flashcard answer — scannable sections, not paragraph walls. */

export function CompactFlashcardAnswer({

  paragraphs,

  theme,

  takeaway,

  supporting,

  supportChunks,

  lesson,

  emphasized = false

}: Props) {

  const resolved = useMemo(() => {
    const lessonFromProps = lesson ?? null;

    if (takeaway?.trim()) {
      const lessonLayout =
        lessonFromProps ??
        inferLessonLayout(supportChunks, supporting?.trim() || null);
      const headline = isEmojiSectionHeadline(takeaway.trim())
        ? ""
        : takeaway.trim();
      return {
        headline,
        lesson: lessonLayout
      };
    }

    if (
      lessonFromProps &&
      (lessonFromProps.intro ||
        lessonFromProps.closing ||
        lessonFromProps.focusTitle ||
        lessonFromProps.middleChunks.length > 0 ||
        lessonFromProps.focusBullets.length > 0)
    ) {
      return {
        headline: "",
        lesson: lessonFromProps
      };
    }

    const inferred = inferTakeawayFromParagraphs(paragraphs);

    if (inferred?.takeaway) {

      return {

        headline: inferred.takeaway,

        lesson: inferLessonLayout(undefined, inferred.supporting)

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

      headline: sentences[0] ?? "",

      lesson: inferLessonLayout(

        undefined,

        sentences.length > 1 ? sentences.slice(1).join(" ") : null

      )

    };

  }, [paragraphs, takeaway, supporting, supportChunks, lesson]);



  if (!resolved.headline && !resolved.lesson.intro && !resolved.lesson.closing && !resolved.lesson.focusTitle && resolved.lesson.middleChunks.length === 0) {
    return null;
  }



  return (

    <LessonFlashcardLayout

      headline={resolved.headline}

      lesson={resolved.lesson}

      theme={theme}

      emphasized={emphasized}

    />

  );

}


