const KEY = "investor-quest::business-island-brief-dismissed";

/** Tab-scoped guard so the hub brief does not re-open after navigation. */
export function markBusinessIslandBriefSeen(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* quota / private mode */
  }
}

export function wasBusinessIslandBriefSeen(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function clearBusinessIslandBriefSeen(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
