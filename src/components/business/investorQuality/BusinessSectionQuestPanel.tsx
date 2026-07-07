"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { BusinessChecklistInfoHint } from "@/components/business/hub/BusinessChecklistInfoHint";
import { BusinessChecklistJourneyProgress } from "@/components/business/hub/BusinessChecklistJourneyProgress";
import { BusinessInvestorPrincipleHint } from "@/components/business/hub/BusinessInvestorPrincipleHint";
import { InvestorChecklistLockBadge } from "@/components/business/hub/InvestorChecklistLockBadge";
import { BusinessChecklistSectionQuizRow } from "@/components/business/investorFramework/BusinessChecklistSectionQuizRow";
import { InvestorPrincipleEvidenceDots } from "@/components/business/investorFramework/InvestorPrincipleEvidenceDots";
import { BUSINESS_INVESTOR_EVIDENCE_GLOW_EVENT } from "@/components/business/investorFramework/InvestorPrincipleEvidenceFly";
import {
  INVESTOR_CHECKLIST_BUSINESS_INTRO,
  INVESTOR_CHECKLIST_HEADER_INTRO,
  resolvePrincipleMarker,
  type BusinessInvestorChecklistSnapshot,
  type BusinessChecklistSectionView,
  type InvestorPrincipleView
} from "@/lib/business/businessInvestorFramework";

type Props = {
  snapshot: BusinessInvestorChecklistSnapshot;
  /** Hide distant locked sections during rating focus. */
  ratingFocusMode?: boolean;
  highlightPrincipleId?: string | null;
  highlightSectionQuizId?: string | null;
  className?: string;
};

function PrincipleQuestRow({
  principle,
  highlighted
}: {
  principle: InvestorPrincipleView;
  highlighted?: boolean;
}) {
  const isNa = principle.status === "na";
  const isLocked = principle.status === "locked";
  const isActive = principle.status === "active";
  const hasEvidenceDots =
    !isNa && !isLocked && principle.evidenceSlotCards.length > 0 && principle.status !== "rated";
  const [evidenceGlow, setEvidenceGlow] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const onGlow = (event: Event) => {
      const detail = (event as CustomEvent<{ principleId?: string }>).detail;
      if (detail?.principleId !== principle.id) return;
      setEvidenceGlow(true);
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setEvidenceGlow(false), 920);
    };
    window.addEventListener(BUSINESS_INVESTOR_EVIDENCE_GLOW_EVENT, onGlow);
    return () => {
      window.removeEventListener(BUSINESS_INVESTOR_EVIDENCE_GLOW_EVENT, onGlow);
      if (timer) window.clearTimeout(timer);
    };
  }, [principle.id]);

  return (
    <li
      className={[
        "iq-business-section-quest-panel__principle",
        hasEvidenceDots ? "iq-business-section-quest-panel__principle--has-evidence" : "",
        isNa ? "iq-business-section-quest-panel__principle--na" : "",
        isLocked ? "iq-business-section-quest-panel__principle--locked" : "",
        isActive ? "iq-business-section-quest-panel__principle--active" : "",
        principle.status === "rated" ? "iq-business-section-quest-panel__principle--rated" : "",
        highlighted ? "iq-business-section-quest-panel__principle--unlock-pulse" : "",
        evidenceGlow ? "iq-business-section-quest-panel__principle--evidence-glow" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      data-principle-id={principle.id}
    >
      <div className="iq-business-section-quest-panel__principle-head">
        <span className="iq-business-section-quest-panel__principle-marker">
          {isLocked ? (
            <InvestorChecklistLockBadge size="principle" />
          ) : (
            <span aria-hidden>{resolvePrincipleMarker(principle)}</span>
          )}
        </span>
        <span className="iq-business-section-quest-panel__principle-title">
          <span className="iq-business-section-quest-panel__principle-label">
            {principle.label}
          </span>
          {!isNa ? (
            <BusinessInvestorPrincipleHint
              principleId={principle.id}
              className="iq-business-section-quest-panel__hint"
            />
          ) : null}
        </span>
        {principle.status === "rated" && principle.rating ? (
          <span className="iq-business-section-quest-panel__principle-rating" aria-hidden>
            {principle.rating === "strong" ? "🟢" : principle.rating === "weak" ? "🔴" : "🟡"}
          </span>
        ) : null}
      </div>
      {hasEvidenceDots ? (
        <InvestorPrincipleEvidenceDots
          principle={principle}
          className="iq-business-section-quest-panel__evidence-dots"
        />
      ) : null}
    </li>
  );
}

function SectionQuestRow({
  section,
  index,
  ratingFocusMode,
  reduceMotion,
  highlightPrincipleId,
  highlightSectionQuizId
}: {
  section: BusinessChecklistSectionView;
  index: number;
  ratingFocusMode: boolean;
  reduceMotion: boolean | null;
  highlightPrincipleId?: string | null;
  highlightSectionQuizId?: string | null;
}) {
  const isLocked = section.state === "locked";
  const isComplete = section.state === "completed";
  const isActive = section.state === "active";
  const hideRow = ratingFocusMode && isLocked && index > 0;

  if (hideRow) return null;

  return (
    <motion.li
      className={[
        "iq-investor-quality-quest-panel__row iq-business-section-quest-panel__row",
        isActive ? "iq-investor-quality-quest-panel__row--active iq-business-framework__section--active" : "",
        isComplete ? "iq-business-section-quest-panel__row--complete" : "",
        isLocked ? "iq-business-section-quest-panel__row--locked iq-business-framework__section--locked" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${index + 1}. ${section.label}`}
      animate={
        isActive && !reduceMotion && !ratingFocusMode
          ? { opacity: [0.94, 1, 0.94] }
          : undefined
      }
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    >
      {isActive ? (
        <>
          <span className="iq-investor-quality-quest-panel__row-aura" aria-hidden />
          <span className="iq-investor-quality-quest-panel__active-tag">✨ ACTIVE</span>
        </>
      ) : null}

      <div className="iq-investor-quality-quest-panel__row-head iq-business-section-quest-panel__row-head">
        <span className="iq-investor-quality-quest-panel__index" aria-hidden>
          {section.emoji}
        </span>
        <span className="iq-investor-quality-quest-panel__label">{section.label}</span>
        {isLocked ? (
          <InvestorChecklistLockBadge size="section" />
        ) : (
          <span
            className={[
              "iq-business-framework__section-status iq-business-section-quest-panel__section-status",
              isActive ? "iq-business-framework__section-status--active" : "",
              isComplete ? "iq-business-framework__section-status--completed" : "",
              section.overallRating === "strong"
                ? "iq-business-framework__section-status--strong"
                : "",
              section.overallRating === "weak" ? "iq-business-framework__section-status--weak" : "",
              section.overallRating === "mixed" ? "iq-business-framework__section-status--mixed" : ""
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {section.statusLabel}
          </span>
        )}
      </div>

      {isActive && section.progressPct > 0 ? (
        <div
          className="iq-business-section-quest-panel__progress"
          role="progressbar"
          aria-valuenow={Math.round(section.progressPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${section.label} progress`}
        >
          <span
            className="iq-business-section-quest-panel__progress-fill"
            style={{ width: `${section.progressPct}%` }}
          />
        </div>
      ) : null}

      {!isLocked ? (
        <ul className="iq-business-section-quest-panel__principles">
          {section.principles.map((principle) => (
            <PrincipleQuestRow
              key={principle.id}
              principle={principle}
              highlighted={highlightPrincipleId === principle.id}
            />
          ))}
          <BusinessChecklistSectionQuizRow
            section={section}
            highlighted={highlightSectionQuizId === section.id}
          />
        </ul>
      ) : null}
    </motion.li>
  );
}

