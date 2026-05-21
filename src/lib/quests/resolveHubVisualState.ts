export type HubQuestVisualState = "locked" | "active" | "completed";

export function isHubQuestComplete(
  progressPct: number,
  engineCompleted?: boolean
): boolean {
  return progressPct >= 100 || Boolean(engineCompleted);
}

/** Hub map card visual tier from unlock + real progress. */
export function resolveHubVisualState(
  locked: boolean,
  progressPct: number,
  engineCompleted?: boolean
): HubQuestVisualState {
  if (locked) return "locked";
  if (isHubQuestComplete(progressPct, engineCompleted)) return "completed";
  return "active";
}
