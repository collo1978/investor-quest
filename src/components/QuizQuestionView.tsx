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

// ---------------------------------------------------------------------------
// Visual tokens
// ---------------------------------------------------------------------------

const GOLD_HI = "#F5C547";
const GOLD_BORDER = "rgba(245, 197, 71, 0.40)";
const GOLD_BORDER_SOFT = "rgba(245, 197, 71, 0.22)";
const GREEN_HI = "#22C58B";
const GREEN_BORDER = "rgba(34, 197, 139, 0.55)";
const RED_HI = "#F47878";
const RED_BORDER = "rgba(244, 120, 120, 0.55)";

// ---------------------------------------------------------------------------
// Deterministic shuffle (seeded by question id) — hydration-safe.
// ---------------------------------------------------------------------------

function hashSeed(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h * 33) ^ id.charCodeAt(i)) >>> 0;
  }
  return h >>> 0;
}

function makeRng(seed: number): () => number {
  let s = seed | 0;
  if (s === 0) s = 1;
  return () => {
    s = (s * 9301 + 49297) | 0;
    s = ((s % 233280) + 233280) % 233280;
    return s / 233280;
  };
}

/** Returns a permutation array `p` where item `p[i]` should display at slot `i`. */
function shuffleIndices(n: number, idSeed: string, salt: string): number[] {
  const out = Array.from({ length: n }, (_, i) => i);
  const rng = makeRng(hashSeed(idSeed + "::" + salt));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
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
};

export function QuizQuestionView(props: QuizQuestionViewProps) {
  const { question, mode, value } = props;
  const isReview = mode === "review";
  const answeredCorrect = isReview && isQuizAnswerCorrect(question, value);

  return (
    <fieldset
      className="rounded-xl border px-4 py-3 transition-[border-color,box-shadow] duration-300"
      style={{
        borderColor: isReview
          ? answeredCorrect
            ? GREEN_BORDER
            : RED_BORDER
          : GOLD_BORDER_SOFT,
        background: isReview
          ? answeredCorrect
            ? "rgba(34,197,139,0.04)"
            : "rgba(244,120,120,0.04)"
          : "rgba(255,255,255,0.02)",
        boxShadow: isReview
          ? answeredCorrect
            ? "0 0 28px -8px rgba(34,197,139,0.55)"
            : "0 0 28px -8px rgba(244,120,120,0.45)"
          : "none"
      }}
    >
      <legend
        className="flex items-center gap-2 px-1 text-[10.5px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: isReview ? (answeredCorrect ? GREEN_HI : RED_HI) : GOLD_HI }}
      >
        <span>{`Question ${props.index + 1}`}</span>
        <span aria-hidden style={{ opacity: 0.6 }}>·</span>
        <span>{kindLabel(question.kind)}</span>
        {isReview ? (
          <>
            <span aria-hidden style={{ opacity: 0.6 }}>·</span>
            <span>{answeredCorrect ? "Correct" : "Not quite"}</span>
          </>
        ) : null}
      </legend>

      <QuestionPrompt question={question} />

      <div className="mt-3">
        <QuestionInput {...props} />
      </div>

      {isReview && question.explain ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="mt-3 rounded-lg border px-3 py-2 text-[12.5px] leading-relaxed text-ink-0/90"
          style={{
            borderColor: answeredCorrect
              ? "rgba(34,197,139,0.25)"
              : "rgba(244,120,120,0.25)",
            background: answeredCorrect
              ? "rgba(34,197,139,0.06)"
              : "rgba(244,120,120,0.06)"
          }}
        >
          {question.explain}
        </motion.p>
      ) : null}
    </fieldset>
  );
}

/**
 * Renders the question prompt with optional kind-specific framing.
 * - `scenario` gets a callout card to feel like "an investor brief".
 * - `fill-blank` swaps `___` for a stylised gold pill.
 * - Everything else uses a plain prompt line.
 */
function QuestionPrompt({ question }: { question: QuizQuestion }) {
  if (question.kind === "scenario") {
    return (
      <div
        className="mt-2 rounded-2xl border px-4 py-3"
        style={{
          borderColor: GOLD_BORDER,
          background:
            "linear-gradient(135deg, rgba(245,197,71,0.12) 0%, rgba(245,197,71,0.04) 100%)",
          boxShadow: "inset 0 0 0 1px rgba(245,197,71,0.08)"
        }}
      >
        <p
          className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: GOLD_HI }}
        >
          <SparkleGlyphSmall className="h-3 w-3" />
          Scenario
        </p>
        <p className="text-[14.5px] leading-relaxed text-ink-0">
          {question.prompt}
        </p>
      </div>
    );
  }
  if (question.kind === "fill-blank") {
    return (
      <p className="mt-1 text-[14.5px] leading-relaxed text-ink-0">
        {renderFillBlankPrompt(question)}
      </p>
    );
  }
  return (
    <p className="mt-1 text-[14.5px] leading-relaxed text-ink-0">
      {question.prompt}
    </p>
  );
}

