"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";

import { BusinessChecklistInfoHint } from "@/components/business/hub/BusinessChecklistInfoHint";
import { BusinessChecklistJourneyProgress } from "@/components/business/hub/BusinessChecklistJourneyProgress";
import { companyById, type CompanyId } from "@/data/companies";
import { useBusinessChecklistProgress } from "@/hooks/useBusinessChecklistProgress";
import {
  formatSectionInvestorQuestion,
  INVESTOR_CHECKLIST_BUSINESS_INTRO,
  INVESTOR_CHECKLIST_HEADER_INTRO,
  type BusinessChecklistSectionView,
  type InvestorPrincipleView
} from "@/lib/business/businessInvestorFramework";
import {
  resolveCompanyInvestorMissionTheme,
  resolveInvestorMissionQuestion,
  usesInvestorMissionFlow
} from "@/lib/business/businessInvestorMissionFlow";
import type { InvestorChallengePrincipleId } from "@/lib/business/businessInvestorChallengeFlow";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";

type Props = {
  companyId: CompanyId;
  variant?: "schools" | "dark";
  presentation?: "default" | "journey" | "island" | "island-kiosk" | "ladder";
  cards?: readonly BusinessHubQuestCard[];
};

function PrincipleStatusMark() {
  return <span aria-hidden>⭐</span>;
}

function QuestionHeroMark({ principle }: { principle: InvestorPrincipleView }) {
  if (principle.status === "rated") {
    return (
      <span className="iq-investor-questions-roadmap__question-tick" aria-hidden>
        ✓
      </span>
    );
  }
  if (principle.status === "active") {
    return (
      <span className="iq-investor-questions-roadmap__question-target" aria-hidden>
        🎯
      </span>
    );
  }
  return (
    <span className="iq-investor-questions-roadmap__question-lock" aria-hidden>
      🔒
    </span>
  );
}

function ActiveMissionBadge() {
  return (
    <span className="iq-investor-questions-roadmap__active-badge">
      <span aria-hidden>🎯</span>
      Active
    </span>
  );
}

function BrandHighlight({
  text,
  companyName
}: {
  text: string;
  companyName: string;
}): ReactNode {
  const idx = text.indexOf(companyName);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="iq-investor-questions-roadmap__brand">{companyName}</span>
      {text.slice(idx + companyName.length)}
    </>
  );
}

function SectionRoadmapStatus({ section }: { section: BusinessChecklistSectionView }) {
  if (section.state === "locked") {
    return (
      <span
        className="iq-investor-questions-roadmap__status iq-investor-questions-roadmap__status--locked"
        aria-label="Locked"
      >
        <span aria-hidden>🔒</span>
      </span>
    );
  }

  if (section.state === "completed") {
    return (
      <span
        className="iq-investor-questions-roadmap__status iq-investor-questions-roadmap__status--complete"
        aria-label="Completed"
      >
        <span className="iq-investor-questions-roadmap__tick" aria-hidden>
          ✓
        </span>
      </span>
    );
  }

  return (
    <span
      className="iq-investor-questions-roadmap__status iq-investor-questions-roadmap__status--active"
      aria-label="Active"
    >
      <span aria-hidden>⭐</span>
      <span className="iq-investor-questions-roadmap__status-label">Active</span>
    </span>
  );
}

