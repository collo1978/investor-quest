"use client";

import { useMemo, type ReactNode } from "react";

import { BusinessSectionQuestPanel } from "@/components/business/investorQuality/BusinessSectionQuestPanel";
import { InvestorPrincipleEvidenceFlyProvider } from "@/components/business/investorFramework/InvestorPrincipleEvidenceFly";
import {
  InvestorQualityRatingSyncProvider,
  useInvestorQualityRatingSync
} from "@/components/business/investorQuality/InvestorQualityRatingSyncContext";
import type { CompanyId } from "@/data/companies";
import { useBusinessChecklistProgress } from "@/hooks/useBusinessChecklistProgress";
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
  highlightPrincipleId = null,
  highlightSectionQuizId = null,
  children
}: Props) {
  const { snapshot: checklistSnapshot } = useBusinessChecklistProgress({
    companyId: companyId ?? "nvda",
    currentQuestSlug: questSlug ?? null,
    currentQuestProgressPct: questProgressPct
  });

  if (!enabled || !companyId) {
    return <>{children}</>;
  }

  return (
    <InvestorPrincipleEvidenceFlyProvider>
      <div className="iq-quest-checklist-layout">
        <BusinessSectionQuestPanel
          snapshot={checklistSnapshot}
          ratingFocusMode={ratingFocusMode}
          highlightPrincipleId={highlightPrincipleId}
          highlightSectionQuizId={highlightSectionQuizId}
          className="iq-quest-checklist-layout__panel"
        />
        <div className="iq-quest-checklist-layout__main">{children}</div>
      </div>
    </InvestorPrincipleEvidenceFlyProvider>
  );
}

/** Quest reading shell — section progression rail + scrollable Q&A column. */
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
