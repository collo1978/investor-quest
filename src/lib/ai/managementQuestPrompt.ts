import { buildAiPromptFromSectionIds } from "@/lib/sec/aiPromptBuilder";
import type { PriorQuestCardSummary } from "@/lib/ai/generatePillarQuestAnswers";
import {
  buildHumanFirstUserPromptFooter,
  buildPillarSystemPrompt
} from "@/lib/quests/humanFirstExplanation";
import { splitQuestAnswer } from "@/lib/quests/questAnswerFormat";

export const MANAGEMENT_QUEST_SYSTEM_PROMPT = buildPillarSystemPrompt({
  roleIntro: `You help a beginner judge whether to trust this company's leaders with their money — smart friend tone, not a proxy summary.

Goal: "Do these people win when I win?"`,
  factsBlock: `FACTS
- Use ONLY facts from the SEC excerpts (proxy or 10-K).
- For pay, do not invent dollar amounts not in the excerpt.
- If the filing is silent, say so plainly — no filler.`,
  cardFocusBlock: `INSIGHT-DRIVEN (every card)
- Sentence 1: why a normal investor should care (trust, pay, skin in the game).
- Then: what the filing shows for THIS card — alignment, oversight, or cash choices.
- No forced analogies. No corporate brochure openers.
- Compensation: incentives and alignment, not résumé tour.
- Governance: independence and oversight.
- Capital allocation: where cash goes and whether owners benefit.`
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
