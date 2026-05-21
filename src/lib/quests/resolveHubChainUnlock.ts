/**
 * Hub map slot unlock — linear chain: slot N unlocks when slot N−1 is **completed**
 * (quiz passed / checklist done), not when cards are only marked read.
 * CMS `hub_locked: true` force-locks; `hub_locked: false` only force-unlocks slot 1.
 */

export function resolveHubSlotLocked(
  orderNumber: number,
  hubLocked: boolean | null | undefined,
  priorSlotCompleted: boolean
): boolean {
  if (hubLocked === true) return true;
  if (hubLocked === false && orderNumber <= 1) return false;
  if (orderNumber <= 1) return false;
  return !priorSlotCompleted;
}
