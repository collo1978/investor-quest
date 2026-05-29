import type { GameState } from "@/engine/progression/state";

import { hasSchoolsAvatarSelected } from "@/lib/schools/schoolsAvatarStorage";
import {
  shouldShowOnboarding,
  shouldShowOpeningScreen
} from "@/lib/opening/shouldShowOpeningScreen";

/** Schools funnel: opening → avatar → onboarding → map. */
export function shouldShowSchoolsAvatarScreen(state: GameState): boolean {
  return (
    state.onboarding.openingScreenSeenAt != null &&
    state.onboarding.completedAt == null &&
    !hasSchoolsAvatarSelected()
  );
}

export function resolveSchoolsHomeEntryRoute(
  state: GameState
):
  | "/schools/opening"
  | "/schools/avatar"
  | "/schools/onboarding"
  | "/schools/map" {
  if (shouldShowOpeningScreen(state)) return "/schools/opening";
  if (shouldShowSchoolsAvatarScreen(state)) return "/schools/avatar";
  if (shouldShowOnboarding(state)) return "/schools/onboarding";
  return "/schools/map";
}