function renderFillBlankPrompt(q: FillBlankQuestion): React.ReactNode {
  const parts = q.prompt.split("___");
  if (parts.length < 2) return q.prompt;
  const out: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    out.push(<span key={`p${i}`}>{part}</span>);
    if (i < parts.length - 1) {
      out.push(
        <span
          key={`b${i}`}
          className="mx-1 inline-block min-w-[2.5rem] rounded-md border px-2 text-center align-baseline text-[12.5px] tracking-[0.1em]"
          style={{
            borderColor: GOLD_BORDER_SOFT,
            background: "rgba(245,197,71,0.08)",
            color: GOLD_HI
          }}
        >
          ____
        </span>
      );
    }
  });
  return out;
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
      return "Fill in the blank";
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

// ---------------------------------------------------------------------------
// Dispatch on question kind
// ---------------------------------------------------------------------------

function QuestionInput(props: QuizQuestionViewProps) {
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
      return <FillBlankPillInput {...props} question={question} />;
    case "true-false":
      return <TrueFalseInput {...props} question={question} />;
    case "match":
      return <MatchInput {...props} question={question} />;
    case "order":
      return <OrderInput {...props} question={question} />;
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
  mode
}: QuizQuestionViewProps & { question: MultipleChoiceQuestion }) {
  const list = question.choices;
  const selected = typeof value === "number" ? value : null;
  const correctIndex = question.correctIndex;
  return (
    <div className="grid gap-1.5">
      {list.map((label, idx) => {
        const isSelected = selected === idx;
        const isCorrectChoice = mode === "review" && idx === correctIndex;
        const isWrongChoice =
          mode === "review" && isSelected && idx !== correctIndex;
        return (
          <label
            key={idx}
            className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-[13.5px] leading-snug transition focus-within:ring-2 focus-within:ring-amber-400/65"
            style={choiceStyle({
              isSelected,
              isCorrectChoice,
              isWrongChoice,
              mode
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
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
              style={radioDotStyle({
                isSelected,
                isCorrectChoice,
                isWrongChoice,
                mode
              })}
            >
              {isSelected || isCorrectChoice ? (
                <span
                  className="block h-1.5 w-1.5 rounded-full"
                  style={{ background: "#0a0a16" }}
                />
              ) : null}
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
// Fill in the blank — horizontal pill chips (visually distinct from MC)
// ---------------------------------------------------------------------------

function FillBlankPillInput({
  question,
  value,
  onChange,
  mode
}: QuizQuestionViewProps & { question: FillBlankQuestion }) {
  const selected = typeof value === "number" ? value : null;
  return (
    <div>
      <p
        className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "rgba(245,197,71,0.7)" }}
      >
        Tap the word that fills the blank
      </p>
      <div className="flex flex-wrap gap-1.5">
        {question.options.map((label, idx) => {
          const isSelected = selected === idx;
          const isCorrectChoice =
            mode === "review" && idx === question.correctIndex;
          const isWrongChoice =
            mode === "review" && isSelected && idx !== question.correctIndex;
          return (
            <button
              key={idx}
              type="button"
              disabled={mode === "review"}
              onClick={() => onChange(idx)}
              className="rounded-full border px-4 py-1.5 text-[13px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65"
              style={choiceStyle({
                isSelected,
                isCorrectChoice,
                isWrongChoice,
                mode
              })}
            >
              <span className="inline-flex items-center gap-1.5">
                {label}
                {mode === "review" && isCorrectChoice ? (
                  <CheckGlyph
                    className="h-3 w-3"
                    style={{ color: GREEN_HI }}
                  />
                ) : mode === "review" && isWrongChoice ? (
                  <CrossGlyph className="h-3 w-3" style={{ color: RED_HI }} />
                ) : null}
              </span>
            </button>
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
  mode
}: QuizQuestionViewProps & { question: TrueFalseQuestion }) {
  const selected = typeof value === "boolean" ? value : null;
  const options: { label: string; sub: string; bool: boolean }[] = [
    { label: "TRUE", sub: "Yes, that's right", bool: true },
    { label: "FALSE", sub: "No, that's off", bool: false }
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const isSelected = selected === opt.bool;
        const isCorrectChoice = mode === "review" && opt.bool === question.correct;
        const isWrongChoice =
          mode === "review" && isSelected && opt.bool !== question.correct;
        return (
          <motion.button
            key={opt.label}
            type="button"
            disabled={mode === "review"}
            onClick={() => onChange(opt.bool)}
            whileHover={mode === "review" ? undefined : { y: -2 }}
            whileTap={mode === "review" ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="relative flex min-h-[96px] flex-col items-center justify-center gap-1.5 rounded-2xl border p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65"
            style={choiceStyle({
              isSelected,
              isCorrectChoice,
              isWrongChoice,
              mode
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
                    ? "rgba(245,197,71,0.55)"
                    : "rgba(245,197,71,0.30)"
                }`,
                background: isCorrectChoice
                  ? "rgba(34,197,139,0.18)"
                  : isWrongChoice
                  ? "rgba(244,120,120,0.18)"
                  : isSelected
                  ? "rgba(245,197,71,0.18)"
                  : "rgba(255,255,255,0.04)",
                color: isCorrectChoice
                  ? GREEN_HI
                  : isWrongChoice
                  ? RED_HI
                  : isSelected
                  ? GOLD_HI
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
                  ? GREEN_HI
                  : isWrongChoice
                  ? RED_HI
                  : isSelected
                  ? "#fff"
                  : "rgba(245,197,71,0.85)"
              }}
            >
              {opt.label}
            </span>
            <span
              className="text-[10.5px] uppercase tracking-[0.18em]"
              style={{ color: "rgba(220,220,232,0.55)" }}
            >
              {opt.sub}
            </span>
          </motion.button>
        );
      })}
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
  mode
}: QuizQuestionViewProps & { question: OddOneOutQuestion }) {
  const selected = typeof value === "number" ? value : null;
  const n = question.choices.length;
  const gridCols =
    n === 4
      ? "grid-cols-2"
      : n === 3
      ? "grid-cols-3"
      : n === 6
      ? "grid-cols-3"
      : "grid-cols-2";
  return (
    <div>
      <p
        className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "rgba(245,197,71,0.7)" }}
      >
        Tap the one that doesn&apos;t belong
      </p>
      <div className={`grid ${gridCols} gap-2`}>
        {question.choices.map((label, idx) => {
          const isSelected = selected === idx;
          const isCorrectPick = mode === "review" && idx === question.oddIndex;
          const isWrongPick =
            mode === "review" && isSelected && idx !== question.oddIndex;
          const struck =
            isSelected || isCorrectPick; // visually crossed-out when "picked as odd"
          return (
            <motion.button
              key={idx}
              type="button"
              disabled={mode === "review"}
              onClick={() => onChange(idx)}
              whileHover={mode === "review" ? undefined : { y: -2 }}
              whileTap={mode === "review" ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="relative flex min-h-[78px] items-center justify-center rounded-2xl border p-3 text-center text-[13px] leading-snug transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65"
              style={choiceStyle({
                isSelected,
                isCorrectChoice: isCorrectPick,
                isWrongChoice: isWrongPick,
                mode
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
  mode
}: QuizQuestionViewProps & { question: ScenarioQuestion }) {
  const selected = typeof value === "number" ? value : null;
  return (
    <div>
      <p
        className="mb-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{
          borderColor: GOLD_BORDER,
          background: "rgba(245,197,71,0.08)",
          color: GOLD_HI
        }}
      >
        <SparkleGlyphSmall className="h-3 w-3" />
        Choose your move
      </p>
      <div className="grid gap-2">
        {question.choices.map((label, idx) => {
          const isSelected = selected === idx;
          const isCorrectChoice =
            mode === "review" && idx === question.correctIndex;
          const isWrongChoice =
            mode === "review" && isSelected && idx !== question.correctIndex;
          return (
            <motion.button
              key={idx}
              type="button"
              disabled={mode === "review"}
              onClick={() => onChange(idx)}
              whileHover={mode === "review" ? undefined : { x: 2 }}
              whileTap={mode === "review" ? undefined : { scale: 0.99 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="group flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[13.5px] leading-snug transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65"
              style={choiceStyle({
                isSelected,
                isCorrectChoice,
                isWrongChoice,
                mode
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
  mode
}: QuizQuestionViewProps & { question: MatchQuestion }) {
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
            className="rounded-lg border px-3 py-2"
            style={{
              borderColor:
                mode === "review"
                  ? userCorrect
                    ? GREEN_BORDER
                    : RED_BORDER
                  : GOLD_BORDER_SOFT,
              background:
                mode === "review"
                  ? userCorrect
                    ? "rgba(34,197,139,0.06)"
                    : "rgba(244,120,120,0.05)"
                  : "rgba(255,255,255,0.015)"
            }}
          >
            <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.16em]" style={{ color: GOLD_HI }}>
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
                    className="rounded-full border px-3 py-1.5 text-[12.5px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/65"
                    style={choiceStyle({
                      isSelected: isPicked,
                      isCorrectChoice,
                      isWrongChoice: isWrongPick,
                      mode
                    })}
                  >
                    {pairs[origIdx].right}
                  </button>
                );
              })}
            </div>
            {mode === "review" && !userCorrect ? (
              <p className="mt-1.5 text-[11.5px]" style={{ color: "rgb(180 180 200)" }}>
                Correct match: <span style={{ color: GREEN_HI }}>{pair.right}</span>
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
  mode
}: QuizQuestionViewProps & { question: OrderQuestion }) {
  const steps = question.steps;
  // initial display order = deterministically shuffled original indices
  const initialOrder = shuffleIndices(steps.length, question.id, "order");

  const current: number[] = Array.isArray(value)
    ? (value as number[])
    : initialOrder;

  // ----- Review mode: static list with ✓/✗ markers (no drag) -----
  if (mode === "review") {
    return (
      <ol className="grid gap-2">
        {current.map((origIdx, displayIdx) => {
          const inCorrectSpot = origIdx === displayIdx;
          return (
            <li
              key={`${origIdx}-${displayIdx}`}
              className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[13.5px] leading-snug"
              style={{
                borderColor: inCorrectSpot ? GREEN_BORDER : RED_BORDER,
                background: inCorrectSpot
                  ? "rgba(34,197,139,0.05)"
                  : "rgba(244,120,120,0.05)",
                color: "rgb(225 225 235)"
              }}
            >
              <span
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11.5px] font-semibold"
                style={{
                  borderColor: inCorrectSpot ? GREEN_BORDER : RED_BORDER,
                  color: inCorrectSpot ? GREEN_HI : RED_HI,
                  background: inCorrectSpot
                    ? "rgba(34,197,139,0.12)"
                    : "rgba(244,120,120,0.12)"
                }}
              >
                {displayIdx + 1}
              </span>
              <span className="flex-1">{steps[origIdx]}</span>
              {inCorrectSpot ? (
                <CheckGlyph
                  className="h-3.5 w-3.5"
                  style={{ color: GREEN_HI }}
                />
              ) : (
                <span
                  className="text-[11px]"
                  style={{ color: "rgb(180 180 200)" }}
                >
                  belongs at step {origIdx + 1}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  // ----- Input mode: drag-to-reorder cards -----
  return (
    <div>
      <p
        className="mb-2 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "rgba(245,197,71,0.7)" }}
      >
        <GripGlyph className="h-3 w-3" />
        Drag to reorder
      </p>
      <Reorder.Group
        axis="y"
        values={current}
        onReorder={(next) => onChange(next as number[])}
        className="grid gap-2"
        as="ol"
      >
        {current.map((origIdx, displayIdx) => (
          <OrderDragItem
            key={origIdx}
            origIdx={origIdx}
            displayIdx={displayIdx}
            label={steps[origIdx]}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

function OrderDragItem({
  origIdx,
  displayIdx,
  label
}: {
  origIdx: number;
  displayIdx: number;
  label: string;
}) {
  // A drag-controls handle lets the user grab the whole card OR just the
  // grip — both feel native on desktop and mobile.
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={origIdx}
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
        borderColor: GOLD_BORDER_SOFT,
        background: "rgba(255,255,255,0.025)",
        color: "rgb(225 225 235)",
        cursor: "grab",
        touchAction: "none"
      }}
      onPointerDown={(event) => controls.start(event)}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11.5px] font-semibold"
          style={{
            borderColor: GOLD_BORDER,
            color: GOLD_HI,
            background: "rgba(245,197,71,0.10)"
          }}
        >
          {displayIdx + 1}
        </span>
        <span className="flex-1">{label}</span>
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
  mode
}: {
  isSelected: boolean;
  isCorrectChoice: boolean;
  isWrongChoice: boolean;
  mode: "input" | "review";
}): React.CSSProperties {
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
      borderColor: "rgba(255,255,255,0.06)",
      background: "rgba(255,255,255,0.02)",
      color: "rgb(170 170 185)",
      cursor: "default"
    };
  }
  return {
    borderColor: isSelected ? GOLD_BORDER : GOLD_BORDER_SOFT,
    background: isSelected ? "rgba(245,197,71,0.10)" : "rgba(255,255,255,0.02)",
    color: isSelected ? "#fff" : "rgb(210 210 225)"
  };
}

function radioDotStyle({
  isSelected,
  isCorrectChoice,
  isWrongChoice,
  mode
}: {
  isSelected: boolean;
  isCorrectChoice: boolean;
  isWrongChoice: boolean;
  mode: "input" | "review";
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
      border: `1.5px solid rgba(245,197,71,0.35)`,
      background: "rgba(0,0,0,0.30)"
    };
  }
  return {
    border: `1.5px solid ${isSelected ? GOLD_HI : "rgba(245,197,71,0.55)"}`,
    background: isSelected ? GOLD_HI : "rgba(0,0,0,0.30)"
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
