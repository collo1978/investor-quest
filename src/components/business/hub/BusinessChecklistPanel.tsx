"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BusinessChecklistInfoHint } from "@/components/business/hub/BusinessChecklistInfoHint";
import { BusinessChecklistJourneyProgress } from "@/components/business/hub/BusinessChecklistJourneyProgress";
import { BusinessInvestorPrincipleHint } from "@/components/business/hub/BusinessInvestorPrincipleHint";
import { InvestorChecklistLockBadge } from "@/components/business/hub/InvestorChecklistLockBadge";
import { BusinessChecklistSectionQuizRow } from "@/components/business/investorFramework/BusinessChecklistSectionQuizRow";
import { InvestorPrincipleEvidenceDots } from "@/components/business/investorFramework/InvestorPrincipleEvidenceDots";
import { navigateToChecklistSectionQuiz } from "@/lib/business/businessChecklistSectionQuizNavigation";
import type { CompanyId } from "@/data/companies";
import { useBusinessChecklistProgress } from "@/hooks/useBusinessChecklistProgress";
import {
  INVESTOR_CHECKLIST_BUSINESS_INTRO,
  INVESTOR_CHECKLIST_HEADER_INTRO,
  resolvePrincipleMarker,
  type BusinessChecklistSectionView,
  type InvestorPrincipleView
} from "@/lib/business/businessInvestorFramework";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";

type Props = {
  companyId: CompanyId;
  variant?: "schools" | "dark";
  presentation?: "default" | "journey" | "island" | "island-kiosk" | "ladder";
  cards?: readonly BusinessHubQuestCard[];
};

