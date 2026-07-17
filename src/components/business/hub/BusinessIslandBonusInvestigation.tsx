"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { BusinessInvestorChallengeCard } from "@/components/business/investorFramework/BusinessInvestorChallengeCard";
import { EvidenceDecodeSequence } from "@/components/business/hub/EvidenceDecodeSequence";
import { SCHOOLS_BUSINESS_MISSION_THEME } from "@/components/quest/pillarQuestTheme";
import { XP_DIG_DEEPER_CHALLENGE } from "@/engine/progression/xpEconomy";
import type { InvestorNotebookQuestionId } from "@/lib/business/businessIslandInvestorNotebook";
import {
  buildBonusInvestigationChallenge,
  resolveBonusInvestigationEvidence,
  resolveBonusInvestigationPrompt
} from "@/lib/business/businessIslandBonusInvestigations";

type BonusPhase = "brief" | "evidence" | "challenge" | "solved";

type Props = {
  companyName: string;
  questionId: InvestorNotebookQuestionId;
  index: number;
  /** Fires once when the Analyst Challenge is passed (award XP + mark done). */
  onSolved: () => void;
  /** Close the investigation overlay (back to the map / checklist). */
  onExit: () => void;
};

/**
 * Optional detective case launched from a Dig Deeper question.
 * Brief → Evidence → Decode → Analyst Challenge → XP on success.
 * XP is awarded only after the challenge is passed — never on open.
 */
export function BusinessIslandBonusInvestigation({
  companyName,
  questionId,
  index,
  onSolved,
  onExit
}: Props) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<BonusPhase>("brief");

  const prompt = useMemo(
    () => resolveBonusInvestigationPrompt(questionId, index, companyName),
    [questionId, index, companyName]
  );
  const evidence = useMemo(
    () => resolveBonusInvestigationEvidence(questionId, index),
    [questionId, index]
  );
  const challenge = useMemo(
    () => buildBonusInvestigationChallenge(questionId, index, companyName),
    [questionId, index, companyName]
  );

  const handleAnswered = () => {
    onSolved();
    setPhase("solved");
  };

  return (
    <motion.div
      className="iq-hq-mission iq-hq-mission--bonus"
      role="dialog"
      aria-modal="true"
      aria-label="Bonus Investigation"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className="iq-hq-mission__exit"
        aria-label="Close bonus investigation"
        onClick={onExit}
      >
        ←
      </button>

      <AnimatePresence mode="wait">
        {phase === "brief" ? (
          <motion.section
            key="bonus-brief"
            className="iq-hq-mission__screen iq-hq-mission__screen--brief"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="iq-bonus-brief">
              <p className="iq-bonus-brief__eyebrow">
                <span aria-hidden>🔍</span> Bonus Investigation
              </p>
              <h2 className="iq-bonus-brief__title">Optional Detective Case</h2>
              <p className="iq-bonus-brief__question">{prompt}</p>
              <p className="iq-bonus-brief__hint">
                Review the evidence, then explain your finding to earn{" "}
                <strong>+{XP_DIG_DEEPER_CHALLENGE} XP</strong>.
              </p>
              <button
                type="button"
                className="iq-hq-mission__primary iq-bonus-brief__cta"
                onClick={() => setPhase("evidence")}
              >
                ▶ Begin Investigation
              </button>
            </div>
          </motion.section>
        ) : phase === "evidence" ? (
          <motion.section
            key="bonus-evidence"
            className="iq-hq-mission__flow"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <EvidenceDecodeSequence
              key={`bonus-${questionId}-${index}`}
              evidence={evidence}
              finalCtaLabel="Answer the challenge →"
              onFinal={() => setPhase("challenge")}
            />
          </motion.section>
        ) : phase === "challenge" ? (
          <motion.section
            key="bonus-challenge"
            className="iq-hq-mission__flow"
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
          </motion.section>
        ) : (
          <motion.section
            key="bonus-solved"
            className="iq-hq-mission__flow"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="iq-mission-tick iq-mission-tick--bonus">
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
              <p className="iq-mission-tick__label">Bonus Investigation solved</p>
              <p className="iq-mission-tick__question">{prompt}</p>
              <p className="iq-mission-tick__xp">
                <span aria-hidden>⚡</span> +{XP_DIG_DEEPER_CHALLENGE} XP earned
              </p>
              <button
                type="button"
                className="iq-hq-mission__primary iq-mission-tick__cta"
                onClick={onExit}
              >
                Return to checklist →
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
