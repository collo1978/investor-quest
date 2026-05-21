import { loadPillarQuestAnswersPayload } from "@/lib/quests/loadPillarQuestAnswers";
import {
  FORCES_REQUIRED_10K_SECTION_KEYS,
  FORCES_TOPIC_CARD_ID,
  getForcesTopicSpecs
} from "@/lib/sec/forcesTopicSectionMap";
import type { PillarQuestAnswersPayload } from "@/lib/supabase/questCardAnswers/types";

export async function loadForcesQuestAnswersPayload(params: {
  ticker: string;
  questSlug: string;
}): Promise<PillarQuestAnswersPayload> {
  const cardSpecs = getForcesTopicSpecs(params.questSlug);
  return loadPillarQuestAnswersPayload({
    pillarId: "forces",
    ticker: params.ticker,
    questSlug: params.questSlug,
    cardSpecs,
    requiredReadiness: {
      formType: "10-K",
      requiredSectionKeys: FORCES_REQUIRED_10K_SECTION_KEYS
    },
    readinessFromSpecs: false
  }).then((payload) => ({
    ...payload,
    expectedCardIds:
      payload.expectedCardIds.length > 0
        ? payload.expectedCardIds
        : [FORCES_TOPIC_CARD_ID]
  }));
}
