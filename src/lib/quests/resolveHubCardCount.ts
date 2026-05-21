import type { QuestDefinition } from "@/data/quests/types";

const DEFAULT_HUB_CARD_COUNT = 3;

/** Badge count on hub map cards — never show 0 after Supabase hydration. */
export function resolveHubCardCount(quest: QuestDefinition): number {
  if (quest.hubCardCount != null && quest.hubCardCount > 0) {
    return quest.hubCardCount;
  }
  if (quest.cards?.length) return quest.cards.length;
  const quizCount = quest.quizConfig?.questions?.length;
  if (quizCount && quizCount > 0) return quizCount;
  return DEFAULT_HUB_CARD_COUNT;
}
