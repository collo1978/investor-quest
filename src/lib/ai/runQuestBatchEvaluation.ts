import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { getCardSpecsForPillar } from "@/lib/admin/pillarGeneration";
import { fetchQuestCardAnswersForSlug } from "@/lib/supabase/questCardAnswers/storage";
import {
  evaluateQuestCardsInOrder,
  type QuestCardEvaluation,
  type QuestTeachingQualityAnalysis
} from "@/lib/ai/questTeachingQualityAnalysis";
import { analyzePromptAnswerQuality } from "@/lib/ai/promptQualityAnalysis";
import { extractVisualNarration } from "@/lib/quests/sanitizeQuestAnswer";
import {
  previewQuestCardGeneration,
  type PreviewQuestCardResult
} from "@/lib/ai/previewQuestCardGeneration";
import type { PromptDraftOverrides } from "@/lib/ai/resolveActivePrompts";
import { getPromptVersionBody } from "@/lib/supabase/promptTemplates/evaluations";
import { savePromptPreviewEvaluation } from "@/lib/supabase/promptTemplates/evaluations";

export type QuestBatchEvaluationInput = {
  pillarId: PillarId;
  ticker: string;
  companyId: CompanyId;
  questSlug: string;
  draft?: PromptDraftOverrides;
  templateId?: string;
  versionId?: string | null;
  saveEvaluations?: boolean;
  /** Score existing DB answers only — no OpenAI calls. */
  useStoredAnswers?: boolean;
};

export type QuestBatchCardResult = PreviewQuestCardResult & {
  promptFocus: string;
  orderIndex: number;
  quality: QuestCardEvaluation["quality"];
  error?: string;
};

export type QuestBatchEvaluationResult = {
  ticker: string;
  pillarId: PillarId;
  questSlug: string;
  cards: QuestBatchCardResult[];
  quest: QuestTeachingQualityAnalysis;
  generated: number;
  failed: number;
};

export async function evaluateStoredQuestAnswers(
  input: Omit<
    QuestBatchEvaluationInput,
    "draft" | "versionId" | "saveEvaluations"
  >
): Promise<QuestBatchEvaluationResult> {
  const specs = getCardSpecsForPillar(input.pillarId, input.questSlug).filter(
    (s) => s.questSlug === input.questSlug
  );
  if (specs.length === 0) {
    throw new Error(`No cards found for quest: ${input.questSlug}`);
  }

  const answers = await fetchQuestCardAnswersForSlug({
    ticker: input.ticker,
    pillarId: input.pillarId,
    questSlug: input.questSlug
  });

  const rows: Array<{
    cardId: string;
    promptFocus: string;
    plainEnglishAnswer: string;
  }> = [];
  let failed = 0;

  for (const spec of specs) {
    const stored = answers[spec.cardId];
    if (!stored?.plainEnglishAnswer?.trim()) {
      failed++;
      continue;
    }
    rows.push({
      cardId: spec.cardId,
      promptFocus: spec.promptFocus,
      plainEnglishAnswer: stored.plainEnglishAnswer
    });
  }

  if (rows.length === 0) {
    throw new Error(
      "No stored answers for this quest. Run AI regeneration or use Generate quest analysis."
    );
  }

  const { cards: evaluated, quest } = evaluateQuestCardsInOrder(
    input.questSlug,
    rows
  );
  const byCardId = new Map(evaluated.map((c) => [c.cardId, c]));

  const cardResults: QuestBatchCardResult[] = specs.map((spec, i) => {
    const stored = answers[spec.cardId];
    const ev = byCardId.get(spec.cardId);
    if (!ev || !stored?.plainEnglishAnswer?.trim()) {
      return {
        ticker: input.ticker.trim().toUpperCase(),
        pillarId: input.pillarId,
        questSlug: input.questSlug,
        cardId: spec.cardId,
        systemPrompt: "",
        userPrompt: "",
        model: "",
        temperature: 0,
        promptSource: "stored",
        rawAnswer: "",
        plainEnglishAnswer: "",
        investorInsight: null,
        promptFocus: spec.promptFocus,
        orderIndex: i,
        quality: analyzePromptAnswerQuality(""),
        error: "No stored answer for this card."
      };
    }
    return {
      ticker: input.ticker.trim().toUpperCase(),
      pillarId: input.pillarId,
      questSlug: input.questSlug,
      cardId: spec.cardId,
      systemPrompt: "",
      userPrompt: "",
      model: "",
      temperature: 0,
      promptSource: "stored",
      rawAnswer: stored.plainEnglishAnswer,
      plainEnglishAnswer: ev.plainEnglishAnswer,
      investorInsight: stored.investorInsight,
      promptFocus: spec.promptFocus,
      orderIndex: i,
      quality: ev.quality
    };
  });

  return {
    ticker: input.ticker.trim().toUpperCase(),
    pillarId: input.pillarId,
    questSlug: input.questSlug,
    cards: cardResults,
    quest,
    generated: rows.length,
    failed
  };
}

