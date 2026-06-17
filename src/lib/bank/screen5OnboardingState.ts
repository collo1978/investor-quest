export const SCREEN5_ONBOARDING_STORAGE_KEY =
  "iq-bank-onboarding-screen5-selections";

export type Screen5OptionId =
  | "exp-social"
  | "exp-someone-told"
  | "exp-guessing"
  | "exp-liked"
  | "exp-education"
  | "exp-research"
  | "beg-watch"
  | "beg-afraid"
  | "beg-understand"
  | "beg-start"
  | "beg-education";

export const SCREEN5_OPTION_IDS: readonly Screen5OptionId[] = [
  "exp-social",
  "exp-someone-told",
  "exp-guessing",
  "exp-liked",
  "exp-education",
  "exp-research",
  "beg-watch",
  "beg-afraid",
  "beg-understand",
  "beg-start",
  "beg-education"
] as const;

export function readScreen5Selections(): Screen5OptionId[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SCREEN5_ONBOARDING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is Screen5OptionId =>
        typeof x === "string" &&
        (SCREEN5_OPTION_IDS as readonly string[]).includes(x)
    );
  } catch {
    return [];
  }
}

export function writeScreen5Selections(selected: Screen5OptionId[]): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      SCREEN5_ONBOARDING_STORAGE_KEY,
      JSON.stringify(selected)
    );
  } catch {
    /* ignore */
  }
}
