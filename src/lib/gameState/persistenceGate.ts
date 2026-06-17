import type { GameAction } from "@/engine/progression/reducer";

/** Actions that mutate saved progress — blocked until hydration completes. */
const PROGRESS_PERSIST_ACTIONS: ReadonlySet<GameAction["type"]> = new Set([
  "mark-quest-read",
  "mark-quest-unread",
  "complete-quest",
  "complete-onboarding",
  "complete-opening-screen",
  "patch-quest-work",
  "clear-pillar-progress",
  "repair-quest-progress",
  "submit-conviction-and-advance",
  "enqueue-pillar-conviction",
  "complete-ten-k-rookie-challenge",
  "award-xp",
  "tick-streak",
  "update-quest-notes",
  "toggle-quest-checklist",
  "reset",
  "dismiss-quest-map-brief",
  "dismiss-business-island-brief"
]);

export function isProgressPersistAction(type: GameAction["type"]): boolean {
  return PROGRESS_PERSIST_ACTIONS.has(type);
}
