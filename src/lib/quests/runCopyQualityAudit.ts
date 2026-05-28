/**
 * Full-game copy quality audit for admin Copy Quality page.
 */

import { companyByTicker } from "@/data/companies";
import { PILLAR_ORDER, type PillarId } from "@/data/pillars";
import { getCompanyPillarQuests } from "@/data/quests/library";
import { getInvestorMasteryContent } from "@/lib/quests/investorMasteryCopy";
import { resolveQuestCardDisplayContent } from "@/lib/quests/questCardContentSource";
import {
  suggestCleanedQuestCopy,
  validateQuestCopy,
  type QuestCopyValidationContext
} from "@/lib/quests/questAnswerValidator";
import { formatPlayerCopy } from "@/lib/quests/questAnswerFormatter";
import { PLAYABLE_DEMO_TICKERS } from "@/lib/demo/playableDemo";
import { FORCES_TOPIC_CARD_ID } from "@/lib/sec/forcesTopicSectionMap";
import { fetchQuestCardAnswersForSlug } from "@/lib/supabase/questCardAnswers/storage";

export type CopyQualityCardRow = {
  id: string;
  ticker: string;
  companyName: string;
  pillarId: PillarId;
  questSlug: string;
  questTitle: string;
  cardId: string;
  question: string;
  currentAnswer: string;
  source: string;
  pass: boolean;
  score: number;
  issues: string[];
  suggestedAnswer: string;
  placeholder: boolean;
};

export type CopyQualityAuditReport = {
  generatedAt: string;
  totalCards: number;
  failedCards: number;
  averageScore: number;
  rows: CopyQualityCardRow[];
};

export async function runCopyQualityAudit(
  tickers: readonly string[] = PLAYABLE_DEMO_TICKERS
): Promise<CopyQualityAuditReport> {
  const rows: CopyQualityCardRow[] = [];

  for (const ticker of tickers) {
    const company = companyByTicker(ticker);
    if (!company) continue;

    for (const pillarId of PILLAR_ORDER) {
      const quests = getCompanyPillarQuests(company.id, pillarId);

      for (const quest of quests) {
        const generated = await fetchQuestCardAnswersForSlug({
          ticker,
          pillarId,
          questSlug: quest.slug
        });

        const cardEntries =
          quest.cards?.length && quest.cards.length > 0
            ? quest.cards.map((c) => ({
                id: c.id,
                question: c.investorQuestion,
                template: c
              }))
            : [
                {
                  id: pillarId === "forces" ? FORCES_TOPIC_CARD_ID : "card-1",
                  question: quest.investorQuestion,
                  template: null
                }
              ];

        for (const card of cardEntries) {
          const resolved = resolveQuestCardDisplayContent({
            companyId: company.id,
            pillarId,
            questSlug: quest.slug,
            cardId: card.id,
            instantiatedCard: card.template ?? quest,
            generatedCard: generated[card.id] ?? null
          });

          const placeholder =
            resolved.source === "template_fallback" ||
            resolved.source === "generating";
          const currentAnswer = resolved.plainEnglishAnswer ?? "";

          const ctx: QuestCopyValidationContext = {
            pillarId,
            questSlug: quest.slug,
            cardId: card.id,
            cardQuestion: card.question ?? quest.investorQuestion,
            kind: "quest_card",
            placeholder: placeholder || !currentAnswer.trim()
          };

          const validation = validateQuestCopy(currentAnswer, ctx);
          const suggestedAnswer = placeholder
            ? ""
            : suggestCleanedQuestCopy(currentAnswer, ctx);

          rows.push({
            id: `${ticker}:${pillarId}:${quest.slug}:${card.id}`,
            ticker,
            companyName: company.name,
            pillarId,
            questSlug: quest.slug,
            questTitle: quest.title,
            cardId: card.id,
            question: card.question ?? quest.investorQuestion ?? "",
            currentAnswer,
            source: resolved.sourceLabel,
            pass: validation.pass,
            score: validation.score,
            issues: validation.issues.map((i) => i.message),
            suggestedAnswer,
            placeholder
          });
        }

        if (quest.quizConfig?.questions) {
          for (const q of quest.quizConfig.questions) {
            const explain =
              "explain" in q ? (q.explain as string | undefined) : undefined;
            if (!explain?.trim()) continue;
            const text = explain.trim();
            const validation = validateQuestCopy(text, {
              pillarId,
              questSlug: quest.slug,
              kind: "quiz_explain"
            });
            rows.push({
              id: `${ticker}:${pillarId}:${quest.slug}:quiz:${q.id}`,
              ticker,
              companyName: company.name,
              pillarId,
              questSlug: quest.slug,
              questTitle: `${quest.title} (quiz)`,
              cardId: String((q as { id?: string }).id ?? "quiz"),
              question:
                "prompt" in q && typeof q.prompt === "string"
                  ? q.prompt
                  : String((q as { id?: string }).id ?? "quiz"),
              currentAnswer: text,
              source: "Quiz explain",
              pass: validation.pass,
              score: validation.score,
              issues: validation.issues.map((i) => i.message),
              suggestedAnswer: suggestCleanedQuestCopy(text, {
                kind: "quiz_explain"
              }),
              placeholder: false
            });
          }
        }

        const mastery = getInvestorMasteryContent({
          companyName: company.name,
          pillarId,
          questSlug: quest.slug,
          questTitle: quest.title
        });
        const masteryParts = [
          { id: "message", label: "Mastery message", text: mastery.message },
          ...mastery.learned.map((text, i) => ({
            id: `learned-${i + 1}`,
            label: `Mastery bullet ${i + 1}`,
            text
          }))
        ];
        for (const part of masteryParts) {
          if (!part.text.trim()) continue;
          const validation = validateQuestCopy(part.text, {
            kind: "ui_copy",
            pillarId,
            questSlug: quest.slug
          });
          rows.push({
            id: `${ticker}:${pillarId}:${quest.slug}:mastery:${part.id}`,
            ticker,
            companyName: company.name,
            pillarId,
            questSlug: quest.slug,
            questTitle: `${quest.title} (mastery)`,
            cardId: part.id,
            question: part.label,
            currentAnswer: part.text,
            source: "Mastery UI",
            pass: validation.pass,
            score: validation.score,
            issues: validation.issues.map((i) => i.message),
            suggestedAnswer: formatPlayerCopy(part.text),
            placeholder: false
          });
        }
      }
    }
  }

  const scorable = rows.filter((r) => !r.placeholder && r.currentAnswer.trim());
  const failedCards = scorable.filter((r) => !r.pass).length;
  const averageScore =
    scorable.length === 0
      ? 100
      : Math.round(
          scorable.reduce((a, r) => a + r.score, 0) / scorable.length
        );

  return {
    generatedAt: new Date().toISOString(),
    totalCards: rows.length,
    failedCards,
    averageScore,
    rows: rows.sort((a, b) => a.score - b.score)
  };
}
