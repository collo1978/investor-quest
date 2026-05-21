import type { CompanyId } from "@/data/companies";
import type { QuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import {
  FORCES_QUEST_SYSTEM_PROMPT,
  buildForcesTopicUserPrompt,
  splitAnswerAndInsight
} from "@/lib/ai/forcesQuestPrompt";
import {
  generatePillarQuestAnswers,
  type GeneratePillarQuestResult
} from "@/lib/ai/generatePillarQuestAnswers";
import {
  FORCES_REQUIRED_10K_SECTION_KEYS,
  getForcesTopicSpecs,
  isForcesHubSlug,
  isForcesTopicSlug,
  type ForcesTopicSpec
} from "@/lib/sec/forcesTopicSectionMap";

export type { GeneratePillarQuestResult as GenerateForcesQuestResult };

export async function generateForcesQuestAnswers(params: {
  ticker: string;
  companyId: CompanyId;
  questSlug?: string;
  cardIds?: string[];
  runExtractIfMissing?: boolean;
  generationOptions?: Partial<QuestGenerationOptions>;
}): Promise<GeneratePillarQuestResult> {
  const specs = getForcesTopicSpecs(params.questSlug).filter(
    (s) => !isForcesHubSlug(s.questSlug)
  );

  return generatePillarQuestAnswers({
    pillarId: "forces",
    ticker: params.ticker,
    companyId: params.companyId,
    questSlug: params.questSlug,
    cardIds: params.cardIds,
    runExtractIfMissing: params.runExtractIfMissing,
    generationOptions: params.generationOptions,
    specs,
    readinessFromSpecs: false,
    requiredReadiness: {
      formType: "10-K",
      requiredSectionKeys: FORCES_REQUIRED_10K_SECTION_KEYS
    },
    systemPrompt: FORCES_QUEST_SYSTEM_PROMPT,
    buildUserPrompt: async (p) => {
      const spec = specs.find((s) => s.questSlug === p.questSlug) as
        | ForcesTopicSpec
        | undefined;
      if (!spec) throw new Error(`Forces topic spec not found: ${p.questSlug}`);
      return buildForcesTopicUserPrompt(spec, {
        companyName: p.companyName,
        ticker: p.ticker,
        questTitle: p.questTitle,
        questAiTask: p.questAiTask,
        cardQuestion: p.cardQuestion,
        sectionIds: p.sectionIds
      });
    },
    splitAnswerAndInsight,
    missingExtractMessage: (ticker, missing) =>
      `Missing required 10-K sections (${missing.join(", ")}). Run POST /api/sec/extract?ticker=${ticker} first.`
  });
}

export function parseForcesQuestSlugParam(
  raw: string | null
): string | undefined {
  if (!raw?.trim()) return undefined;
  const slug = raw.trim();
  if (isForcesHubSlug(slug)) return undefined;
  return isForcesTopicSlug(slug) ? slug : undefined;
}
