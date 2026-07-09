"use client";

import { useEffect, useState } from "react";

import { BusinessChecklistInfoHint } from "@/components/business/hub/BusinessChecklistInfoHint";
import { InvestorChecklistLockBadge } from "@/components/business/hub/InvestorChecklistLockBadge";
import { ForcesChecklistJourneyProgress } from "@/components/forces/hub/ForcesChecklistJourneyProgress";
import { ForcesChecklistSectionHint } from "@/components/forces/hub/ForcesChecklistSectionHint";
import { ForcesInvestorPrincipleHint } from "@/components/forces/hub/ForcesInvestorPrincipleHint";
import type { CompanyId } from "@/data/companies";
import { useForcesChecklistProgress } from "@/hooks/useForcesChecklistProgress";
import {
  INVESTOR_CHECKLIST_FORCES_INTRO,
  INVESTOR_CHECKLIST_RISK_INTRO,
  resolveForcesPrincipleMarker,
  type ForcesChecklistGroupView,
  type ForcesChecklistSectionView,
  type ForcesPrincipleView
} from "@/lib/forces/forcesInvestorFramework";

type Props = {
  companyId: CompanyId;
  variant?: "schools" | "dark";
  presentation?: "default" | "island" | "island-kiosk" | "ladder";
};

function SectionStatusBadge({ section }: { section: ForcesChecklistSectionView }) {
  if (section.state === "locked") {
    return <InvestorChecklistLockBadge size="section" />;
  }

  return (
    <span
      className={[
        "iq-business-framework__section-status",
        section.state === "active" ? "iq-business-framework__section-status--active" : "",
        section.state === "completed" ? "iq-business-framework__section-status--completed" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {section.statusLabel}
    </span>
  );
}

function PrincipleRow({ principle }: { principle: ForcesPrincipleView }) {
  const isLocked = principle.status === "locked";
  const isNa = principle.status === "na";
  const isActive = principle.status === "active";
  const isRated = principle.status === "rated";

  return (
    <li
      className={[
        "iq-business-framework__principle",
        isLocked ? "iq-business-framework__principle--locked" : "",
        isNa ? "iq-business-framework__principle--na" : "",
        isActive ? "iq-business-framework__principle--active" : "",
        isRated ? "iq-business-framework__principle--rated" : ""
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
            <span aria-hidden>{resolveForcesPrincipleMarker(principle)}</span>
          )}
        </span>
        <span className="iq-business-framework__principle-title">
          <span className="iq-business-framework__principle-label">{principle.label}</span>
          {!isNa ? (
            <ForcesInvestorPrincipleHint
              principleId={principle.id}
              className="iq-business-framework__principle-hint"
            />
          ) : null}
        </span>
        <span className="iq-business-framework__principle-status">
          {isNa ? "N/A" : null}
        </span>
      </div>
    </li>
  );
}

function SectionBlock({
  section,
  expanded,
  onToggle,
  compact
}: {
  section: ForcesChecklistSectionView;
  expanded: boolean;
  onToggle: () => void;
  compact?: boolean;
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
            <span className="iq-business-framework__section-order" aria-hidden>
              {section.order}.
            </span>
            <span className="iq-business-framework__section-label">{section.label}</span>
            <ForcesChecklistSectionHint
              sectionId={section.id}
              className="iq-business-framework__section-hint"
            />
          </button>
        ) : (
          <div className="iq-business-framework__section-toggle iq-business-framework__section-toggle--static">
            <span className="iq-business-framework__section-order" aria-hidden>
              {section.order}.
            </span>
            <span className="iq-business-framework__section-label">{section.label}</span>
            {!isLocked ? (
              <ForcesChecklistSectionHint
                sectionId={section.id}
                className="iq-business-framework__section-hint"
              />
            ) : null}
          </div>
        )}
        <SectionStatusBadge section={section} />
      </div>

      {expanded && canExpand ? (
        <div className="iq-forces-framework__section-body">
          <p className="iq-forces-framework__investor-question">{section.investorQuestion}</p>
          <ul className="iq-business-framework__principles">
            {section.principles.map((principle) => (
              <PrincipleRow key={principle.id} principle={principle} />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function GroupBlock({
  group,
  expandedSectionId,
  onToggleSection,
  compact
}: {
  group: ForcesChecklistGroupView;
  expandedSectionId: string | null;
  onToggleSection: (sectionId: string) => void;
  compact?: boolean;
}) {
  return (
    <li className="iq-forces-framework__group">
      <div className="iq-forces-framework__group-head">
        <span className="iq-forces-framework__group-emoji" aria-hidden>
          {group.emoji}
        </span>
        <div className="iq-forces-framework__group-copy">
          <p className="iq-forces-framework__group-label">{group.label}</p>
          <p className="iq-forces-framework__group-subtitle">{group.subtitle}</p>
        </div>
      </div>
      <ul className="iq-business-framework__sections iq-forces-framework__sections">
        {group.sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            expanded={
              expandedSectionId === section.id ||
              (section.state === "active" && !compact)
            }
            onToggle={() => onToggleSection(section.id)}
            compact={compact}
          />
        ))}
      </ul>
    </li>
  );
}

/**
 * Risk Island Investor Checklist — Inside / Outside Forces with investing principles.
 */
export function ForcesChecklistPanel({
  companyId,
  variant = "schools",
  presentation = "default"
}: Props) {
  const isIsland = presentation === "island" || presentation === "island-kiosk";
  const isKiosk = presentation === "island-kiosk";
  const isLadder = presentation === "ladder";
  const compact = isIsland || isKiosk;

  const { snapshot } = useForcesChecklistProgress({ companyId });
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    snapshot.activeSection?.id ?? null
  );

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
        "iq-master-principles-panel iq-forces-checklist-panel iq-business-framework iq-forces-framework pointer-events-auto",
        variant === "schools" ? "iq-master-principles-panel--schools" : "iq-master-principles-panel--dark",
        isIsland ? "iq-master-principles-panel--island" : "",
        isKiosk ? "iq-master-principles-panel--island-kiosk" : "",
        isLadder ? "iq-master-principles-panel--ladder" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Investor Checklist, Risk section"
    >
      <header className="iq-master-principles-panel__header-band iq-forces-checklist-panel__header">
        <div className="iq-business-checklist-panel__title-row">
          <h2 className="iq-master-principles-panel__title">Investor Checklist</h2>
          <BusinessChecklistInfoHint
            label="About the Investor Checklist"
            content={INVESTOR_CHECKLIST_FORCES_INTRO}
            className="iq-business-checklist-panel__header-hint"
          />
        </div>
        <div className="iq-business-checklist-panel__pillar-row">
          <p className="iq-business-checklist-panel__pillar">Risk</p>
          <BusinessChecklistInfoHint
            label="About the Risk section"
            content={INVESTOR_CHECKLIST_RISK_INTRO}
            className="iq-business-checklist-panel__header-hint"
          />
        </div>
        <ForcesChecklistJourneyProgress
          snapshot={snapshot}
          variant={compact ? "compact" : "full"}
          className="iq-forces-checklist-panel__journey"
        />
        <div className="iq-master-principles-panel__title-divider" aria-hidden />
      </header>

      <div className="iq-master-principles-panel__body">
        <ul className="iq-forces-framework__groups">
          {snapshot.groups.map((group) => (
            <GroupBlock
              key={group.id}
              group={group}
              expandedSectionId={expandedSectionId}
              onToggleSection={toggleSection}
              compact={compact && !isLadder}
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
