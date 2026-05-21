import type { PillarQuestAnswersPayload } from "@/lib/supabase/questCardAnswers/types";

export type QuestPipelineProgress = {
  completed: number;
  total: number;
  /** Human label for the card currently generating (optional). */
  currentLabel?: string;
};

export function countCompletedCards(
  payload: Pick<PillarQuestAnswersPayload, "expectedCardIds" | "cards">
): number {
  return payload.expectedCardIds.filter((id) =>
    Boolean(payload.cards[id]?.plainEnglishAnswer?.trim())
  ).length;
}

export function getMissingCardIds(
  payload: Pick<PillarQuestAnswersPayload, "expectedCardIds" | "cards">
): string[] {
  return payload.expectedCardIds.filter(
    (id) => !payload.cards[id]?.plainEnglishAnswer?.trim()
  );
}

export function getPriorityCardId(expectedCardIds: string[]): string {
  return expectedCardIds[0] ?? "card-1";
}

export function hasAnyGeneratedCard(
  payload: Pick<PillarQuestAnswersPayload, "cards"> | null | undefined
): boolean {
  if (!payload?.cards) return false;
  return Object.values(payload.cards).some((c) =>
    Boolean(c.plainEnglishAnswer?.trim())
  );
}

export function buildQuestProgress(
  payload: Pick<PillarQuestAnswersPayload, "expectedCardIds" | "cards">
): QuestPipelineProgress {
  const total = payload.expectedCardIds.length;
  const completed = countCompletedCards(payload);
  const nextId = getMissingCardIds(payload)[0];
  return {
    completed,
    total,
    currentLabel: nextId ? `Card ${nextId}` : undefined
  };
}

export function resolvePayloadStatus(
  expectedCardIds: string[],
  cards: PillarQuestAnswersPayload["cards"],
  extractReady: boolean
): PillarQuestAnswersPayload["status"] {
  if (!extractReady) return "missing_extract";
  const completed = countCompletedCards({ expectedCardIds, cards });
  if (completed >= expectedCardIds.length && expectedCardIds.length > 0) {
    return "ready";
  }
  if (completed > 0) return "partial";
  return "needs_generation";
}
