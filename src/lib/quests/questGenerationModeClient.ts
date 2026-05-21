"use client";

/** Client-side fast quest iteration (set NEXT_PUBLIC_QUEST_FAST_DEV=true). */
export function isClientFastQuestMode(): boolean {
  if (typeof process === "undefined") return false;
  const v = process.env.NEXT_PUBLIC_QUEST_FAST_DEV?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function getQuestAnswersPollMs(): number {
  return isClientFastQuestMode() ? 750 : 2000;
}

export function isClientForceQuestRegenerate(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get("force") === "1") {
      return true;
    }
    return sessionStorage.getItem("iq-force-quest-regen") === "1";
  } catch {
    return false;
  }
}

/** Disable session-wide demo prewarm (competes with prompt testing). */
export function isDemoPrewarmDisabled(): boolean {
  return isClientFastQuestMode();
}
