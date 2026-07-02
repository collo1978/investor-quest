"use client";

/**
 * QuestQuizPanel â€” runner-style mini-game quiz.
 *
 * Game flow (Duolingo-like, not exam-like):
 *
 *   locked  â†’ reading prerequisite not yet satisfied
 *   ready   â†’ quiz unlocked, intro screen with Start button
 *   playing â†’ ONE question at a time
 *               answering â†’ user is picking an answer
 *               feedback  â†’ answer locked, âœ“/âœ— + Why shown,
 *                           Next / See results button
 *   summary â†’ end-of-quiz card with score, XP confirmation, Replay
 *
 * Question order is **shuffled per attempt** so the player never knows
 * what style is coming next. Shuffle happens in click handlers only
 * (after hydration), never on first paint â€” hydration-safe.
 *
 * On pass we dispatch `actions.completeQuest(pillarId, slug, { quizPerfect })`
 * exactly once (the reducer is idempotent for slugs already in
 * `completedQuestSlugs`). Mark-as-Read never awards XP.
 *
 * Per-question rendering is delegated to `QuizQuestionView`, which
 * handles visually distinct question kinds (MC, T/F, match, swipe, etc.).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SchoolsQuestQuizCompletionFlow } from "@/components/schools/SchoolsQuestQuizCompletionFlow";

import { useGame } from "@/components/GameProvider";
import { usePillarQuestViews } from "@/components/gameHooks";
import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { QuizQuestionView } from "@/components/QuizQuestionView";
import type { PillarId } from "@/data/pillars";
import { nextPillarId, pillarById } from "@/data/pillars";
import { XP_ISLAND_COMPLETION } from "@/engine/progression/xpEconomy";
import { ConfettiBurst } from "@/ui/effects/ConfettiBurst";
import type { QuizConfig, QuizQuestion } from "@/data/quests/types";
import { TEN_K_ROOKIE_CHALLENGE_XP } from "@/data/quests/tenKRookieFinalChallenge";
import {
  XP_QUIZ_PERFECT_BONUS,
  XP_SECTION_QUIZ
} from "@/engine/progression/xpEconomy";
import {
  hasPlayableQuizConfig,
  isQuizAnswerCorrect,
  isQuizAnswerProvided,
  normalizeQuizConfig,
  type OrderQuestion
} from "@/data/quests/types";
import {
  initialOrderPermutation,
  orderPermutationsEqual
} from "@/lib/quests/quizOrderShuffle";
import { createQuizAttemptLayout } from "@/lib/quests/quizChoiceShuffle";
import {
  islandQuizLockedHint,
  islandQuizPlayingFeedback,
  islandQuizReadyIntro,
  islandQuizStartCta,
  islandQuizStatusLabel,
  islandQuizUnlockedHeadline
} from "@/lib/quests/islandQuizStyle";
import { LOCK_IN_ANSWER_LABEL } from "@/lib/quests/gameActionCopy";
import { resolveSchoolsDemoMapHref } from "@/lib/schools/schoolsDemoHref";
import {
  SCHOOLS_CARD_COMPLETE_XP,
  SCHOOLS_MICRO_XP_PER_CORRECT,
  schoolsCorrectMessage,
  schoolsWrongMessage
} from "@/lib/schools/schoolsQuestRewardFlow";

export type QuestQuizPanelProps = {
  pillarId: PillarId;
  slug: string;
  quiz: QuizConfig;
  /** True when the reading prerequisite is satisfied (quiz unlocked). */
  unlocked: boolean;
  /**
   * When true, bypass the Ready screen and start playing immediately once unlocked.
   * Use for in-flow "Quiz unlocked" CTAs (keeps momentum; fewer clicks).
   */
  autoStart?: boolean;
  /**
   * Label shown in the panel header (e.g. "Snapshot Quiz",
   * "Revenue Quiz"). Defaults to "Quiz".
   */
  title?: string;
  /** XP awarded for passing â€” surfaced in the summary card. */
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
  /** Pass screen CTA — next quest in the pillar trail. */
  nextQuest?: { href: string; label: string };
  /** When this quest clears the island, CTA back to hub / conviction gate. */
  islandFinaleCta?: { href: string; label: string };
  /** Island pass screen — centered headline, XP, and trail copy. */
  passCelebration?: { headline: string; message: string };
  /** Pillar accent for quiz panel chrome (business / financials / management). */
  panelTheme?: PillarQuestTheme;
  /** Return to insight cards (pillar quest reading flow). */
  onReviewQuestCards?: () => void;
  /** Schools Business Island — micro rewards + hybrid skill summary. */
  rewardFlow?: "default" | "schools";
  /** Short topic takeaways for the post-quiz mentor summary (Schools flow). */
  whatYouNowKnow?: readonly string[];
  /** Opening pride line — "You now understand … better than most beginners." */
  schoolsPrideLine?: string;
  /** Company display name — used on principle-unlock completion screens. */
  companyName?: string;
  microXpPerCorrect?: number;
  cardCompleteXp?: number;
  onBackToIsland?: () => void;
  /** When set, inline question progress is hidden (shown in page header instead). */
  externalQuestionProgress?: boolean;
  /** Fires while answering — null when not in the playing phase. */
  onPlayingProgress?: (progress: { current: number; total: number } | null) => void;
  /**
   * Schools / in-flow handoff — always open on question 1 when the panel mounts,
   * even if the quest slug is already marked complete in the engine.
   */
  freshAttemptOnMount?: boolean;
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

