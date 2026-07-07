"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { useInvestorQualityRatingSync } from "@/components/business/investorQuality/InvestorQualityRatingSyncContext";
import { InvestorQualityAssessmentControl } from "@/components/business/investorQuality/InvestorQualityAssessmentInteractions";
import {
  INVESTOR_QUALITY_CHECKLIST_ITEMS,
  resolveAssessmentStyleForItem,
  resolveChecklistItem,
  resolveCompanyAssessmentQuestion,
  type InvestorQualityChecklistItemId,
  type InvestorQualityRatingValue
} from "@/lib/business/investorQualityChecklist";
import { ChecklistItemHintIcon } from "@/components/business/investorQuality/InvestorQualityChecklistTooltip";
import { InvestorQualityChecklistTitleHint } from "@/components/business/investorQuality/InvestorQualityChecklistTitleHint";
import { InvestorQualityChecklistTooltip } from "@/components/business/investorQuality/InvestorQualityChecklistTooltip";

type Props = {
  companyName: string;
  itemIds: readonly InvestorQualityChecklistItemId[];
  evidenceCountByItem?: Partial<Record<InvestorQualityChecklistItemId, number>>;
  onSubmit: (
    ratings: Partial<Record<InvestorQualityChecklistItemId, InvestorQualityRatingValue>>
  ) => void;
  onSkip?: () => void;
  /** CTA label — defaults to post-quiz return copy. */
  submitLabel?: string;
};

function InvestorQualityRatingHero({
  reduceMotion
}: {
  reduceMotion: boolean | null;
}) {
  return (
    <motion.header
      className="iq-investor-quality-rating__hero"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="iq-investor-quality-rating__hero-aura" aria-hidden />
      <h2 className="iq-investor-quality-rating__hero-title font-[var(--font-grotesk)]">
        <span className="iq-investor-quality-rating__hero-now">NOW</span> it&apos;s
        your turn to think like a{" "}
        <span className="iq-investor-quality-rating__hero-accent">
          professional investor
        </span>
        .
      </h2>
    </motion.header>
  );
}

function InvestorQualityCelebrationHero({
  reduceMotion
}: {
  reduceMotion: boolean | null;
}) {
  return (
    <motion.header
      className="iq-investor-quality-rating__hero iq-investor-quality-rating__hero--celebration"
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
    >
      <span
        className="iq-investor-quality-rating__hero-aura iq-investor-quality-rating__hero-aura--celebration"
        aria-hidden
      />

      <motion.span
        className="iq-investor-quality-rating__hero-celebration-icon"
        aria-hidden
        initial={reduceMotion ? false : { scale: 0.5, opacity: 0, rotate: -12 }}
        animate={
          reduceMotion
            ? { scale: 1, opacity: 1, rotate: 0 }
            : {
                scale: [1, 1.12, 1],
                opacity: 1,
                rotate: [0, 4, 0]
              }
        }
        transition={
          reduceMotion
            ? { duration: 0.4 }
            : {
                scale: {
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.35
                },
                rotate: {
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.35
                },
                opacity: { duration: 0.45, delay: 0.08 }
              }
        }
      >
        🎉
      </motion.span>

      <motion.h2
        className="iq-investor-quality-rating__hero-title iq-investor-quality-rating__hero-title--celebration font-[var(--font-grotesk)]"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        You&apos;ve taken your first step towards becoming a{" "}
        <span className="iq-investor-quality-rating__hero-accent">
          great investor
        </span>
        .
      </motion.h2>

      <motion.p
        className="iq-investor-quality-rating__hero-celebration-tagline"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.44, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        Every great investor starts by following the evidence.
      </motion.p>
    </motion.header>
  );
}

/**
 * End-of-quest Investor Quality Check — only principles with evidence from this quest.
 */