/** Progress-only row — island markers start quests, not the checklist. */
function PrincipleRoadmapRow({
  principle,
  companyId,
  companyName
}: {
  principle: InvestorPrincipleView;
  companyId: CompanyId;
  companyName: string;
}) {
  const isLocked = principle.status === "locked";
  const isActive = principle.status === "active";
  const isRated = principle.status === "rated";
  const isMission = usesInvestorMissionFlow(principle.id);
  const question = isMission
    ? resolveInvestorMissionQuestion(
        companyId,
        principle.id as InvestorChallengePrincipleId
      )
    : principle.whyItMatters;

  const rowClassName = [
    "iq-investor-questions-roadmap__principle",
    isActive ? "iq-investor-questions-roadmap__principle--active" : "",
    isRated ? "iq-investor-questions-roadmap__principle--complete" : "",
    isLocked ? "iq-investor-questions-roadmap__principle--locked" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const ariaLabel = isRated
    ? `Answered: ${question}`
    : isActive
      ? `Current investor question: ${question}`
      : `Locked: ${question}`;

  return (
    <li className={rowClassName} data-principle-id={principle.id}>
      <div className="iq-investor-questions-roadmap__principle-static" aria-label={ariaLabel}>
        {isActive ? (
          <>
            <span className="iq-investor-questions-roadmap__active-pulse" aria-hidden />
            <span
              className="iq-investor-questions-roadmap__active-pulse iq-investor-questions-roadmap__active-pulse--outer"
              aria-hidden
            />
          </>
        ) : null}
        <div className="iq-investor-questions-roadmap__principle-meta">
          <span className="iq-investor-questions-roadmap__principle-chip">
            <PrincipleStatusMark />
            <span className="iq-investor-questions-roadmap__principle-label">
              {principle.label}
            </span>
          </span>
          {isActive ? <ActiveMissionBadge /> : null}
        </div>
        <div className="iq-investor-questions-roadmap__question-hero">
          <QuestionHeroMark principle={principle} />
          <p className="iq-investor-questions-roadmap__principle-question">
            <BrandHighlight text={question} companyName={companyName} />
          </p>
        </div>
      </div>
    </li>
  );
}

function CompanyOverviewRoadmapBlock({
  section,
  companyId,
  companyName
}: {
  section: BusinessChecklistSectionView;
  companyId: CompanyId;
  companyName: string;
}) {
  const isLocked = section.state === "locked";

  return (
    <li
      className={[
        "iq-investor-questions-roadmap__section-block",
        section.state === "active" ? "iq-investor-questions-roadmap__section-block--active" : "",
        section.state === "completed"
          ? "iq-investor-questions-roadmap__section-block--complete"
          : "",
        isLocked ? "iq-investor-questions-roadmap__section-block--locked" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="iq-investor-questions-roadmap__section-head">
        <span className="iq-investor-questions-roadmap__emoji" aria-hidden>
          {section.emoji}
        </span>
        <span className="iq-investor-questions-roadmap__title">{section.label}</span>
      </div>
      <ul className="iq-investor-questions-roadmap__principles" aria-label={`${section.label} principles`}>
        {section.principles.map((principle) => (
          <PrincipleRoadmapRow
            key={principle.id}
            principle={principle}
            companyId={companyId}
            companyName={companyName}
          />
        ))}
      </ul>
    </li>
  );
}

function SectionRoadmapRow({
  section,
  companyName
}: {
  section: BusinessChecklistSectionView;
  companyName: string;
}) {
  const question = formatSectionInvestorQuestion(section, companyName);
  const isLocked = section.state === "locked";
  const isActive = section.state === "active";
  const isComplete = section.state === "completed";
  const isPending = !isLocked && !isActive && !isComplete;

  return (
    <li
      className={[
        "iq-investor-questions-roadmap__row",
        isActive ? "iq-investor-questions-roadmap__row--active" : "",
        isComplete ? "iq-investor-questions-roadmap__row--complete" : "",
        isLocked ? "iq-investor-questions-roadmap__row--locked" : "",
        isPending ? "iq-investor-questions-roadmap__row--pending" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="iq-investor-questions-roadmap__title-col">
        <span className="iq-investor-questions-roadmap__emoji" aria-hidden>
          {section.emoji}
        </span>
        <span className="iq-investor-questions-roadmap__title">{section.label}</span>
      </div>
      <p className="iq-investor-questions-roadmap__question">
        <BrandHighlight text={question} companyName={companyName} />
      </p>
      <SectionRoadmapStatus section={section} />
    </li>
  );
}

/**
 * Investor Questions roadmap — progress display only.
 * Island markers remain the way players enter quest cards.
 */
export function BusinessChecklistPanel({
  companyId,
  variant = "schools",
  presentation = "default",
  cards
}: Props) {
  const isIsland = presentation === "island" || presentation === "island-kiosk";
  const isKiosk = presentation === "island-kiosk";
  const isLadder = presentation === "ladder";
  const compact = isIsland || isKiosk;
  const company = companyById(companyId);
  const companyName = company.name;
  const missionTheme = useMemo(
    () => resolveCompanyInvestorMissionTheme(companyId),
    [companyId]
  );

  const { snapshot } = useBusinessChecklistProgress({ companyId, cards });

  const themeStyle = {
    "--iq-mission-accent": missionTheme.accent,
    "--iq-mission-accent-rgb": missionTheme.accentRgb,
    "--iq-mission-accent-soft": missionTheme.accentSoft,
    "--iq-mission-accent-glow": missionTheme.accentGlow
  } as CSSProperties;

  return (
    <section
      className={[
        "iq-master-principles-panel iq-business-checklist-panel iq-business-framework iq-investor-questions-roadmap pointer-events-auto",
        variant === "schools" ? "iq-master-principles-panel--schools" : "iq-master-principles-panel--dark",
        isIsland ? "iq-master-principles-panel--island" : "",
        isKiosk ? "iq-master-principles-panel--island-kiosk" : "",
        isLadder ? "iq-master-principles-panel--ladder" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      style={themeStyle}
      aria-label="Investor Checklist, Business section"
    >
      <span className="iq-investor-questions-roadmap__grid" aria-hidden />
      <header className="iq-master-principles-panel__header-band iq-business-checklist-panel__header">
        <div className="iq-business-checklist-panel__title-row">
          <h2 className="iq-master-principles-panel__title">Investor Checklist</h2>
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
        <p className="iq-investor-questions-roadmap__lead">
          Master these questions to understand {companyName} like an investor
        </p>
        <BusinessChecklistJourneyProgress
          snapshot={snapshot}
          variant={compact ? "compact" : "full"}
          className="iq-business-checklist-panel__journey"
        />
        <div className="iq-master-principles-panel__title-divider" aria-hidden />
      </header>

      <div className="iq-master-principles-panel__body">
        <ul className="iq-investor-questions-roadmap__list" aria-label="Investor questions roadmap">
          {snapshot.sections.map((section) =>
            section.id === "company-overview" ? (
              <CompanyOverviewRoadmapBlock
                key={section.id}
                section={section}
                companyId={companyId}
                companyName={companyName}
              />
            ) : (
              <SectionRoadmapRow
                key={section.id}
                section={section}
                companyName={companyName}
              />
            )
          )}
        </ul>
      </div>

      {!compact && snapshot.footerHint ? (
        <footer className="iq-master-principles-panel__footer">
          <p className="iq-master-principles-panel__footer-hint">{snapshot.footerHint}</p>
        </footer>
      ) : null}
    </section>
  );
}
