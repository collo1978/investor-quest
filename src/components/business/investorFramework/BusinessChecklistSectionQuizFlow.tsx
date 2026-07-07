"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

import { QuestQuizPanel } from "@/components/QuestQuizPanel";
import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { useGame } from "@/components/GameProvider";
import type { Company } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { hasPlayableQuizConfig, normalizeQuizConfig } from "@/data/quests/types";
import { XP_SECTION_QUIZ } from "@/engine/progression/xpEconomy";
import { resolveChecklistSectionQuizConfig } from "@/lib/business/businessChecklistSectionQuizzes";
import {
  BUSINESS_INVESTOR_CHECKLIST_SECTIONS,
  resolveInvestorSection,
  type BusinessChecklistSectionId
} from "@/lib/business/businessInvestorFramework";
import { markSectionQuizPassed } from "@/lib/business/businessInvestorFrameworkStorage";
import { buildDynamicQuizConfig } from "@/lib/quests/dynamicQuizEngine";
import { fillQuizConfigTokens } from "@/lib/quests/fillQuestTokens";
import { SCHOOLS_MICRO_XP_PER_CORRECT } from "@/lib/schools/schoolsQuestRewardFlow";

type FlowPhase = "unlock" | "quiz" | "complete" | "next-unlock";

type Props = {
  company: Company;
  sectionId: BusinessChecklistSectionId;
  pillarId: PillarId;
  questSlug: string;
  theme: PillarQuestTheme;
  onPassed: () => void;
  onFinished: () => void;
};

