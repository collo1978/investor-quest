import type {
  BusinessChecklistSectionView,
  BusinessInvestorChecklistSnapshot
} from "@/lib/business/businessInvestorFramework";

/** Section shown in the right-hand workspace — prefers the current quest's section. */
export function resolveChecklistWorkspaceSection(
  snapshot: BusinessInvestorChecklistSnapshot,
  questSlug?: string | null
): BusinessChecklistSectionView | null {
  if (questSlug) {
    const byQuest = snapshot.sections.find((section) => section.questSlug === questSlug);
    if (byQuest) return byQuest;
  }

  return (
    snapshot.activeSection ??
    snapshot.sections.find((section) => section.state === "active") ??
    null
  );
}
