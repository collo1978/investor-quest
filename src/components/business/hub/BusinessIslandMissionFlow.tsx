"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

import { BusinessInvestorChallengeCard } from "@/components/business/investorFramework/BusinessInvestorChallengeCard";
import { EvidenceDecodeSequence } from "@/components/business/hub/EvidenceDecodeSequence";
import { KeyTermsCheck } from "@/components/business/hub/KeyTermsCheck";
import { SCHOOLS_BUSINESS_MISSION_THEME } from "@/components/quest/pillarQuestTheme";
import {
  formatInvestorNotebookQuestion,
  INVESTOR_NOTEBOOK_QUESTIONS,
  type InvestorNotebookQuestionId
} from "@/lib/business/businessIslandInvestorNotebook";
import {
  resolveHqDecodeEvidence,
  resolveHqDecodeMissionTerms
} from "@/lib/business/businessIslandHqDecodeContent";
import { buildNotebookChallengeDef } from "@/lib/business/businessIslandMissionChallenge";

/**
 * Prototype scope — the Key Terms Check matching game is wired only for the
 * first Business mission. Add more question ids here to roll it out.
 */
const KEY_TERMS_CHECK_QUESTION_IDS = new Set<InvestorNotebookQuestionId>([
  "explain-what-does"
]);

type Props = {
  /** Questions handled in order: evidence → answer → tick → next. */
  questionIds: readonly InvestorNotebookQuestionId[];
  companyName: string;
  /** Index to begin at (checklist deep-link). */
  startIndex?: number;
  /** Persist the green tick (idempotent). */
  onQuestionMastered: (questionId: InvestorNotebookQuestionId) => void;
  /** Fired after the final question's checklist tick. */
  onComplete: () => void;
  /** Label for the final continue button. */
  completeLabel?: string;
};

type SubPhase = "evidence" | "terms-check" | "answer" | "tick";

/**
 * Chained mission — for each checklist question, gather all 10-K evidence,
 * answer the question, then play a checklist-tick before the next question.
 */
export function BusinessIslandMissionFlow({
  questionIds,
  companyName,
  startIndex = 0,
  onQuestionMastered,
  onComplete,
  completeLabel = "Continue →"
}: Props) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(() =>
    startIndex > 0 && startIndex < questionIds.length ? startIndex : 0
  );
  const [sub, setSub] = useState<SubPhase>("evidence");

  const questionId = questionIds[index];
  const isLastQuestion = index >= questionIds.length - 1;

  const evidence = useMemo(
    () => (questionId ? resolveHqDecodeEvidence(questionId) : []),
    [questionId]
  );
  const hasKeyTermsCheck = questionId
    ? KEY_TERMS_CHECK_QUESTION_IDS.has(questionId)
    : false;
  const missionTerms = useMemo(
    () => (hasKeyTermsCheck && questionId ? resolveHqDecodeMissionTerms(questionId) : []),
    [hasKeyTermsCheck, questionId]
  );
  const challenge = useMemo(
    () => (questionId ? buildNotebookChallengeDef(questionId, companyName) : null),
    [questionId, companyName]
  );
  const questionText = useMemo(() => {
    const def = INVESTOR_NOTEBOOK_QUESTIONS.find((q) => q.id === questionId);
    return def
      ? formatInvestorNotebookQuestion(def.questionTemplate, companyName)
      : "";
  }, [questionId, companyName]);

  const handleAnswered = useCallback(() => {
    if (questionId) onQuestionMastered(questionId);
    setSub("tick");
  }, [questionId, onQuestionMastered]);

  const advance = useCallback(() => {
    if (isLastQuestion) {
      onComplete();
      return;
    }
    setIndex((prev) => prev + 1);
    setSub("evidence");
  }, [isLastQuestion, onComplete]);

  if (!questionId) return null;

  return (
    <div className="iq-mission-flow">
      {questionIds.length > 1 ? (
        <p className="iq-mission-flow__progress">
          Question {index + 1} of {questionIds.length}
        </p>
      ) : null}

      <AnimatePresence mode="wait">
        {sub === "evidence" ? (
          <EvidenceDecodeSequence
            key={`evidence-${questionId}`}
            evidence={evidence}
            finalCtaLabel={
              hasKeyTermsCheck ? "Key Terms Check →" : "Answer this question →"
            }
            onFinal={() => setSub(hasKeyTermsCheck ? "terms-check" : "answer")}
          />
        ) : sub === "terms-check" && hasKeyTermsCheck ? (
          <KeyTermsCheck
            key={`terms-check-${questionId}`}
            terms={missionTerms}
            xpReason={`Key Terms Check: ${questionId}`}
            onComplete={() => setSub("answer")}
          />
        ) : sub === "answer" && challenge ? (
          <motion.div
            key={`answer-${questionId}`}
            className="iq-mission-flow__answer"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <BusinessInvestorChallengeCard
              challenge={challenge}
              theme={SCHOOLS_BUSINESS_MISSION_THEME}
              onSubmit={handleAnswered}
            />
          </motion.div>
        ) : sub === "tick" ? (
          <motion.div
            key={`tick-${questionId}`}
            className="iq-mission-tick"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="iq-mission-tick__check"
              aria-hidden
              initial={reduceMotion ? false : { scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 16,
                delay: 0.05
              }}
            >
              ✓
            </motion.span>
            <p className="iq-mission-tick__label">Checklist updated</p>
            <p className="iq-mission-tick__question">{questionText}</p>
            <p className="iq-mission-tick__xp">
              <span aria-hidden>⚡</span> Mastery unlocked
            </p>
            <button
              type="button"
              className="iq-hq-mission__primary iq-mission-tick__cta"
              onClick={advance}
            >
              {isLastQuestion
                ? completeLabel
                : "Next question →"}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
