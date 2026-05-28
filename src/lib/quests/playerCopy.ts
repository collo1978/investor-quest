import { normalizePlayerFacingCopy } from "@/lib/quests/normalizeQuestProse";

/** Normalize UI strings (toasts, tooltips, completion lines) at read time. */
export function playerCopy(text: string): string {
  return normalizePlayerFacingCopy(text);
}
