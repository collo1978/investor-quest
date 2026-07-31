import type { GameState } from "@/engine/progression/state";

import {
  shouldShowOnboarding,
  shouldShowOpeningScreen
} from "@/lib/opening/shouldShowOpeningScreen";

/** True once the opening cinematic is done but profile creation isn't. */
function isMidSchoolsProfileCreation(state: GameState): boolean {
  return (
    state.onboarding.openingScreenSeenAt != null &&
    state.onboarding.completedAt == null
  );
}

/** Schools funnel: opening → name → pick-avatar (face + archetype) → onboarding → map. */
export function shouldShowSchoolsNameScreen(state: GameState): boolean {
  return isMidSchoolsProfileCreation(state) && !state.playerName;
}

/** Merged identity step — gates on either half still being unset. */
export function shouldShowSchoolsPickAvatarScreen(state: GameState): boolean {
  return (
    isMidSchoolsProfileCreation(state) &&
    !!state.playerName &&
    (!state.schoolsProfile.avatarId || !state.schoolsProfile.armorId)
  );
}

export function resolveSchoolsHomeEntryRoute(
  state: GameState
):
  | "/schools/opening"
  | "/schools/name"
  | "/schools/pick-avatar"
  | "/schools/screen5-onboarding"
  | "/schools/map" {
  if (shouldShowOpeningScreen(state)) return "/schools/opening";
  if (shouldShowSchoolsNameScreen(state)) return "/schools/name";
  if (shouldShowSchoolsPickAvatarScreen(state)) return "/schools/pick-avatar";
  if (shouldShowOnboarding(state)) return "/schools/screen5-onboarding";
  return "/schools/map";
}
