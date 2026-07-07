"use client";

/**
 * QuizQuestionView — renderers for every quiz question variant.
 *
 * A single React component dispatches on `question.kind` to render the
 * right input UI. Each renderer is pure and reads/writes its own
 * answer shape through the same generic `value`/`onChange` props.
 *
 * Two display modes:
 *   - mode = "input"  : user selects answers (no feedback)
 *   - mode = "review" : answers locked, ✓/✗ feedback + explanation
 *
 * All shuffling for `match` and `order` questions is deterministic
 * (seeded from `question.id`) so server and client agree on a single
 * order — hydration-safe.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, Reorder, useDragControls } from "framer-motion";

import type {
  BullBearQuestion,
  FillBlankQuestion,
  MatchQuestion,
  MultipleChoiceQuestion,
  OddOneOutQuestion,
  OrderQuestion,
  QuizQuestion,
  RedFlagQuestion,
  RiskMeterQuestion,
  ScenarioQuestion,
  SwipeCardsQuestion,
  SwipeVerdict,
  TrueFalseQuestion
} from "@/data/quests/types";
import { isQuizAnswerCorrect } from "@/data/quests/types";
import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import {
  initialOrderPermutation,
  shuffleIndices
} from "@/lib/quests/quizOrderShuffle";
import { SchoolsQuizMicroRewardFx } from "@/components/schools/SchoolsQuizMicroRewardFx";
import {
  quizLayoutProfileForKind,
  quizLayoutProfileForQuestion,
  usesIntegratedQuizPrompt
} from "@/lib/quests/quizLayoutProfiles";

// ---------------------------------------------------------------------------
// Visual tokens
// ---------------------------------------------------------------------------

const GOLD_HI = "#F5C547";
const GOLD_BORDER = "rgba(245, 197, 71, 0.40)";
const GOLD_BORDER_SOFT = "rgba(245, 197, 71, 0.22)";
const GOLD_GLOW = "rgba(245,197,71,0.45)";
const GREEN_HI = "#22C58B";
const GREEN_BORDER = "rgba(34, 197, 139, 0.55)";
const RED_HI = "#F47878";
const RED_BORDER = "rgba(244, 120, 120, 0.55)";
const MISSION_HEADING = "#92400e";
const MISSION_BODY = "#0f172a";
const MISSION_MUTED = "#475569";
const MISSION_LABEL = "#64748b";

function isMissionQuizSurface(theme?: PillarQuestTheme): boolean {
  return theme?.cardChrome === "mission";
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type QuizQuestionViewProps = {
  index: number;
  question: QuizQuestion;
  value: unknown;
  onChange: (next: unknown) => void;
  mode: "input" | "review";
  /** Order questions: show ✓/✗ per step while still allowing reorder (input mode). */
  showFeedback?: boolean;
  /** `focus` — single clean card; question is the hero (no inner fieldset chrome). */
  variant?: "default" | "focus";
  /** Schools micro-reward — pulse the card green/gold after a correct answer. */
  celebrateCorrect?: boolean;
  /** XP earned on the current correct answer (Schools flow). */
  successXp?: number;
  /** Schools Business Island — cream/gold quiz card surface. */
  surfaceTheme?: PillarQuestTheme;
};

export function QuizQuestionView(props: QuizQuestionViewProps) {
  const {
    question,
    mode,
    value,
    showFeedback,
    variant = "default",
    celebrateCorrect = false,
    successXp,
    surfaceTheme
  } = props;
  const isFocus = variant === "focus";
  const isMissionSurface = surfaceTheme?.cardChrome === "mission";
  const bodyText = surfaceTheme?.text ?? MISSION_BODY;
  const mutedText = surfaceTheme?.textMuted ?? MISSION_MUTED;
  const isReview = mode === "review";
  const showResult =
    isReview || (showFeedback && question.kind === "order");
  const answeredCorrect =
    !!showResult && isQuizAnswerCorrect(question, value);

  const celebrating = celebrateCorrect && answeredCorrect;
  const showSuccessXp = celebrating && successXp != null;
  const feedbackBorder = celebrating
    ? "rgba(245,197,71,0.58)"
    : showResult
      ? answeredCorrect
        ? GREEN_BORDER
        : RED_BORDER
      : isFocus
        ? isMissionSurface
          ? "rgba(202, 138, 4, 0.35)"
          : "rgba(255,255,255,0.08)"
        : GOLD_BORDER_SOFT;
  const feedbackBg = celebrating
    ? "rgba(34,197,139,0.07)"
    : showResult
      ? answeredCorrect
        ? "rgba(34,197,139,0.035)"
        : "rgba(244,120,120,0.04)"
      : isFocus
        ? isMissionSurface
          ? "rgba(255,255,255,0.42)"
          : "rgba(255,255,255,0.03)"
        : isMissionSurface
          ? "rgba(255,255,255,0.62)"
          : "rgba(255,255,255,0.02)";
  const feedbackShadow = celebrating
    ? "0 0 36px -6px rgba(34,197,139,0.44), 0 0 24px -8px rgba(245,197,71,0.28)"
    : showResult
      ? answeredCorrect
        ? "0 0 28px -8px rgba(34,197,139,0.44)"
        : "0 0 28px -8px rgba(244,120,120,0.45)"
      : isFocus
        ? isMissionSurface
          ? "0 10px 26px rgba(2, 6, 23, 0.16)"
          : "0 24px 64px -32px rgba(0,0,0,0.55)"
        : isMissionSurface
          ? "0 8px 22px rgba(2, 6, 23, 0.12)"
          : "none";

  const cardClassName = [
    "iq-quiz-stage transition-[border-color,box-shadow] duration-300",
    `iq-quiz-stage--${quizLayoutProfileForQuestion(question)}`,
    celebrating ? "overflow-visible" : "",
    showSuccessXp && isMissionSurface ? "pt-14 sm:pt-16" : "",
    isFocus
      ? "relative rounded-2xl border px-5 py-9 sm:px-7 sm:py-11"
      : isMissionSurface
        ? "relative rounded-2xl border px-5 py-5 sm:px-6 sm:py-6"
        : "relative rounded-xl border px-4 py-3"
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cardClassName}
      data-quiz-layout={quizLayoutProfileForQuestion(question)}
      data-quiz-kind={question.kind}
      style={{
        borderColor: feedbackBorder,
        background: feedbackBg,
        boxShadow: feedbackShadow
      }}
    >
      {celebrating ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border sm:right-5 sm:top-5"
          initial={{ scale: 0.5, opacity: 0, rotate: -24 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 20 }}
          style={{
            borderColor: GREEN_BORDER,
            background: "rgba(34,197,139,0.18)",
            color: GREEN_HI,
            boxShadow: "0 0 18px rgba(34,197,139,0.36)"
          }}
        >
          <CheckGlyph className="h-5 w-5" />
        </motion.span>
      ) : null}

      {showSuccessXp && successXp != null ? (
        <SchoolsQuizMicroRewardFx
          xp={successXp}
          triggerKey={`${question.id}-correct`}
          variant={isMissionSurface ? "mission" : "default"}
        />
      ) : null}
      {!isFocus && !isMissionSurface ? (
        <div>
          <p
            className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-[10.5px] font-semibold uppercase tracking-[0.22em]"
            style={{
              color: showResult
                ? answeredCorrect
                  ? GREEN_HI
                  : RED_HI
                : GOLD_HI
            }}
          >
            <span>{`Question ${props.index + 1}`}</span>
            <span aria-hidden style={{ opacity: 0.6 }}>
              ·
            </span>
            <span>{kindLabel(question.kind)}</span>
            {showResult ? (
              <>
                <span aria-hidden style={{ opacity: 0.6 }}>
                  ·
                </span>
                <span>{answeredCorrect ? "Correct" : "Not quite"}</span>
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {isMissionSurface ? (
        <QuizMiniGameHeader kind={question.kind} answeredCorrect={answeredCorrect} showResult={!!showResult} />
      ) : null}

      {!usesIntegratedQuizPrompt(question.kind) ? (
        <QuestionPrompt
          question={question}
          hero={isFocus}
          celebrating={showSuccessXp}
          textColor={isMissionSurface ? bodyText : undefined}
          mutedText={isMissionSurface ? mutedText : undefined}
          missionSurface={isMissionSurface}
        />
      ) : null}

      <div
        className={
          isFocus
            ? "mt-9"
            : isMissionSurface
              ? question.kind === "true-false"
                ? "mt-3"
                : question.kind === "fill-blank"
                  ? "mt-4"
                  : question.kind === "odd-one-out" || question.kind === "order"
                    ? "mt-2"
                    : "mt-5"
              : "mt-3"
        }
      >
        <QuestionInput
          {...props}
          premium={isFocus || isMissionSurface}
          missionSurface={isMissionSurface}
        />
      </div>

      {(isReview || showFeedback) && question.explain ? (
        <QuizExplanationCallout
          explain={question.explain}
          answeredCorrect={!!answeredCorrect}
          isFocus={isFocus}
          isMissionSurface={isMissionSurface}
        />
      ) : null}
    </div>
  );
}

function QuizMiniGameHeader({
  kind,
  answeredCorrect,
  showResult
}: {
  kind: QuizQuestion["kind"];
  answeredCorrect: boolean;
  showResult: boolean;
}) {
  const layout = quizLayoutProfileForKind(kind);
  return (
    <div className={`iq-quiz-minigame-header iq-quiz-minigame-header--${layout}`}>
      <p className="iq-quiz-minigame-header__badge">{kindBadgeIcon(kind)} {kindLabel(kind)}</p>
      <p className="iq-quiz-minigame-header__hint">{kindInstruction(kind)}</p>
      {showResult ? (
        <p
          className="iq-quiz-minigame-header__result"
          style={{ color: answeredCorrect ? GREEN_HI : RED_HI }}
        >
          {answeredCorrect ? "Nice — locked in." : "Not quite — read the explanation."}
        </p>
      ) : null}
    </div>
  );
}

function kindBadgeIcon(kind: QuizQuestion["kind"]): string {
  switch (kind) {
    case "multiple-choice":
      return "🎯";
    case "true-false":
      return "⚖️";
    case "fill-blank":
      return "🧩";
    case "odd-one-out":
      return "🔍";
    case "order":
      return "📊";
    case "match":
      return "🔗";
    case "scenario":
      return "📋";
    default:
      return "✨";
  }
}

function stripTrueFalseDisplayPrompt(prompt: string): string {
  return prompt.replace(/^(true or false|t\s*\/\s*f)\s*:?\s*/i, "").trim();
}

function embeddedQuizStem(prompt: string): string {
  const parts = prompt.split("\n\n").map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? prompt;
  return parts.slice(1).join(" ");
}

function QuizExplanationCallout({
  explain,
  answeredCorrect,
  isFocus,
  isMissionSurface
}: {
  explain: string;
  answeredCorrect: boolean;
  isFocus: boolean;
  isMissionSurface: boolean;
}) {
  const heading = answeredCorrect
    ? "Why this is correct"
    : "Why this isn't quite right";
  const tone = answeredCorrect ? "correct" : "wrong";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: "easeOut" }}
      className={[
        "iq-quiz-explanation",
        `iq-quiz-explanation--${tone}`,
        isMissionSurface ? "iq-quiz-explanation--mission" : "iq-quiz-explanation--dark",
        isFocus ? "iq-quiz-explanation--focus" : "iq-quiz-explanation--compact"
      ].join(" ")}
      role="note"
      aria-label={heading}
    >
      <p className="iq-quiz-explanation__heading">
        <span className="iq-quiz-explanation__icon" aria-hidden>
          {answeredCorrect ? "✅" : "💡"}
        </span>
        {heading}
      </p>
      <p className="iq-quiz-explanation__body">{explain}</p>
    </motion.div>
  );
}