export function QuestQuizPanel({
  pillarId,
  slug,
  quiz: quizRaw,
  unlocked,
  autoStart = false,
  title = "Quiz",
  rewardXp = 0,
  cardsRead,
  cardsTotal,
  metaCompletion,
  uiVariant = "default",
  honorSeed = false,
  nextQuest,
  islandFinaleCta,
  passCelebration,
  panelTheme,
  onReviewQuestCards,
  rewardFlow = "default",
  whatYouNowKnow,
  schoolsPrideLine,
  companyName,
  microXpPerCorrect = SCHOOLS_MICRO_XP_PER_CORRECT,
  cardCompleteXp = SCHOOLS_CARD_COMPLETE_XP,
  onBackToIsland,
  externalQuestionProgress = false,
  onPlayingProgress,
  freshAttemptOnMount = false
}: QuestQuizPanelProps) {
  const pathname = usePathname();
  const mapReturnHref = resolveSchoolsDemoMapHref(pathname);
  const { state, actions } = useGame();
  const quiz = useMemo(() => normalizeQuizConfig(quizRaw), [quizRaw]);

  const isTenK = uiVariant === "ten-k-final";
  const accent = panelTheme ?? {
    hi: GOLD_HI,
    lo: GOLD_HI,
    glow: GOLD_GLOW,
    glowSoft: "rgba(245,197,71,0.14)",
    border: GOLD_BORDER,
    borderSoft: GOLD_BORDER_SOFT,
    rim: GOLD_BORDER,
    whyHi: GOLD_HI,
    whyGlow: GOLD_GLOW,
    whyWash: "rgba(245,197,71,0.10)",
    badgeText: "#0a0a0a",
    markReadPulse: "rgba(245,197,71,0.14)"
  };

  // Engine source of truth â€” XP awarded for this quest?
  const slugTrackedComplete =
    !metaCompletion &&
    (state.pillars[pillarId]?.completedQuestSlugs.includes(slug) ?? false);
  const alreadyCompleted = Boolean(
    metaCompletion?.completed ?? slugTrackedComplete
  );

  const playable = hasPlayableQuizConfig(quiz);
  const questions = useMemo(
    () => (playable && quiz ? quiz.questions : []),
    [playable, quiz]
  );
  const total = questions.length;
  const threshold = quiz?.passThreshold ?? 0.66;
  const requiredCorrect = Math.max(1, Math.ceil(total * threshold));

  const shouldShuffleOnMount =
    !alreadyCompleted && autoStart && unlocked;
  const initialLayoutRef = useRef(
    shouldShuffleOnMount
      ? createQuizAttemptLayout(questions, true)
      : {
          order: questions.map((_, i) => i),
          displayQuestions: questions.map((q) => q)
        }
  );

  const [order, setOrder] = useState<number[]>(() => initialLayoutRef.current.order);
  const [displayQuestions, setDisplayQuestions] = useState<QuizQuestion[]>(
    () => initialLayoutRef.current.displayQuestions
  );
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastFraction, setLastFraction] = useState<number | null>(null);
  const [didPass, setDidPass] = useState<boolean>(alreadyCompleted);
  /** First-time meta pass â€” show XP line even before parent re-renders. */
  const [showTenKXpBanner, setShowTenKXpBanner] = useState(false);
  const [phase, setPhase] = useState<Phase>(() =>
    alreadyCompleted ? "summary" : unlocked ? (autoStart ? "playing" : "ready") : "locked"
  );
  const [microBeat, setMicroBeat] = useState<{
    questionId: string;
    kind: "correct" | "wrong";
    message: string;
  } | null>(null);
  const celebratedQuestionRef = useRef<string | null>(null);
  const checkedIdsRef = useRef<string[]>([]);
  const currentQRef = useRef<QuizQuestion | null>(null);
  const answerCheckTimerRef = useRef<number | null>(null);
  const continueCtaRef = useRef<HTMLDivElement | null>(null);
  const isSchoolsReward = rewardFlow === "schools";
  const isSchoolsMission = isSchoolsReward && accent.cardChrome === "mission";

  checkedIdsRef.current = checkedIds;

  const clearAnswerCheckTimer = useCallback(() => {
    if (answerCheckTimerRef.current) {
      clearTimeout(answerCheckTimerRef.current);
      answerCheckTimerRef.current = null;
    }
  }, []);

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

  useEffect(() => {
    if (!onPlayingProgress) return;
    if (phase === "playing" && total > 0) {
      onPlayingProgress({ current: currentIndex + 1, total });
      return;
    }
    onPlayingProgress(null);
  }, [onPlayingProgress, phase, currentIndex, total]);

  const honorRoll =
    isTenK &&
    didPass &&
    (Boolean(honorSeed) ||
      (lastFraction !== null && lastFraction >= 0.9));

  const startQuiz = useCallback(() => {
    const layout = createQuizAttemptLayout(questions, true);
    setOrder(layout.order);
    setDisplayQuestions(layout.displayQuestions);
    setAnswers({});
    setCheckedIds([]);
    setCurrentIndex(0);
    setDidPass(false);
    setLastScore(null);
    setLastFraction(null);
    setShowTenKXpBanner(false);
    setMicroBeat(null);
    celebratedQuestionRef.current = null;
    clearAnswerCheckTimer();
    setPhase("playing");
  }, [questions, clearAnswerCheckTimer]);

  // In-flow handoff: when the quiz panel mounts after a "Quiz unlocked" CTA,
  // skip the Ready interstitial and start immediately once unlocked.
  useEffect(() => {
    if (!autoStart) return;
    if (!unlocked) return;
    if (phase !== "ready") return;
    startQuiz();
  }, [autoStart, alreadyCompleted, unlocked, phase, startQuiz]);

  // Re-entering the quiz (Schools) must show questions, not the prior pass summary.
  useEffect(() => {
    if (!freshAttemptOnMount || !autoStart || !unlocked) return;
    startQuiz();
  }, [freshAttemptOnMount, autoStart, unlocked, startQuiz]);

  function setAnswer(qid: string, value: unknown) {
    if (checkedIdsRef.current.includes(qid)) return;
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  const lockInCurrentAnswer = useCallback(() => {
    const q = currentQRef.current;
    if (!q || checkedIdsRef.current.includes(q.id)) return;
    const ans = answers[q.id];
    if (!isQuizAnswerProvided(q, ans)) return;
    if (q.kind === "order") {
      const oq = q as OrderQuestion;
      const initial = initialOrderPermutation(oq.id, oq.steps.length);
      if (
        Array.isArray(ans) &&
        orderPermutationsEqual(ans as number[], initial)
      ) {
        return;
      }
    }
    setCheckedIds((prev) => (prev.includes(q.id) ? prev : [...prev, q.id]));
  }, [answers]);

  function advance() {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    // Last question â€” tally final score and transition to summary.
    const correctCount = order.reduce((n, idx) => {
      const q = displayQuestions[idx]!;
      return isQuizAnswerCorrect(q, answers[q.id]) ? n + 1 : n;
    }, 0);
    setLastScore(correctCount);
    const pct = total === 0 ? 0 : correctCount / total;
    setLastFraction(pct);
    const passed = pct >= threshold;
    setDidPass(passed);
    setPhase("summary");
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
  }

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const currentQ: QuizQuestion | null =
    phase === "playing" && order[currentIndex] !== undefined
      ? displayQuestions[order[currentIndex]] ?? null
      : null;
  currentQRef.current = currentQ;
  const currentQuestionId = currentQ?.id ?? null;
  const currentAnswerValue = currentQuestionId
    ? answers[currentQuestionId]
    : undefined;
  const isCurrentChecked = currentQ
    ? checkedIds.includes(currentQ.id)
    : false;
  const isCurrentCorrect = currentQ
    ? isQuizAnswerCorrect(currentQ, answers[currentQ.id])
    : false;
  const isCurrentAnswerProvided = currentQ
    ? isQuizAnswerProvided(currentQ, currentAnswerValue)
    : false;
  const isOrderAtDefault =
    currentQ?.kind === "order" &&
    Array.isArray(currentAnswerValue) &&
    orderPermutationsEqual(
      currentAnswerValue as number[],
      initialOrderPermutation(
        currentQ.id,
        (currentQ as OrderQuestion).steps.length
      )
    );
  const canLockIn =
    isCurrentAnswerProvided &&
    !isCurrentChecked &&
    (currentQ?.kind !== "order" || !isOrderAtDefault);

  const isLast = currentIndex >= total - 1;

  const questViews = usePillarQuestViews(pillarId);
  const pillarCompletedCount = questViews.filter((q) => q.completed).length;
  const pillarQuestTotal = questViews.length;
  const pillarProgressPct =
    pillarQuestTotal > 0
      ? Math.round((pillarCompletedCount / pillarQuestTotal) * 100)
      : 0;
  const questTrailIndex = questViews.findIndex((q) => q.quest.slug === slug);
  const isLastQuestInPillar =
    questTrailIndex >= 0 && questTrailIndex === questViews.length - 1;
  const nextIsland = nextPillarId(pillarId);

  const quizPlayingCopy = useMemo(
    () => islandQuizPlayingFeedback(pillarId, slug),
    [pillarId, slug]
  );

  const lockInHelperText =
    currentQ?.kind === "order" && !canLockIn
      ? "Reorder the steps, then lock in your answer"
      : canLockIn
        ? ""
        : quizPlayingCopy.prompt;

  const checkedFeedbackMessage = !isCurrentChecked
    ? ""
    : (() => {
        if (isSchoolsReward && !isCurrentCorrect) return "";
        const schoolsMsg =
          microBeat &&
          isSchoolsReward &&
          microBeat.questionId === currentQ?.id
            ? microBeat.message
            : null;
        return (
          schoolsMsg ??
          (isCurrentCorrect
            ? quizPlayingCopy.correct
            : quizPlayingCopy.wrong)
        );
      })();

  const learningRecap = useMemo(() => {
    if (phase !== "summary" || lastScore === null) return [];
    const snippets: string[] = [];
    for (const idx of order) {
      const q = displayQuestions[idx]!;
      if (isQuizAnswerCorrect(q, answers[q.id])) continue;
      if (q.explain?.trim()) snippets.push(q.explain.trim());
      if (snippets.length >= 2) break;
    }
    return snippets;
  }, [phase, lastScore, order, displayQuestions, answers]);

  // Instant inline feedback once the answer is complete (same screen).
  // Removed: answers lock in only via explicit "LOCK IN ANSWER" CTA.

  useEffect(() => {
    setMicroBeat(null);
    celebratedQuestionRef.current = null;
    clearAnswerCheckTimer();
  }, [currentIndex, clearAnswerCheckTimer]);

  useEffect(() => {
    return () => clearAnswerCheckTimer();
  }, [clearAnswerCheckTimer]);

  // Tall question layouts (e.g. multiple choice) can push the CTA below the fold.
  useEffect(() => {
    if (phase !== "playing" || !isCurrentChecked) return;
    const node = continueCtaRef.current;
    if (!node) return;
    const t = window.setTimeout(() => {
      node.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 160);
    return () => window.clearTimeout(t);
  }, [phase, isCurrentChecked, currentIndex]);

  useEffect(() => {
    if (phase !== "playing" || !isSchoolsReward || !currentQuestionId) return;
    if (!checkedIds.includes(currentQuestionId)) return;
    if (celebratedQuestionRef.current === currentQuestionId) return;

    const q = currentQRef.current;
    if (!q) return;

    celebratedQuestionRef.current = currentQuestionId;
    const correct = isQuizAnswerCorrect(q, currentAnswerValue);
    setMicroBeat({
      questionId: currentQuestionId,
      kind: correct ? "correct" : "wrong",
      message: correct
        ? schoolsCorrectMessage(currentIndex)
        : schoolsWrongMessage(currentIndex)
    });
  }, [
    phase,
    currentQuestionId,
    currentAnswerValue,
    checkedIds,
    currentIndex,
    isSchoolsReward
  ]);

  const perQuestionStatus: PerQuestionStatus[] = order.map((origIdx, slot) => {
    const q = displayQuestions[origIdx]!;
    const checked = checkedIds.includes(q.id);
    if (!checked) {
      return slot === currentIndex ? "current" : "upcoming";
    }
    return isQuizAnswerCorrect(q, answers[q.id]) ? "correct" : "wrong";
  });

  const isPassedDisplay = phase === "summary" && didPass;
  const isFailedDisplay = phase === "summary" && !didPass;
  /** Playing + ready + pass summary — no duplicate title chip / section label. */
  const isPlayingFocus = phase === "playing" && !isTenK && !isSchoolsMission;
  const schoolsLearnings =
    whatYouNowKnow && whatYouNowKnow.length > 0
      ? whatYouNowKnow
      : learningRecap;
  const hideHeader =
    !isTenK &&
    (phase === "ready" ||
      phase === "playing" ||
      (phase === "summary" && isPassedDisplay));

  const isMicroCorrectCelebration =
    microBeat?.questionId === currentQ?.id && microBeat?.kind === "correct";

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (!playable) {
    return (
      <motion.div
        role="status"
        className="rounded-2xl border border-white/10 bg-black/30 px-5 py-8 text-center text-sm text-ink-2"
      >
        Quiz questions are not available for this quest yet.
      </motion.div>
    );
  }

  const baseStyle: React.CSSProperties = isSchoolsMission
    ? {
        borderColor: isPassedDisplay ? GREEN_BORDER : accent.border,
        background:
          accent.surface ??
          "linear-gradient(168deg, #fffbeb 0%, #fef3c7 46%, #fde68a 100%)",
        boxShadow: isPassedDisplay
          ? "0 16px 36px rgba(2, 6, 23, 0.18), inset 0 0 0 1px rgba(34,197,139,0.28)"
          : "inset 0 1px 0 rgba(255, 255, 255, 0.78), inset 0 -2px 0 rgba(180, 83, 9, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.42), 0 10px 26px rgba(2, 6, 23, 0.22)"
      }
    : {
        borderColor: isPassedDisplay ? GREEN_BORDER : accent.border,
        background: "rgba(8,7,4,0.78)",
        boxShadow: isPassedDisplay
          ? `0 24px 60px -28px rgba(34,197,139,0.55), inset 0 0 0 1px rgba(34,197,139,0.20)`
          : `0 24px 60px -28px ${accent.glow}, inset 0 0 0 1px ${accent.borderSoft}`
      };

  return (
    <motion.section
      initial={false}
      animate={
        isPlayingFocus
          ? undefined
          : {
              boxShadow: baseStyle.boxShadow as string,
              borderColor: baseStyle.borderColor as string
            }
      }
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={
        isPlayingFocus
          ? "relative"
          : `relative overflow-hidden rounded-2xl border backdrop-blur-md${
              isSchoolsMission ? " iq-schools-quest-quiz-panel" : ""
            }`
      }
      style={isPlayingFocus ? undefined : baseStyle}
      aria-label={title}
    >
      {!isPlayingFocus ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: isPassedDisplay
              ? "radial-gradient(110% 80% at 90% -10%, rgba(34,197,139,0.10) 0%, transparent 60%)"
              : `radial-gradient(110% 80% at 90% -10%, ${accent.glowSoft} 0%, transparent 60%)`
          }}
        />
      ) : null}

      <div
        className={
          isPlayingFocus ? "relative" : "relative px-5 py-5 md:px-6 md:py-6"
        }
      >
        {/* Header row â€” hidden on ready intro (body shows "Quiz unlocked" only). */}
        {!hideHeader ? (
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
              style={{
                color: isSchoolsMission
                  ? accent.badgeText ?? "#92400e"
                  : isPassedDisplay
                    ? GREEN_HI
                    : GOLD_HI
              }}
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
        ) : null}

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
                pillarId={pillarId}
                questSlug={slug}
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
                pillarId={pillarId}
                questSlug={slug}
                total={total}
                requiredCorrect={requiredCorrect}
                title={title}
                onStart={startQuiz}
                accent={accent}
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
              {isTenK ? <ProgressDots statuses={perQuestionStatus} /> : null}

              {isSchoolsMission ? (
                <SchoolsMissionQuizProgress
                  currentIndex={currentIndex}
                  total={total}
                  answeredCount={checkedIds.length}
                />
              ) : null}

              {isPlayingFocus && !externalQuestionProgress ? (
                <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-2/65">
                  Question {currentIndex + 1} of {total}
                </p>
              ) : null}

              <div className="relative overflow-visible">
                {isSchoolsMission && isMicroCorrectCelebration && currentQ ? (
                  <ConfettiBurst
                    triggerKey={`panel-${currentQ.id}-correct`}
                    count={18}
                    spreadX={220}
                    fallDistance={200}
                    originTopPct={12}
                    particleDurationSec={1.65}
                    maxParticleDelaySec={0.38}
                    activeDurationMs={2600}
                    className="pointer-events-none absolute inset-x-[-8%] -top-6 bottom-0 z-20"
                  />
                ) : null}
                <AnimatePresence mode="wait" initial={false}>
                  {currentQ ? (
                    <motion.div
                      key={currentQ.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={
                        isSchoolsReward &&
                        microBeat?.questionId === currentQ.id &&
                        microBeat.kind === "wrong"
                          ? { opacity: 1, y: 0, x: [0, -5, 5, -3, 3, 0] }
                          : { opacity: 1, y: 0, x: 0 }
                      }
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <QuizQuestionView
                        index={currentIndex}
                        question={currentQ}
                        value={answers[currentQ.id]}
                        onChange={(v) => setAnswer(currentQ.id, v)}
                        mode={isCurrentChecked ? "review" : "input"}
                        showFeedback={false}
                        variant={isPlayingFocus ? "focus" : "default"}
                        surfaceTheme={isSchoolsMission ? accent : undefined}
                        celebrateCorrect={isMicroCorrectCelebration}
                        successXp={
                          isSchoolsReward && isMicroCorrectCelebration
                            ? microXpPerCorrect
                            : undefined
                        }
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <motion.div
                ref={continueCtaRef}
                className={
                  isPlayingFocus || isSchoolsMission
                    ? "mt-8 flex flex-col items-center gap-4"
                    : "mt-5 flex flex-wrap items-center justify-between gap-3"
                }
                initial={false}
                animate={{
                  opacity:
                    isSchoolsMission || canLockIn || isCurrentChecked ? 1 : 0.55
                }}
              >
                {isCurrentChecked ? (
                  <>
                    {checkedFeedbackMessage.trim() ? (
                      <motion.span
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className={
                          isPlayingFocus || isSchoolsMission
                            ? "text-center text-sm font-semibold sm:text-left"
                            : "text-[11.5px] uppercase tracking-[0.16em]"
                        }
                        style={{
                          color: isCurrentCorrect
                            ? isSchoolsMission
                              ? "#15803d"
                              : GREEN_HI
                            : isSchoolsMission
                              ? "#b45309"
                              : RED_HI
                        }}
                        aria-live="polite"
                      >
                        {checkedFeedbackMessage}
                      </motion.span>
                    ) : null}
                    <PrimaryGoldButton
                      onClick={advance}
                      variant={isPlayingFocus ? "trail" : "default"}
                      theme={isSchoolsMission ? accent : undefined}
                    >
                      {isLast ? "See results" : "Next question"}
                    </PrimaryGoldButton>
                  </>
                ) : (
                  <>
                    {isPlayingFocus ? (
                      <span className="sr-only">
                        {canLockIn
                          ? "Lock in your answer to continue"
                          : "Select an answer to continue"}
                      </span>
                    ) : lockInHelperText.trim() ? (
                      <span
                        className={
                          isSchoolsMission
                            ? "text-center text-[12px] font-semibold uppercase tracking-[0.14em]"
                            : "text-[11.5px] uppercase tracking-[0.16em] text-ink-2"
                        }
                        style={
                          isSchoolsMission ? { color: "#64748b" } : undefined
                        }
                      >
                        {lockInHelperText}
                      </span>
                    ) : isSchoolsMission ? null : (
                      <span className="sr-only">
                        Select an answer to continue
                      </span>
                    )}
                    <PrimaryGoldButton
                      onClick={lockInCurrentAnswer}
                      disabled={!canLockIn}
                      variant={isPlayingFocus ? "trail" : "default"}
                      theme={isSchoolsMission ? accent : undefined}
                      readyPulse={isSchoolsMission && canLockIn}
                    >
                      {LOCK_IN_ANSWER_LABEL}
                    </PrimaryGoldButton>
                  </>
                )}
              </motion.div>
            </motion.div>
          ) : isSchoolsReward && didPass && onBackToIsland ? (
            <motion.div
              key="schools-summary"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <SchoolsQuestQuizCompletionFlow
                key={`schools-complete-${slug}`}
                rewardXp={cardCompleteXp > 0 ? cardCompleteXp : rewardXp}
                quizMicroXp={
                  lastScore != null ? lastScore * microXpPerCorrect : 0
                }
                prideLine={
                  schoolsPrideLine ??
                  "You now understand this company better than most beginners."
                }
                takeaways={schoolsLearnings}
                accent={accent}
                onBackToIsland={onBackToIsland}
                questSlug={slug}
                companyName={companyName}
              />
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
                onReviewQuestCards={onReviewQuestCards}
                nextQuest={nextQuest}
                islandFinaleCta={islandFinaleCta}
                mapReturnHref={mapReturnHref}
                isLastQuestInPillar={isLastQuestInPillar}
                nextIslandTitle={
                  nextIsland ? pillarById(nextIsland).title : undefined
                }
                passCelebration={passCelebration}
                accent={accent}
                pillarId={pillarId}
                pillarProgressPct={pillarProgressPct}
                pillarCompletedCount={pillarCompletedCount}
                pillarQuestTotal={pillarQuestTotal}
                learningRecap={learningRecap}
                quizPerfect={lastScore !== null && lastScore === total}
                celebrateKey={
                  didPass ? `${pillarId}:${slug}:${lastScore}` : null
                }
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
  pillarId,
  questSlug,
  cardsRead,
  cardsTotal
}: {
  isTenK: boolean;
  pillarId: PillarId;
  questSlug: string;
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
          pulse saved after each pillar. Finish the map â€” then come back to
          light the core.
        </p>
      </>
    );
  }
  return (
    <div className="mt-3 space-y-2 text-center">
      {typeof cardsRead === "number" && typeof cardsTotal === "number" ? (
        <p
          className="text-[10.5px] font-semibold uppercase tracking-[0.20em] text-ink-2"
          style={{ color: "rgba(245,197,71,0.75)" }}
        >
          {cardsRead} / {cardsTotal} insights
        </p>
      ) : null}
      <p className="text-[13px] leading-relaxed text-ink-2">
        {islandQuizLockedHint(pillarId, questSlug)}
      </p>
    </div>
  );
}

