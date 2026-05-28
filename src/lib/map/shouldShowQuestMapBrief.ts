import type { GameState } from "@/engine/progression/state";
import { initialCompanyProgress } from "@/engine/progression/state";

/** True when the player finished onboarding but has not dismissed the map mission brief. */
export function shouldShowQuestMapBrief(state: GameState): boolean {
  if (state.onboarding.completedAt == null) return false;
  const prog =
    state.companies[state.activeCompanyId] ?? initialCompanyProgress();
  return prog.questMapBriefDismissedAt == null;
}
