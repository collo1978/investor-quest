"use client";

import { useMemo, type ReactNode } from "react";

import { BusinessChecklistChapterNav } from "@/components/business/checklist/BusinessChecklistChapterNav";
import { BusinessChecklistSectionWorkspace } from "@/components/business/checklist/BusinessChecklistSectionWorkspace";
import { BusinessInvestorNotebookPanel } from "@/components/business/hub/BusinessInvestorNotebookPanel";
import { InvestorPrincipleEvidenceFlyProvider } from "@/components/business/investorFramework/InvestorPrincipleEvidenceFly";
import {
  InvestorQualityRatingSyncProvider
} from "@/components/business/investorQuality/InvestorQualityRatingSyncContext";
import type { CompanyId } from "@/data/companies";
import { useBusinessChecklistProgress } from "@/hooks/useBusinessChecklistProgress";
import { resolveChecklistWorkspaceSection } from "@/lib/business/businessChecklistWorkspaceHelpers";
import type { InvestorQualityChecklistSnapshot } from "@/lib/business/investorQualityChecklist";

export { useEvidenceFly } from "@/components/business/investorQuality/InvestorQualityEvidenceFlyover";
export { useInvestorPrincipleEvidenceFly } from "@/components/business/investorFramework/InvestorPrincipleEvidenceFly";
export {
  InvestorQualityRatingSyncProvider,
  useInvestorQualityRatingSync
} from "@/components/business/investorQuality/InvestorQualityRatingSyncContext";

type Props = {
  enabled: boolean;
  /** @deprecated Principles no longer shown in quest rail — kept for evidence/rating flow. */
  snapshot: InvestorQualityChecklistSnapshot;
  companyId?: CompanyId;
  questSlug?: string;
  questProgressPct?: number;
  ratingFocusMode?: boolean;
  /** Hide chapter rail — section-only mission tracker during Schools section missions. */
  hideChapterNav?: boolean;
  highlightPrincipleId?: string | null;
  highlightSectionQuizId?: string | null;
  children: ReactNode;
};

function ChecklistLayoutInner({
  enabled,
  companyId,
  questSlug,
  questProgressPct = 0,
  ratingFocusMode = false,
  hideChapterNav = false,
  highlightPrincipleId = null,
  highlightSectionQuizId = null,
  children
}: Props) {
  const { snapshot: checklistSnapshot } = useBusinessChecklistProgress({
    companyId: companyId ?? "nvda",
    currentQuestSlug: questSlug ?? null,
    currentQuestProgressPct: questProgressPct
  });

  const workspaceSection = useMemo(
    () => resolveChecklistWorkspaceSection(checklistSnapshot, questSlug),
    [checklistSnapshot, questSlug]
  );

  if (!enabled || !companyId) {
    return <>{children}</>;
  }

  /* Section mission: docked left sidebar + lesson main (no floating card). */
  if (hideChapterNav) {
    return (
      <InvestorPrincipleEvidenceFlyProvider>
        <div className="iq-quest-checklist-layout iq-quest-checklist-layout--section-mission">
          <aside
            className="iq-quest-checklist-layout__sidebar"
            aria-label="Investor Checklist"
          >
            <BusinessInvestorNotebookPanel companyId={companyId} />
          </aside>
          <div className="iq-quest-checklist-layout__main">{children}</div>
        </div>
      </InvestorPrincipleEvidenceFlyProvider>
    );
  }

  return (
    <InvestorPrincipleEvidenceFlyProvider>
      <div className="iq-quest-checklist-layout">
        <BusinessChecklistChapterNav
          snapshot={checklistSnapshot}
          workspaceSectionId={workspaceSection?.id ?? null}
          ratingFocusMode={ratingFocusMode}
          className="iq-quest-checklist-layout__nav"
        />
        <div className="iq-quest-checklist-layout__workspace">
          <BusinessChecklistSectionWorkspace
            section={workspaceSection}
            companyId={companyId}
            highlightPrincipleId={highlightPrincipleId}
            highlightSectionQuizId={highlightSectionQuizId}
            className="iq-quest-checklist-layout__section-panel"
          />
          <div className="iq-quest-checklist-layout__main">{children}</div>
        </div>
      </div>
    </InvestorPrincipleEvidenceFlyProvider>
  );
}

/** Quest reading shell — chapter nav + active section workspace + lesson column. */
export function BusinessQuestChecklistLayout({
  ratingFocusMode = false,
  questProgressPct,
  ...props
}: Props) {
  const progressPct = useMemo(() => {
    if (questProgressPct != null) return questProgressPct;
    return 0;
  }, [questProgressPct]);

  if (ratingFocusMode) {
    return (
      <InvestorQualityRatingSyncProvider>
        <ChecklistLayoutInner
          {...props}
          ratingFocusMode
          questProgressPct={progressPct}
        />
      </InvestorQualityRatingSyncProvider>
    );
  }

  return (
    <ChecklistLayoutInner
      {...props}
      ratingFocusMode={false}
      questProgressPct={progressPct}
    />
  );
}