/**
 * Renders the question prompt with optional kind-specific framing.
 * - `scenario` gets a callout card to feel like "an investor brief".
 * - `fill-blank` shows the question stem only — answer goes in a Best Answer drop zone.
 * - Everything else uses a plain prompt line.
 */
function formatQuizPrompt(question: QuizQuestion): string {
  if (question.kind !== "true-false") return question.prompt;
  return stripTrueFalseDisplayPrompt(question.prompt);
}

function QuestionPrompt({
  question,
  hero = false,
  celebrating = false,
  textColor,
  mutedText,
  missionSurface = false
}: {
  question: QuizQuestion;
  hero?: boolean;
  celebrating?: boolean;
  textColor?: string;
  mutedText?: string;
  missionSurface?: boolean;
}) {
  if (hero) {
    const promptContent =
      question.kind === "fill-blank"
        ? stripFillBlankDisplayPrompt(question.prompt)
        : formatQuizPrompt(question);
    return (
      <p
        className={[
          "font-[var(--font-grotesk)] font-semibold leading-[1.35] tracking-[-0.01em]",
          textColor ? "" : "text-ink-0",
          "text-[clamp(1.25rem,2.4vw,1.75rem)]",
          celebrating ? "px-2 pt-1" : "px-1 py-1"
        ].join(" ")}
        style={textColor ? { color: textColor } : undefined}
      >
        {promptContent}
      </p>
    );
  }
  if (question.kind === "scenario") {
    return (
      <div
        className="mt-1 rounded-2xl border px-4 py-3"
        style={{
          borderColor: missionSurface ? "rgba(202, 138, 4, 0.42)" : GOLD_BORDER,
          background: missionSurface
            ? "rgba(255, 255, 255, 0.62)"
            : "linear-gradient(135deg, rgba(245,197,71,0.12) 0%, rgba(245,197,71,0.04) 100%)",
          boxShadow: missionSurface
            ? "inset 0 1px 0 rgba(255,255,255,0.72)"
            : "inset 0 0 0 1px rgba(245,197,71,0.08)"
        }}
      >
        <p
          className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: missionSurface ? MISSION_HEADING : GOLD_HI }}
        >
          <SparkleGlyphSmall className="h-3 w-3" />
          Scenario
        </p>
        <p
          className="text-[15px] font-semibold leading-relaxed"
          style={{ color: textColor ?? (missionSurface ? MISSION_BODY : undefined) }}
        >
          {question.prompt}
        </p>
      </div>
    );
  }
  if (question.kind === "fill-blank") {
    return (
      <p
        className={[
          "mt-1 text-[15px] font-semibold leading-relaxed",
          missionSurface ? "" : "text-ink-0"
        ].join(" ")}
        style={textColor ? { color: textColor } : undefined}
      >
        {stripFillBlankDisplayPrompt(question.prompt)}
      </p>
    );
  }
  return (
    <p
      className={[
        "mt-1 text-[15px] font-semibold leading-relaxed",
        missionSurface ? "" : "text-ink-0"
      ].join(" ")}
      style={textColor ? { color: textColor } : undefined}
    >
      {question.prompt}
    </p>
  );
}

const FILL_BLANK_PLACEHOLDER = /_{3,}/g;

/** Show the question only — blanks and "complete the sentence" framing stay out of the UI. */
function stripFillBlankDisplayPrompt(prompt: string): string {
  const withoutFraming = prompt
    .replace(/^Complete the sentence:\s*\n?/i, "")
    .replace(/\n\nBest answer: _+/gi, "")
    .trim();

  const withoutBlanks = withoutFraming
    .replace(FILL_BLANK_PLACEHOLDER, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([?.!,])/g, "$1")
    .trim();

  if (withoutBlanks) return withoutBlanks;

  const firstLine = prompt.split("\n")[0]?.trim() ?? prompt;
  return firstLine.replace(FILL_BLANK_PLACEHOLDER, "").trim() || prompt;
}

function kindLabel(kind: QuizQuestion["kind"]): string {
  switch (kind) {
    case "multiple-choice":
      return "Multiple choice";
    case "scenario":
      return "Quick scenario";
    case "odd-one-out":
      return "Pick the odd one out";
    case "red-flag":
      return "Spot the red flag";
    case "fill-blank":
      return "Pick the best answer";
    case "true-false":
      return "True or false";
    case "match":
      return "Match the concept";
    case "order":
      return "Order the steps";
    case "bull-bear":
      return "Bull vs bear";
    case "risk-meter":
      return "Risk meter";
    case "swipe-cards":
      return "Good sign / warning sign";
  }
}

function kindInstruction(kind: QuizQuestion["kind"]): string {
  switch (kind) {
    case "multiple-choice":
      return "Choose the best answer below.";
    case "scenario":
      return "Read the scenario, then pick your call.";
    case "odd-one-out":
      return "Tap the one that doesn't belong.";
    case "red-flag":
      return "Flag the warning sign.";
    case "fill-blank":
      return "Drag the correct answer into Best Answer (or tap a choice).";
    case "true-false":
      return "Decide if the statement is true or false.";
    case "match":
      return "Match each concept on the left.";
    case "order":
      return "Put the steps in the right order.";
    case "bull-bear":
      return "Pick the stronger side of the argument.";
    case "risk-meter":
      return "Slide to where this risk feels.";
    case "swipe-cards":
      return "Sort each card as a good sign or warning sign.";
  }
}

// ---------------------------------------------------------------------------
// Dispatch on question kind
// ---------------------------------------------------------------------------

function QuestionInput(
  props: QuizQuestionViewProps & { premium?: boolean; missionSurface?: boolean }
) {
  const { question } = props;
  switch (question.kind) {
    case "multiple-choice":
      return <IndexChoiceInput {...props} question={question} />;
    case "scenario":
      return <ScenarioInput {...props} question={question} />;
    case "odd-one-out":
      return <OddOneOutInput {...props} question={question} />;
    case "red-flag":
      return <RedFlagInput {...props} question={question} />;
    case "fill-blank":
      return <FillBlankBestAnswerInput {...props} question={question} />;
    case "true-false":
      return <TrueFalseInput {...props} question={question} />;
    case "match":
      return <MatchInput {...props} question={question} />;
    case "order":
      return (
        <OrderInput
          {...props}
          question={question}
          showStepFeedback={props.showFeedback ?? props.mode === "review"}
          missionSurface={props.missionSurface}
        />
      );
    case "bull-bear":
      return <BullBearInput {...props} question={question} />;
    case "risk-meter":
      return <RiskMeterInput {...props} question={question} />;
    case "swipe-cards":
      return <SwipeCardsInput {...props} question={question} />;
  }
}

// ---------------------------------------------------------------------------
// Multiple choice — the baseline vertical radio list
// ---------------------------------------------------------------------------

