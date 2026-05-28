import type { GameState } from "@/engine/progression/state";

/** True until the logo intro finishes (first-time / new-user demo). */
export function shouldShowOpeningScreen(state: GameState): boolean {
  return (
    state.onboarding.openingScreenSeenAt == null &&
    state.onboarding.completedAt == null
  );
}

/** True after logo intro until the welcome CTA starts onboarding. */
export function shouldShowWelcomeScreen(state: GameState): boolean {
  return (
    state.onboarding.openingScreenSeenAt != null &&
    state.onboarding.welcomeScreenSeenAt == null &&
    state.onboarding.completedAt == null
  );
}

/** True until onboarding is completed (welcome CTA must be tapped first). */
export function shouldShowOnboarding(state: GameState): boolean {
  return (
    state.onboarding.completedAt == null &&
    state.onboarding.welcomeScreenSeenAt != null
  );
}

/** Resolve `/` redirect target once persistence is ready. */
export function resolveHomeEntryRoute(
  state: GameState
): "/opening" | "/welcome" | "/onboarding" | "/map" {
  if (shouldShowOpeningScreen(state)) return "/opening";
  if (shouldShowWelcomeScreen(state)) return "/welcome";
  if (shouldShowOnboarding(state)) return "/onboarding";
  return "/map";
}