function SectionQuizUnlockPanel({
  sectionLabel,
  onStart
}: {
  sectionLabel: string;
  onStart: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="iq-investor-evidence-unlock"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
    >
      <motion.span
        className="iq-investor-evidence-unlock__burst"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { scale: [0.85, 1.15, 1], opacity: [0.7, 0.35, 0.2] }
        }
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.span
        className="iq-investor-evidence-unlock__lock"
        aria-hidden
        animate={reduceMotion ? undefined : { rotate: [0, -8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        🔓
      </motion.span>
      <p className="iq-investor-evidence-unlock__eyebrow">Section quiz unlocked</p>
      <h3 className="iq-investor-evidence-unlock__title">{sectionLabel} Quiz</h3>
      <p className="iq-investor-evidence-unlock__copy">
        Five quick mini-games — each tests what you learned in a different way.
      </p>
      <button type="button" className="iq-investor-evidence-unlock__cta" onClick={onStart}>
        Start quiz
      </button>
    </motion.div>
  );
}

function SectionCompletePanel({
  sectionLabel,
  score,
  total,
  onContinue
}: {
  sectionLabel: string;
  score: number;
  total: number;
  onContinue: () => void;
}) {
  return (
    <motion.div
      className="iq-investor-evidence-complete"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
    >
      <span className="iq-investor-evidence-complete__burst" aria-hidden />
      <p className="iq-investor-evidence-complete__eyebrow">Section complete</p>
      <h3 className="iq-investor-evidence-complete__title">{sectionLabel}</h3>
      <p className="iq-investor-evidence-complete__rating">
        ✅ {score} / {total} correct
      </p>
      <p className="iq-investor-evidence-complete__copy">
        You passed the checkpoint — your Investor Checklist is updated.
      </p>
      <button type="button" className="iq-investor-evidence-complete__cta" onClick={onContinue}>
        Continue
      </button>
    </motion.div>
  );
}

function NextSectionUnlockPanel({
  nextEmoji,
  nextLabel,
  onDone
}: {
  nextEmoji: string;
  nextLabel: string;
  onDone: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="iq-investor-evidence-unlock"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
    >
      <motion.span
        className="iq-investor-evidence-unlock__burst"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { scale: [0.85, 1.15, 1], opacity: [0.7, 0.35, 0.2] }
        }
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.span
        className="iq-investor-evidence-unlock__lock"
        aria-hidden
        animate={reduceMotion ? undefined : { rotate: [0, -8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        🔓
      </motion.span>
      <p className="iq-investor-evidence-unlock__eyebrow">Next section unlocked</p>
      <h3 className="iq-investor-evidence-unlock__title">
        {nextEmoji} {nextLabel}
      </h3>
      <p className="iq-investor-evidence-unlock__copy">
        {nextLabel} is ready when you return to Business Island.
      </p>
      <button type="button" className="iq-investor-evidence-unlock__cta" onClick={onDone}>
        Back to island
      </button>
    </motion.div>
  );
}

/** Section-end checkpoint — unlock panel → 5-question quiz → section complete → next section. */
export function BusinessChecklistSectionQuizFlow({
  company,
  sectionId,
  pillarId,
  questSlug,
  theme,
  onPassed,
  onFinished
}: Props) {
  const { actions } = useGame();
  const section = resolveInvestorSection(sectionId);
  const nextSection =
    BUSINESS_INVESTOR_CHECKLIST_SECTIONS.find((s) => s.order === section.order + 1) ??
    null;

  const [phase, setPhase] = useState<FlowPhase>("unlock");
  const [passResult, setPassResult] = useState<{ correct: number; total: number } | null>(
    null
  );
  const [quizSessionKey, setQuizSessionKey] = useState(0);

  const quiz = useMemo(() => {
    const raw = fillQuizConfigTokens(
      resolveChecklistSectionQuizConfig(sectionId),
      company
    );
    const normalized = normalizeQuizConfig(raw);
    if (!normalized) return undefined;
    if (quizSessionKey === 0) return normalized;
    const attemptSeed =
      quizSessionKey * 9973 +
      sectionId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const dynamic = buildDynamicQuizConfig(normalized, { seed: attemptSeed });
    return fillQuizConfigTokens(dynamic, company);
  }, [sectionId, company, quizSessionKey]);

  const playable = hasPlayableQuizConfig(quiz);
  const quizSlug = `${questSlug}--section-quiz`;

  const handleQuizPass = useCallback(
    (result: { correct: number; total: number; fraction: number }) => {
      markSectionQuizPassed(company.id, sectionId);
      actions.completeQuest(pillarId, questSlug, {
        quizPerfect: result.correct === result.total
      });
      setPassResult({ correct: result.correct, total: result.total });
      onPassed();
      setPhase("complete");
    },
    [actions, company.id, onPassed, pillarId, questSlug, sectionId]
  );

  const handleStartQuiz = useCallback(() => {
    setQuizSessionKey((key) => key + 1);
    setPhase("quiz");
  }, []);

  const handleCompleteContinue = useCallback(() => {
    if (nextSection) {
      setPhase("next-unlock");
      return;
    }
    onFinished();
  }, [nextSection, onFinished]);

  if (!playable) {
    return (
      <div className="iq-investor-evidence-card iq-investor-evidence-card--empty">
        <p>Section quiz content is not available yet.</p>
        <button type="button" onClick={onFinished}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="iq-checklist-section-quiz-flow">
      <AnimatePresence mode="wait">
        {phase === "unlock" ? (
          <SectionQuizUnlockPanel
            key="unlock"
            sectionLabel={section.label}
            onStart={handleStartQuiz}
          />
        ) : null}

        {phase === "quiz" ? (
          <motion.div
            key={`quiz-${quizSessionKey}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            <QuestQuizPanel
              pillarId={pillarId}
              slug={quizSlug}
              quiz={quiz}
              unlocked
              autoStart
              freshAttemptOnMount
              title={`${section.emoji} ${section.label} Quiz`}
              rewardXp={XP_SECTION_QUIZ}
              rewardMicroOnCorrect
              microXpPerCorrect={SCHOOLS_MICRO_XP_PER_CORRECT}
              panelTheme={theme}
              companyName={company.name}
              metaCompletion={{
                completed: false,
                onPass: handleQuizPass
              }}
            />
          </motion.div>
        ) : null}

        {phase === "complete" && passResult ? (
          <SectionCompletePanel
            key="complete"
            sectionLabel={section.label}
            score={passResult.correct}
            total={passResult.total}
            onContinue={handleCompleteContinue}
          />
        ) : null}

        {phase === "next-unlock" && nextSection ? (
          <NextSectionUnlockPanel
            key="next-unlock"
            nextEmoji={nextSection.emoji}
            nextLabel={nextSection.label}
            onDone={onFinished}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
