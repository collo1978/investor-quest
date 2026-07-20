"use client";

import { useMemo } from "react";

import { BusinessChecklistChapterNav } from "@/components/business/checklist/BusinessChecklistChapterNav";
import { BusinessChecklistSectionWorkspace } from "@/components/business/checklist/BusinessChecklistSectionWorkspace";
import type { CompanyId } from "@/data/companies";
import { resolveChecklistWorkspaceSection } from "@/lib/business/businessChecklistWorkspaceHelpers";
import type { BusinessInvestorChecklistSnapshot } from "@/lib/business/businessInvestorFramework";

type Props = {
  snapshot: BusinessInvestorChecklistSnapshot;
  companyId: CompanyId;
  questSlug?: string | null;
  ratingFocusMode?: boolean;
  highlightPrincipleId?: string | null;
  highlightSectionQuizId?: string | null;
  className?: string;
};

/**
 * Split checklist — chapter nav (left) + active section workspace (right).
 * @deprecated Prefer BusinessQuestChecklistLayout for quest reading.
 */
export function BusinessSectionQuestPanel({
  snapshot,
  companyId,
  questSlug = null,
  ratingFocusMode = false,
  highlightPrincipleId = null,
  highlightSectionQuizId = null,
  className = ""
}: Props) {
  const workspaceSection = useMemo(
    () => resolveChecklistWorkspaceSection(snapshot, questSlug),
    [snapshot, questSlug]
  );

  return (
    <div className={["iq-quest-checklist-layout iq-quest-checklist-layout--panel-only", className].join(" ")}>
      <BusinessChecklistChapterNav
        snapshot={snapshot}
        workspaceSectionId={workspaceSection?.id ?? null}
        ratingFocusMode={ratingFocusMode}
        className="iq-quest-checklist-layout__nav"
      />
      <BusinessChecklistSectionWorkspace
        section={workspaceSection}
        companyId={companyId}
        highlightPrincipleId={highlightPrincipleId}
        highlightSectionQuizId={highlightSectionQuizId}
        className="iq-quest-checklist-layout__section-panel"
      />
    </div>
  );
}
