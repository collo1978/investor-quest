"use client";



import { motion } from "framer-motion";

import { useMemo, type CSSProperties } from "react";



import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";

import { CINEMATIC_FILLER_RE } from "@/lib/quests/humanFirstExplanation";

import { inferLessonLayout, type LessonLayoutParts } from "@/lib/quests/lessonAnswer";

import { splitIntoSentences } from "@/lib/quests/scannableAnswer";

import type { ScannableSupportChunk, SegmentPanel } from "@/lib/quests/scannableTakeawayBody";

import {
  inferTakeawayFromParagraphs,
  isEmojiSectionHeadline
} from "@/lib/quests/takeawayAnswer";

/** Schools mission cards — high-contrast readable palette on cream. */
const MISSION_HEADING = "#0f172a";
const MISSION_BODY = "#475569";
const MISSION_BODY_STRONG = "#334155";
const MISSION_ACCENT = "#92400e";
const MISSION_BULLET = "#d97706";

function isMissionTheme(theme?: PillarQuestTheme): boolean {
  return theme?.cardChrome === "mission";
}

function missionHeading(theme?: PillarQuestTheme): string {
  return isMissionTheme(theme) ? MISSION_HEADING : theme?.hi ?? "#F5C547";
}

function missionBodyClass(theme?: PillarQuestTheme, emphasized?: boolean): string {
  if (!isMissionTheme(theme)) {
    return emphasized
      ? "text-[13.5px] leading-[1.45] text-ink-0/90 sm:text-[14px]"
      : "text-[13px] leading-[1.42] text-ink-0/88 sm:text-[13.5px]";
  }
  return emphasized
    ? "text-[14px] leading-[1.55] sm:text-[14.5px]"
    : "text-[13.5px] leading-[1.52] sm:text-[14px]";
}

function missionBodyStyle(theme?: PillarQuestTheme): CSSProperties | undefined {
  return isMissionTheme(theme) ? { color: MISSION_BODY } : undefined;
}

function missionInfoPanelStyle(theme?: PillarQuestTheme): CSSProperties {
  if (!isMissionTheme(theme)) {
    return {
      borderColor: theme?.borderSoft ?? "rgba(245, 197, 71, 0.18)",
      background: theme
        ? `linear-gradient(155deg, ${theme.glowSoft} 0%, rgba(8, 10, 18, 0.42) 58%, rgba(0, 0, 0, 0.28) 100%)`
        : "rgba(0, 0, 0, 0.24)",
      boxShadow: theme
        ? `inset 0 1px 0 ${theme.rim}, 0 10px 28px rgba(0, 0, 0, 0.22)`
        : undefined
    };
  }
  return {
    borderColor: "rgba(191, 219, 254, 0.55)",
    background:
      "linear-gradient(168deg, rgba(240, 249, 255, 0.72) 0%, rgba(255, 251, 235, 0.58) 100%)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.82)"
  };
}

function missionTakeawayPanelStyle(theme?: PillarQuestTheme): CSSProperties {
  if (!isMissionTheme(theme)) {
    return {
      borderColor: theme?.whyGlow ?? "rgba(168, 85, 247, 0.35)",
      background: theme
        ? `linear-gradient(160deg, ${theme.whyWash} 0%, rgba(8, 10, 18, 0.5) 100%)`
        : "rgba(88, 28, 135, 0.12)",
      boxShadow: theme ? `inset 0 1px 0 rgba(255,255,255,0.06)` : undefined
    };
  }
  return {
    borderColor: "rgba(251, 191, 36, 0.42)",
    background: "rgba(255, 255, 255, 0.48)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.75)"
  };
}

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
        background: isMissionTheme(theme) ? MISSION_BULLET : theme?.hi ?? "rgba(245,197,71,0.85)",
        boxShadow: isMissionTheme(theme)
          ? undefined
          : theme
            ? `0 0 10px ${theme.glowSoft}`
            : undefined
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

