/** Tracks which demo profile was last applied (UI label only). */
export const DEMO_PROFILE_SESSION_KEY = "investor-quest::demo-profile-active";

/** Set when Start New User Demo runs — forces /opening until dismissed. */
export const DEMO_FRESH_START_KEY = "iq-demo-fresh-start";

const SESSION_KEYS_TO_CLEAR = [
  "investor-quest::business-island-brief-dismissed",
  "iq-demo-snapshot-prewarm-v1",
  "iq-force-quest-regen",
  DEMO_PROFILE_SESSION_KEY
] as const;

/**
 * Clears tab-scoped UX flags so first-visit modals and prewarm can replay.
 * Does not touch Supabase analytics tables.
 */
export function clearDemoSessionFlags(): void {
  if (typeof sessionStorage === "undefined") return;
  for (const key of SESSION_KEYS_TO_CLEAR) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

export function setActiveDemoProfileLabel(profileId: string): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(DEMO_PROFILE_SESSION_KEY, profileId);
  } catch {
    /* ignore */
  }
}

export function getActiveDemoProfileLabel(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    return sessionStorage.getItem(DEMO_PROFILE_SESSION_KEY);
  } catch {
    return null;
  }
}

/**
 * Optional: fresh onboarding guest id so interest API starts clean.
 * Keeps analytics separate from the prior walkthrough.
 */
export function rotateOnboardingGuestId(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem("iq-onboarding-guest-id");
  } catch {
    /* ignore */
  }
}

export function markDemoFreshStart(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(DEMO_FRESH_START_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function isDemoFreshStart(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(DEMO_FRESH_START_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearDemoFreshStart(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(DEMO_FRESH_START_KEY);
  } catch {
    /* ignore */
  }
}
