import type { CompanyId } from "@/data/companies";
import { companyById } from "@/data/companies";
import { findQuestDefinition } from "@/data/quests/library";
import type { PillarId } from "@/data/pillars";
import { buildCardUserPromptFromTemplate } from "@/lib/ai/buildCardUserPromptFromTemplate";
import { createChatCompletion } from "@/lib/ai/openaiClient";
import { finalizeQuestAnswer } from "@/lib/ai/questAnswerQualityPipeline";
import {
  applyPromptDraftOverrides,
  resolveActivePrompts,
  type PromptDraftOverrides
} from "@/lib/ai/resolveActivePrompts";
import { getCardSpecsForPillar } from "@/lib/admin/pillarGeneration";
import type { ForcesTopicSpec } from "@/lib/sec/forcesTopicSectionMap";
import { resolveSectionIdsForQuestCard } from "@/lib/sec/resolveQuestSectionIds";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { buildPillarGenerationContext } from "./pillarGenerationContext";

export type PreviewQuestCardInput = {
  pillarId: PillarId;
  ticker: string;
  companyId: CompanyId;
  questSlug: string;
  cardId: string;
  draft?: PromptDraftOverrides;
};

export type PreviewQuestCardResult = {
  ticker: string;
  pillarId: PillarId;
  questSlug: string;
  cardId: string;
  systemPrompt: string;
  userPrompt: string;
  model: string;
  temperature: number;
  promptSource: string;
  rawAnswer: string;
  plainEnglishAnswer: string;
  investorInsight: string | null;
};

export async function previewQuestCardGeneration(
  input: PreviewQuestCardInput
): Promise<PreviewQuestCardResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const ticker = input.ticker.trim().toUpperCase();
  const company = companyById(input.companyId);
  const specs = getCardSpecsForPillar(input.pillarId, input.questSlug);
  const spec = specs.find(
    (s) => s.questSlug === input.questSlug && s.cardId === input.cardId
  );

  if (!spec) {
    throw new Error(`Card spec not found: ${input.questSlug}/${input.cardId}`);
  }

  const quest = findQuestDefinition(
    input.companyId,
    input.pillarId,
    input.questSlug
  );
  if (!quest) {
    throw new Error("Quest template not found.");
  }

  let card = quest.cards?.find((c) => c.id === spec.cardId);
  if (!card && spec.cardId === "main") {
    card = {
      id: "main",
      investorQuestion: quest.investorQuestion,
      plainEnglishAnswer: null,
      whyItMatters: quest.whyItMatters
    };
  }
  if (!card) {
    throw new Error("Card not found on quest.");
  }

  const resolved = await resolveSectionIdsForQuestCard(ticker, spec);
  if (!resolved) {
    throw new Error(
      `Missing filing sections: ${spec.sectionKeys.join(", ")}. Run extract first.`
    );
  }

  const prompts = applyPromptDraftOverrides(
    await resolveActivePrompts(input.pillarId, input.questSlug),
    input.draft
  );

  const ctx = await buildPillarGenerationContext({
    pillarId: input.pillarId,
    ticker,
    companyId: input.companyId,
    questSlug: input.questSlug,
    specs: [spec]
  });

  const forcesSpec =
    input.pillarId === "forces"
      ? (spec as ForcesTopicSpec)
      : undefined;

  const userPrompt = await buildCardUserPromptFromTemplate({
    pillarId: input.pillarId,
    userTemplate: prompts.userTemplate,
    companyName: company.name,
    ticker: company.ticker,
    questSlug: spec.questSlug,
    questTitle: quest.title,
    questAiTask: quest.aiTask,
    cardQuestion: card.investorQuestion,
    cardId: spec.cardId,
    cardPromptFocus: spec.promptFocus,
    sectionIds: resolved.sectionIds,
    priorCardsInQuest: [],
    forcesSpec
  });

  const raw = await createChatCompletion({
    system: prompts.systemPrompt,
    user: userPrompt,
    model: prompts.model,
    temperature: prompts.temperature
  });

  const finalized = await finalizeQuestAnswer({
    companyName: company.name,
    cardQuestion: card.investorQuestion,
    rawAnswer: raw,
    splitAnswerAndInsight: ctx.splitAnswerAndInsight,
    model: prompts.model,
    temperature: prompts.temperature
  });

  if (!finalized.ok) {
    throw new Error(finalized.reason);
  }

  const { plainEnglishAnswer, investorInsight } = finalized;

  return {
    ticker,
    pillarId: input.pillarId,
    questSlug: input.questSlug,
    cardId: input.cardId,
    systemPrompt: prompts.systemPrompt,
    userPrompt,
    model: prompts.model,
    temperature: prompts.temperature,
    promptSource: prompts.source,
    rawAnswer: raw,
    plainEnglishAnswer,
    investorInsight
  };
}