function ReadyBody({
  isTenK,
  pillarId,
  questSlug,
  total,
  requiredCorrect,
  title,
  onStart,
  accent
}: {
  isTenK: boolean;
  pillarId: PillarId;
  questSlug: string;
  total: number;
  requiredCorrect: number;
  title: string;
  onStart: () => void;
  accent: PillarQuestTheme;
}) {
  const isMission = accent.cardChrome === "mission";
  const bodyText = accent.text ?? "#1e3a5f";
  if (isTenK) {
    return (
      <>
        <h3 className="mt-3 font-[var(--font-grotesk)] text-[18px] leading-tight text-ink-0">
          Final Challenge â€” prove the full picture
        </h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-1">
          Twelve rapid-fire prompts pulled from Business, Forces, Financials,
          and Management â€” mixed formats, shuffled every run. Clear{" "}
          <span className="font-semibold text-ink-0">
            {requiredCorrect} of {total}
          </span>{" "}
          to claim your{" "}
          <span className="font-semibold text-ink-0">10-K Rookie Badge</span> and
          bonus XP. This is a boss encounter, not a scantron.
        </p>
        <div className="mt-4">
          <PrimaryGoldButton onClick={onStart} theme={accent}>
            Enter the reactor
          </PrimaryGoldButton>
        </div>
      </>
    );
  }
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div className="relative w-full px-2 pt-1 pb-4" initial={false}>
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[55%] h-28 w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: `radial-gradient(ellipse 85% 75% at 50% 50%, ${accent.glowSoft}, ${accent.whyWash} 45%, transparent 72%)`
          }}
        />
        <motion.div
          initial={false}
          animate={{
            filter: [
              `drop-shadow(0 0 14px ${accent.glow})`,
              `drop-shadow(0 0 26px ${accent.glow})`,
              `drop-shadow(0 0 14px ${accent.glow})`
            ]
          }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex flex-col items-center"
        >
          <h3
            className="font-[var(--font-grotesk)] text-[clamp(1.35rem,5vw,1.85rem)] font-bold uppercase leading-none tracking-[0.16em]"
            style={{
              color: accent.hi,
              textShadow: `0 0 32px ${accent.glow}, 0 2px 0 rgba(0,0,0,0.35)`
            }}
          >
            {islandQuizUnlockedHeadline(pillarId, questSlug)}
          </h3>
        </motion.div>
      </motion.div>

      <p
        className="max-w-md text-[13.5px] leading-relaxed"
        style={{ color: isMission ? bodyText : undefined }}
      >
        <span className={isMission ? "" : "text-ink-1"}>
          {islandQuizReadyIntro(pillarId, requiredCorrect, total, questSlug)}
        </span>
      </p>

      <div className="mt-6 flex w-full justify-center">
        <PrimaryGoldButton onClick={onStart} theme={accent} variant="trail">
          {islandQuizStartCta(pillarId, questSlug)}
        </PrimaryGoldButton>
      </div>
    </div>
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


function SummaryBody({
  isTenK,
  honorRoll,
  didPass,
  score,
  total,
  requiredCorrect,
  rewardXp,
  celebrateXp,
  onReplay,
  onReviewQuestCards,
  nextQuest,
  islandFinaleCta,
  mapReturnHref,
  isLastQuestInPillar,
  nextIslandTitle,
  passCelebration,
  accent,
  pillarId,
  pillarProgressPct,
  pillarCompletedCount,
  pillarQuestTotal,
  learningRecap,
  quizPerfect,
  celebrateKey
}: {
  isTenK: boolean;
  honorRoll: boolean;
  mapReturnHref: string;
  didPass: boolean;
  score: number | null;
  total: number;
  requiredCorrect: number;
  rewardXp: number;
  celebrateXp: boolean;
  onReplay: () => void;
  onReviewQuestCards?: () => void;
  nextQuest?: { href: string; label: string };
  islandFinaleCta?: { href: string; label: string };
  isLastQuestInPillar?: boolean;
  nextIslandTitle?: string;
  passCelebration?: { headline: string; message: string };
  accent: PillarQuestTheme;
  pillarId: PillarId;
  pillarProgressPct: number;
  pillarCompletedCount: number;
  pillarQuestTotal: number;
  learningRecap: string[];
  quizPerfect: boolean;
  celebrateKey: string | null;
}) {
  if (didPass && !isTenK) {
    const xpBase = rewardXp > 0 ? rewardXp : XP_SECTION_QUIZ;
    const xpEarned = celebrateXp
      ? quizPerfect
        ? xpBase + XP_QUIZ_PERFECT_BONUS
        : xpBase
      : 0;
    return (
      <QuizCompleteReward
        headline={passCelebration?.headline ?? "Quest cleared"}
        message={passCelebration?.message}
        score={score}
        total={total}
        xpEarned={xpEarned}
        quizPerfect={quizPerfect}
        learningRecap={learningRecap}
        pillarId={pillarId}
        pillarProgressPct={pillarProgressPct}
        pillarCompletedCount={pillarCompletedCount}
        pillarQuestTotal={pillarQuestTotal}
        nextQuest={nextQuest}
        islandFinaleCta={islandFinaleCta}
        isLastQuestInPillar={isLastQuestInPillar}
        nextIslandTitle={nextIslandTitle}
        islandMasteryXp={XP_ISLAND_COMPLETION}
        onReplay={onReplay}
        accent={accent}
        celebrateKey={celebrateKey}
      />
    );
  }

  const passTitle = isTenK
    ? honorRoll
      ? "High Conviction Rookie"
      : "10-K Rookie unlocked"
    : "Quiz passed";
  const failTitle = isTenK ? "Close call â€” run it back" : "Almost there";
  const passDetail =
    score !== null
      ? isTenK
        ? `You locked ${score} / ${total} â€” full-company read confirmed.`
        : `You got ${score} of ${total}`
      : "";
  const failDetail =
    score !== null
      ? isTenK
        ? `You landed ${score} / ${total}. Need ${requiredCorrect} to clear the reactor.`
        : `You got ${score} of ${total} â€” need ${requiredCorrect} of ${total} to pass`
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
          Rare clear â€” you held 90%+ accuracy across every island lens. That is
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
            ? "Badge and XP are saved locally. The map core stays lit â€” your next expedition bridge is warming up."
            : "XP is locked in for this quest. Replay any time â€” your XP only counts once."
          : isTenK
          ? "No penalty run â€” shuffle a new lane, skim one weak island, and dive back in."
          : "Skim the insights once more, then retry the quiz. Questions shuffle every attempt."}
      </p>

      <QuizSummaryActions
        className="mt-5"
        accent={accent}
        onReplay={onReplay}
        onReviewQuestCards={onReviewQuestCards}
        primary={
          didPass && nextQuest && !isTenK
            ? { kind: "link", href: nextQuest.href, label: "NEXT QUEST UNLOCKED" }
            : didPass && islandFinaleCta && !isTenK
              ? {
                  kind: "link",
                  href: islandFinaleCta.href,
                  label: islandFinaleCta.label
                }
              : { kind: "button", label: didPass ? (isTenK ? "Retry quiz" : "Retry quiz") : "Retry quiz" }
        }
        extraLink={
          isTenK && didPass
            ? { href: mapReturnHref, label: "Return to map" }
            : undefined
        }
      />
    </>
  );
}