/**
 * Quest reading rail — investor journey milestones and principle quests.
 */
export function BusinessSectionQuestPanel({
  snapshot,
  ratingFocusMode = false,
  highlightPrincipleId = null,
  highlightSectionQuizId = null,
  className = ""
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <aside
      className={[
        "iq-investor-quality-quest-panel iq-business-section-quest-panel iq-business-framework pointer-events-auto",
        ratingFocusMode ? "iq-investor-quality-quest-panel--rating-focus" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Investor Checklist, Business section"
    >
      <div className="iq-investor-quality-quest-panel__shell">
        <span className="iq-investor-quality-quest-panel__rim" aria-hidden />
        <span className="iq-investor-quality-quest-panel__halo" aria-hidden />

        <header className="iq-investor-quality-quest-panel__header iq-business-checklist-panel__header">
          <div className="iq-business-checklist-panel__title-row">
            <h2 className="iq-investor-quality-quest-panel__title">Investor Checklist</h2>
            <BusinessChecklistInfoHint
              label="About the Investor Checklist"
              content={INVESTOR_CHECKLIST_HEADER_INTRO}
              className="iq-business-checklist-panel__header-hint iq-business-section-quest-panel__header-hint"
            />
          </div>
          <div className="iq-business-checklist-panel__pillar-row">
            <p className="iq-business-checklist-panel__pillar iq-business-section-quest-panel__pillar">
              Business
            </p>
            <BusinessChecklistInfoHint
              label="About the Business section"
              content={INVESTOR_CHECKLIST_BUSINESS_INTRO}
              className="iq-business-checklist-panel__header-hint iq-business-section-quest-panel__header-hint"
            />
          </div>
          <BusinessChecklistJourneyProgress
            snapshot={snapshot}
            className="iq-business-section-quest-panel__journey"
          />
          {!ratingFocusMode && snapshot.footerHint ? (
            <p className="iq-investor-quality-quest-panel__subtitle">{snapshot.footerHint}</p>
          ) : null}
        </header>

        <ol className="iq-investor-quality-quest-panel__list iq-business-section-quest-panel__list">
          {snapshot.sections.map((section, index) => (
            <SectionQuestRow
              key={section.id}
              section={section}
              index={index}
              ratingFocusMode={ratingFocusMode}
              reduceMotion={reduceMotion}
              highlightPrincipleId={highlightPrincipleId}
              highlightSectionQuizId={highlightSectionQuizId}
            />
          ))}
        </ol>
      </div>
    </aside>
  );
}
