import { buildAiPromptFromSectionIds } from "@/lib/sec/aiPromptBuilder";
import type { PriorQuestCardSummary } from "@/lib/ai/generatePillarQuestAnswers";
import {
  buildHumanFirstUserPromptFooter,
  buildPillarSystemPrompt
} from "@/lib/quests/humanFirstExplanation";
import { splitQuestAnswer } from "@/lib/quests/questAnswerFormat";

export const MANAGEMENT_QUEST_SYSTEM_PROMPT = buildPillarSystemPrompt({
  roleIntro: `You are a friendly guide helping a beginner judge whether they trust a company's management with their money.

Your reader has never read a proxy (DEF 14A) or a 10-K. They care about alignment: do leaders win when shareholders win?`,
  factsBlock: `FACTS
- Use ONLY facts from the SEC excerpts (proxy or 10-K).
- For pay, do not invent dollar amounts not in the excerpt.
- If the filing is silent, say so plainly.`,
  cardFocusBlock: `- Answer ONLY this card. Do not repeat earlier cards.
- Sentence 1: why a normal investor should care (trust, pay, control) in one human beat.
- Sentence 2: one analogy for alignment or oversight.
- Sentence 3: one filing fact for THIS card only.
- Compensation cards: incentives and alignment, not biography.
- Governance cards: independence and oversight, not product strategy.
- Capital allocation cards: cash deployment and returns to owners.`
});

export async function buildManagementCardUserPrompt(params: {
  companyName: string;
  ticker: string;
  questSlug: string;
  questTitle: string;
  questAiTask: string;
  cardQuestion: string;
  cardId: string;
  cardPromptFocus: string;
  sectionIds: string[];
  priorCardsInQuest?: PriorQuestCardSummary[];
}): Promise<string> {
  const payload = await buildAiPromptFromSectionIds(params.sectionIds);

  const excerptBlocks = payload.sections
    .map(
      (s) =>
        `${s.sectionLabel} (${s.sectionKey})\n${s.excerpt}${
          s.truncated ? "\n[section truncated in source]" : ""
        }`
    )
    .join("\n\n");

  const priorBlock =
    params.priorCardsInQuest && params.priorCardsInQuest.length > 0
      ? [
          "Earlier cards on this quest (do NOT repeat):",
          ...params.priorCardsInQuest.map(
            (p) =>
              `- ${p.cardId} (${p.investorQuestion}): ${p.summary}`
          ),
          ""
        ].join("\n")
      : "";

  return [
    `Company: ${params.companyName} (${params.ticker})`,
    `Quest: ${params.questTitle}`,
    `Quest goal: ${params.questAiTask}`,
    `This card: ${params.cardId}`,
    `Card question: ${params.cardQuestion}`,
    `Focus ONLY on: ${params.cardPromptFocus}`,
    priorBlock,
    "SEC filing excerpts:",
    excerptBlocks,
    buildHumanFirstUserPromptFooter({
      pillarId: "management",
      questSlug: params.questSlug,
      cardId: params.cardId,
      cardQuestion: params.cardQuestion,
      promptFocus: params.cardPromptFocus
    })
  ].join("\n");
}

export function splitAnswerAndInsight(raw: string): {
  plainEnglishAnswer: string;
  investorInsight: string | null;
} {
  return splitQuestAnswer(raw);
}