function IndexChoiceInput({
  question,
  value,
  onChange,
  mode,
  premium = false,
  missionSurface = false
}: QuizQuestionViewProps & {
  question: MultipleChoiceQuestion;
  premium?: boolean;
  missionSurface?: boolean;
}) {
  const list = question.choices;
  const selected = typeof value === "number" ? value : null;
  const correctIndex = question.correctIndex;
  return (
    <div className={premium ? "iq-quiz-mc-list iq-quiz-mc-list--premium" : "iq-quiz-mc-list"}>
      {list.map((label, idx) => {
        const isSelected = selected === idx;
        const isCorrectChoice = mode === "review" && idx === correctIndex;
        const isWrongChoice =
          mode === "review" && isSelected && idx !== correctIndex;
        const missionChoiceClass = missionSurface
          ? [
              "iq-schools-quiz-choice",
              isSelected && mode === "input" ? "iq-schools-quiz-choice--selected" : "",
              isCorrectChoice ? "iq-schools-quiz-choice--review-correct" : "",
              isWrongChoice ? "iq-schools-quiz-choice--review-wrong" : ""
            ]
              .filter(Boolean)
              .join(" ")
          : "";
        return (
          <label
            key={idx}
            className={[
              "flex items-center gap-4 border text-left leading-snug transition focus-within:ring-2 focus-within:ring-amber-400/65",
              mode === "review" ? "cursor-default" : "cursor-pointer",
              premium
                ? "min-h-[3.75rem] rounded-2xl px-5 py-4 text-[15px] font-medium"
                : missionSurface
                  ? "min-h-[3.25rem] rounded-xl px-4 py-3 text-[14.5px] font-medium"
                  : "rounded-lg px-3 py-2 text-[13.5px]",
              missionChoiceClass
            ].join(" ")}
            style={choiceStyle({
              isSelected,
              isCorrectChoice,
              isWrongChoice,
              mode,
              premium,
              missionSurface
            })}
          >
            <input
              type="radio"
              name={question.id}
              value={idx}
              checked={isSelected}
              disabled={mode === "review"}
              onChange={() => onChange(idx)}
              className="sr-only"
            />
            <span
              aria-hidden
              className="iq-quiz-mc-letter inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              style={radioDotStyle({
                isSelected,
                isCorrectChoice,
                isWrongChoice,
                mode,
                missionSurface
              })}
            >
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="flex-1">{label}</span>
            {mode === "review" && isCorrectChoice ? (
              <CheckGlyph className="h-3.5 w-3.5" style={{ color: GREEN_HI }} />
            ) : mode === "review" && isWrongChoice ? (
              <CrossGlyph className="h-3.5 w-3.5" style={{ color: RED_HI }} />
            ) : null}
          </label>
        );
      })}
    </div>
  );
}


// ---------------------------------------------------------------------------
// Fill in the blank — Best Answer drop zone + draggable choice chips
// ---------------------------------------------------------------------------

