import type { QuestDefinition } from "@/data/quests/types";
import { resolveQuestCardDisplayContent } from "@/lib/quests/questCardContentSource";
import type { StoredQuestCardAnswer } from "@/lib/supabase/questCardAnswers/types";

/**
 * Apply DB-generated quest card answers over the instantiated template.
 * Curated overrides in `src/data/quests/content/*.ts` always win on screen.
 */
export function mergeGeneratedQuestContent(
  quest: QuestDefinition,
  generatedCards: Record<string, StoredQuestCardAnswer>,
  options?: { pipelineGenerating?: boolean }
): QuestDefinition {
  if (!quest.cards?.length) {
    const firstId = Object.keys(generatedCards)[0];
    const gen = firstId ? generatedCards[firstId] : undefined;
    const resolved = resolveQuestCardDisplayContent({
      companyId: quest.companyId,
      pillarId: quest.pillarId,
      questSlug: quest.slug,
      cardId: firstId ?? "main",
      instantiatedCard: {
        plainEnglishAnswer: quest.plainEnglishAnswer,
        investorInsight: quest.investorInsight,
        whyItMatters: quest.whyItMatters
      },
      generatedCard: gen ?? null,
      pipelineGenerating: options?.pipelineGenerating
    });
    return {
      ...quest,
      plainEnglishAnswer: resolved.plainEnglishAnswer,
      investorInsight: resolved.investorInsight ?? quest.investorInsight,
      whyItMatters: quest.whyItMatters
    };
  }

  return {
    ...quest,
    cards: quest.cards.map((card) => {
      const resolved = resolveQuestCardDisplayContent({
        companyId: quest.companyId,
        pillarId: quest.pillarId,
        questSlug: quest.slug,
        cardId: card.id,
        instantiatedCard: card,
        generatedCard: generatedCards[card.id] ?? null,
        pipelineGenerating: options?.pipelineGenerating
      });
      return {
        ...card,
        plainEnglishAnswer: resolved.plainEnglishAnswer,
        investorInsight: resolved.investorInsight ?? card.investorInsight,
        whyItMatters: card.whyItMatters
      };
    })
  };
}

/** @deprecated Use mergeGeneratedQuestContent */
export { mergeGeneratedQuestContent as mergeGeneratedFinancialContent };
