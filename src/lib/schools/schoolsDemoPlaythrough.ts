import type { PillarId } from "@/data/pillars";
import {
  isSchoolsDemoStoryModeActive,
  wasSchoolsDemoLaunchedInSession,
  type SchoolsDemoStoryStep
} from "@/lib/schools/schoolsDemoStoryMode";

/** Only Business tile exposed in the Schools end-to-end demo. */
export const SCHOOLS_DEMO_BUSINESS_TILE = "what-they-do" as const;

export function isSchoolsDemoPlaythroughActive(): boolean {
  return (
    wasSchoolsDemoLaunchedInSession() && isSchoolsDemoStoryModeActive()
  );
}

/** Schools demo unlocks the final challenge after Business conviction — not full game. */
export function isSchoolsDemoFinalChallengeReady(
  pillarConvictionSubmittedAt: Partial<Record<PillarId, number>>
): boolean {
  if (!isSchoolsDemoPlaythroughActive()) return false;
  return typeof pillarConvictionSubmittedAt.business === "number";
}

/** Post-conviction tour order (after first Business tile quiz). */
export const SCHOOLS_DEMO_POST_QUEST_STEPS = [
  "conviction",
  "profile",
  "xp-ladder",
  "final-challenge",
  "map-return"
] as const satisfies readonly SchoolsDemoStoryStep[];
