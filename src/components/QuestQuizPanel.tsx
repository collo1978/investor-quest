"use client";

/**
 * QuestQuizPanel — runner-style mini-game quiz.
 *
 * Game flow (Duolingo-like, not exam-like):
 *
 *   locked  → reading prerequisite not yet satisfied
 *   ready   → quiz unlocked, intro screen with Start button
 *   playing → ONE question at a time
 *               answering → user is picking an answer
 *               feedback  → answer locked, ✓/✗ + Why shown,
 *                           Next / See results button
 *   summary → end-of-quiz card with score, XP confirmation, Replay
 *
 * Question order is **shuffled per attempt** so the player never knows
 * what style is coming next. Shuffle happens in click handlers only
 * (after hydration), never on first paint — hydration-safe.
 *
 * On pass we dispatch `actions.completeQuest(pillarId, slug, { quizPerfect })`
 * exactly once (the reducer is idempotent for slugs already in
 * `completedQuestSlugs`). Mark-as-Read never awards XP.
 *
 * Per-question rendering is delegated to `QuizQuestionView`, which
 * handles 9 visually distinct question kinds.
 */

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { useGame } from "@/components/GameProvider";
import { QuizQuestionView } from "@/components/QuizQuestionView";
import type { PillarId } from "@/data/pillars";
import type { QuizConfig, QuizQuestion } from "@/data/quests/types";
import { TEN_K_ROOKIE_CHALLENGE_XP } from "@/data/quests/tenKRookieFinalChallenge";
import {
  isQuizAnswerCorrect,
  isQuizAnswerProvided
} from "@/data/quests/types";

export type QuestQuizPanelProps = {
  pillarId: PillarId;
  slug: string;
  quiz: QuizConfig;
  /** True when the reading prerequisite is satisfied (quiz unlocked). */
  unlocked: boolean;
  /**
   * Label shown in the panel header (e.g. "Snapshot Quiz",
   * "Revenue Quiz"). Defaults to "Quiz".
   */
  title?: string;
  /** XP awarded for passing — surfaced in the summary card. */
  rewardXp?: number;
  /** Total cards-read progress for the "lock" copy on small quizzes. */
  cardsRead?: number;
  cardsTotal?: number;
  /**
   * Meta quizzes (e.g. center-map final challenge) never call `completeQuest`.
   * When `completed` is true, the panel opens on the summary pass state.
   */
  metaCompletion?: {
    completed: boolean;
    onPass: (result: {
      correct: number;
      total: number;
      fraction: number;
    }) => void;
  };
  /** When opening a cold summary for a meta quiz, preserve honor tier. */
  honorSeed?: boolean;
  /** Alternate copy + summary treatment (final map challenge). */
  uiVariant?: "default" | "ten-k-final";
};

const GOLD_HI = "#F5C547";
const GOLD_BORDER = "rgba(245, 197, 71, 0.40)";
const GOLD_BORDER_SOFT = "rgba(245, 197, 71, 0.22)";
const GOLD_GLOW = "rgba(245, 197, 71, 0.45)";
const GREEN_HI = "#22C58B";
const GREEN_BORDER = "rgba(34, 197, 139, 0.55)";
const RED_HI = "#F47878";
const RED_BORDER = "rgba(244, 120, 120, 0.55)";

type Phase = "locked" | "ready" | "playing" | "summary";
type AnswerMap = Record<string, unknown>;
type PerQuestionStatus = "upcoming" | "current" | "correct" | "wrong";

