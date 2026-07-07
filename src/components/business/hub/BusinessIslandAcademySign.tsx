"use client";

import { BusinessChecklistJourneyProgress } from "@/components/business/hub/BusinessChecklistJourneyProgress";
import { BusinessChecklistInfoHint } from "@/components/business/hub/BusinessChecklistInfoHint";
import type { CompanyId } from "@/data/companies";
import { useBusinessChecklistProgress } from "@/hooks/useBusinessChecklistProgress";
import { INVESTOR_CHECKLIST_HEADER_INTRO } from "@/lib/business/businessInvestorFramework";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";

type Props = {
  companyId: CompanyId;
  onOpenLadder: () => void;
  cards?: readonly BusinessHubQuestCard[];
};

/**
 * Compact island HUD chip — clean entry point into the Investor Checklist.
 */
export function BusinessIslandAcademySign({ companyId, onOpenLadder, cards }: Props) {
  const { snapshot } = useBusinessChecklistProgress({ companyId, cards });
  const progressLabel = `${snapshot.journey.pct}% Complete`;

  return (
    <div className="iq-schools-island-academy-sign iq-schools-island-prop iq-schools-island-prop--notice-board pointer-events-auto">
      <span className="iq-schools-island-prop__ground-shadow" aria-hidden />
      <span className="iq-schools-island-prop__post" aria-hidden />

      <div className="iq-schools-island-academy-sign__open">
        <button
          type="button"
          className="iq-schools-island-academy-sign__open-trigger"
          onClick={onOpenLadder}
          aria-label={`Investor Checklist. ${progressLabel}. View full checklist.`}
        >
          <span className="iq-schools-island-academy-sign__title">Investor Checklist</span>
          <BusinessChecklistJourneyProgress
            snapshot={snapshot}
            variant="compact"
            className="iq-schools-island-academy-sign__journey"
          />
          <span className="iq-schools-island-academy-sign__cta">
            View Checklist
            <span aria-hidden> →</span>
          </span>
        </button>
        <BusinessChecklistInfoHint
          label="About the Investor Checklist"
          content={INVESTOR_CHECKLIST_HEADER_INTRO}
          className="iq-schools-island-academy-sign__header-hint"
        />
      </div>
    </div>
  );
}
