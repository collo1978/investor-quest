"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { useOptionalGame } from "@/components/GameProvider";
import { BusinessChecklistInfoHint } from "@/components/business/hub/BusinessChecklistInfoHint";
import { InvestorChecklistCircuitEye } from "@/components/business/hub/BusinessInvestorNotebookIcons";
import type { CompanyId } from "@/data/companies";
import { companyById } from "@/data/companies";
import { XP_DIG_DEEPER_CHALLENGE } from "@/engine/progression/xpEconomy";
import {
  digDeeperKey,
  formatInvestorNotebookQuestion,
  INVESTOR_NOTEBOOK_INTRO,
  INVESTOR_NOTEBOOK_QUESTIONS,
  type InvestorNotebookQuestionDef,
  type InvestorNotebookQuestionId
} from "@/lib/business/businessIslandInvestorNotebook";
import {
  BUSINESS_ISLAND_STORY_PROGRESS_EVENT,
  clearBusinessIslandStoryPulse,
  isInvestorNotebookQuestionMastered,
  isInvestorNotebookQuestionUnlocked,
  markInvestorNotebookDigDeeperComplete,
  readBusinessIslandStoryProgress
} from "@/lib/business/businessIslandStoryProgress";

type Props = {
  companyId: CompanyId;
  /** Open the campus learning experience for this mastery question. */
  onOpenMasteryQuestion?: (questionId: InvestorNotebookQuestionId) => void;
};

