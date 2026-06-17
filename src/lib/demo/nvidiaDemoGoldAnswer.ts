import { buildTakeawayAnswerBody } from "@/lib/quests/takeawayAnswer";

/**
 * NVIDIA demo gold-standard card body: headline takeaway + white explanation.
 * Parsed by {@link parseTakeawayAnswerBody} for yellow/white UI.
 */
export function goldAnswer(takeaway: string, supporting: string): string {
  return buildTakeawayAnswerBody({
    takeaway: takeaway.trim(),
    supporting: supporting.trim()
  });
}