function QuizCompleteReward({
  headline,
  message,
  score,
  total,
  xpEarned,
  quizPerfect,
  learningRecap,
  pillarId,
  pillarProgressPct,
  pillarCompletedCount,
  pillarQuestTotal,
  nextQuest,
  islandFinaleCta,
  isLastQuestInPillar,
  nextIslandTitle,
  islandMasteryXp,
  onReplay,
  onReviewQuestCards,
  accent,
  celebrateKey
}: {
  headline: string;
  message?: string;
  score: number | null;
  total: number;
  xpEarned: number;
  quizPerfect: boolean;
  learningRecap: string[];
  pillarId: PillarId;
  pillarProgressPct: number;
  pillarCompletedCount: number;
  pillarQuestTotal: number;
  nextQuest?: { href: string; label: string };
  islandFinaleCta?: { href: string; label: string };
  isLastQuestInPillar?: boolean;
  nextIslandTitle?: string;
  islandMasteryXp: number;
  onReplay: () => void;
  onReviewQuestCards?: () => void;
  accent: PillarQuestTheme;
  celebrateKey: string | null;
}) {
  const pillar = pillarById(pillarId);
  const scorePct =
    score !== null && total > 0 ? Math.round((score / total) * 100) : 0;
  const islandConquered = Boolean(isLastQuestInPillar);
  const trailCta = nextQuest ?? (islandConquered ? islandFinaleCta : undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="relative flex flex-col items-center px-2 pt-1 pb-1 text-center"
    >
      <ConfettiBurst triggerKey={celebrateKey} count={islandConquered ? 32 : 22} />

      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[18%] h-36 w-[min(100%,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: islandConquered
            ? `radial-gradient(ellipse 90% 80% at 50% 50%, ${accent.glow}, rgba(245,197,71,0.12) 40%, transparent 72%)`
            : `radial-gradient(ellipse 85% 75% at 50% 50%, ${accent.glowSoft}, rgba(34,197,139,0.08) 45%, transparent 72%)`
        }}
      />

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="relative mt-2 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border"
        style={{
          borderColor: GREEN_BORDER,
          background: "rgba(34,197,139,0.12)",
          boxShadow: "0 0 32px rgba(34,197,139,0.45)"
        }}
      >
        <span style={{ color: GREEN_HI }}>
          <CheckGlyph className="h-7 w-7" />
        </span>
      </motion.div>

      <h3
        className="relative mt-4 font-[var(--font-grotesk)] text-[clamp(1.15rem,4.5vw,1.6rem)] font-bold uppercase leading-tight tracking-[0.12em]"
        style={{
          color: accent.hi,
          textShadow: `0 0 28px ${accent.glow}, 0 2px 0 rgba(0,0,0,0.35)`
        }}
      >
        {headline}
      </h3>

      {score !== null ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="relative mt-3 font-[var(--font-grotesk)] text-[clamp(1.5rem,6vw,2rem)] font-bold tabular-nums leading-none"
          style={{ color: "#fff" }}
        >
          {score}
          <span className="text-[0.55em] font-semibold text-ink-2">
            {" "}
            / {total}
          </span>
          <span
            className="ml-2 text-[0.42em] font-semibold uppercase tracking-[0.14em]"
            style={{ color: GREEN_HI }}
          >
            {scorePct}%
          </span>
        </motion.p>
      ) : null}

      {xpEarned > 0 ? (
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 320, damping: 22 }}
          className="relative mt-4 inline-flex flex-col items-center gap-1"
        >
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.16em]"
            style={{
              borderColor: GREEN_BORDER,
              background: "rgba(34,197,139,0.14)",
              color: GREEN_HI,
              boxShadow: "0 0 20px rgba(34,197,139,0.4)"
            }}
          >
            <SparkleGlyph className="h-3.5 w-3.5" />
            +{xpEarned} Investor XP
          </motion.span>
          {quizPerfect ? (
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-2">
              Perfect run — +{XP_QUIZ_PERFECT_BONUS} bonus
            </span>
          ) : null}
        </motion.div>
      ) : null}

      {islandConquered ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="relative mt-5 w-full max-w-md rounded-xl border px-4 py-4"
          style={{
            borderColor: accent.border,
            background: `linear-gradient(160deg, ${accent.glowSoft}, rgba(0,0,0,0.35))`,
            boxShadow: `0 0 40px -12px ${accent.glow}`
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: accent.hi }}
          >
            Island conquered
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-1">
            {pillar.title} is fully cleared. Chart your conviction to power the
            bridge
            {nextIslandTitle ? ` toward ${nextIslandTitle}` : " to your next expedition"}
            {" "}
            and claim +{islandMasteryXp} mastery XP.
          </p>
          <BridgeUnlockPulse accent={accent} />
        </motion.div>
      ) : null}

      {message && pillarId !== "business" ? (
        <p className="relative mt-4 max-w-md text-[13.5px] leading-relaxed text-ink-1">
          {message}
        </p>
      ) : null}

      {pillarId !== "business" && learningRecap.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="relative mt-5 w-full max-w-md rounded-xl border px-4 py-3 text-left"
          style={{
            borderColor: accent.borderSoft,
            background: "rgba(255,255,255,0.03)"
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: accent.hi }}
          >
            Quick recap
          </p>
          <ul className="mt-2 space-y-2">
            {learningRecap.map((line, i) => (
              <li
                key={i}
                className="text-[12.5px] leading-relaxed text-ink-1 before:mr-2 before:content-['•']"
                style={{ color: "rgb(210 210 225)" }}
              >
                {line}
              </li>
            ))}
          </ul>
        </motion.div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="relative mt-5 w-full max-w-md"
      >
        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-2">
          <span>{pillar.title} island</span>
          <span className="tabular-nums" style={{ color: accent.hi }}>
            {pillarCompletedCount} / {pillarQuestTotal} quests
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full border"
          style={{
            borderColor: accent.borderSoft,
            background: "rgba(255,255,255,0.04)"
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pillarProgressPct}%` }}
            transition={{ delay: 0.22, duration: 0.5, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${accent.lo}, ${accent.hi})`,
              boxShadow: `0 0 12px ${accent.glow}`
            }}
          />
        </div>
        <p className="mt-2 text-[11.5px] text-ink-2">
          {pillarId === "business" && nextQuest
            ? "Next quest unlocked — keep moving."
            : nextQuest
              ? "Your next quest is warmed up — keep the momentum."
              : islandConquered
                ? "Return to the island hub to lock conviction and unlock the trail ahead."
                : "This slice is cleared — explore the map for your next expedition."}
        </p>
      </motion.div>

      <QuizSummaryActions
        className="relative mt-7"
        accent={accent}
        onReplay={onReplay}
        onReviewQuestCards={onReviewQuestCards}
        primaryVariant={pillarId === "business" && trailCta ? "hero" : "trail"}
        primary={
          trailCta
            ? {
                kind: "link",
                href: trailCta.href,
                label: trailCta === nextQuest ? "NEXT QUEST UNLOCKED" : trailCta.label
              }
            : { kind: "button", label: "Retry quiz" }
        }
      />
    </motion.div>
  );
}