function SectionStatusBadge({ section }: { section: BusinessChecklistSectionView }) {
  if (section.state === "locked") {
    return <InvestorChecklistLockBadge size="section" />;
  }

  return (
    <span
      className={[
        "iq-business-framework__section-status",
        section.state === "active" ? "iq-business-framework__section-status--active" : "",
        section.state === "completed" ? "iq-business-framework__section-status--completed" : "",
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
  );
}

function PrincipleRatingGlyph({ principle }: { principle: InvestorPrincipleView }) {
  if (principle.status !== "rated" || !principle.rating) return null;
  if (principle.rating === "strong") return <span aria-hidden>🟢</span>;
  if (principle.rating === "weak") return <span aria-hidden>🔴</span>;
  return <span aria-hidden>🟡</span>;
}

function PrincipleRow({ principle }: { principle: InvestorPrincipleView }) {
  const isLocked = principle.status === "locked";
  const isNa = principle.status === "na";
  const isActive = principle.status === "active";
  const hasEvidenceDots =
    !isNa && !isLocked && principle.evidenceSlotCards.length > 0 && principle.status !== "rated";

  return (
    <li
      className={[
        "iq-business-framework__principle",
        hasEvidenceDots ? "iq-business-framework__principle--has-evidence" : "",
        isLocked ? "iq-business-framework__principle--locked" : "",
        isNa ? "iq-business-framework__principle--na" : "",
        isActive ? "iq-business-framework__principle--active" : "",
        principle.status === "rated" ? "iq-business-framework__principle--rated" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      data-principle-id={principle.id}
    >
      <div className="iq-business-framework__principle-head">
        <span className="iq-business-framework__principle-marker">
          {isLocked ? (
            <InvestorChecklistLockBadge size="principle" />
          ) : (
            <span aria-hidden>{resolvePrincipleMarker(principle)}</span>
          )}
        </span>
        <span className="iq-business-framework__principle-title">
          <span className="iq-business-framework__principle-label">{principle.label}</span>
          {!isNa ? (
            <BusinessInvestorPrincipleHint
              principleId={principle.id}
              className="iq-business-framework__principle-hint"
            />
          ) : null}
        </span>
        <span className="iq-business-framework__principle-status">
          {isNa ? "N/A" : null}
          <PrincipleRatingGlyph principle={principle} />
        </span>
      </div>
      {hasEvidenceDots ? <InvestorPrincipleEvidenceDots principle={principle} /> : null}
    </li>
  );
}

function SectionBlock({
  section,
  expanded,
  onToggle,
  compact,
  onQuizStart
}: {
  section: BusinessChecklistSectionView;
  expanded: boolean;
  onToggle: () => void;
  compact?: boolean;
  onQuizStart: (section: BusinessChecklistSectionView) => void;
}) {
  const isLocked = section.state === "locked";
  const canExpand = !isLocked && !compact;

  return (
    <li
      className={[
        "iq-business-framework__section",
        isLocked ? "iq-business-framework__section--locked" : "",
        section.state === "active" ? "iq-business-framework__section--active" : "",
        section.state === "completed" ? "iq-business-framework__section--completed" : "",
        expanded ? "iq-business-framework__section--expanded" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="iq-business-framework__section-head">
        {canExpand ? (
          <button
            type="button"
            className="iq-business-framework__section-toggle"
            aria-expanded={expanded}
            onClick={onToggle}
          >
            <span className="iq-business-framework__section-emoji" aria-hidden>
              {section.emoji}
            </span>
            <span className="iq-business-framework__section-label">{section.label}</span>
          </button>
        ) : (
          <div className="iq-business-framework__section-toggle iq-business-framework__section-toggle--static">
            <span className="iq-business-framework__section-emoji" aria-hidden>
              {section.emoji}
            </span>
            <span className="iq-business-framework__section-label">{section.label}</span>
          </div>
        )}
        <SectionStatusBadge section={section} />
      </div>

      {expanded && canExpand ? (
        <ul className="iq-business-framework__principles">
          {section.principles.map((principle) => (
            <PrincipleRow key={principle.id} principle={principle} />
          ))}
          <BusinessChecklistSectionQuizRow
            section={section}
            onStartRequest={onQuizStart}
            listClassName="iq-business-framework__principle iq-business-section-quest-panel__quiz"
            buttonClassName="iq-business-section-quest-panel__quiz-button"
            labelClassName="iq-business-framework__principle-label"
            markerClassName="iq-business-framework__principle-marker"
          />
        </ul>
      ) : null}
    </li>
  );
}

/**
 * Business Investor Checklist — quest-log progression through investor milestones.
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

  const pathname = usePathname();
  const router = useRouter();
  const { snapshot } = useBusinessChecklistProgress({ companyId, cards });
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    snapshot.activeSection?.id ?? null
  );

  const handleQuizStart = (section: BusinessChecklistSectionView) => {
    navigateToChecklistSectionQuiz(section.questSlug, section.id, pathname, router);
  };

  useEffect(() => {
    if (snapshot.activeSection?.id) {
      setExpandedSectionId(snapshot.activeSection.id);
    }
  }, [snapshot.activeSection?.id]);

  const toggleSection = (sectionId: string) => {
    setExpandedSectionId((current) => (current === sectionId ? null : sectionId));
  };

  return (
    <section
      className={[
        "iq-master-principles-panel iq-business-checklist-panel iq-business-framework pointer-events-auto",
        variant === "schools" ? "iq-master-principles-panel--schools" : "iq-master-principles-panel--dark",
        isIsland ? "iq-master-principles-panel--island" : "",
        isKiosk ? "iq-master-principles-panel--island-kiosk" : "",
        isLadder ? "iq-master-principles-panel--ladder" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Investor Checklist, Business section"
    >
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
        <BusinessChecklistJourneyProgress
          snapshot={snapshot}
          variant={compact ? "compact" : "full"}
          className="iq-business-checklist-panel__journey"
        />
        <div className="iq-master-principles-panel__title-divider" aria-hidden />
      </header>

      <div className="iq-master-principles-panel__body">
        <ul className="iq-business-framework__sections">
          {snapshot.sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              expanded={
                expandedSectionId === section.id ||
                (section.state === "active" && !compact)
              }
              onToggle={() => toggleSection(section.id)}
              compact={compact && !isLadder}
              onQuizStart={handleQuizStart}
            />
          ))}
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
