import { getOrCreateOnboardingGuestId } from "@/lib/onboarding/guestId";
import { DEFAULT_PARTNER_ID } from "@/platform/partners/partnerRegistry";

const PARTNER_STORAGE_KEY = "iq-analytics-partner-id";

/**
 * Anonymous / guest user id until real auth ships.
 * TODO: Replace with Supabase Auth `user.id` (or school SSO subject).
 */
export function getAnalyticsUserId(): string {
  if (typeof window === "undefined") return "server";
  return getOrCreateOnboardingGuestId();
}

/**
 * Partner / org scope for multi-tenant dashboards.
 * TODO: Resolve from JWT org claim, school district id, or broker branch id.
 */
export function getAnalyticsPartnerId(): string {
  if (typeof window === "undefined") return DEFAULT_PARTNER_ID;
  try {
    const stored = localStorage.getItem(PARTNER_STORAGE_KEY)?.trim();
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_PARTNER_ID;
}

/** Optional: set partner id for demo broker/school splits. */
export function setAnalyticsPartnerId(partnerId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PARTNER_STORAGE_KEY, partnerId);
  } catch {
    /* ignore */
  }
}