export function InvestorQualityRatingScreen({
  companyName,
  itemIds,
  evidenceCountByItem = {},
  onSubmit,
  onSkip,
  submitLabel = "Continue"
}: Props) {
  const reduceMotion = useReducedMotion();
  const ratingSync = useInvestorQualityRatingSync();
  const introPulseFiredRef = useRef(false);
  const items = useMemo(
    () => itemIds.map((id) => resolveChecklistItem(id)),
    [itemIds]
  );
  const [selections, setSelections] = useState<
    Partial<Record<InvestorQualityChecklistItemId, InvestorQualityRatingValue>>
  >({});

  const activeItem = useMemo(
    () => items.find((item) => !selections[item.id]) ?? null,
    [items, selections]
  );
  const allAnswered = activeItem == null;
  const activeIndex = activeItem
    ? items.findIndex((item) => item.id === activeItem.id)
    : items.length;
  const assessmentStyle = activeItem
    ? resolveAssessmentStyleForItem(activeItem.id)
    : "verdict";
  const assessmentQuestion = activeItem
    ? resolveCompanyAssessmentQuestion(activeItem.id, companyName)
    : null;

  useEffect(() => {
    ratingSync?.setActiveItemId(activeItem?.id ?? null);
  }, [activeItem?.id, ratingSync]);

  useEffect(() => {
    if (!ratingSync || introPulseFiredRef.current || itemIds.length === 0) return;
    introPulseFiredRef.current = true;
    ratingSync.triggerIntroPulse(itemIds);
  }, [itemIds, ratingSync]);

  const handleSelect = (
    itemId: InvestorQualityChecklistItemId,
    value: InvestorQualityRatingValue
  ) => {
    setSelections((prev) => ({ ...prev, [itemId]: value }));
    ratingSync?.setLiveRating(itemId, value);
  };

  const completionSubmittedRef = useRef(false);

  useEffect(() => {
    if (!allAnswered || completionSubmittedRef.current) return;
    completionSubmittedRef.current = true;
    const delayMs = reduceMotion ? 650 : 2200;
    const timeout = window.setTimeout(() => onSubmit(selections), delayMs);
    return () => window.clearTimeout(timeout);
  }, [allAnswered, onSubmit, reduceMotion, selections]);

  if (items.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="iq-investor-quality-rating mx-auto w-full min-w-0 max-w-none px-1.5 py-2 sm:px-2"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      role="form"
      aria-label="Investor Quality Check"
    >
      <AnimatePresence mode="wait" initial={false}>
        {allAnswered ? (
          <InvestorQualityCelebrationHero
            key="celebration-hero"
            reduceMotion={reduceMotion}
          />
        ) : (
          <div
            key="section-intro"
            className={[
              "iq-investor-quality-rating__section-intro",
              activeIndex > 0 ? "iq-investor-quality-rating__section-intro--continued" : ""
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {activeIndex === 0 ? (
              <InvestorQualityRatingHero reduceMotion={reduceMotion} />
            ) : null}

            <header className="iq-investor-quality-rating__stage-heading">
              <h2 className="iq-investor-quality-rating__stage-title font-[var(--font-grotesk)]">
                Rate the evidence and see how strongly{" "}
                <span className="iq-investor-quality-rating__question-company">
                  {companyName}
                </span>{" "}
                meets the Investor Checklist.
              </h2>
            </header>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {activeItem ? (
          <div className="iq-investor-quality-rating__assessment">
            <motion.section
              key={activeItem.id}
              className="iq-investor-quality-rating__item iq-investor-quality-rating__item--active"
              initial={reduceMotion ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -14 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
            <p className="iq-investor-quality-rating__principle-context">
              <span className="iq-investor-quality-rating__principle-emoji" aria-hidden>
                {activeItem.emoji}
              </span>
              {activeItem.label}
            </p>

            {assessmentQuestion ? (
              <h3 className="iq-investor-quality-rating__question iq-investor-quality-rating__question--hero">
                {assessmentQuestion.beforeHighlight}
                <strong className="iq-investor-quality-rating__question-company">
                  {assessmentQuestion.companyHighlight}
                </strong>
                {assessmentQuestion.afterHighlight}
              </h3>
            ) : null}

            <button
              type="button"
              className="iq-investor-quality-rating__review-evidence"
              onClick={() => ratingSync?.requestEvidenceReview(activeItem.id)}
            >
              <span className="iq-investor-quality-rating__review-evidence-icon" aria-hidden>
                🔍
              </span>
              Not sure? Review the evidence.
            </button>

            <div className="iq-investor-quality-rating__interaction iq-investor-quality-rating__interaction--primary">
              <InvestorQualityAssessmentControl
                key={activeItem.id}
                style={assessmentStyle}
                itemLabel={activeItem.label}
                evidenceCount={evidenceCountByItem[activeItem.id] ?? 0}
                value={selections[activeItem.id]}
                onSelect={(value) => handleSelect(activeItem.id, value)}
              />
            </div>
          </motion.section>
          </div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

/** Compact scorecard for profile / mastery overlay. */
export function InvestorQualityChecklistScorecard({
  companyName,
  rows
}: {
  companyName: string;
  rows: ReturnType<
    typeof import("@/lib/business/investorQualityChecklist").resolveInvestorQualityChecklistRows
  >;
}) {
  const ratedCount = rows.filter((row) => row.ratingLabel).length;

  return (
    <section
      className="iq-investor-quality-scorecard pointer-events-auto"
      aria-label={`${companyName} investor quality checklist`}
    >
      <header className="iq-investor-quality-scorecard__header">
        <InvestorQualityChecklistTitleHint titleClassName="iq-investor-quality-scorecard__eyebrow" />
        <h2 className="iq-investor-quality-scorecard__title">{companyName}</h2>
        <p className="iq-investor-quality-scorecard__meta">
          {ratedCount} of {INVESTOR_QUALITY_CHECKLIST_ITEMS.length} rated
        </p>
      </header>
      <ol className="iq-investor-quality-scorecard__list">
        {rows.map((row) => (
          <InvestorQualityChecklistTooltip
            key={row.id}
            itemId={row.id}
            variant="row"
            className="iq-investor-quality-scorecard__row"
          >
            <span className="iq-investor-quality-scorecard__row-main">
              <span className="iq-investor-quality-scorecard__label">
                {row.emoji ? `${row.emoji} ` : ""}
                {row.label}
              </span>
              <ChecklistItemHintIcon className="iq-investor-quality-row-hint--scorecard" />
            </span>
            <div className="iq-investor-quality-scorecard__row-meta">
              {row.evidenceCount > 0 ? (
                <span className="iq-investor-quality-scorecard__evidence">
                  {row.evidenceCount} insight{row.evidenceCount === 1 ? "" : "s"}
                </span>
              ) : (
                <span className="iq-investor-quality-scorecard__evidence iq-investor-quality-scorecard__evidence--empty">
                  No evidence yet
                </span>
              )}
              <span
                className={[
                  "iq-investor-quality-scorecard__rating",
                  row.ratingLabel
                    ? "iq-investor-quality-scorecard__rating--set"
                    : "iq-investor-quality-scorecard__rating--pending"
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {row.ratingLabel ?? "Not rated"}
              </span>
            </div>
          </InvestorQualityChecklistTooltip>
        ))}
      </ol>
    </section>
  );
}
