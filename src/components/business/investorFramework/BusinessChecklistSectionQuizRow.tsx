"use client";

import { useEffect, useState } from "react";

import { InvestorChecklistLockBadge } from "@/components/business/hub/InvestorChecklistLockBadge";
import {
  BUSINESS_SECTION_QUIZ_GLOW_EVENT,
  BUSINESS_SECTION_QUIZ_START_EVENT
} from "@/lib/business/businessChecklistSectionQuizHelpers";
import type {
  BusinessChecklistSectionView,
  ChecklistSectionQuizStatus
} from "@/lib/business/businessInvestorFramework";

function resolveSectionQuizMarker(status: ChecklistSectionQuizStatus): string {
  if (status === "passed") return "✅";
  if (status === "ready") return "🔓";
  return "🔒";
}

function resolveQuizLabel(status: ChecklistSectionQuizStatus): string {
  if (status === "passed") return "Section Quiz — Complete";
  if (status === "ready") return "Start quiz";
  return "Section Quiz";
}

type Props = {
  section: BusinessChecklistSectionView;
  highlighted?: boolean;
  /** Hub checklist — caller handles navigation before quiz start. */
  onStartRequest?: (section: BusinessChecklistSectionView) => void;
  className?: string;
  listClassName?: string;
  buttonClassName?: string;
  labelClassName?: string;
  markerClassName?: string;
};

/** Checklist quiz row — always listed under the section's three principles. */
export function BusinessChecklistSectionQuizRow({
  section,
  highlighted = false,
  onStartRequest,
  className = "",
  listClassName = "iq-business-section-quest-panel__principle iq-business-section-quest-panel__quiz",
  buttonClassName = "iq-business-section-quest-panel__quiz-button",
  labelClassName = "iq-business-section-quest-panel__principle-label",
  markerClassName = "iq-business-section-quest-panel__principle-marker",
}: Props) {
  const isLocked = section.quizStatus === "locked";
  const isReady = section.quizStatus === "ready";
  const isPassed = section.quizStatus === "passed";
  const [quizGlow, setQuizGlow] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const onGlow = (event: Event) => {
      const detail = (event as CustomEvent<{ sectionId?: string }>).detail;
      if (detail?.sectionId !== section.id) return;
      setQuizGlow(true);
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setQuizGlow(false), 920);
    };
    window.addEventListener(BUSINESS_SECTION_QUIZ_GLOW_EVENT, onGlow);
    return () => {
      window.removeEventListener(BUSINESS_SECTION_QUIZ_GLOW_EVENT, onGlow);
      if (timer) window.clearTimeout(timer);
    };
  }, [section.id]);

  const handleClick = () => {
    if (!isReady) return;
    if (onStartRequest) {
      onStartRequest(section);
      return;
    }
    window.dispatchEvent(
      new CustomEvent(BUSINESS_SECTION_QUIZ_START_EVENT, {
        detail: { sectionId: section.id, questSlug: section.questSlug }
      })
    );
  };

  return (
    <li
      className={[
        listClassName,
        isLocked ? "iq-business-section-quest-panel__quiz--locked" : "",
        isReady ? "iq-business-section-quest-panel__quiz--ready" : "",
        isPassed ? "iq-business-section-quest-panel__quiz--passed" : "",
        highlighted || quizGlow ? "iq-business-section-quest-panel__principle--unlock-pulse" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      data-section-quiz-id={section.id}
    >
      <button
        type="button"
        className={buttonClassName}
        disabled={!isReady}
        onClick={handleClick}
        aria-label={
          isPassed
            ? `${section.label} section quiz complete`
            : isReady
              ? `Start ${section.label} section quiz`
              : `${section.label} section quiz locked — complete all evidence above`
        }
      >
        <span className={markerClassName}>
          {isLocked ? (
            <InvestorChecklistLockBadge size="principle" />
          ) : (
            <span aria-hidden>{resolveSectionQuizMarker(section.quizStatus)}</span>
          )}
        </span>
        <span className={labelClassName}>{resolveQuizLabel(section.quizStatus)}</span>
      </button>
    </li>
  );
}