function FillBlankBestAnswerInput({
  question,
  value,
  onChange,
  mode,
  premium = false,
  missionSurface = false
}: QuizQuestionViewProps & {
  question: FillBlankQuestion;
  premium?: boolean;
  missionSurface?: boolean;
}) {
  const selected = typeof value === "number" ? value : null;
  const [dragOver, setDragOver] = useState(false);
  const correctIndex = question.correctIndex;
  const selectedLabel =
    selected != null ? question.options[selected] ?? null : null;
  const zoneCorrect = mode === "review" && selected === correctIndex;
  const zoneWrong =
    mode === "review" && selected != null && selected !== correctIndex;

  const selectOption = (idx: number) => {
    if (mode === "review") return;
    onChange(idx);
  };

  const zoneBorder = dragOver
    ? missionSurface
      ? "rgba(202, 138, 4, 0.72)"
      : GOLD_BORDER
    : zoneCorrect
      ? GREEN_BORDER
      : zoneWrong
        ? RED_BORDER
        : selectedLabel
          ? missionSurface
            ? "rgba(202, 138, 4, 0.55)"
            : GOLD_BORDER
          : missionSurface
            ? "rgba(202, 138, 4, 0.38)"
            : "rgba(255,255,255,0.14)";

  const zoneBackground = zoneCorrect
    ? "rgba(34,197,139,0.10)"
    : zoneWrong
      ? "rgba(244,120,120,0.08)"
      : selectedLabel
        ? missionSurface
          ? "rgba(255,255,255,0.72)"
          : "rgba(245,197,71,0.08)"
        : missionSurface
          ? "rgba(255,255,255,0.42)"
          : "rgba(255,255,255,0.03)";

  return (
    <div className={premium ? "iq-quiz-fb-layout iq-quiz-fb-layout--premium" : "iq-quiz-fb-layout"}>
      <div className="iq-quiz-fb-dropzone-wrap">
        <p
          className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: missionSurface ? MISSION_LABEL : "rgba(245,197,71,0.75)" }}
        >
          Best Answer
        </p>
        <div
          role="button"
          tabIndex={mode === "input" ? 0 : -1}
          aria-label={
            selectedLabel
              ? `Best answer: ${selectedLabel}`
              : "Drag the correct answer here"
          }
          onDragOver={(event) => {
            if (mode === "review") return;
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            if (mode === "review") return;
            event.preventDefault();
            setDragOver(false);
            const idx = Number(event.dataTransfer.getData("text/plain"));
            if (!Number.isNaN(idx)) selectOption(idx);
          }}
          className={[
            "min-h-[4.5rem] rounded-2xl border px-4 py-4 text-left transition",
            premium ? "sm:min-h-[5rem] sm:px-5 sm:py-5" : ""
          ].join(" ")}
          style={{
            borderColor: zoneBorder,
            background: zoneBackground,
            boxShadow: dragOver
              ? `0 0 28px -6px ${missionSurface ? "rgba(251,191,36,0.45)" : GOLD_GLOW}`
              : zoneCorrect
                ? "0 0 24px -8px rgba(34,197,139,0.45)"
                : undefined
          }}
        >
          {selectedLabel ? (
            <p
              className={[
                "font-medium leading-snug",
                premium ? "text-[15px] sm:text-[16px]" : "text-[14.5px]"
              ].join(" ")}
              style={{
                color: zoneCorrect
                  ? GREEN_HI
                  : zoneWrong
                    ? RED_HI
                    : missionSurface
                      ? MISSION_BODY
                      : "rgb(235 235 245)"
              }}
            >
              {selectedLabel}
            </p>
          ) : (
            <p
              className={[
                "font-medium leading-snug",
                premium ? "text-[14.5px]" : "text-[13.5px]"
              ].join(" ")}
              style={{
                color: missionSurface ? MISSION_MUTED : "rgba(210,210,225,0.72)"
              }}
            >
              Drag the correct answer here
            </p>
          )}
        </div>
      </div>

      <div className="iq-quiz-fb-chips">
        {question.options.map((label, idx) => {
          const isSelected = selected === idx;
          const isCorrectChoice = mode === "review" && idx === correctIndex;
          const isWrongChoice =
            mode === "review" && isSelected && idx !== correctIndex;
          const missionChoiceClass = missionSurface
            ? [
                "iq-schools-quiz-choice",
                isSelected && mode === "input" ? "iq-schools-quiz-choice--selected" : "",
                isCorrectChoice ? "iq-schools-quiz-choice--review-correct" : "",
                isWrongChoice ? "iq-schools-quiz-choice--review-wrong" : ""
              ]
                .filter(Boolean)
                .join(" ")
            : "";

          return (
            <div
              key={idx}
              role="button"
              tabIndex={mode === "input" ? 0 : -1}
              draggable={mode === "input"}
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", String(idx));
                event.dataTransfer.effectAllowed = "move";
              }}
              onClick={() => selectOption(idx)}
              onKeyDown={(event) => {
                if (mode === "review") return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectOption(idx);
                }
              }}
              className={[
                "iq-quiz-fb-chip inline-flex max-w-full items-center border text-left leading-snug transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65",
                mode === "review" ? "cursor-default" : "cursor-grab active:cursor-grabbing",
                premium ? "rounded-full px-4 py-2.5 text-[14.5px] font-medium" : "rounded-full px-3.5 py-2 text-[13.5px] font-medium",
                missionChoiceClass
              ].join(" ")}
              style={choiceStyle({
                isSelected,
                isCorrectChoice,
                isWrongChoice,
                mode,
                premium,
                missionSurface
              })}
            >
              <span className="flex-1">{label}</span>
              {mode === "review" && isCorrectChoice ? (
                <CheckGlyph className="h-3.5 w-3.5" style={{ color: GREEN_HI }} />
              ) : mode === "review" && isWrongChoice ? (
                <CrossGlyph className="h-3.5 w-3.5" style={{ color: RED_HI }} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// True / False — large side-by-side decision buttons
// ---------------------------------------------------------------------------

function TrueFalseInput({
  question,
  value,
  onChange,
  mode,
  premium = false,
  missionSurface = false
}: QuizQuestionViewProps & {
  question: TrueFalseQuestion;
  premium?: boolean;
  missionSurface?: boolean;
}) {
  const selected = typeof value === "boolean" ? value : null;
  const statement = stripTrueFalseDisplayPrompt(question.prompt);
  const options: { label: string; sub: string; bool: boolean }[] = [
    { label: "TRUE", sub: "Yes, that's right", bool: true },
    { label: "FALSE", sub: "No, that's off", bool: false }
  ];
  return (
    <div className="iq-quiz-tf-layout">
      <div className="iq-quiz-tf-statement">
        <p className="iq-quiz-tf-statement__label">Statement</p>
        <p className="iq-quiz-tf-statement__text">{statement}</p>
      </div>
      <div className="iq-quiz-tf-split grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {options.map((opt) => {
        const isSelected = selected === opt.bool;
        const isCorrectChoice = mode === "review" && opt.bool === question.correct;
        const isWrongChoice =
          mode === "review" && isSelected && opt.bool !== question.correct;
        const missionChoiceClass = missionSurface
          ? [
              "iq-schools-quiz-choice",
              isSelected && mode === "input" ? "iq-schools-quiz-choice--selected" : "",
              isCorrectChoice ? "iq-schools-quiz-choice--review-correct" : "",
              isWrongChoice ? "iq-schools-quiz-choice--review-wrong" : ""
            ]
              .filter(Boolean)
              .join(" ")
          : "";
        return (
          <motion.button
            key={opt.label}
            type="button"
            disabled={mode === "review"}
            onClick={() => onChange(opt.bool)}
            whileHover={mode === "review" ? undefined : { y: -2 }}
            whileTap={mode === "review" ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className={[
              "relative flex flex-col items-center justify-center gap-2 border p-5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65",
              premium ? "min-h-[124px] rounded-2xl" : "min-h-[112px] rounded-2xl",
              missionSurface ? "iq-quiz-tf-split__btn" : "",
              missionChoiceClass
            ].join(" ")}
            style={choiceStyle({
              isSelected,
              isCorrectChoice,
              isWrongChoice,
              mode,
              premium,
              isFalseOption: opt.bool === false,
              missionSurface
            })}
          >
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                border: `1px solid ${
                  isCorrectChoice
                    ? GREEN_BORDER
                    : isWrongChoice
                    ? RED_BORDER
                    : isSelected
                    ? missionSurface
                      ? "rgba(180, 83, 9, 0.55)"
                      : "rgba(245,197,71,0.55)"
                    : missionSurface
                      ? "rgba(202, 138, 4, 0.42)"
                      : opt.bool === false
                        ? "rgba(245,197,71,0.36)"
                        : "rgba(245,197,71,0.30)"
                }`,
                background: isCorrectChoice
                  ? "rgba(34,197,139,0.18)"
                  : isWrongChoice
                  ? "rgba(244,120,120,0.18)"
                  : isSelected
                  ? missionSurface
                    ? "rgba(251, 191, 36, 0.28)"
                    : "rgba(245,197,71,0.18)"
                  : missionSurface
                    ? "rgba(255,255,255,0.72)"
                    : "rgba(255,255,255,0.04)",
                color: isCorrectChoice
                  ? GREEN_HI
                  : isWrongChoice
                  ? RED_HI
                  : isSelected
                  ? missionSurface
                    ? "#451a03"
                    : GOLD_HI
                  : missionSurface
                    ? MISSION_HEADING
                    : "rgba(245,197,71,0.55)"
              }}
            >
              {opt.bool ? (
                <CheckGlyph className="h-4 w-4" />
              ) : (
                <CrossGlyph className="h-4 w-4" />
              )}
            </span>
            <span
              className="text-[20px] font-bold tracking-[0.14em]"
              style={{
                color: isCorrectChoice
                  ? missionSurface
                    ? "#15803d"
                    : GREEN_HI
                  : isWrongChoice
                  ? missionSurface
                    ? "#b45309"
                    : RED_HI
                  : isSelected
                  ? missionSurface
                    ? "#451a03"
                    : "#fff"
                  : missionSurface
                    ? MISSION_BODY
                    : opt.bool === false
                      ? "rgba(245,197,71,0.92)"
                      : "rgba(245,197,71,0.85)"
              }}
            >
              {opt.label}
            </span>
            <span
              className="text-[10.5px] uppercase tracking-[0.18em]"
              style={{
                color: missionSurface ? MISSION_LABEL : "rgba(220,220,232,0.55)"
              }}
            >
              {opt.sub}
            </span>
          </motion.button>
        );
      })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pick the odd one out — 2×2 (or 1×N) card grid with strike-through on pick
// ---------------------------------------------------------------------------

function OddOneOutInput({
  question,
  value,
  onChange,
  mode,
  missionSurface = false
}: QuizQuestionViewProps & {
  question: OddOneOutQuestion;
  missionSurface?: boolean;
}) {
  const selected = typeof value === "number" ? value : null;
  const n = question.choices.length;
  const stem = embeddedQuizStem(question.prompt);
  const gridCols =
    n === 4
      ? "grid-cols-2"
      : n === 3
      ? "grid-cols-3"
      : n === 6
      ? "grid-cols-3"
      : "grid-cols-2";
  return (
    <div className="iq-quiz-ooo-layout">
      <p
        className="iq-quiz-ooo-stem"
        style={{ color: missionSurface ? MISSION_BODY : "rgb(235 235 245)" }}
      >
        {stem}
      </p>
      <div className={`grid ${gridCols} gap-3`}>
        {question.choices.map((label, idx) => {
          const isSelected = selected === idx;
          const isCorrectPick = mode === "review" && idx === question.oddIndex;
          const isWrongPick =
            mode === "review" && isSelected && idx !== question.oddIndex;
          const struck =
            isSelected || isCorrectPick;
          const missionChoiceClass = missionSurface
            ? [
                "iq-schools-quiz-choice",
                isSelected && mode === "input" ? "iq-schools-quiz-choice--selected" : "",
                isCorrectPick ? "iq-schools-quiz-choice--review-correct" : "",
                isWrongPick ? "iq-schools-quiz-choice--review-wrong" : ""
              ]
                .filter(Boolean)
                .join(" ")
            : "";
          return (
            <motion.button
              key={idx}
              type="button"
              disabled={mode === "review"}
              onClick={() => onChange(idx)}
              whileHover={mode === "review" ? undefined : { y: -2 }}
              whileTap={mode === "review" ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={[
                "relative flex min-h-[84px] items-center justify-center rounded-2xl border p-3 text-center text-[14px] leading-snug transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65",
                missionChoiceClass
              ].join(" ")}
              style={choiceStyle({
                isSelected,
                isCorrectChoice: isCorrectPick,
                isWrongChoice: isWrongPick,
                mode,
                missionSurface
              })}
            >
              <span
                className="relative inline-flex items-center"
                style={{
                  textDecoration: struck ? "line-through" : "none",
                  textDecorationThickness: struck ? "2px" : undefined,
                  textDecorationColor: isCorrectPick
                    ? GREEN_HI
                    : isWrongPick
                    ? RED_HI
                    : isSelected
                    ? GOLD_HI
                    : undefined
                }}
              >
                {label}
              </span>
              {mode === "review" && isCorrectPick ? (
                <span
                  aria-hidden
                  className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(34,197,139,0.22)",
                    color: GREEN_HI
                  }}
                >
                  <CheckGlyph className="h-2.5 w-2.5" />
                </span>
              ) : mode === "review" && isWrongPick ? (
                <span
                  aria-hidden
                  className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(244,120,120,0.22)",
                    color: RED_HI
                  }}
                >
                  <CrossGlyph className="h-2.5 w-2.5" />
                </span>
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Spot the red flag — statement cards, the picked one glows red
// ---------------------------------------------------------------------------

function RedFlagInput({
  question,
  value,
  onChange,
  mode
}: QuizQuestionViewProps & { question: RedFlagQuestion }) {
  const selected = typeof value === "number" ? value : null;
  return (
    <div>
      <p
        className="mb-2 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "rgba(244,120,120,0.85)" }}
      >
        <WarningGlyph className="h-3 w-3" />
        Flag the one warning sign
      </p>
      <div className="grid gap-2">
        {question.choices.map((label, idx) => {
          const isSelected = selected === idx;
          const isCorrectPick =
            mode === "review" && idx === question.flagIndex;
          const isWrongPick =
            mode === "review" && isSelected && idx !== question.flagIndex;
          const showWarning = isSelected || isCorrectPick;
          const tone = isCorrectPick
            ? "ok"
            : isWrongPick
            ? "bad"
            : isSelected && mode === "input"
            ? "flag"
            : "neutral";
          const borderColor =
            tone === "ok"
              ? GREEN_BORDER
              : tone === "bad"
              ? RED_BORDER
              : tone === "flag"
              ? RED_BORDER
              : GOLD_BORDER_SOFT;
          const bg =
            tone === "ok"
              ? "rgba(34,197,139,0.10)"
              : tone === "bad"
              ? "rgba(244,120,120,0.10)"
              : tone === "flag"
              ? "rgba(244,120,120,0.08)"
              : "rgba(255,255,255,0.02)";
          const glow =
            tone === "flag"
              ? "0 0 18px -4px rgba(244,120,120,0.45)"
              : tone === "ok"
              ? "0 0 18px -4px rgba(34,197,139,0.55)"
              : tone === "bad"
              ? "0 0 18px -4px rgba(244,120,120,0.45)"
              : "none";
          return (
            <motion.button
              key={idx}
              type="button"
              disabled={mode === "review"}
              onClick={() => onChange(idx)}
              whileHover={mode === "review" ? undefined : { y: -1 }}
              whileTap={mode === "review" ? undefined : { scale: 0.99 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[13.5px] leading-snug transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65"
              style={{
                borderColor,
                background: bg,
                color:
                  mode === "review"
                    ? "rgb(225 225 235)"
                    : isSelected
                    ? "#fff"
                    : "rgb(210 210 225)",
                cursor: mode === "review" ? "default" : "pointer",
                boxShadow: glow
              }}
            >
              <span
                aria-hidden
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{
                  border: `1px solid ${
                    showWarning
                      ? tone === "ok"
                        ? GREEN_BORDER
                        : RED_BORDER
                      : "rgba(245,197,71,0.25)"
                  }`,
                  background: showWarning
                    ? tone === "ok"
                      ? "rgba(34,197,139,0.18)"
                      : "rgba(244,120,120,0.18)"
                    : "rgba(255,255,255,0.03)",
                  color: showWarning
                    ? tone === "ok"
                      ? GREEN_HI
                      : RED_HI
                    : "rgba(245,197,71,0.65)"
                }}
              >
                {showWarning ? (
                  <WarningGlyph className="h-3 w-3" />
                ) : (
                  <span className="text-[10px]">{idx + 1}</span>
                )}
              </span>
              <span className="flex-1">{label}</span>
              {mode === "review" && isCorrectPick ? (
                <span
                  className="rounded-full border px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.16em]"
                  style={{
                    borderColor: GREEN_BORDER,
                    background: "rgba(34,197,139,0.16)",
                    color: GREEN_HI
                  }}
                >
                  Red flag
                </span>
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick scenario — scenario callout + decision rows
// ---------------------------------------------------------------------------

function ScenarioInput({
  question,
  value,
  onChange,
  mode,
  premium = false,
  missionSurface = false
}: QuizQuestionViewProps & {
  question: ScenarioQuestion;
  premium?: boolean;
  missionSurface?: boolean;
}) {
  const selected = typeof value === "number" ? value : null;
  return (
    <div className={premium ? "grid gap-3" : "grid gap-2"}>
      {question.choices.map((label, idx) => {
        const isSelected = selected === idx;
        const isCorrectChoice =
          mode === "review" && idx === question.correctIndex;
        const isWrongChoice =
          mode === "review" && isSelected && idx !== question.correctIndex;
        const missionChoiceClass = missionSurface
          ? [
              "iq-schools-quiz-choice",
              isSelected && mode === "input" ? "iq-schools-quiz-choice--selected" : "",
              isCorrectChoice ? "iq-schools-quiz-choice--review-correct" : "",
              isWrongChoice ? "iq-schools-quiz-choice--review-wrong" : ""
            ]
              .filter(Boolean)
              .join(" ")
          : "";
        return (
          <motion.button
            key={idx}
            type="button"
            disabled={mode === "review"}
            onClick={() => onChange(idx)}
            whileHover={mode === "review" ? undefined : { y: -1 }}
            whileTap={mode === "review" ? undefined : { scale: 0.99 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className={[
              "group flex items-center gap-4 border text-left leading-snug transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65",
              premium
                ? "min-h-[3.75rem] rounded-2xl px-5 py-4 text-[15px] font-medium"
                : missionSurface
                  ? "min-h-[3.25rem] rounded-xl px-4 py-3 text-[14.5px] font-medium"
                  : "rounded-xl px-3.5 py-3 text-[13.5px]",
              missionChoiceClass
            ].join(" ")}
            style={choiceStyle({
              isSelected,
              isCorrectChoice,
              isWrongChoice,
              mode,
              premium,
              missionSurface
            })}
          >
              <span
                aria-hidden
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                style={{
                  border: `1px solid ${
                    isCorrectChoice
                      ? GREEN_BORDER
                      : isWrongChoice
                      ? RED_BORDER
                      : isSelected
                      ? "rgba(245,197,71,0.55)"
                      : "rgba(245,197,71,0.30)"
                  }`,
                  background: isCorrectChoice
                    ? "rgba(34,197,139,0.18)"
                    : isWrongChoice
                    ? "rgba(244,120,120,0.18)"
                    : isSelected
                    ? "rgba(245,197,71,0.18)"
                    : "rgba(255,255,255,0.03)",
                  color: isCorrectChoice
                    ? GREEN_HI
                    : isWrongChoice
                    ? RED_HI
                    : GOLD_HI
                }}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{label}</span>
              <span
                aria-hidden
                className="text-[14px] transition-transform group-hover:translate-x-0.5"
                style={{
                  color: isCorrectChoice
                    ? GREEN_HI
                    : isWrongChoice
                    ? RED_HI
                    : isSelected
                    ? GOLD_HI
                    : "rgba(245,197,71,0.45)"
                }}
              >
                ›
              </span>
            </motion.button>
          );
        })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Match
// ---------------------------------------------------------------------------

function MatchInput({
  question,
  value,
  onChange,
  mode,
  missionSurface = false
}: QuizQuestionViewProps & {
  question: MatchQuestion;
  missionSurface?: boolean;
}) {
  const pairs = question.pairs;
  // Permutation of right indices for *display*: rightOrder[i] = original right idx
  const rightOrder = shuffleIndices(pairs.length, question.id, "right");
  const current: (number | null)[] = Array.isArray(value)
    ? (value as (number | null)[])
    : pairs.map(() => null);

  function pickFor(leftIdx: number, originalRightIdx: number) {
    if (mode === "review") return;
    const next = pairs.map(
      (_, i) => (current[i] ?? null) as number | null
    );
    // If the user picks a right that's already chosen elsewhere, clear that slot.
    for (let i = 0; i < next.length; i++) {
      if (i !== leftIdx && next[i] === originalRightIdx) next[i] = null;
    }
    next[leftIdx] = originalRightIdx;
    onChange(next);
  }

  return (
    <div className="grid gap-3">
      {pairs.map((pair, leftIdx) => {
        const picked = current[leftIdx];
        const userCorrect = picked === leftIdx;
        return (
          <div
            key={leftIdx}
            className="rounded-lg border px-3 py-2.5"
            style={{
              borderColor:
                mode === "review"
                  ? userCorrect
                    ? GREEN_BORDER
                    : RED_BORDER
                  : missionSurface
                    ? "rgba(202, 138, 4, 0.35)"
                    : GOLD_BORDER_SOFT,
              background:
                mode === "review"
                  ? userCorrect
                    ? missionSurface
                      ? "rgba(34,197,139,0.12)"
                      : "rgba(34,197,139,0.06)"
                    : missionSurface
                      ? "rgba(244,120,120,0.10)"
                      : "rgba(244,120,120,0.05)"
                  : missionSurface
                    ? "rgba(255,255,255,0.62)"
                    : "rgba(255,255,255,0.015)"
            }}
          >
            <div
              className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: missionSurface ? MISSION_HEADING : GOLD_HI }}
            >
              <span>{pair.left}</span>
              {mode === "review" ? (
                userCorrect ? (
                  <CheckGlyph className="h-3 w-3" style={{ color: GREEN_HI }} />
                ) : (
                  <CrossGlyph className="h-3 w-3" style={{ color: RED_HI }} />
                )
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {rightOrder.map((origIdx) => {
                const isPicked = picked === origIdx;
                const isCorrectChoice =
                  mode === "review" && origIdx === leftIdx;
                const isWrongPick =
                  mode === "review" && isPicked && origIdx !== leftIdx;
                return (
                  <button
                    key={origIdx}
                    type="button"
                    disabled={mode === "review"}
                    onClick={() => pickFor(leftIdx, origIdx)}
                    className={[
                      "rounded-full border px-3 py-1.5 text-[12.5px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65",
                      missionSurface ? "iq-schools-quiz-choice min-h-[2.25rem] px-4 text-[13px]" : "",
                      missionSurface && isPicked && mode === "input"
                        ? "iq-schools-quiz-choice--selected"
                        : "",
                      missionSurface && isCorrectChoice
                        ? "iq-schools-quiz-choice--review-correct"
                        : "",
                      missionSurface && isWrongPick
                        ? "iq-schools-quiz-choice--review-wrong"
                        : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={choiceStyle({
                      isSelected: isPicked,
                      isCorrectChoice,
                      isWrongChoice: isWrongPick,
                      mode,
                      missionSurface
                    })}
                  >
                    {pairs[origIdx].right}
                  </button>
                );
              })}
            </div>
            {mode === "review" && !userCorrect ? (
              <p
                className="mt-1.5 text-[11.5px]"
                style={{ color: missionSurface ? MISSION_MUTED : "rgb(180 180 200)" }}
              >
                Correct match:{" "}
                <span style={{ color: missionSurface ? "#15803d" : GREEN_HI }}>
                  {pair.right}
                </span>
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order — drag-and-drop reorderable cards (mobile-friendly via pointer events).
// Uses framer-motion's Reorder.Group/Item to get animated FLIP swaps for free.
// ---------------------------------------------------------------------------

function OrderInput({
  question,
  value,
  onChange,
  mode,
  showStepFeedback,
  missionSurface = false
}: QuizQuestionViewProps & {
  question: OrderQuestion;
  showStepFeedback: boolean;
  missionSurface?: boolean;
}) {
  const steps = question.steps;
  const stem = embeddedQuizStem(question.prompt);
  const initialOrder = useMemo(
    () => initialOrderPermutation(question.id, steps.length),
    [question.id, steps.length]
  );

  const [order, setOrder] = useState<number[]>(() => {
    if (Array.isArray(value) && value.length === steps.length) {
      return value as number[];
    }
    return initialOrder;
  });

  useEffect(() => {
    if (Array.isArray(value) && value.length === steps.length) {
      setOrder(value as number[]);
    }
  }, [question.id, steps.length, value]);

  const applyOrder = (next: number[]) => {
    setOrder(next);
    onChange(next);
  };

  const moveStep = (displayIdx: number, direction: -1 | 1) => {
    const target = displayIdx + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    const [item] = next.splice(displayIdx, 1);
    next.splice(target, 0, item);
    applyOrder(next);
  };

  // ----- Review mode: static list with ✓/✗ markers (no drag) -----
  if (mode === "review") {
    return (
      <OrderStepList
        order={order}
        steps={steps}
        showStepFeedback
        interactive={false}
        onMove={() => undefined}
      />
    );
  }

  // ----- Input mode: drag + tap up/down; feedback without locking -----
  return (
    <div className="iq-quiz-order-layout">
      <p
        className="iq-quiz-order-stem"
        style={{ color: missionSurface ? MISSION_BODY : "rgb(235 235 245)" }}
      >
        {stem}
      </p>
      <p
        className="mb-3 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: missionSurface ? MISSION_LABEL : "rgba(245,197,71,0.7)" }}
      >
        <GripGlyph className="h-3 w-3" />
        Drag or use arrows to reorder
      </p>
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={(next) => applyOrder(next as number[])}
        className="grid gap-2"
        as="ol"
      >
        {order.map((origIdx, displayIdx) => (
          <OrderDragItem
            key={origIdx}
            origIdx={origIdx}
            displayIdx={displayIdx}
            label={steps[origIdx]}
            canMoveUp={displayIdx > 0}
            canMoveDown={displayIdx < order.length - 1}
            onMoveUp={() => moveStep(displayIdx, -1)}
            onMoveDown={() => moveStep(displayIdx, 1)}
            inCorrectSpot={showStepFeedback && origIdx === displayIdx}
            inWrongSpot={showStepFeedback && origIdx !== displayIdx}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

function OrderStepList({
  order,
  steps,
  showStepFeedback,
  interactive,
  onMove
}: {
  order: number[];
  steps: string[];
  showStepFeedback: boolean;
  interactive: boolean;
  onMove: (displayIdx: number, direction: -1 | 1) => void;
}) {
  return (
    <ol className="grid gap-2">
      {order.map((origIdx, displayIdx) => {
        const inCorrectSpot = origIdx === displayIdx;
        const showBad = showStepFeedback && !inCorrectSpot;
        const showGood = showStepFeedback && inCorrectSpot;
        return (
          <li
            key={`${origIdx}-${displayIdx}`}
            className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[13.5px] leading-snug"
            style={{
              borderColor: showGood
                ? GREEN_BORDER
                : showBad
                  ? RED_BORDER
                  : GOLD_BORDER_SOFT,
              background: showGood
                ? "rgba(34,197,139,0.05)"
                : showBad
                  ? "rgba(244,120,120,0.05)"
                  : "rgba(255,255,255,0.025)",
              color: "rgb(225 225 235)"
            }}
          >
            <span
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11.5px] font-semibold"
              style={{
                borderColor: showGood
                  ? GREEN_BORDER
                  : showBad
                    ? RED_BORDER
                    : GOLD_BORDER,
                color: showGood ? GREEN_HI : showBad ? RED_HI : GOLD_HI,
                background: showGood
                  ? "rgba(34,197,139,0.12)"
                  : showBad
                    ? "rgba(244,120,120,0.12)"
                    : "rgba(245,197,71,0.10)"
              }}
            >
              {displayIdx + 1}
            </span>
            <span className="flex-1">{steps[origIdx]}</span>
            {interactive ? (
              <OrderMoveButtons
                canMoveUp={displayIdx > 0}
                canMoveDown={displayIdx < order.length - 1}
                onMoveUp={() => onMove(displayIdx, -1)}
                onMoveDown={() => onMove(displayIdx, 1)}
              />
            ) : showGood ? (
              <CheckGlyph className="h-3.5 w-3.5" style={{ color: GREEN_HI }} />
            ) : showBad ? (
              <span className="text-[11px]" style={{ color: "rgb(180 180 200)" }}>
                belongs at step {origIdx + 1}
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function OrderMoveButtons({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown
}: {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-0.5">
      <button
        type="button"
        disabled={!canMoveUp}
        onClick={(e) => {
          e.stopPropagation();
          onMoveUp();
        }}
        aria-label="Move step up"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border text-[13px] font-bold transition enabled:hover:bg-white/5 disabled:opacity-30"
        style={{
          borderColor: GOLD_BORDER_SOFT,
          color: GOLD_HI
        }}
      >
        ↑
      </button>
      <button
        type="button"
        disabled={!canMoveDown}
        onClick={(e) => {
          e.stopPropagation();
          onMoveDown();
        }}
        aria-label="Move step down"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border text-[13px] font-bold transition enabled:hover:bg-white/5 disabled:opacity-30"
        style={{
          borderColor: GOLD_BORDER_SOFT,
          color: GOLD_HI
        }}
      >
        ↓
      </button>
    </div>
  );
}

function OrderDragItem({
  origIdx,
  displayIdx,
  label,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  inCorrectSpot,
  inWrongSpot
}: {
  origIdx: number;
  displayIdx: number;
  label: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  inCorrectSpot: boolean;
  inWrongSpot: boolean;
}) {
  const controls = useDragControls();
  const borderColor = inCorrectSpot
    ? GREEN_BORDER
    : inWrongSpot
      ? RED_BORDER
      : GOLD_BORDER_SOFT;
  const background = inCorrectSpot
    ? "rgba(34,197,139,0.05)"
    : inWrongSpot
      ? "rgba(244,120,120,0.05)"
      : "rgba(255,255,255,0.025)";

  return (
    <Reorder.Item
      value={origIdx}
      as="li"
      dragListener={false}
      dragControls={controls}
      whileDrag={{
        scale: 1.04,
        zIndex: 10,
        boxShadow:
          "0 18px 40px -10px rgba(245,197,71,0.55), 0 0 0 1px rgba(245,197,71,0.55)"
      }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="select-none rounded-xl border px-3 py-2.5 text-[13.5px] leading-snug"
      style={{
        borderColor,
        background,
        color: "rgb(225 225 235)",
        cursor: "grab",
        touchAction: "none",
        listStyle: "none"
      }}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        controls.start(event);
      }}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11.5px] font-semibold"
          style={{
            borderColor: inCorrectSpot
              ? GREEN_BORDER
              : inWrongSpot
                ? RED_BORDER
                : GOLD_BORDER,
            color: inCorrectSpot ? GREEN_HI : inWrongSpot ? RED_HI : GOLD_HI,
            background: inCorrectSpot
              ? "rgba(34,197,139,0.12)"
              : inWrongSpot
                ? "rgba(244,120,120,0.12)"
                : "rgba(245,197,71,0.10)"
          }}
        >
          {displayIdx + 1}
        </span>
        <span className="flex-1">{label}</span>
        <OrderMoveButtons
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
        <span
          aria-hidden
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{
            color: "rgba(245,197,71,0.65)",
            background: "rgba(245,197,71,0.06)"
          }}
        >
          <GripGlyph className="h-3.5 w-3.5" />
        </span>
      </div>
    </Reorder.Item>
  );
}

function GripGlyph({
  className,
  style
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className={className}
      style={style}
    >
      <circle cx="6" cy="4" r="1.1" />
      <circle cx="10" cy="4" r="1.1" />
      <circle cx="6" cy="8" r="1.1" />
      <circle cx="10" cy="8" r="1.1" />
      <circle cx="6" cy="12" r="1.1" />
      <circle cx="10" cy="12" r="1.1" />
    </svg>
  );
}

function BullGlyph({
  className,
  style
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  // Stylised upward trend with a peak (bull = price going up).
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={style}
    >
      <path d="M2 12l4-4 3 3 5-6" />
      <path d="M9 5h5v5" />
    </svg>
  );
}

function BearGlyph({
  className,
  style
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  // Mirrored downward trend (bear = price falling).
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={style}
    >
      <path d="M2 4l4 4 3-3 5 6" />
      <path d="M9 11h5V6" />
    </svg>
  );
}

function RiskGlyph({
  className,
  style
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  // Gauge-style half-arc with needle.
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={style}
    >
      <path d="M2.5 12a5.5 5.5 0 0 1 11 0" />
      <path d="M8 12l3.5-4" />
      <circle cx="8" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

function SwipeGlyph({
  className,
  style
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  // Two-way arrow pair.
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={style}
    >
      <path d="M5 5L2 8l3 3" />
      <path d="M11 5l3 3-3 3" />
      <path d="M2 8h12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Bull vs Bear — two large stance cards with bull/bear iconography
// ---------------------------------------------------------------------------

function BullBearInput({
  question,
  value,
  onChange,
  mode
}: QuizQuestionViewProps & { question: BullBearQuestion }) {
  const selected: "bull" | "bear" | null =
    value === "bull" || value === "bear" ? value : null;
  const labels = question.labels ?? { bull: "Bullish", bear: "Bearish" };
  const subtitles = {
    bull: "Lean in — this is a positive signal.",
    bear: "Lean out — this is a concern."
  };
  const options: Array<{
    key: "bull" | "bear";
    label: string;
    sub: string;
    tone: "good" | "bad";
  }> = [
    { key: "bull", label: labels.bull, sub: subtitles.bull, tone: "good" },
    { key: "bear", label: labels.bear, sub: subtitles.bear, tone: "bad" }
  ];
  return (
    <div>
      {question.caption ? (
        <p
          className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "rgba(245,197,71,0.75)" }}
        >
          {question.caption}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt.key;
          const isCorrectChoice =
            mode === "review" && opt.key === question.correct;
          const isWrongChoice =
            mode === "review" && isSelected && opt.key !== question.correct;
          const accent =
            opt.tone === "good"
              ? { hi: GREEN_HI, border: GREEN_BORDER, fill: "rgba(34,197,139,0.10)", glow: "rgba(34,197,139,0.45)" }
              : { hi: RED_HI, border: RED_BORDER, fill: "rgba(244,120,120,0.10)", glow: "rgba(244,120,120,0.40)" };
          return (
            <motion.button
              key={opt.key}
              type="button"
              disabled={mode === "review"}
              onClick={() => onChange(opt.key)}
              whileHover={mode === "review" ? undefined : { y: -3 }}
              whileTap={mode === "review" ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="relative flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65"
              style={{
                borderColor: isCorrectChoice
                  ? GREEN_BORDER
                  : isWrongChoice
                  ? RED_BORDER
                  : isSelected
                  ? accent.border
                  : GOLD_BORDER_SOFT,
                background: isCorrectChoice
                  ? "rgba(34,197,139,0.14)"
                  : isWrongChoice
                  ? "rgba(244,120,120,0.14)"
                  : isSelected
                  ? accent.fill
                  : "rgba(255,255,255,0.02)",
                color: isSelected || isCorrectChoice ? "#fff" : "rgb(225 225 235)",
                cursor: mode === "review" ? "default" : "pointer",
                boxShadow: isSelected
                  ? `0 18px 40px -16px ${accent.glow}`
                  : "none"
              }}
            >
              <span
                aria-hidden
                className="inline-flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  border: `1px solid ${isSelected || isCorrectChoice ? accent.border : "rgba(245,197,71,0.30)"}`,
                  background: isSelected || isCorrectChoice ? accent.fill : "rgba(255,255,255,0.04)",
                  color: isSelected || isCorrectChoice ? accent.hi : "rgba(245,197,71,0.65)"
                }}
              >
                {opt.key === "bull" ? (
                  <BullGlyph className="h-6 w-6" />
                ) : (
                  <BearGlyph className="h-6 w-6" />
                )}
              </span>
              <span
                className="text-[17px] font-bold tracking-[0.04em]"
                style={{
                  color: isCorrectChoice
                    ? GREEN_HI
                    : isWrongChoice
                    ? RED_HI
                    : isSelected
                    ? "#fff"
                    : "rgb(225 225 235)"
                }}
              >
                {opt.label.toUpperCase()}
              </span>
              <span
                className="text-[11px] leading-tight text-center"
                style={{ color: "rgba(220,220,232,0.65)" }}
              >
                {opt.sub}
              </span>
              {mode === "review" && isCorrectChoice ? (
                <CheckGlyph
                  className="absolute right-2 top-2 h-4 w-4"
                  style={{ color: GREEN_HI }}
                />
              ) : mode === "review" && isWrongChoice ? (
                <CrossGlyph
                  className="absolute right-2 top-2 h-4 w-4"
                  style={{ color: RED_HI }}
                />
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Risk Meter — color-ramped segmented bar (low → critical)
// ---------------------------------------------------------------------------

function RiskMeterInput({
  question,
  value,
  onChange,
  mode
}: QuizQuestionViewProps & { question: RiskMeterQuestion }) {
  const max = question.scaleMax ?? 5;
  const selected = typeof value === "number" ? value : null;
  const labels = question.levelLabels ?? defaultRiskLabels(max);

  // Green → lime → amber → orange → red ramp (interpolated for any max).
  function levelColor(level: number) {
    const ramp = [
      { hi: "#22C58B", glow: "rgba(34,197,139,0.45)" },
      { hi: "#A6D14B", glow: "rgba(166,209,75,0.40)" },
      { hi: "#F2C84B", glow: "rgba(242,200,75,0.40)" },
      { hi: "#F09A4B", glow: "rgba(240,154,75,0.40)" },
      { hi: "#F47878", glow: "rgba(244,120,120,0.45)" }
    ];
    const idx = Math.min(
      ramp.length - 1,
      Math.floor(((level - 1) / Math.max(1, max - 1)) * (ramp.length - 1))
    );
    return ramp[idx];
  }

  return (
    <div>
      <p
        className="mb-2 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "rgba(245,197,71,0.75)" }}
      >
        <RiskGlyph className="h-3 w-3" />
        Set the risk level
      </p>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((level) => {
          const isSelected = selected === level;
          const isCorrectLevel = mode === "review" && level === question.correctLevel;
          const isWrongPick =
            mode === "review" && isSelected && level !== question.correctLevel;
          const colors = levelColor(level);
          return (
            <motion.button
              key={level}
              type="button"
              disabled={mode === "review"}
              onClick={() => onChange(level)}
              whileHover={mode === "review" ? undefined : { y: -2 }}
              whileTap={mode === "review" ? undefined : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              aria-label={`Risk level ${level}: ${labels[level - 1] ?? ""}`}
              className="relative flex min-h-[78px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65"
              style={{
                borderColor: isCorrectLevel
                  ? GREEN_BORDER
                  : isWrongPick
                  ? RED_BORDER
                  : isSelected
                  ? colors.hi
                  : GOLD_BORDER_SOFT,
                background: isSelected
                  ? `${colors.hi}22`
                  : "rgba(255,255,255,0.02)",
                color: isSelected ? "#fff" : "rgba(220,220,232,0.85)",
                cursor: mode === "review" ? "default" : "pointer",
                boxShadow: isSelected ? `0 0 22px -6px ${colors.glow}` : "none"
              }}
            >
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
                style={{
                  background: colors.hi,
                  color: "#0a0a16"
                }}
              >
                {level}
              </span>
              <span
                className="text-[10px] leading-tight uppercase tracking-[0.10em]"
                style={{
                  color: isSelected ? "#fff" : "rgba(220,220,232,0.55)"
                }}
              >
                {labels[level - 1] ?? ""}
              </span>
              {mode === "review" && isCorrectLevel ? (
                <CheckGlyph
                  className="absolute right-1.5 top-1.5 h-3 w-3"
                  style={{ color: GREEN_HI }}
                />
              ) : mode === "review" && isWrongPick ? (
                <CrossGlyph
                  className="absolute right-1.5 top-1.5 h-3 w-3"
                  style={{ color: RED_HI }}
                />
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function defaultRiskLabels(max: number): string[] {
  if (max === 5) return ["Low", "Moderate", "Medium", "High", "Critical"];
  if (max === 4) return ["Low", "Moderate", "High", "Critical"];
  if (max === 3) return ["Low", "Medium", "High"];
  return Array.from({ length: max }, (_, i) => `L${i + 1}`);
}

// ---------------------------------------------------------------------------
// Swipe cards — for each statement, swipe right (good) or left (warning).
// Drag-to-commit OR tap the action buttons. The whole deck is visible so the
// player can rethink an earlier swipe before checking the answer.
// ---------------------------------------------------------------------------

function SwipeCardsInput({
  question,
  value,
  onChange,
  mode
}: QuizQuestionViewProps & { question: SwipeCardsQuestion }) {
  const verdicts: (SwipeVerdict | null)[] = Array.isArray(value)
    ? (value as (SwipeVerdict | null)[])
    : question.cards.map(() => null);

  function setVerdict(i: number, v: SwipeVerdict) {
    if (mode === "review") return;
    const next = question.cards.map((_, idx) =>
      idx === i ? v : verdicts[idx] ?? null
    );
    onChange(next);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p
          className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "rgba(245,197,71,0.75)" }}
        >
          <SwipeGlyph className="h-3 w-3" />
          Swipe each card
        </p>
        <div className="flex items-center gap-2 text-[9.5px] uppercase tracking-[0.18em]">
          <span style={{ color: RED_HI }}>← Warning</span>
          <span style={{ color: GREEN_HI }}>Good →</span>
        </div>
      </div>
      <div className="grid gap-2">
        {question.cards.map((card, i) => {
          const picked = verdicts[i] ?? null;
          const truth = card.verdict;
          const userCorrect = picked === truth;
          const isReview = mode === "review";
          const tone =
            picked === "good" ? "good" : picked === "warning" ? "warning" : null;
          const reviewBorder = isReview
            ? userCorrect
              ? GREEN_BORDER
              : RED_BORDER
            : tone === "good"
            ? GREEN_BORDER
            : tone === "warning"
            ? RED_BORDER
            : GOLD_BORDER_SOFT;
          const reviewBg = isReview
            ? userCorrect
              ? "rgba(34,197,139,0.06)"
              : "rgba(244,120,120,0.06)"
            : tone === "good"
            ? "rgba(34,197,139,0.06)"
            : tone === "warning"
            ? "rgba(244,120,120,0.06)"
            : "rgba(255,255,255,0.02)";
          return (
            <SwipeCardItem
              key={i}
              text={card.text}
              picked={picked}
              truth={truth}
              borderColor={reviewBorder}
              bg={reviewBg}
              mode={mode}
              onPick={(v) => setVerdict(i, v)}
            />
          );
        })}
      </div>
    </div>
  );
}

function SwipeCardItem({
  text,
  picked,
  truth,
  borderColor,
  bg,
  mode,
  onPick
}: {
  text: string;
  picked: SwipeVerdict | null;
  truth: SwipeVerdict;
  borderColor: string;
  bg: string;
  mode: "input" | "review";
  onPick: (v: SwipeVerdict) => void;
}) {
  // Drag-to-commit when we're in input mode. The card returns to centre
  // after the user releases, but we lock in the verdict on threshold-cross.
  const isReview = mode === "review";
  return (
    <motion.div
      drag={isReview ? false : "x"}
      dragConstraints={{ left: -120, right: 120 }}
      dragElastic={0.7}
      onDragEnd={(_e, info) => {
        if (info.offset.x > 70) onPick("good");
        else if (info.offset.x < -70) onPick("warning");
      }}
      whileDrag={{ scale: 1.02, cursor: "grabbing" }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="relative overflow-hidden rounded-xl border px-3 py-2.5"
      style={{
        borderColor,
        background: bg,
        cursor: isReview ? "default" : "grab",
        touchAction: "pan-y"
      }}
    >
      <div className="flex items-center gap-3">
        <span className="flex-1 text-[13.5px] leading-snug text-ink-0">
          {text}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <SwipeVerdictButton
            tone="warning"
            isSelected={picked === "warning"}
            isReview={isReview}
            isCorrect={isReview && truth === "warning"}
            isWrong={isReview && picked === "warning" && truth !== "warning"}
            onClick={() => onPick("warning")}
          />
          <SwipeVerdictButton
            tone="good"
            isSelected={picked === "good"}
            isReview={isReview}
            isCorrect={isReview && truth === "good"}
            isWrong={isReview && picked === "good" && truth !== "good"}
            onClick={() => onPick("good")}
          />
        </div>
      </div>
      {isReview && picked !== truth ? (
        <p
          className="mt-1.5 text-[11px]"
          style={{ color: "rgb(180 180 200)" }}
        >
          Correct call:{" "}
          <span
            style={{
              color: truth === "good" ? GREEN_HI : RED_HI,
              fontWeight: 600
            }}
          >
            {truth === "good" ? "Good sign" : "Warning sign"}
          </span>
        </p>
      ) : null}
    </motion.div>
  );
}

function SwipeVerdictButton({
  tone,
  isSelected,
  isReview,
  isCorrect,
  isWrong,
  onClick
}: {
  tone: SwipeVerdict;
  isSelected: boolean;
  isReview: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  onClick: () => void;
}) {
  const accent =
    tone === "good"
      ? { hi: GREEN_HI, border: GREEN_BORDER, fill: "rgba(34,197,139,0.16)" }
      : { hi: RED_HI, border: RED_BORDER, fill: "rgba(244,120,120,0.16)" };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isReview}
      aria-label={tone === "good" ? "Mark good sign" : "Mark warning sign"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65"
      style={{
        borderColor: isCorrect
          ? GREEN_BORDER
          : isWrong
          ? RED_BORDER
          : isSelected
          ? accent.border
          : "rgba(245,197,71,0.20)",
        background: isSelected || isCorrect ? accent.fill : "rgba(255,255,255,0.03)",
        color: isCorrect
          ? GREEN_HI
          : isWrong
          ? RED_HI
          : isSelected
          ? accent.hi
          : "rgba(245,197,71,0.65)",
        cursor: isReview ? "default" : "pointer"
      }}
    >
      {tone === "good" ? (
        <CheckGlyph className="h-3.5 w-3.5" />
      ) : (
        <WarningGlyph className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Shared styling helpers
// ---------------------------------------------------------------------------

function choiceStyle({
  isSelected,
  isCorrectChoice,
  isWrongChoice,
  mode,
  premium = false,
  isFalseOption = false,
  missionSurface = false
}: {
  isSelected: boolean;
  isCorrectChoice: boolean;
  isWrongChoice: boolean;
  mode: "input" | "review";
  premium?: boolean;
  isFalseOption?: boolean;
  missionSurface?: boolean;
}): React.CSSProperties {
  if (missionSurface) {
    if (mode === "review") {
      if (isCorrectChoice) {
        return {
          borderColor: GREEN_BORDER,
          background: "rgba(34,197,139,0.18)",
          color: "#14532d",
          cursor: "default",
          boxShadow: "0 0 16px -4px rgba(34,197,139,0.45)"
        };
      }
      if (isWrongChoice) {
        return {
          borderColor: RED_BORDER,
          background: "rgba(244,120,120,0.16)",
          color: "#7f1d1d",
          cursor: "default",
          boxShadow: "0 0 16px -4px rgba(244,120,120,0.4)"
        };
      }
      return {
        borderColor: "rgba(202, 138, 4, 0.28)",
        background: "rgba(255,255,255,0.35)",
        color: "#64748b",
        cursor: "default"
      };
    }
    return {
      borderColor: isSelected
        ? "rgba(180, 83, 9, 0.62)"
        : "rgba(202, 138, 4, 0.42)",
      background: isSelected
        ? "rgba(251, 191, 36, 0.28)"
        : "rgba(255, 255, 255, 0.78)",
      color: isSelected ? "#451a03" : MISSION_BODY,
      boxShadow: isSelected
        ? "0 8px 20px -10px rgba(251, 191, 36, 0.42)"
        : undefined
    };
  }
  if (mode === "review") {
    if (isCorrectChoice) {
      return {
        borderColor: GREEN_BORDER,
        background: "rgba(34,197,139,0.12)",
        color: "rgb(235 245 240)",
        cursor: "default",
        boxShadow: "0 0 20px -4px rgba(34,197,139,0.65)"
      };
    }
    if (isWrongChoice) {
      return {
        borderColor: RED_BORDER,
        background: "rgba(244,120,120,0.12)",
        color: "rgb(225 220 228)",
        cursor: "default",
        boxShadow: "0 0 20px -4px rgba(244,120,120,0.55)"
      };
    }
    return {
      borderColor: isFalseOption
        ? "rgba(255,255,255,0.10)"
        : "rgba(255,255,255,0.06)",
      background: "rgba(255,255,255,0.02)",
      color: isFalseOption ? "rgb(185 185 198)" : "rgb(170 170 185)",
      cursor: "default"
    };
  }
  return {
    borderColor: isSelected
      ? GOLD_BORDER
      : premium
        ? isFalseOption
          ? "rgba(255,255,255,0.14)"
          : "rgba(255,255,255,0.10)"
        : GOLD_BORDER_SOFT,
    background: isSelected
      ? "rgba(245,197,71,0.12)"
      : premium
        ? "rgba(255,255,255,0.04)"
        : "rgba(255,255,255,0.02)",
    color: isSelected ? "#fff" : premium ? "rgb(225 225 235)" : "rgb(210 210 225)",
    boxShadow: isSelected && premium ? "0 12px 32px -18px rgba(245,197,71,0.45)" : undefined
  };
}

function radioDotStyle({
  isSelected,
  isCorrectChoice,
  isWrongChoice,
  mode,
  missionSurface = false
}: {
  isSelected: boolean;
  isCorrectChoice: boolean;
  isWrongChoice: boolean;
  mode: "input" | "review";
  missionSurface?: boolean;
}): React.CSSProperties {
  if (mode === "review") {
    if (isCorrectChoice) {
      return {
        border: `1.5px solid ${GREEN_HI}`,
        background: GREEN_HI
      };
    }
    if (isWrongChoice) {
      return {
        border: `1.5px solid ${RED_HI}`,
        background: RED_HI
      };
    }
    return {
      border: `1.5px solid rgba(202, 138, 4, 0.35)`,
      background: missionSurface ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.30)"
    };
  }
  return {
    border: `1.5px solid ${
      isSelected
        ? missionSurface
          ? "rgba(180, 83, 9, 0.62)"
          : GOLD_HI
        : missionSurface
          ? "rgba(202, 138, 4, 0.48)"
          : "rgba(245,197,71,0.55)"
    }`,
    background: isSelected
      ? missionSurface
        ? "#fbbf24"
        : GOLD_HI
      : missionSurface
        ? "rgba(255,255,255,0.78)"
        : "rgba(0,0,0,0.30)"
  };
}

function CheckGlyph({
  className,
  style
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={style}
    >
      <path d="M3 8.5l3 3 7-7.5" />
    </svg>
  );
}

function CrossGlyph({
  className,
  style
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={style}
    >
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  );
}

function WarningGlyph({
  className,
  style
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className={className}
      style={style}
    >
      <path d="M8 1.5l7 12.5H1L8 1.5zm0 4.5v3.5m0 1.6v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="8" cy="12" r="0.8" />
    </svg>
  );
}

function SparkleGlyphSmall({
  className,
  style
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className={className}
      style={style}
    >
      <path d="M8 0.5l1.6 4.4 4.4 1.6-4.4 1.6L8 12.5 6.4 8.1 2 6.5l4.4-1.6L8 0.5z" />
    </svg>
  );
}