/** Small contextual icon for Used In / segment list items (mission cards). */
function segmentItemIcon(label: string): string | null {
  const t = label.toLowerCase();
  if (/\bai\b|artificial intelligence|machine learning|generative/.test(t)) return "🤖";
  if (/video game|gaming|game console/.test(t)) return "🎮";
  if (/data cent|datacenter|cloud server|server farm/.test(t)) return "🖥️";
  if (/scientific|research|laboratory|lab\b|physics|biology/.test(t)) return "🔬";
  if (/automotive|self-driving|vehicle|car\b/.test(t)) return "🚗";
  if (/healthcare|medical|hospital/.test(t)) return "🏥";
  if (/finance|bank|trading/.test(t)) return "💹";
  return null;
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

  const bulletClass = missionBodyClass(theme, emphasized);
  const panelGap = isMissionTheme(theme) ? "gap-4 sm:gap-5" : "gap-3.5 sm:gap-4";
  const activeSegments = segments.filter((segment) => segment.items.length > 0);
  const singleMissionPanel = isMissionTheme(theme) && activeSegments.length === 1;

  const renderSegment = (segment: SegmentPanel) => (
    <div
      key={segment.title}
      className={`flex min-h-0 flex-col rounded-xl border ${
        isMissionTheme(theme)
          ? "px-4 py-3.5 sm:px-5 sm:py-4"
          : "px-3.5 py-4 sm:px-4 sm:py-5"
      }`}
      style={missionInfoPanelStyle(theme)}
    >
      <h3
        className={
          isMissionTheme(theme)
            ? "text-[11px] font-extrabold uppercase tracking-[0.18em]"
            : emphasized
              ? "text-[17px] font-extrabold leading-[1.2] tracking-[0.03em] sm:text-[18px]"
              : "text-[16px] font-extrabold leading-[1.2] tracking-[0.03em] sm:text-[17px]"
        }
        style={
          isMissionTheme(theme)
            ? { color: MISSION_ACCENT }
            : theme
              ? { color: theme.hi, textShadow: `0 0 22px ${theme.glowSoft}` }
              : { color: "#F5C547" }
        }
      >
        {formatSegmentTitle(segment.title)}
      </h3>
      <ul
        className={
          isMissionTheme(theme) ? "mt-3 space-y-2 sm:mt-3.5" : "mt-4 space-y-1 sm:mt-5"
        }
      >
        {segment.items.map((item) => {
          const icon = isMissionTheme(theme) ? segmentItemIcon(item) : null;
          return (
            <li key={item} className={`flex gap-2.5 ${bulletClass}`} style={missionBodyStyle(theme)}>
              {icon ? (
                <span aria-hidden className="mt-0.5 shrink-0 text-[15px] leading-none">
                  {icon}
                </span>
              ) : (
                <SupportDot theme={theme} />
              )}
              <span className="min-w-0 flex-1">{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  if (singleMissionPanel) {
    return (
      <div className="mx-auto w-full max-w-sm">{renderSegment(activeSegments[0]!)}</div>
    );
  }

  return (
    <div className={`grid grid-cols-1 ${panelGap} sm:grid-cols-2`}>
      {segments.map((segment) =>
        segment.items.length > 0 ? renderSegment(segment) : null
      )}
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

  const bulletClass = missionBodyClass(theme, emphasized);

  return (
    <div
      className={`rounded-xl border ${
        isMissionTheme(theme) ? "px-4 py-4 sm:px-5 sm:py-5" : "px-4 py-3 sm:px-5 sm:py-3.5"
      }`}
      style={missionTakeawayPanelStyle(theme)}
    >
      <p
        className={
          isMissionTheme(theme)
            ? "text-[13px] font-extrabold uppercase tracking-[0.14em]"
            : emphasized
              ? "text-[15px] font-bold leading-[1.35] text-ink-0 sm:text-[16px]"
              : "text-[14.5px] font-bold leading-[1.35] text-ink-0 sm:text-[15px]"
        }
        style={
          isMissionTheme(theme)
            ? { color: MISSION_ACCENT }
            : theme
              ? { color: theme.whyHi }
              : undefined
        }
      >
        {title}
      </p>
      <ul
        className={
          isMissionTheme(theme) ? "mt-3.5 space-y-2 sm:mt-4" : "mt-3 space-y-1 sm:mt-3.5"
        }
      >
        {bullets.map((item) => (
          <li key={item} className={`flex gap-2.5 ${bulletClass}`} style={missionBodyStyle(theme)}>
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
  emphasized,
  theme
}: {
  text: string;
  emphasized?: boolean;
  theme?: PillarQuestTheme;
}) {
  const mission = isMissionTheme(theme);
  return (
    <p
      className={
        mission
          ? emphasized
            ? "text-[15px] font-semibold leading-[1.72] sm:text-[15.5px]"
            : "text-[14.5px] font-semibold leading-[1.68] sm:text-[15px]"
          : emphasized
            ? "text-[15px] font-semibold leading-[1.68] text-ink-0 sm:text-[15.5px] sm:leading-[1.72]"
            : "text-[14.5px] font-semibold leading-[1.65] text-ink-0 sm:text-[15px]"
      }
      style={mission ? { color: MISSION_BODY_STRONG } : undefined}
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

    <div className={isMissionTheme(theme) ? "space-y-5 sm:space-y-6" : "space-y-4"}>

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

  const introClass = isMissionTheme(theme)
    ? emphasized
      ? "text-[15px] font-normal leading-[1.72] sm:text-[16px] sm:leading-[1.76]"
      : "text-[14.5px] font-normal leading-[1.68] sm:text-[15px]"
    : emphasized
      ? "text-[15px] font-normal leading-[1.68] text-ink-0 sm:text-[15.5px] sm:leading-[1.72]"
      : "text-[14.5px] font-normal leading-[1.65] text-ink-0/94 sm:text-[15px]";

  const hasFocus = Boolean(lesson.focusTitle && lesson.focusBullets.length > 0);
  const hasMiddle = lesson.middleChunks.length > 0;
  const showYellowHeadline = Boolean(
    headline.trim() && !isEmojiSectionHeadline(headline)
  );
  const sectionGap = isMissionTheme(theme)
    ? emphasized
      ? "w-full space-y-7 sm:space-y-8"
      : "w-full space-y-6 sm:space-y-7"
    : emphasized
      ? "w-full space-y-6 sm:space-y-7"
      : "w-full space-y-5 sm:space-y-6";

  return (
    <motion.div
      className={sectionGap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {showYellowHeadline ? (
        <h2
          className={
            isMissionTheme(theme)
              ? emphasized
                ? "text-[clamp(1.35rem,4.2vw,1.65rem)] font-bold leading-[1.28] tracking-[-0.02em]"
                : "text-[clamp(1.25rem,3.8vw,1.5rem)] font-bold leading-[1.3] tracking-[-0.02em]"
              : emphasized
                ? "text-[20px] font-extrabold leading-[1.3] sm:text-[22px] sm:leading-[1.28]"
                : "text-[18px] font-extrabold leading-[1.32] sm:text-[20px]"
          }
          style={
            isMissionTheme(theme)
              ? { color: missionHeading(theme) }
              : theme
                ? { color: theme.hi, textShadow: `0 0 28px ${theme.glowSoft}` }
                : { color: "#F5C547" }
          }
        >
          {headline}
        </h2>
      ) : null}

      {lesson.intro ? (
        <p className={introClass} style={missionBodyStyle(theme)}>
          {lesson.intro}
        </p>
      ) : null}



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
        <LessonClosingLine text={lesson.closing} emphasized={emphasized} theme={theme} />
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


