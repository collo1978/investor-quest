"use client";

import { motion, useReducedMotion } from "framer-motion";

import { BusinessChecklistPrincipleQuestRow } from "@/components/business/checklist/BusinessChecklistPrincipleQuestRow";
import { BusinessChecklistSectionPrinciplesGroup } from "@/components/business/hub/BusinessChecklistSectionPrinciplesGroup";
import { BusinessChecklistSectionTitleHint } from "@/components/business/hub/BusinessChecklistSectionTitleHint";
import { InvestorChecklistLockBadge } from "@/components/business/hub/InvestorChecklistLockBadge";
import { BusinessChecklistSectionQuizRow } from "@/components/business/investorFramework/BusinessChecklistSectionQuizRow";
import type { CompanyId } from "@/data/companies";
import type { BusinessChecklistSectionView } from "@/lib/business/businessInvestorFramework";

type Props = {
  section: BusinessChecklistSectionView | null;
  companyId: CompanyId;
  highlightPrincipleId?: string | null;
  highlightSectionQuizId?: string | null;
  className?: string;
};

/** Right workspace — active section mission panel, principles, and quiz. */
export function BusinessChecklistSectionWorkspace({
  section,
  companyId,
  highlightPrincipleId = null,
  highlightSectionQuizId = null,
  className = ""
}: Props) {
  const reduceMotion = useReducedMotion();

  if (!section) {
    return (
      <div className={["iq-business-section-workspace iq-business-section-workspace--empty", className].join(" ")}>
        <p className="iq-business-section-workspace__empty">Select a chapter to begin.</p>
      </div>
    );
  }

  const isLocked = section.state === "locked";
  const isComplete = section.state === "completed";
  const isActive = section.state === "active";

  return (
    <motion.section
      key={section.id}
      className={[
        "iq-business-section-workspace",
        isActive ? "iq-business-section-workspace--active" : "",
        isComplete ? "iq-business-section-workspace--complete" : "",
        isLocked ? "iq-business-section-workspace--locked" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${section.label} workspace`}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="iq-business-section-workspace__glow" aria-hidden />

      <header className="iq-business-section-workspace__header">
        <div className="iq-business-section-workspace__title-row">
          <span className="iq-business-section-workspace__emoji" aria-hidden>
            {section.emoji}
          </span>
          <div className="iq-business-section-workspace__title-wrap">
            <h3 className="iq-business-section-workspace__title">{section.label}</h3>
            <BusinessChecklistSectionTitleHint
              sectionLabel={section.label}
              keyQuestion={section.keyQuestion}
              className="iq-business-section-workspace__hint"
            />
          </div>
          {isLocked ? (
            <InvestorChecklistLockBadge size="section" />
          ) : (
            <span
              className={[
                "iq-business-framework__section-status iq-business-section-workspace__status",
                isActive ? "iq-business-framework__section-status--active" : "",
                isComplete ? "iq-business-framework__section-status--completed" : ""
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
            className="iq-business-section-workspace__progress"
            role="progressbar"
            aria-valuenow={Math.round(section.progressPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${section.label} progress`}
          >
            <span
              className="iq-business-section-workspace__progress-fill"
              style={{ width: `${section.progressPct}%` }}
            />
          </div>
        ) : null}
      </header>

      {isLocked ? (
        <p className="iq-business-section-workspace__locked-copy">
          Complete the prior section quiz to unlock this chapter.
        </p>
      ) : (
        <BusinessChecklistSectionPrinciplesGroup locked={false}>
          <ul className="iq-business-section-workspace__principles">
            {section.principles.map((principle) => (
              <BusinessChecklistPrincipleQuestRow
                key={principle.id}
                companyId={companyId}
                principle={principle}
                highlighted={highlightPrincipleId === principle.id}
              />
            ))}
            <BusinessChecklistSectionQuizRow
              section={section}
              highlighted={highlightSectionQuizId === section.id}
            />
          </ul>
        </BusinessChecklistSectionPrinciplesGroup>
      )}
    </motion.section>
  );
}
