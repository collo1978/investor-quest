"use client";

import { useMemo, useState } from "react";

import { BusinessIslandHqDecodeExperience } from "@/components/business/hub/BusinessIslandHqDecodeExperience";
import type { InvestorNotebookQuestionId } from "@/lib/business/businessIslandInvestorNotebook";
import type { BusinessIslandStoryLocationDef } from "@/lib/business/businessIslandStoryLocations";

type Props = {
  location: BusinessIslandStoryLocationDef;
  companyId: string;
  companyName: string;
  alreadyExplored: boolean;
  masteredQuestionIds: readonly InvestorNotebookQuestionId[];
  /** Checklist deep-link — jump straight into this mission. */
  focusQuestionId?: InvestorNotebookQuestionId | null;
  onBeforeQuestNavigate?: (href: string) => void;
  onMissionMastered: (questionId: InvestorNotebookQuestionId) => void;
  onLeave: (markVisited: boolean) => void;
};

/**
 * Every district uses the Headquarters case-file UI:
 * brief → evidence → answer → checklist tick → next question.
 */
export function BusinessIslandLocationExperience({
  location,
  companyName,
  alreadyExplored,
  masteredQuestionIds,
  focusQuestionId = null,
  onMissionMastered,
  onLeave
}: Props) {
  const masteredSet = useMemo(
    () => new Set(masteredQuestionIds),
    [masteredQuestionIds]
  );
  const [completedThisVisit, setCompletedThisVisit] = useState(false);

  const startIndex = useMemo(() => {
    if (!focusQuestionId) return 0;
    const idx = location.notebookQuestionIds.indexOf(focusQuestionId);
    return idx >= 0 ? idx : 0;
  }, [focusQuestionId, location.notebookQuestionIds]);

  const allDistrictMastered = location.notebookQuestionIds.every((id) =>
    masteredSet.has(id)
  );

  const handleQuestionMastered = (questionId: InvestorNotebookQuestionId) => {
    if (!masteredSet.has(questionId)) {
      setCompletedThisVisit(true);
    }
    onMissionMastered(questionId);
  };

  const leaveIsland = () => {
    // Headquarters historically counts as visited as soon as its brief opens.
    // Other districts retain their existing progression semantics: visiting
    // without completing a mission does not clear the district.
    onLeave(
      location.id === "district-hq" ||
        alreadyExplored ||
        completedThisVisit ||
        allDistrictMastered
    );
  };

  return (
    <BusinessIslandHqDecodeExperience
      location={location}
      companyName={companyName}
      startIndex={startIndex}
      onMissionMastered={handleQuestionMastered}
      onLeave={leaveIsland}
    />
  );
}