function BridgeUnlockPulse({ accent }: { accent: PillarQuestTheme }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative mx-auto mt-4 flex h-10 max-w-[220px] items-center justify-center"
    >
      <motion.span
        className="absolute left-[18%] h-2 w-2 rounded-full"
        style={{ background: accent.hi, boxShadow: `0 0 12px ${accent.glow}` }}
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="h-0.5 flex-1 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${accent.lo}, ${accent.hi}, ${accent.lo})`
        }}
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute right-[18%] h-2 w-2 rounded-full"
        style={{ background: GOLD_HI, boxShadow: `0 0 12px ${GOLD_GLOW}` }}
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.2, 0.95] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
    </div>
  );
}

function QuizSummarySecondaryButton({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-2/70 transition hover:text-ink-1"
    >
      {children}
    </button>
  );
}

function QuizSummaryActions({
  accent,
  onReplay,
  onReviewQuestCards,
  primary,
  extraLink,
  className = "",
  primaryVariant = "trail"
}: {
  accent: PillarQuestTheme;
  onReplay: () => void;
  onReviewQuestCards?: () => void;
  primary:
    | { kind: "link"; href: string; label: string }
    | { kind: "button"; label: string };
  extraLink?: { href: string; label: string };
  className?: string;
  primaryVariant?: "trail" | "hero";
}) {
  const showSecondaries =
    Boolean(onReviewQuestCards) || primary.kind === "link";
  const containerMaxClass = primaryVariant === "hero" ? "max-w-md" : "max-w-sm";

  return (
    <div
      className={`flex w-full ${containerMaxClass} flex-col items-center gap-4 ${className}`.trim()}
    >
      {primary.kind === "link" ? (
        <PrimaryGoldButton
          href={primary.href}
          theme={accent}
          variant={primaryVariant}
        >
          {primary.label}
        </PrimaryGoldButton>
      ) : (
        <PrimaryGoldButton
          onClick={onReplay}
          theme={accent}
          variant={primaryVariant}
        >
          {primary.label}
        </PrimaryGoldButton>
      )}

      {showSecondaries ? (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {onReviewQuestCards ? (
            <QuizSummarySecondaryButton onClick={onReviewQuestCards}>
              Review quest cards
            </QuizSummarySecondaryButton>
          ) : null}
          {primary.kind === "link" ? (
            <QuizSummarySecondaryButton onClick={onReplay}>
              Retry quiz
            </QuizSummarySecondaryButton>
          ) : null}
        </div>
      ) : null}

      {extraLink ? (
        <Link
          href={extraLink.href}
          className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-2/70 transition hover:text-ink-1"
        >
          {extraLink.label}
        </Link>
      ) : null}
    </div>
  );
}

