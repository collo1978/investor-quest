"use client";

import { BusinessChecklistInfoHint } from "@/components/business/hub/BusinessChecklistInfoHint";
import { BusinessChecklistJourneyProgress } from "@/components/business/hub/BusinessChecklistJourneyProgress";
import { InvestorChecklistLockBadge } from "@/components/business/hub/InvestorChecklistLockBadge";
import {
  INVESTOR_CHECKLIST_BUSINESS_INTRO,
  INVESTOR_CHECKLIST_HEADER_INTRO,
  type BusinessChecklistSectionView,
  type BusinessInvestorChecklistSnapshot
} from "@/lib/business/businessInvestorFramework";

type Props = {
  snapshot: BusinessInvestorChecklistSnapshot;
  workspaceSectionId: string | null;
  ratingFocusMode?: boolean;
  className?: string;
};

function ChapterNavItem({
  section,
  isCurrent,
  ratingFocusMode,
  index
}: {
  section: BusinessChecklistSectionView;
  isCurrent: boolean;
  ratingFocusMode: boolean;
  index: number;
}) {
  const isLocked = section.state === "locked";
  const isComplete = section.state === "completed";

  if (ratingFocusMode && isLocked && index > 0) return null;

  return (
    <li
      className={[
        "iq-business-chapter-nav__item",
        isCurrent ? "iq-business-chapter-nav__item--current" : "",
        isLocked ? "iq-business-chapter-nav__item--locked" : "",
        isComplete ? "iq-business-chapter-nav__item--complete" : "",
        section.state === "active" ? "iq-business-chapter-nav__item--active" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      aria-current={isCurrent ? "true" : undefined}
    >
      <span className="iq-business-chapter-nav__emoji" aria-hidden>
        {section.emoji}
      </span>
      <span className="iq-business-chapter-nav__label">{section.label}</span>
      {isLocked ? (
        <InvestorChecklistLockBadge size="section" />
      ) : (
        <span
          className={[
            "iq-business-chapter-nav__status",
            isComplete ? "iq-business-chapter-nav__status--complete" : "",
            section.state === "active" ? "iq-business-chapter-nav__status--active" : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isComplete ? "✓" : section.state === "active" ? "●" : ""}
        </span>
      )}
    </li>
  );
}

/** Left rail — permanent Business section chapter navigation. */
export function BusinessChecklistChapterNav({
  snapshot,
  workspaceSectionId,
  ratingFocusMode = false,
  className = ""
}: Props) {
  return (
    <nav
      className={[
        "iq-business-chapter-nav iq-investor-quality-quest-panel iq-business-framework pointer-events-auto",
        ratingFocusMode ? "iq-investor-quality-quest-panel--rating-focus" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Business island chapters"
    >
      <div className="iq-investor-quality-quest-panel__shell iq-business-chapter-nav__shell">
        <span className="iq-investor-quality-quest-panel__rim" aria-hidden />
        <span className="iq-investor-quality-quest-panel__halo" aria-hidden />

        <header className="iq-business-chapter-nav__header">
          <div className="iq-business-checklist-panel__title-row">
            <h2 className="iq-investor-quality-quest-panel__title">Investor Checklist</h2>
            <BusinessChecklistInfoHint
              label="About the Investor Checklist"
              content={INVESTOR_CHECKLIST_HEADER_INTRO}
              className="iq-business-checklist-panel__header-hint"
            />
          </div>
          <div className="iq-business-checklist-panel__pillar-row">
            <p className="iq-business-checklist-panel__pillar">Business</p>
            <BusinessChecklistInfoHint
              label="About the Business section"
              content={INVESTOR_CHECKLIST_BUSINESS_INTRO}
              className="iq-business-checklist-panel__header-hint"
            />
          </div>
          <BusinessChecklistJourneyProgress
            snapshot={snapshot}
            className="iq-business-chapter-nav__journey"
          />
        </header>

        <ol className="iq-business-chapter-nav__list">
          {snapshot.sections.map((section, index) => (
            <ChapterNavItem
              key={section.id}
              section={section}
              index={index}
              ratingFocusMode={ratingFocusMode}
              isCurrent={workspaceSectionId === section.id}
            />
          ))}
        </ol>

        {!ratingFocusMode && snapshot.footerHint ? (
          <p className="iq-business-chapter-nav__footer">{snapshot.footerHint}</p>
        ) : null}
      </div>
    </nav>
  );
}