export async function runQuestBatchEvaluation(
  input: QuestBatchEvaluationInput
): Promise<QuestBatchEvaluationResult> {
  if (input.useStoredAnswers) {
    return evaluateStoredQuestAnswers(input);
  }

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

  const specs = getCardSpecsForPillar(input.pillarId, input.questSlug).filter(
    (s) => s.questSlug === input.questSlug
  );

  if (specs.length === 0) {
    throw new Error(`No cards found for quest: ${input.questSlug}`);
  }

  const priorSummaries: string[] = [];
  const generatedRows: Array<{
    cardId: string;
    promptFocus: string;
    plainEnglishAnswer: string;
  }> = [];
  const cardResults: QuestBatchCardResult[] = [];
  let generated = 0;
  let failed = 0;

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    try {
      const preview = await previewQuestCardGeneration({
        pillarId: input.pillarId,
        ticker: input.ticker,
        companyId: input.companyId,
        questSlug: input.questSlug,
        cardId: spec.cardId,
        draft
      });

      const quality = analyzePromptAnswerQuality(preview.plainEnglishAnswer, {
        priorCardSummaries: [...priorSummaries]
      });

      if (input.saveEvaluations && input.templateId) {
        await savePromptPreviewEvaluation({
          templateId: input.templateId,
          versionId: input.versionId ?? null,
          pillarId: input.pillarId,
          ticker: input.ticker,
          questSlug: input.questSlug,
          cardId: spec.cardId,
          plainEnglishAnswer: preview.plainEnglishAnswer,
          investorInsight: preview.investorInsight,
          quality,
          compareLabel: `quest-batch:${input.questSlug}`
        });
      }

      priorSummaries.push(
        extractVisualNarration(preview.plainEnglishAnswer) ??
          preview.plainEnglishAnswer.slice(0, 220).trim()
      );

      generatedRows.push({
        cardId: spec.cardId,
        promptFocus: spec.promptFocus,
        plainEnglishAnswer: preview.plainEnglishAnswer
      });

      cardResults.push({
        ...preview,
        promptFocus: spec.promptFocus,
        orderIndex: i,
        quality
      });
      generated++;
    } catch (err) {
      failed++;
      cardResults.push({
        ticker: input.ticker.trim().toUpperCase(),
        pillarId: input.pillarId,
        questSlug: input.questSlug,
        cardId: spec.cardId,
        systemPrompt: "",
        userPrompt: "",
        model: "",
        temperature: 0,
        promptSource: "",
        rawAnswer: "",
        plainEnglishAnswer: "",
        investorInsight: null,
        promptFocus: spec.promptFocus,
        orderIndex: i,
        quality: analyzePromptAnswerQuality(""),
        error: err instanceof Error ? err.message : "Generation failed"
      });
    }
  }

  const { quest } = evaluateQuestCardsInOrder(input.questSlug, generatedRows);

  return {
    ticker: input.ticker.trim().toUpperCase(),
    pillarId: input.pillarId,
    questSlug: input.questSlug,
    cards: cardResults,
    quest,
    generated,
    failed
  };
}
