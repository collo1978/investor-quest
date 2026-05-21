"use client";

import type { PillarId } from "@/data/pillars";
import { isClientFastQuestMode } from "@/lib/quests/questGenerationModeClient";
import { getPillarQuestPipelineConfig } from "@/lib/quests/pillarQuestPipelineConfig";
import {
  getMissingCardIds,
  getPriorityCardId
} from "@/lib/quests/questPayloadProgress";
import {
  fetchQuestAnswersPayload,
  postQuestGenerate,
  postSecExtract
} from "@/lib/quests/runQuestGenerationClient";
import type { PillarQuestAnswersPayload } from "@/lib/supabase/questCardAnswers/types";

/** Entry quests to prewarm when a company is selected (fast first visit). */
export const QUEST_PREWARM_TARGETS: ReadonlyArray<{
  pillarId: PillarId;
  questSlug: string;
}> = [{ pillarId: "business", questSlug: "snapshot" }];

const inflight = new Set<string>();

function prewarmKey(ticker: string, pillarId: PillarId, questSlug: string) {
  return `${ticker}:${pillarId}:${questSlug}`;
}

/**
 * Non-blocking prewarm: skip if cached; card-1 first, rest in background.
 */
export async function prewarmQuestAnswers(
  ticker: string,
  pillarId: PillarId,
  questSlug: string,
  options?: { cardIds?: string[] }
): Promise<void> {
  if (isClientFastQuestMode()) return;

  const config = getPillarQuestPipelineConfig(pillarId);
  if (!config) return;

  const key = prewarmKey(ticker, pillarId, questSlug);
  if (inflight.has(key)) return;
  inflight.add(key);

  try {
    let payload = await fetchQuestAnswersPayload(config, ticker, questSlug);
    if (payload.status === "ready") return;

    const priorityId = getPriorityCardId(payload.expectedCardIds);
    if (payload.cards[priorityId]?.plainEnglishAnswer?.trim()) {
      const rest = getMissingCardIds(payload).filter((id) => id !== priorityId);
      if (!rest.length) return;
      void postQuestGenerate(config, {
        ticker,
        questSlug,
        cardIds: rest,
        extract: false
      });
      return;
    }

    if (payload.status === "missing_extract") {
      await postSecExtract(ticker);
      payload = await fetchQuestAnswersPayload(config, ticker, questSlug);
      if (payload.status === "ready") return;
    }

    await runProgressivePrewarmGenerate(
      config,
      ticker,
      questSlug,
      payload,
      options?.cardIds
    );
  } catch (err) {
    console.warn("[quest-prewarm]", { ticker, pillarId, questSlug, err });
  } finally {
    inflight.delete(key);
  }
}

async function runProgressivePrewarmGenerate(
  config: NonNullable<ReturnType<typeof getPillarQuestPipelineConfig>>,
  ticker: string,
  questSlug: string,
  payload: PillarQuestAnswersPayload,
  cardIds?: string[]
) {
  const priorityId = getPriorityCardId(payload.expectedCardIds);
  let missing = getMissingCardIds(payload);
  if (cardIds?.length) {
    missing = missing.filter((id) => cardIds.includes(id));
  }

  if (missing.includes(priorityId)) {
    void postQuestGenerate(config, {
      ticker,
      questSlug,
      cardIds: [priorityId],
      extract: false
    });
    return;
  }

  const rest = missing.filter((id) => id !== priorityId);
  if (rest.length) {
    void postQuestGenerate(config, {
      ticker,
      questSlug,
      cardIds: rest,
      extract: false
    });
  }
}