function shuffleArray<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function QuestQuizPanel({
  pillarId,
  slug,
  quiz,
  unlocked,
  title = "Quiz",
  rewardXp = 0,
  cardsRead,
  cardsTotal,
  metaCompletion,
  uiVariant = "default",
  honorSeed = false
}: QuestQuizPanelProps) {
  const { state, actions } = useGame();

  const isTenK = uiVariant === "ten-k-final";

  // Engine source of truth — XP awarded for this quest?
  const slugTrackedComplete =
    !metaCompletion &&
    (state.pillars[pillarId]?.completedQuestSlugs.includes(slug) ?? false);
  const alreadyCompleted = Boolean(
    metaCompletion?.completed ?? slugTrackedComplete
  );

  const questions = quiz.questions;
  const total = questions.length;
  const threshold = quiz.passThreshold ?? 0.66;
  const requiredCorrect = Math.max(1, Math.ceil(total * threshold));

  // Identity-stable initial order (questions in their original order).
  // First paint is always `locked` or `ready` — never `playing` — so this
  // never causes a hydration mismatch.
  const initialOrder = useMemo(
    () => questions.map((_, i) => i),
    [questions]
  );

  const [order, setOrder] = useState<number[]>(initialOrder);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastFraction, setLastFraction] = useState<number | null>(null);
  const [didPass, setDidPass] = useState<boolean>(alreadyCompleted);
  /** First-time meta pass — show XP line even before parent re-renders. */
  const [showTenKXpBanner, setShowTenKXpBanner] = useState(false);
  const [phase, setPhase] = useState<Phase>(() =>
    alreadyCompleted ? "summary" : unlocked ? "ready" : "locked"
  );

  // Keep phase in sync with engine + unlock prop. Never demote out of
  // summary or playing.
  useEffect(() => {
    if (alreadyCompleted) {
      setDidPass(true);
      setPhase((prev) => (prev === "playing" ? "playing" : "summary"));
      return;
    }
    setPhase((prev) => {
      if (prev === "playing" || prev === "summary") return prev;
      return unlocked ? "ready" : "locked";
    });
  }, [alreadyCompleted, unlocked]);

  const honorRoll =
    isTenK &&
    didPass &&
    (Boolean(honorSeed) ||
      (lastFraction !== null && lastFraction >= 0.9));

  function startQuiz() {
    setOrder(shuffleArray(questions.map((_, i) => i)));
    setAnswers({});
    setCheckedIds([]);
    setCurrentIndex(0);
    setDidPass(false);
    setLastScore(null);
    setLastFraction(null);
    setShowTenKXpBanner(false);
    setPhase("playing");
  }

  function setAnswer(qid: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function checkAnswer() {
    if (!currentQ) return;
    if (!isQuizAnswerProvided(currentQ, answers[currentQ.id])) return;
    if (checkedIds.includes(currentQ.id)) return;
    setCheckedIds((prev) => [...prev, currentQ.id]);
  }

  function advance() {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    // Last question — tally final score and transition to summary.
    const correctCount = order.reduce((n, idx) => {
      const q = questions[idx];
      return isQuizAnswerCorrect(q, answers[q.id]) ? n + 1 : n;
    }, 0);
    setLastScore(correctCount);
    const pct = total === 0 ? 0 : correctCount / total;
    setLastFraction(pct);
    const passed = pct >= threshold;
    if (passed) {
      if (metaCompletion) {
        if (!metaCompletion.completed) {
          setShowTenKXpBanner(true);
        }
        metaCompletion.onPass({
          correct: correctCount,
          total,
          fraction: pct
        });
      } else {
        // XP from quiz pass / perfect bonus only (engine); idempotent.
        actions.completeQuest(pillarId, slug, {
          quizPerfect: correctCount === total
        });
      }
    }
    setDidPass(passed);
    setPhase("summary");
  }

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const currentQ: QuizQuestion | null =
    phase === "playing" && order[currentIndex] !== undefined
      ? questions[order[currentIndex]]
      : null;
  const isCurrentChecked = currentQ
    ? checkedIds.includes(currentQ.id)
    : false;
  const isCurrentCorrect = currentQ
    ? isQuizAnswerCorrect(currentQ, answers[currentQ.id])
    : false;
  const canCheck = currentQ
    ? isQuizAnswerProvided(currentQ, answers[currentQ.id])
    : false;
  const isLast = currentIndex >= total - 1;

  const perQuestionStatus: PerQuestionStatus[] = order.map((origIdx, slot) => {
    const q = questions[origIdx];
    const checked = checkedIds.includes(q.id);
    if (!checked) {
      return slot === currentIndex ? "current" : "upcoming";
    }
    return isQuizAnswerCorrect(q, answers[q.id]) ? "correct" : "wrong";
  });

  const isPassedDisplay = phase === "summary" && didPass;
  const isFailedDisplay = phase === "summary" && !didPass;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const baseStyle: React.CSSProperties = {
    borderColor: isPassedDisplay ? GREEN_BORDER : GOLD_BORDER,
    background: "rgba(8,7,4,0.78)",
    boxShadow: isPassedDisplay
      ? `0 24px 60px -28px rgba(34,197,139,0.55), inset 0 0 0 1px rgba(34,197,139,0.20)`
      : `0 24px 60px -28px ${GOLD_GLOW}, inset 0 0 0 1px rgba(245,197,71,0.14)`
  };

  return (
    <motion.section
      initial={false}
      animate={{
        boxShadow: baseStyle.boxShadow as string,
        borderColor: baseStyle.borderColor as string
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border backdrop-blur-md"
      style={baseStyle}
      aria-label={title}
    >
      {/* Ambient corner wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: isPassedDisplay
            ? "radial-gradient(110% 80% at 90% -10%, rgba(34,197,139,0.10) 0%, transparent 60%)"
            : "radial-gradient(110% 80% at 90% -10%, rgba(245,197,71,0.14) 0%, transparent 60%)"
        }}
      />

      <div className="relative px-5 py-5 md:px-6 md:py-6">
        {/* Header row */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center rounded-full"
              style={{
                border: `1px solid ${isPassedDisplay ? GREEN_BORDER : GOLD_BORDER}`,
                background: isPassedDisplay
                  ? "rgba(34,197,139,0.14)"
                  : "rgba(245,197,71,0.10)",
                color: isPassedDisplay ? GREEN_HI : GOLD_HI,
                boxShadow: isPassedDisplay
                  ? "0 0 14px rgba(34,197,139,0.45)"
                  : `0 0 14px ${GOLD_GLOW}`
              }}
            >
              {isPassedDisplay ? (
                <CheckGlyph className="h-3.5 w-3.5" />
              ) : phase === "locked" ? (
                <LockGlyph className="h-3.5 w-3.5" />
              ) : (
                <SparkleGlyph className="h-3.5 w-3.5" />
              )}
            </span>
            <span
              className="text-[10.5px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: isPassedDisplay ? GREEN_HI : GOLD_HI }}
            >
              {title}
            </span>
          </div>

          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{
              borderColor: isPassedDisplay
                ? GREEN_BORDER
                : phase === "locked"
                ? GOLD_BORDER_SOFT
                : GOLD_BORDER,
              background: isPassedDisplay
                ? "rgba(34,197,139,0.12)"
                : "rgba(245,197,71,0.06)",
              color: isPassedDisplay
                ? GREEN_HI
                : isFailedDisplay
                ? RED_HI
                : GOLD_HI
            }}
          >
            {phase === "locked"
              ? isTenK
                ? "Sealed"
                : "Locked"
              : phase === "ready"
              ? isTenK
                ? "Ready"
                : "Unlocked"
              : phase === "playing"
              ? `Question ${currentIndex + 1} of ${total}`
              : isPassedDisplay
              ? isTenK
                ? "Cleared"
                : "Passed"
              : isTenK
              ? "Run it back"
              : "Try again"}
          </span>
        </header>

        {/* Body */}
        <AnimatePresence mode="wait" initial={false}>
          {phase === "locked" ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <LockedBody
                isTenK={isTenK}
                cardsRead={cardsRead}
                cardsTotal={cardsTotal}
              />
            </motion.div>
          ) : phase === "ready" ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <ReadyBody
                isTenK={isTenK}
                total={total}
                requiredCorrect={requiredCorrect}
                title={title}
                onStart={startQuiz}
              />
            </motion.div>
          ) : phase === "playing" ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <ProgressDots statuses={perQuestionStatus} />

              {/* Single-question runner */}
              <div className="relative mt-4 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  {currentQ ? (
                    <motion.div
                      key={`${currentQ.id}-${isCurrentChecked ? "f" : "a"}`}
                      initial={{ x: 28, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -28, opacity: 0 }}
                      transition={{ duration: 0.26, ease: "easeOut" }}
                    >
                      <QuizQuestionView
                        index={currentIndex}
                        question={currentQ}
                        value={answers[currentQ.id]}
                        onChange={(v) => setAnswer(currentQ.id, v)}
                        mode={isCurrentChecked ? "review" : "input"}
                      />

                      <AnimatePresence>
                        {isCurrentChecked ? (
                          <motion.div
                            key="banner"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.22 }}
                          >
                            <FeedbackBanner correct={isCurrentCorrect} />
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11.5px] uppercase tracking-[0.16em] text-ink-2">
                  {isCurrentChecked
                    ? isCurrentCorrect
                      ? "Nice — locked in"
                      : "Saved your answer"
                    : canCheck
                    ? "Ready when you are"
                    : "Pick an answer to continue"}
                </span>
                {isCurrentChecked ? (
                  <PrimaryGoldButton onClick={advance}>
                    {isLast ? "See results" : "Next question"}
                  </PrimaryGoldButton>
                ) : (
                  <PrimaryGoldButton onClick={checkAnswer} disabled={!canCheck}>
                    Check answer
                  </PrimaryGoldButton>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <SummaryBody
                isTenK={isTenK}
                honorRoll={honorRoll}
                didPass={didPass}
                score={lastScore}
                total={total}
                requiredCorrect={requiredCorrect}
                rewardXp={rewardXp ?? 0}
                celebrateXp={Boolean((rewardXp ?? 0) > 0 || (isTenK && showTenKXpBanner))}
                onReplay={startQuiz}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

// ===========================================================================
// Sub-components
// ===========================================================================

function LockedBody({
  isTenK,
  cardsRead,
  cardsTotal
}: {
  isTenK: boolean;
  cardsRead?: number;
  cardsTotal?: number;
}) {
  if (isTenK) {
    return (
      <>
        <h3 className="mt-3 font-[var(--font-grotesk)] text-[18px] leading-tight text-ink-0">
          The reactor is sealed for now
        </h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-1">
          Claim the Final Challenge only after every island is fully cleared:
          all quest cards read, every section quiz passed, and your conviction
          pulse saved after each pillar. Finish the map — then come back to
          light the core.
        </p>
      </>
    );
  }
  return (
    <>
      <h3 className="mt-3 font-[var(--font-grotesk)] text-[18px] leading-tight text-ink-0">
        Mark all cards as read to unlock the quiz
      </h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-1">
        The quiz uses the answers and &ldquo;why this matters&rdquo; content
        from the cards above. Read each card and mark it as read — once you
        finish all{cardsTotal ? ` ${cardsTotal}` : ""} cards, the quiz unlocks.
      </p>
      {typeof cardsRead === "number" && typeof cardsTotal === "number" ? (
        <p
          className="mt-3 text-[10.5px] font-semibold uppercase tracking-[0.20em]"
          style={{ color: "rgba(245,197,71,0.75)" }}
        >
          Progress: {cardsRead} / {cardsTotal} cards read
        </p>
      ) : null}
    </>
  );
}

function ReadyBody({
  isTenK,
  total,
  requiredCorrect,
  title,
  onStart
}: {
  isTenK: boolean;
  total: number;
  requiredCorrect: number;
  title: string;
  onStart: () => void;
}) {
  if (isTenK) {
    return (
      <>
        <h3 className="mt-3 font-[var(--font-grotesk)] text-[18px] leading-tight text-ink-0">
          Final Challenge — prove the full picture
        </h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-1">
          Twelve rapid-fire prompts pulled from Business, Forces, Financials,
          and Management — mixed formats, shuffled every run. Clear{" "}
          <span className="font-semibold text-ink-0">
            {requiredCorrect} of {total}
          </span>{" "}
          to claim your{" "}
          <span className="font-semibold text-ink-0">10-K Rookie Badge</span> and
          bonus XP. This is a boss encounter, not a scantron.
        </p>
        <div className="mt-4">
          <PrimaryGoldButton onClick={onStart}>Enter the reactor</PrimaryGoldButton>
        </div>
      </>
    );
  }
  return (
    <>
      <h3 className="mt-3 font-[var(--font-grotesk)] text-[18px] leading-tight text-ink-0">
        Quiz unlocked
      </h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-1">
        {total} short questions, one at a time. Each one uses a different style —
        you won&apos;t know what&apos;s coming next. Get{" "}
        <span className="font-semibold text-ink-0">
          {requiredCorrect} of {total}
        </span>{" "}
        right to earn XP for this quest.
      </p>
      <div className="mt-4">
        <PrimaryGoldButton onClick={onStart}>Start {title}</PrimaryGoldButton>
      </div>
    </>
  );
}

function ProgressDots({ statuses }: { statuses: PerQuestionStatus[] }) {
  return (
    <div className="mt-3 flex items-center gap-1.5">
      {statuses.map((status, idx) => {
        const baseColor =
          status === "correct"
            ? GREEN_HI
            : status === "wrong"
            ? RED_HI
            : status === "current"
            ? GOLD_HI
            : "rgba(245,197,71,0.25)";
        const fill =
          status === "correct"
            ? "rgba(34,197,139,0.85)"
            : status === "wrong"
            ? "rgba(244,120,120,0.85)"
            : status === "current"
            ? "rgba(245,197,71,0.85)"
            : "rgba(245,197,71,0.10)";
        return (
          <motion.span
            key={idx}
            initial={false}
            animate={{
              width: status === "current" ? 28 : 14,
              backgroundColor: fill,
              borderColor: baseColor
            }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="inline-block h-2 rounded-full border"
            aria-label={`Question ${idx + 1}: ${status}`}
          />
        );
      })}
    </div>
  );
}

function FeedbackBanner({ correct }: { correct: boolean }) {
  return (
    <div
      className="mt-3 flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5"
      style={{
        borderColor: correct ? GREEN_BORDER : RED_BORDER,
        background: correct
          ? "rgba(34,197,139,0.10)"
          : "rgba(244,120,120,0.08)"
      }}
    >
      <span
        aria-hidden
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{
          border: `1px solid ${correct ? GREEN_BORDER : RED_BORDER}`,
          background: correct
            ? "rgba(34,197,139,0.20)"
            : "rgba(244,120,120,0.18)",
          color: correct ? GREEN_HI : RED_HI,
          boxShadow: correct
            ? "0 0 14px rgba(34,197,139,0.45)"
            : "0 0 14px rgba(244,120,120,0.35)"
        }}
      >
        {correct ? (
          <CheckGlyph className="h-3 w-3" />
        ) : (
          <CrossGlyph className="h-3 w-3" />
        )}
      </span>
      <div className="min-w-0">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.20em]"
          style={{ color: correct ? GREEN_HI : RED_HI }}
        >
          {correct ? "Nice — got it" : "Not quite"}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-1">
          {correct
            ? "Locked in. Finishing this run builds your quiz streak — understanding, not scrolling."
            : "Read the gold note below — it explains the right answer."}
        </p>
      </div>
    </div>
  );
}

function SummaryBody({
  isTenK,
  honorRoll,
  didPass,
  score,
  total,
  requiredCorrect,
  rewardXp,
  celebrateXp,
  onReplay
}: {
  isTenK: boolean;
  honorRoll: boolean;
  didPass: boolean;
  score: number | null;
  total: number;
  requiredCorrect: number;
  rewardXp: number;
  celebrateXp: boolean;
  onReplay: () => void;
}) {
  const passTitle = isTenK
    ? honorRoll
      ? "High Conviction Rookie"
      : "10-K Rookie unlocked"
    : "Quiz passed";
  const failTitle = isTenK ? "Close call — run it back" : "Almost there";
  const passDetail =
    score !== null
      ? isTenK
        ? `You locked ${score} / ${total} — full-company read confirmed.`
        : `You got ${score} of ${total}`
      : "";
  const failDetail =
    score !== null
      ? isTenK
        ? `You landed ${score} / ${total}. Need ${requiredCorrect} to clear the reactor.`
        : `You got ${score} of ${total} — need ${requiredCorrect} of ${total} to pass`
      : "";

  return (
    <>
      <div className="mt-4 flex items-center gap-3">
        <span
          aria-hidden
          className="inline-flex h-10 w-10 items-center justify-center rounded-full"
          style={{
            border: `1px solid ${didPass ? GREEN_BORDER : RED_BORDER}`,
            background: didPass
              ? "rgba(34,197,139,0.16)"
              : "rgba(244,120,120,0.14)",
            color: didPass ? GREEN_HI : RED_HI,
            boxShadow: didPass
              ? "0 0 22px rgba(34,197,139,0.55)"
              : "0 0 22px rgba(244,120,120,0.35)"
          }}
        >
          {didPass ? (
            <CheckGlyph className="h-5 w-5" />
          ) : (
            <CrossGlyph className="h-5 w-5" />
          )}
        </span>
        <div>
          <h3
            className="font-[var(--font-grotesk)] text-[20px] leading-tight"
            style={{ color: didPass ? GREEN_HI : "#fff" }}
          >
            {didPass ? passTitle : failTitle}
          </h3>
          <p className="mt-0.5 text-[13px] text-ink-1">
            {didPass ? passDetail : failDetail}
          </p>
        </div>
      </div>

      {isTenK && honorRoll && didPass ? (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-[12.5px] leading-relaxed text-ink-1"
        >
          Rare clear — you held 90%+ accuracy across every island lens. That is
          rookie-tier mastery with investor instincts switched on.
        </motion.p>
      ) : null}

      {didPass && celebrateXp ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 320, damping: 22 }}
          className="mt-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold uppercase tracking-[0.18em]"
          style={{
            borderColor: GREEN_BORDER,
            background: "rgba(34,197,139,0.14)",
            color: GREEN_HI,
            boxShadow: "0 0 18px rgba(34,197,139,0.45)"
          }}
        >
          <SparkleGlyph className="h-3.5 w-3.5" />
          <span>
            {isTenK && rewardXp > 0
              ? `+${rewardXp} XP awarded`
              : isTenK
              ? `+${TEN_K_ROOKIE_CHALLENGE_XP} XP awarded`
              : `+${rewardXp} XP awarded`}
          </span>
        </motion.div>
      ) : null}

      <p className="mt-4 text-[13px] leading-relaxed text-ink-1">
        {didPass
          ? isTenK
            ? "Badge and XP are saved locally. The map core stays lit — your next expedition bridge is warming up."
            : "XP is locked in for this quest. Replay any time — your XP only counts once."
          : isTenK
          ? "No penalty run — shuffle a new lane, skim one weak island, and dive back in."
          : "Re-read the cards above (especially the \u201CWhy this matters\u201D lines), then try again. Question order shuffles every attempt."}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <PrimaryGoldButton onClick={onReplay}>
          {didPass ? (isTenK ? "Run it again" : "Replay quiz") : "Try again"}
        </PrimaryGoldButton>
        {isTenK && didPass ? (
          <Link
            href="/map"
            className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-ink-1 underline-offset-4 transition hover:text-ink-0 hover:underline"
            style={{ color: GOLD_HI }}
          >
            Return to map
          </Link>
        ) : null}
      </div>
    </>
  );
}

function PrimaryGoldButton({
  onClick,
  disabled,
  children
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-[13.5px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/75"
      style={{
        borderColor: GOLD_BORDER,
        background: disabled
          ? "rgba(245,197,71,0.06)"
          : "rgba(245,197,71,0.14)",
        color: disabled ? "rgba(245,197,71,0.55)" : GOLD_HI,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : `0 0 24px -10px ${GOLD_GLOW}`,
        opacity: disabled ? 0.85 : 1
      }}
    >
      {children}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Glyphs
// ---------------------------------------------------------------------------

function CheckGlyph({ className }: { className?: string }) {
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
    >
      <path d="M3 8.5l3 3 7-7.5" />
    </svg>
  );
}

function CrossGlyph({ className }: { className?: string }) {
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
    >
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  );
}

function LockGlyph({ className }: { className?: string }) {
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
    >
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

function SparkleGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M8 0.5l1.6 4.4 4.4 1.6-4.4 1.6L8 12.5 6.4 8.1 2 6.5l4.4-1.6L8 0.5z" />
    </svg>
  );
}
