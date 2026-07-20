import { resolveSectionForQuest } from "@/lib/business/businessInvestorFramework";
import type { BusinessInvestorFrameworkStoredState } from "@/lib/business/businessInvestorFrameworkStorage";

/** Hub slot unlock — prior quest's checklist section quiz passed. */
export function isChecklistSectionQuestComplete(
  questSlug: string,
  stored: BusinessInvestorFrameworkStoredState | undefined
): boolean {
  if (!stored) return false;
  const section = resolveSectionForQuest(questSlug);
  if (!section) return false;
  return stored.sectionQuizPassed?.[section.id] === true;
}
