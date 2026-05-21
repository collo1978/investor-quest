import type { QuestDefinition } from "@/data/quests/types";
import type { StoredQuestCardAnswer } from "@/lib/supabase/questCardAnswers/types";

/**
 * Apply DB-generated quest card answers over the instantiated template.
 * Generated content wins over template nulls and static file overrides.
 */
export function mergeGeneratedQuestContent(
  quest: QuestDefinition,
  generatedCards: Record<string, StoredQuestCardAnswer>
): QuestDefinition {
  if (!quest.cards?.length) {
    const first = Object.values(generatedCards)[0];
    if (!first) return quest;
    const why = first.investorInsight?.trim();
    return {
      ...quest,
      plainEnglishAnswer: first.plainEnglishAnswer,
      investorInsight: why ?? quest.investorInsight,
      whyItMatters: why ?? quest.whyItMatters
    };
  }

  return {
    ...quest,
    cards: quest.cards.map((card) => {
      const gen = generatedCards[card.id];
      if (!gen) return card;
      const why = gen.investorInsight?.trim();
      return {
        ...card,
        plainEnglishAnswer: gen.plainEnglishAnswer,
        investorInsight: why ?? card.investorInsight,
        whyItMatters: why ?? card.whyItMatters
      };
    })
  };
}

/** @deprecated Use mergeGeneratedQuestContent */
export { mergeGeneratedQuestContent as mergeGeneratedFinancialContent };
