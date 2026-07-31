import { DEMO_INTERESTS } from "@/lib/onboarding/seedData";
import type { OnboardingInterest } from "@/lib/onboarding/types";

export const PICK_INTERESTS_STORAGE_KEY = "iq-bank-onboarding-pick-interests";

export const PICK_INTERESTS_REQUIRED_COUNT = 2;

/** Full catalog — matches API/demo seed so tiles do not pop in after fetch. */
export const PICK_INTERESTS_FALLBACK: OnboardingInterest[] = [...DEMO_INTERESTS].sort(
  (a, b) => a.sortOrder - b.sortOrder
);

export function pickInterestsCatalogEqual(
  a: readonly OnboardingInterest[],
  b: readonly OnboardingInterest[]
): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item.id === b[index]?.id);
}

export function readPickInterestsSelection(): string[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(PICK_INTERESTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function writePickInterestsSelection(ids: string[]): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(PICK_INTERESTS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export function clearPickInterestsSelection(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(PICK_INTERESTS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
