import type { CompanyId } from "@/data/companies";
import { companyById } from "@/data/companies";
import { findQuestDefinition } from "@/data/quests/library";
import type { PillarId } from "@/data/pillars";
import {
  analyzePromptAnswerQuality,
  type PromptQualityAnalysis
} from "@/lib/ai/promptQualityAnalysis";
import { extractVisualNarration } from "@/lib/quests/sanitizeQuestAnswer";
import {
  previewQuestCardGeneration,
  type PreviewQuestCardResult
} from "@/lib/ai/previewQuestCardGeneration";
import type { PromptDraftOverrides } from "@/lib/ai/resolveActivePrompts";
import { getCardSpecsForPillar } from "@/lib/admin/pillarGeneration";
import { fetchQuestCardAnswersForSlug } from "@/lib/supabase/questCardAnswers/storage";
import {
  getPromptVersionBody,
  savePromptPreviewEvaluation
} from "@/lib/supabase/promptTemplates/evaluations";

export type EvaluatedPreviewResult = PreviewQuestCardResult & {
  quality: PromptQualityAnalysis;
  evaluationId: string | null;
  priorCardCount: number;
};

export type RunEvaluatedPreviewInput = {
  pillarId: PillarId;
  ticker: string;
  companyId: CompanyId;
  questSlug: string;
  cardId: string;
  draft?: PromptDraftOverrides;
  templateId?: string;
  versionId?: string | null;
  compareLabel?: string;
  saveEvaluation?: boolean;
};

async function loadPriorSummaries(
  ticker: string,
  pillarId: PillarId,
  questSlug: string,
  cardId: string,
  companyId: CompanyId
): Promise<string[]> {
  const quest = findQuestDefinition(companyId, pillarId, questSlug);
  const specs = getCardSpecsForPillar(pillarId, questSlug);
  const cardOrder = specs
    .filter((s) => s.questSlug === questSlug)
    .map((s) => s.cardId);
  const idx = cardOrder.indexOf(cardId);
  const priorIds = idx > 0 ? cardOrder.slice(0, idx) : [];

  if (priorIds.length === 0) return [];

  const answers = await fetchQuestCardAnswersForSlug({
    ticker,
    pillarId,
    questSlug
  });

  return priorIds
    .map((id) => answers[id]?.plainEnglishAnswer)
    .filter((t): t is string => Boolean(t?.trim()))
    .map(
      (t) =>
        extractVisualNarration(t) ?? t.slice(0, 220).trim()
    );
}

export async function runEvaluatedPreview(
  input: RunEvaluatedPreviewInput
): Promise<EvaluatedPreviewResult> {
  let draft = input.draft;

  if (input.versionId && input.templateId) {
    const version = await getPromptVersionBody(input.versionId);
    if (version.scope === "system") {
      draft = { ...draft, systemPrompt: version.body };
    } else {
      draft = {
        ...draft,
        userTemplate: version.body,
        model: version.model,
        temperature: version.temperature
      };
    }
  }

  const preview = await previewQuestCardGeneration({
    pillarId: input.pillarId,
    ticker: input.ticker,
    companyId: input.companyId,
    questSlug: input.questSlug,
    cardId: input.cardId,
    draft
  });

  const priorCardSummaries = await loadPriorSummaries(
    input.ticker,
    input.pillarId,
    input.questSlug,
    input.cardId,
    input.companyId
  );

  const quality = analyzePromptAnswerQuality(preview.plainEnglishAnswer, {
    priorCardSummaries
  });

  let evaluationId: string | null = null;
  if (input.saveEvaluation && input.templateId) {
    evaluationId = await savePromptPreviewEvaluation({
      templateId: input.templateId,
      versionId: input.versionId ?? null,
      pillarId: input.pillarId,
      ticker: input.ticker,
      questSlug: input.questSlug,
      cardId: input.cardId,
      plainEnglishAnswer: preview.plainEnglishAnswer,
      investorInsight: preview.investorInsight,
      quality,
      compareLabel: input.compareLabel
    });
  }

  return {
    ...preview,
    quality,
    evaluationId,
    priorCardCount: priorCardSummaries.length
  };
}
