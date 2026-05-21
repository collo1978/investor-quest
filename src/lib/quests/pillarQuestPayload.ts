import type { PillarQuestAnswersPayload } from "@/lib/supabase/questCardAnswers/types";

import {
  countCompletedCards,
  hasAnyGeneratedCard
} from "./questPayloadProgress";

/** True when every expected card has non-empty generated text. */
export function isPillarQuestPayloadReady(
  payload: PillarQuestAnswersPayload
): boolean {
  if (payload.status === "ready") {
    return payload.expectedCardIds.every(
      (id) => Boolean(payload.cards[id]?.plainEnglishAnswer?.trim())
    );
  }
  return false;
}

/** At least one card is ready — show quest while the rest generate. */
export function isPillarQuestPayloadPartiallyPlayable(
  payload: PillarQuestAnswersPayload | null | undefined
): boolean {
  if (!payload) return false;
  if (payload.status === "ready") return true;
  if (payload.status === "partial") return true;
  return hasAnyGeneratedCard(payload);
}

/** Statuses that should trigger SEC extract + OpenAI generation. */
export function shouldRunQuestPipeline(
  status: PillarQuestAnswersPayload["status"]
): boolean {
  return (
    status === "needs_generation" ||
    status === "missing_extract" ||
    status === "partial"
  );
}

export function describeIncompleteQuestPayload(
  payload: PillarQuestAnswersPayload
): string {
  if (payload.status === "missing_extract") {
    return (
      "SEC filing sections are still missing after the pull. " +
      "Confirm SEC_API_KEY in .env.local, restart npm run dev, then retry."
    );
  }
  const missing = payload.expectedCardIds.filter(
    (id) => !payload.cards[id]?.plainEnglishAnswer?.trim()
  );
  if (missing.length) {
    return `Answer generation incomplete (missing: ${missing.join(", ")}). Retry the pipeline.`;
  }
  return `Quest content is not ready (status: ${payload.status}).`;
}

export function payloadProgressSummary(
  payload: PillarQuestAnswersPayload
): { completed: number; total: number } {
  return {
    completed: countCompletedCards(payload),
    total: payload.expectedCardIds.length
  };
}
