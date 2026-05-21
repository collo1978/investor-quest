const GUEST_STORAGE_KEY = "iq-onboarding-guest-id";

/** Stable anonymous id for onboarding interest persistence. */
export function getOrCreateOnboardingGuestId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = localStorage.getItem(GUEST_STORAGE_KEY);
    if (existing?.trim()) return existing.trim();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `guest-${Date.now()}`;
    localStorage.setItem(GUEST_STORAGE_KEY, id);
    return id;
  } catch {
    return `guest-${Date.now()}`;
  }
}