function MissionCheckmark({ celebrate }: { celebrate: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <span className="iq-island-tracker__check" aria-hidden>
      <motion.svg viewBox="0 0 48 48" className="iq-island-tracker__check-svg">
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          fill="#76B900"
          initial={false}
          animate={
            celebrate && !reduceMotion
              ? { scale: [0.85, 1.1, 1], opacity: [0.55, 1, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M14 24.5 L21 31.5 L34 16.5"
          fill="none"
          stroke="#052e05"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={
            celebrate && !reduceMotion
              ? { pathLength: [0, 1], opacity: [0, 1] }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.svg>
      {celebrate && !reduceMotion ? (
        <span className="iq-island-tracker__sparkle" />
      ) : null}
    </span>
  );
}

function MasteryRow({
  question,
  companyName,
  mastered,
  locked,
  current,
  celebrating,
  pulsing,
  digDeeperDone,
  expanded,
  onToggleExpand,
  onOpenMastery,
  onCompleteDigDeeper
}: {
  question: InvestorNotebookQuestionDef;
  companyName: string;
  mastered: boolean;
  locked: boolean;
  current: boolean;
  celebrating: boolean;
  pulsing: boolean;
  digDeeperDone: ReadonlySet<string>;
  expanded: boolean;
  onToggleExpand: () => void;
  onOpenMastery: () => void;
  onCompleteDigDeeper: (index: number) => void;
}) {
  const title = formatInvestorNotebookQuestion(
    question.questionTemplate,
    companyName
  );
  const care = formatInvestorNotebookQuestion(
    question.whyInvestorsCare,
    companyName
  );
  const digCount = question.digDeeperTemplates.length;
  const digDoneCount = question.digDeeperTemplates.filter((_, i) =>
    digDeeperDone.has(digDeeperKey(question.id, i))
  ).length;
  const digBonusXp = digCount * XP_DIG_DEEPER_CHALLENGE;
  const remainingDigXp =
    (digCount - digDoneCount) * XP_DIG_DEEPER_CHALLENGE;

  return (
    <li
      className={[
        "iq-island-tracker__card",
        mastered ? "iq-island-tracker__card--answered" : "",
        locked ? "iq-island-tracker__card--locked" : "",
        current ? "iq-island-tracker__card--current" : "",
        pulsing && current ? "iq-island-tracker__card--pulse" : "",
        celebrating ? "iq-island-tracker__card--celebrate" : "",
        expanded ? "iq-island-tracker__card--expanded" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {current ? (
        <p className="iq-island-tracker__mission-tag">Current Mission</p>
      ) : null}
      <div className="iq-island-tracker__card-top">
        <button
          type="button"
          className="iq-island-tracker__open"
          disabled={locked}
          onClick={onOpenMastery}
          aria-label={
            locked
              ? `Locked: ${title}`
              : mastered
                ? `Revisit: ${title}`
                : `Open learning experience: ${title}`
          }
        >
          <span className="iq-island-tracker__icon" aria-hidden>
            <span className="iq-island-tracker__emoji">
              {locked ? "🔒" : question.icon}
            </span>
          </span>
          <span className="iq-island-tracker__step" aria-hidden>
            {question.order}
          </span>
          <span className="iq-island-tracker__copy">
            <span className="iq-island-tracker__question">{title}</span>
          </span>
        </button>

        {!locked ? (
          <BusinessChecklistInfoHint
            label="Why Investors Care"
            content={`💡 Why Investors Care\n\n${care}`}
            className="iq-island-tracker__why-hint"
            variant="info"
          />
        ) : (
          <span className="iq-island-tracker__expand-spacer" aria-hidden />
        )}

        {digCount > 0 && !locked ? (
          <button
            type="button"
            className="iq-island-tracker__expand"
            aria-expanded={expanded}
            aria-label={
              expanded
                ? `Collapse Dig Deeper for question ${question.order}`
                : `Expand Dig Deeper for question ${question.order}`
            }
            onClick={onToggleExpand}
          >
            <span aria-hidden>{expanded ? "▴" : "▾"}</span>
          </button>
        ) : (
          <span className="iq-island-tracker__expand-spacer" aria-hidden />
        )}

        {mastered ? (
          <MissionCheckmark celebrate={celebrating} />
        ) : locked ? (
          <span className="iq-island-tracker__lock" aria-hidden>
            🔒
          </span>
        ) : (
          <span className="iq-island-tracker__pending" aria-hidden />
        )}
      </div>

      {expanded && digCount > 0 && !locked ? (
        <div className="iq-island-tracker__deeper">
          {!mastered ? (
            <p className="iq-island-tracker__deeper-locked">
              Master the main question first — open it to start the learning
              experience. Dig Deeper unlocks after the green tick.
            </p>
          ) : (
            <>
              <p className="iq-island-tracker__deeper-heading">
                <span>⭐ Dig Deeper (+{digBonusXp} XP)</span>
                <span className="iq-island-tracker__deeper-meta">
                  {digDoneCount}/{digCount}
                  {remainingDigXp > 0 ? ` · ${remainingDigXp} XP left` : " · complete"}
                </span>
              </p>
              <ul className="iq-island-tracker__deeper-list">
                {question.digDeeperTemplates.map((template, index) => {
                  const key = digDeeperKey(question.id, index);
                  const done = digDeeperDone.has(key);
                  const label = formatInvestorNotebookQuestion(
                    template,
                    companyName
                  );
                  return (
                    <li key={key} className="iq-island-tracker__deeper-item">
                      <button
                        type="button"
                        className={[
                          "iq-island-tracker__deeper-btn",
                          done ? "iq-island-tracker__deeper-btn--done" : ""
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={done}
                        onClick={() => onCompleteDigDeeper(index)}
                      >
                        <span
                          className="iq-island-tracker__deeper-check"
                          aria-hidden
                        >
                          {done ? "✓" : "□"}
                        </span>
                        <span className="iq-island-tracker__deeper-q">{label}</span>
                        {!done ? (
                          <span className="iq-island-tracker__deeper-xp">
                            +{XP_DIG_DEEPER_CHALLENGE} XP
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </li>
  );
}

/**
 * Investor Checklist notebook — clean rows, expandable Dig Deeper, mastery via campus learning.
 */
export function BusinessInvestorNotebookPanel({
  companyId,
  onOpenMasteryQuestion
}: Props) {
  const company = companyById(companyId);
  const game = useOptionalGame();
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);
  const prevMasteredRef = useRef<Set<InvestorNotebookQuestionId>>(new Set());
  const [celebratingId, setCelebratingId] = useState<InvestorNotebookQuestionId | null>(
    null
  );
  const [expandedId, setExpandedId] = useState<InvestorNotebookQuestionId | null>(
    null
  );

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(BUSINESS_ISLAND_STORY_PROGRESS_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(BUSINESS_ISLAND_STORY_PROGRESS_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const progress = useMemo(
    () => readBusinessIslandStoryProgress(companyId),
    [companyId, tick]
  );
  const digDeeperDone = useMemo(
    () => new Set(progress.digDeeperCompletedKeys),
    [progress.digDeeperCompletedKeys]
  );

  const masteredIds = useMemo(() => {
    const set = new Set<InvestorNotebookQuestionId>();
    for (const q of INVESTOR_NOTEBOOK_QUESTIONS) {
      if (isInvestorNotebookQuestionMastered(q.id, progress)) set.add(q.id);
    }
    return set;
  }, [progress]);

  useEffect(() => {
    let newlyMastered: InvestorNotebookQuestionId | null = null;
    for (const id of masteredIds) {
      if (!prevMasteredRef.current.has(id)) {
        newlyMastered = id;
        break;
      }
    }
    prevMasteredRef.current = new Set(masteredIds);
    if (!newlyMastered) return;
    setCelebratingId(newlyMastered);
    const t = window.setTimeout(() => setCelebratingId(null), 1800);
    return () => window.clearTimeout(t);
  }, [masteredIds]);

  useEffect(() => {
    if (!progress.pulseQuestionId && !progress.lastEvidenceLabel) return;
    const t = window.setTimeout(() => {
      clearBusinessIslandStoryPulse(companyId);
    }, 3200);
    return () => window.clearTimeout(t);
  }, [companyId, progress.pulseQuestionId, progress.lastEvidenceLabel]);

  const masteredCount = masteredIds.size;
  const total = INVESTOR_NOTEBOOK_QUESTIONS.length;
  const fillPct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
  const companyCaps = company.name.toUpperCase();

  const handleDigDeeper = (
    questionId: InvestorNotebookQuestionId,
    index: number
  ) => {
    const result = markInvestorNotebookDigDeeperComplete(
      companyId,
      questionId,
      index
    );
    if (!result) return;
    game?.actions.awardBonusXp(
      XP_DIG_DEEPER_CHALLENGE,
      `Dig Deeper: ${digDeeperKey(questionId, index)}`
    );
  };

  return (
    <section
      className="iq-island-tracker pointer-events-auto"
      aria-label="Investor Checklist mastery tracker"
    >
      <div className="iq-island-tracker__fx" aria-hidden />

      <header className="iq-island-tracker__header">
        <div className="iq-island-tracker__brand-stack">
          <div className="iq-island-tracker__brand">
            <Image
              src={company.logoSrc}
              alt=""
              width={28}
              height={28}
              className="iq-island-tracker__brand-mark"
            />
            <span className="iq-island-tracker__brand-name">{companyCaps}</span>
          </div>
          <InvestorChecklistCircuitEye className="iq-island-tracker__hero-eye" />
        </div>

        <div className="iq-island-tracker__title-row">
          <h2 className="iq-island-tracker__title">Investor Checklist</h2>
          <BusinessChecklistInfoHint
            label="About the Investor Checklist"
            content={INVESTOR_NOTEBOOK_INTRO}
            className="iq-island-tracker__hint"
          />
        </div>

        <div className="iq-island-tracker__cta">
          <p className="iq-island-tracker__cta-lead">
            Complete the 10 key investor questions
          </p>
          <p className="iq-island-tracker__cta-main">
            And you&apos;ll understand{" "}
            <span className="iq-island-tracker__cta-accent">{company.name}</span>{" "}
            <span className="iq-island-tracker__cta-accent">like a pro.</span>
          </p>
          <p className="iq-island-tracker__cta-bonus">
            <span className="iq-island-tracker__cta-bonus-icon" aria-hidden>
              ⭐
            </span>
            <span>
              Discover hidden bonus questions to earn extra XP and become an even
              better investor.
            </span>
          </p>
        </div>
      </header>

      <div className="iq-island-tracker__progress-block">
        <div className="iq-island-tracker__progress-head">
          <span className="iq-island-tracker__progress-label">Progress</span>
          <span className="iq-island-tracker__progress-pct">{fillPct}%</span>
        </div>
        <div
          className="iq-island-tracker__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={fillPct}
          aria-label={`${masteredCount} of ${total} questions mastered`}
        >
          <motion.span
            className="iq-island-tracker__bar-fill"
            initial={false}
            animate={{ width: `${Math.max(fillPct, fillPct > 0 ? 2 : 0)}%` }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
            }
          />
        </div>

        {progress.lastEvidenceLabel ? (
          <p className="iq-island-tracker__toast" aria-live="polite">
            Campus evidence: {progress.lastEvidenceLabel}
          </p>
        ) : null}
      </div>

      <ul className="iq-island-tracker__list" aria-label="Investment mastery questions">
        {INVESTOR_NOTEBOOK_QUESTIONS.map((question) => {
          const mastered = masteredIds.has(question.id);
          const locked =
            !mastered &&
            !isInvestorNotebookQuestionUnlocked(question.id, progress);
          const current = !locked && !mastered;
          return (
            <MasteryRow
              key={question.id}
              question={question}
              companyName={company.name}
              mastered={mastered}
              locked={locked}
              current={current}
              celebrating={celebratingId === question.id}
              pulsing={progress.pulseQuestionId === question.id}
              digDeeperDone={digDeeperDone}
              expanded={expandedId === question.id}
              onToggleExpand={() =>
                setExpandedId((id) => (id === question.id ? null : question.id))
              }
              onOpenMastery={() => {
                if (locked) return;
                onOpenMasteryQuestion?.(question.id);
              }}
              onCompleteDigDeeper={(index) => handleDigDeeper(question.id, index)}
            />
          );
        })}
      </ul>
    </section>
  );
}
