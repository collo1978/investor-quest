import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { buildCardUserPromptFromTemplate } from "@/lib/ai/buildCardUserPromptFromTemplate";
import {
  FINANCIAL_QUEST_SYSTEM_PROMPT,
  splitAnswerAndInsight as splitFinancial
} from "@/lib/ai/financialQuestPrompt";
import {
  BUSINESS_QUEST_SYSTEM_PROMPT,
  splitAnswerAndInsight as splitBusiness
} from "@/lib/ai/businessQuestPrompt";
import {
  MANAGEMENT_QUEST_SYSTEM_PROMPT,
  splitAnswerAndInsight as splitManagement
} from "@/lib/ai/managementQuestPrompt";
import {
  FORCES_QUEST_SYSTEM_PROMPT,
  splitAnswerAndInsight as splitForces
} from "@/lib/ai/forcesQuestPrompt";
import { resolveActivePrompts } from "@/lib/ai/resolveActivePrompts";
import type { PillarQuestGenerationContext } from "@/lib/ai/generatePillarQuestAnswers";
import type { QuestCardSpec } from "@/lib/sec/questCardSpec";
import {
  FINANCIAL_REQUIRED_10K_SECTION_KEYS
} from "@/lib/sec/financialQuestSectionMap";
import {
  FORCES_REQUIRED_10K_SECTION_KEYS,
  type ForcesTopicSpec
} from "@/lib/sec/forcesTopicSectionMap";

export async function buildPillarGenerationContext(params: {
  pillarId: PillarId;
  ticker: string;
  companyId: CompanyId;
  questSlug?: string;
  specs: QuestCardSpec[];
}): Promise<PillarQuestGenerationContext> {
  const prompts = await resolveActivePrompts(
    params.pillarId,
    params.questSlug
  );

  const base = {
    pillarId: params.pillarId,
    ticker: params.ticker,
    companyId: params.companyId,
    questSlug: params.questSlug,
    specs: params.specs,
    systemPrompt: prompts.systemPrompt,
    userTemplate: prompts.userTemplate,
    model: prompts.model,
    temperature: prompts.temperature,
    promptSource: prompts.source
  };

  const buildFromTemplate = async (p: Parameters<
    PillarQuestGenerationContext["buildUserPrompt"]
  >[0]) => {
    const spec = params.specs.find(
      (s) => s.questSlug === p.questSlug && s.cardId === p.cardId
    );
    if (!spec) {
      throw new Error(`Card spec missing for ${p.questSlug}/${p.cardId}`);
    }

    return buildCardUserPromptFromTemplate({
      pillarId: params.pillarId,
      userTemplate: prompts.userTemplate,
      companyName: p.companyName,
      ticker: p.ticker,
      questSlug: p.questSlug,
      questTitle: p.questTitle,
      questAiTask: p.questAiTask,
      cardQuestion: p.cardQuestion,
      cardId: p.cardId,
      cardPromptFocus: p.cardPromptFocus,
      sectionIds: p.sectionIds,
      priorCardsInQuest: p.priorCardsInQuest,
      forcesSpec:
        params.pillarId === "forces"
          ? (spec as ForcesTopicSpec)
          : undefined
    });
  };

  switch (params.pillarId) {
    case "financials":
      return {
        ...base,
        requiredReadiness: {
          formType: "10-K",
          requiredSectionKeys: FINANCIAL_REQUIRED_10K_SECTION_KEYS
        },
        readinessFromSpecs: false,
        systemPrompt: prompts.systemPrompt || FINANCIAL_QUEST_SYSTEM_PROMPT,
        buildUserPrompt: buildFromTemplate,
        splitAnswerAndInsight: splitFinancial,
        missingExtractMessage: (ticker, missing) =>
          `Missing 10-K sections (${missing.join(", ")}). Run extract for ${ticker} first.`
      };
    case "business":
      return {
        ...base,
        requiredReadiness: {
          formType: "10-K",
          requiredSectionKeys: ["item_1"]
        },
        readinessFromSpecs: false,
        systemPrompt: prompts.systemPrompt || BUSINESS_QUEST_SYSTEM_PROMPT,
        buildUserPrompt: buildFromTemplate,
        splitAnswerAndInsight: splitBusiness,
        missingExtractMessage: (ticker, missing) =>
          `Missing 10-K Item 1 (${missing.join(", ")}). Run extract for ${ticker} first.`
      };
    case "management":
      return {
        ...base,
        readinessFromSpecs: true,
        systemPrompt: prompts.systemPrompt || MANAGEMENT_QUEST_SYSTEM_PROMPT,
        buildUserPrompt: buildFromTemplate,
        splitAnswerAndInsight: splitManagement,
        missingExtractMessage: (ticker, missing) =>
          `Missing filing sections (${missing.join(", ")}). Run extract for ${ticker} (10-K + DEF 14A).`
      };
    case "forces": {
      const forceSpecs = params.specs as ForcesTopicSpec[];
      return {
        ...base,
        requiredReadiness: {
          formType: "10-K",
          requiredSectionKeys: FORCES_REQUIRED_10K_SECTION_KEYS
        },
        readinessFromSpecs: false,
        systemPrompt: prompts.systemPrompt || FORCES_QUEST_SYSTEM_PROMPT,
        buildUserPrompt: async (p) => {
          const spec = forceSpecs.find((s) => s.questSlug === p.questSlug);
          if (!spec) {
            throw new Error(`Forces spec missing for ${p.questSlug}`);
          }
          return buildCardUserPromptFromTemplate({
            pillarId: "forces",
            userTemplate: prompts.userTemplate,
            companyName: p.companyName,
            ticker: p.ticker,
            questSlug: p.questSlug,
            questTitle: p.questTitle,
            questAiTask: p.questAiTask,
            cardQuestion: p.cardQuestion,
            cardId: p.cardId,
            cardPromptFocus: p.cardPromptFocus,
            sectionIds: p.sectionIds,
            priorCardsInQuest: p.priorCardsInQuest,
            forcesSpec: spec
          });
        },
        splitAnswerAndInsight: splitForces,
        missingExtractMessage: (ticker, missing) =>
          `Missing Item 1A (${missing.join(", ")}). Run extract for ${ticker} first.`
      };
    }
    default:
      throw new Error(`Unsupported pillar: ${params.pillarId}`);
  }
}
