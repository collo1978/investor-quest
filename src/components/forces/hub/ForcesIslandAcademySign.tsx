"use client";

import { ForcesChecklistJourneyProgress } from "@/components/forces/hub/ForcesChecklistJourneyProgress";
import { BusinessChecklistInfoHint } from "@/components/business/hub/BusinessChecklistInfoHint";
import type { CompanyId } from "@/data/companies";
import { useForcesChecklistProgress } from "@/hooks/useForcesChecklistProgress";
import { INVESTOR_CHECKLIST_FORCES_INTRO } from "@/lib/forces/forcesInvestorFramework";

type Props = {
  companyId: CompanyId;
  onOpenLadder: () => void;
};

/**
 * Compact Risk Island HUD chip — entry point into the Investor Checklist.
 */
export function ForcesIslandAcademySign({ companyId, onOpenLadder }: Props) {
  const { snapshot } = useForcesChecklistProgress({ companyId });
  const progressLabel = `${snapshot.journey.pct}% Complete`;

  return (
    <div className="iq-schools-island-academy-sign iq-schools-island-academy-sign--forces iq-schools-island-prop iq-schools-island-prop--notice-board pointer-events-auto">
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
          <ForcesChecklistJourneyProgress
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
          content={INVESTOR_CHECKLIST_FORCES_INTRO}
          className="iq-schools-island-academy-sign__header-hint"
        />
      </div>
    </div>
  );
}
