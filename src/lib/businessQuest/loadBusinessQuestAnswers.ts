import type { BusinessAiQuestSlug } from "@/app/business/businessQuestSlugs";
import { loadPillarQuestAnswersPayload } from "@/lib/quests/loadPillarQuestAnswers";
import {
  BUSINESS_REQUIRED_10K_SECTION_KEYS,
  getBusinessCardSpecs
} from "@/lib/sec/businessQuestSectionMap";
import type { PillarQuestAnswersPayload } from "@/lib/supabase/questCardAnswers/types";

export async function loadBusinessQuestAnswersPayload(params: {
  ticker: string;
  questSlug: BusinessAiQuestSlug;
}): Promise<PillarQuestAnswersPayload> {
  return loadPillarQuestAnswersPayload({
    pillarId: "business",
    ticker: params.ticker,
    questSlug: params.questSlug,
    cardSpecs: getBusinessCardSpecs(params.questSlug),
    requiredReadiness: {
      formType: "10-K",
      requiredSectionKeys: BUSINESS_REQUIRED_10K_SECTION_KEYS
    }
  });
}
