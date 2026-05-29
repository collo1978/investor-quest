/**
 * Short-lived session flags so EntryFunnelGuard does not bounce the player
 * backward while a forward navigation + persist is in flight.
 */

const KEY = "iq-funnel-transition";

export type FunnelTransitionTarget =
  | "welcome"
  | "avatar"
  | "onboarding"
  | "map"
  | "business";

export function markFunnelTransition(target: FunnelTransitionTarget): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(KEY, target);
  } catch {
    /* ignore */
  }
}

export function clearFunnelTransition(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function getFunnelTransition(): FunnelTransitionTarget | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const v = sessionStorage.getItem(KEY);
    if (
      v === "welcome" ||
      v === "avatar" ||
      v === "onboarding" ||
      v === "map" ||
      v === "business"
    ) {
      return v;
    }
    return null;
  } catch {
    return null;
  }
}

export function isFunnelTransitionActive(): boolean {
  return getFunnelTransition() != null;
}

/** Call after the destination route has committed (one frame). */
export function releaseFunnelTransition(expected?: FunnelTransitionTarget): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (expected && sessionStorage.getItem(KEY) !== expected) return;
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
