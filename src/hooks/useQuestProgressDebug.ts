"use client";

/**
 * Explicit debug only — never enabled from NODE_ENV alone.
 * Use `?questDebug=1`, `?admin=1`, or `?dev=1` on the quest URL.
 */
export function useQuestProgressDebug(): boolean {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  return q.get("questDebug") === "1" || q.get("admin") === "1" || q.get("dev") === "1";
}
