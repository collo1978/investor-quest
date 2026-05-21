import type { ManagementAiQuestSlug } from "@/app/management/managementQuestSlugs";
import { loadPillarQuestAnswersPayload } from "@/lib/quests/loadPillarQuestAnswers";
import { getManagementCardSpecs } from "@/lib/sec/managementQuestSectionMap";
import type { PillarQuestAnswersPayload } from "@/lib/supabase/questCardAnswers/types";

export async function loadManagementQuestAnswersPayload(params: {
  ticker: string;
  questSlug: ManagementAiQuestSlug;
}): Promise<PillarQuestAnswersPayload> {
  return loadPillarQuestAnswersPayload({
    pillarId: "management",
    ticker: params.ticker,
    questSlug: params.questSlug,
    cardSpecs: getManagementCardSpecs(params.questSlug),
    readinessFromSpecs: true
  });
}