function SchoolsMissionQuizProgress({
  currentIndex,
  total,
  answeredCount
}: {
  currentIndex: number;
  total: number;
  answeredCount: number;
}) {
  const displayPct =
    total > 0 ? Math.min(100, Math.round((answeredCount / total) * 100)) : 0;
  const trackPct =
    total > 0
      ? Math.min(
          100,
          Math.max(
            currentIndex === 0 && answeredCount === 0 ? 6 : 8,
            Math.round(((answeredCount + 0.12) / total) * 100)
          )
        )
      : 0;

  return (
    <div className="iq-schools-quiz-progress">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p
          className="text-[10.5px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "#92400e" }}
        >
          Question {currentIndex + 1} of {total}
        </p>
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: "#64748b" }}
        >
          {answeredCount}/{total} locked in
        </p>
      </div>
      <div
        className="iq-schools-quiz-progress__track"
        role="progressbar"
        aria-valuenow={displayPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Quiz progress: ${displayPct} percent`}
      >
        <motion.div
          className="iq-schools-quiz-progress__fill"
          initial={false}
          animate={{ width: `${trackPct}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function PrimaryGoldButton({
  onClick,
  href,
  disabled,
  theme: buttonTheme,
  variant = "default",
  readyPulse = false,
  children
}: {
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  theme?: PillarQuestTheme;
  variant?: "default" | "trail" | "hero";
  readyPulse?: boolean;
  children: React.ReactNode;
}) {
  const t = buttonTheme ?? {
    hi: GOLD_HI,
    border: GOLD_BORDER,
    glow: GOLD_GLOW,
    glowSoft: "rgba(245,197,71,0.14)"
  } as Pick<PillarQuestTheme, "hi" | "border" | "glow" | "glowSoft" | "cardChrome">;
  const isMission = t.cardChrome === "mission";
  const className = [
    "inline-flex items-center justify-center gap-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/75",
    isMission
      ? disabled
        ? "iq-schools-mission-nav-btn rounded-full font-black uppercase tracking-[0.08em] disabled:cursor-not-allowed"
        : [
            "iq-schools-mission-cta rounded-full font-black uppercase tracking-[0.08em]",
            readyPulse ? "iq-schools-quiz-lock-cta--ready" : ""
          ].join(" ")
      : "rounded-2xl border text-[13.5px] font-semibold",
    !isMission && variant === "hero"
      ? "w-full max-w-md px-8 py-4 text-[13px] uppercase tracking-[0.18em]"
      : !isMission && variant === "trail"
        ? "w-full max-w-[14rem] px-4 py-2.5 text-[12px] uppercase tracking-[0.18em]"
        : !isMission
          ? "px-4 py-2.5"
          : variant === "trail"
            ? "w-full max-w-[14rem] px-4 py-2 text-[12px]"
            : "px-5 py-2.5 text-[12px]"
  ].join(" ");
  const style: React.CSSProperties = isMission
    ? {
        cursor: disabled ? "not-allowed" : "pointer"
      }
    : {
        borderColor: t.border,
        background: disabled ? t.glowSoft : `color-mix(in srgb, ${t.hi} 24%, transparent)`,
        color: disabled ? `${t.hi}88` : t.hi,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow:
          disabled
            ? "none"
            : variant === "hero"
              ? `0 0 34px -12px ${t.glow}`
              : variant === "trail"
                ? `0 0 18px -12px ${t.glow}`
                : `0 0 24px -10px ${t.glow}`,
        opacity: disabled ? 0.85 : 1
      };

  if (href && !disabled) {
    return (
      <motion.div
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="inline-flex"
      >
        <Link href={href} className={className} style={style}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={className}
      style={style}
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

