"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { BusinessInvestorPrincipleHint } from "@/components/business/hub/BusinessInvestorPrincipleHint";
import { InvestorChecklistLockBadge } from "@/components/business/hub/InvestorChecklistLockBadge";
import { InvestorPrincipleEvidenceDots } from "@/components/business/investorFramework/InvestorPrincipleEvidenceDots";
import { BUSINESS_INVESTOR_EVIDENCE_GLOW_EVENT } from "@/components/business/investorFramework/InvestorPrincipleEvidenceFly";
import { navigateToChecklistPrincipleReview } from "@/lib/business/businessChecklistPrincipleNavigation";
import type { InvestorChallengePrincipleId } from "@/lib/business/businessInvestorChallengeFlow";
import {
  resolveInvestorMissionQuestion,
  usesInvestorMissionFlow
} from "@/lib/business/businessInvestorMissionFlow";
import type { CompanyId } from "@/data/companies";
import { companyById } from "@/data/companies";
import {
  resolvePrincipleMarker,
  type InvestorPrincipleView
} from "@/lib/business/businessInvestorFramework";

type Props = {
  principle: InvestorPrincipleView;
  companyId: CompanyId;
  highlighted?: boolean;
};

function MissionQuestionHero({
  principle,
  companyId
}: {
  principle: InvestorPrincipleView;
  companyId: CompanyId;
}) {
  const question = usesInvestorMissionFlow(principle.id)
    ? resolveInvestorMissionQuestion(
        companyId,
        principle.id as InvestorChallengePrincipleId
      )
    : principle.whyItMatters;
  const companyName = companyById(companyId).name;
  const brandIdx = question.indexOf(companyName);
  const questionNode =
    brandIdx < 0 ? (
      question
    ) : (
      <>
        {question.slice(0, brandIdx)}
        <span className="iq-business-section-quest-panel__brand">{companyName}</span>
        {question.slice(brandIdx + companyName.length)}
      </>
    );

  const principleStatusEmoji =
    principle.status === "rated" ? "✅" : principle.status === "active" ? "⭐" : "🔒";

  return (
    <div className="iq-business-section-quest-panel__mission-block">
      <div className="iq-business-section-quest-panel__principle-meta">
        <span className="iq-business-section-quest-panel__principle-chip">
          <span aria-hidden>{principleStatusEmoji}</span>
          <span className="iq-business-section-quest-panel__principle-label">
            {principle.label}
          </span>
          <BusinessInvestorPrincipleHint
            principleId={principle.id}
            className="iq-business-section-quest-panel__hint"
          />
        </span>
        {principle.status === "rated" ? (
          <span
            className="iq-business-section-quest-panel__question-tick"
            aria-label="Completed"
          >
            ✓
          </span>
        ) : principle.status === "locked" ? (
          <span className="iq-business-section-quest-panel__question-lock" aria-hidden>
            🔒
          </span>
        ) : null}
      </div>
      <p className="iq-business-section-quest-panel__principle-question">{questionNode}</p>
      {principle.status === "active" ? (
        <span className="iq-business-section-quest-panel__status-under">Active</span>
      ) : null}
    </div>
  );
}

export function BusinessChecklistPrincipleQuestRow({
  principle,
  companyId,
  highlighted
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isNa = principle.status === "na";
  const isLocked = principle.status === "locked";
  const isActive = principle.status === "active";
  const isRated = principle.status === "rated";
  const isReviewable = isRated && principle.evidenceSlotCards.length > 0;
  const hasEvidenceDots =
    !isNa && !isLocked && principle.evidenceSlotCards.length > 0 && !isRated;
  const isMissionPrinciple =
    principle.sectionId === "company-overview" && usesInvestorMissionFlow(principle.id);
  const isEvidenceFocus =
    (highlighted && isActive) ||
    (isActive && (hasEvidenceDots || isMissionPrinciple));
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

  const rowClassName = [
    "iq-business-section-quest-panel__principle",
    isMissionPrinciple ? "iq-business-section-quest-panel__principle--mission" : "",
    hasEvidenceDots && !isMissionPrinciple
      ? "iq-business-section-quest-panel__principle--has-evidence"
      : "",
    isNa ? "iq-business-section-quest-panel__principle--na" : "",
    isLocked ? "iq-business-section-quest-panel__principle--locked" : "",
    isActive ? "iq-business-section-quest-panel__principle--active" : "",
    isRated ? "iq-business-section-quest-panel__principle--rated" : "",
    isReviewable ? "iq-business-section-quest-panel__principle--reviewable" : "",
    highlighted ? "iq-business-section-quest-panel__principle--unlock-pulse" : "",
    isEvidenceFocus ? "iq-business-framework__principle--evidence-focus" : "",
    evidenceGlow ? "iq-business-section-quest-panel__principle--evidence-glow" : ""
  ]
    .filter(Boolean)
    .join(" ");

  if (isMissionPrinciple) {
    return (
      <li className={rowClassName} data-principle-id={principle.id}>
        <MissionQuestionHero principle={principle} companyId={companyId} />
        {isReviewable ? (
          <button
            type="button"
            className="iq-investor-mission__review-btn"
            onClick={() => navigateToChecklistPrincipleReview(principle.id, pathname, router)}
            aria-label={`Review ${principle.label} mission evidence`}
          >
            Review mission
          </button>
        ) : null}
      </li>
    );
  }

  const rowContent = (
    <>
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
        {isRated && principle.rating ? (
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
    </>
  );

  if (isReviewable) {
    return (
      <li className={rowClassName} data-principle-id={principle.id}>
        <div className="iq-business-section-quest-panel__principle-head">
          <span className="iq-business-section-quest-panel__principle-marker">
            <span aria-hidden>{resolvePrincipleMarker(principle)}</span>
          </span>
          <span className="iq-business-section-quest-panel__principle-title">
            <button
              type="button"
              className="iq-business-section-quest-panel__principle-button"
              onClick={() => navigateToChecklistPrincipleReview(principle.id, pathname, router)}
              aria-label={`Review ${principle.label} evidence`}
            >
              <span className="iq-business-section-quest-panel__principle-label">
                {principle.label}
              </span>
            </button>
            <BusinessInvestorPrincipleHint
              principleId={principle.id}
              className="iq-business-section-quest-panel__hint"
            />
          </span>
          {principle.rating ? (
            <span className="iq-business-section-quest-panel__principle-rating" aria-hidden>
              {principle.rating === "strong" ? "🟢" : principle.rating === "weak" ? "🔴" : "🟡"}
            </span>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <li className={rowClassName} data-principle-id={principle.id}>
      {rowContent}
    </li>
  );
}
