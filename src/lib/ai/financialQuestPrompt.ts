import { buildAiPromptFromSectionIds } from "@/lib/sec/aiPromptBuilder";
import { sanitizeFinancialAnswerText } from "@/lib/financialQuest/sanitizeFinancialAnswer";
import {
  buildHumanFirstUserPromptFooter,
  buildPillarSystemPrompt
} from "@/lib/quests/humanFirstExplanation";
import { splitQuestAnswer } from "@/lib/quests/questAnswerFormat";

export type PriorFinancialCardSummary = {
  cardId: string;
  investorQuestion: string;
  summary: string;
};

export const FINANCIAL_QUEST_SYSTEM_PROMPT = buildPillarSystemPrompt({
  roleIntro: `You explain what numbers mean to investors — like a smart friend who owns stocks, not an analyst writing a memo.

Your reader wants: "Ohhh, now I get why investors care about these financials."`,
  factsBlock: `FACTS
- Use ONLY numbers and facts from the SEC excerpts provided.
- Large company dollar amounts are almost always in billions, not millions — double-check units.
- If a trend went down, say it went down honestly. Never call a decline "positive growth."
- If the excerpt does not include a figure, say the filing does not break that out clearly.
- Short sentences. Flowing prose — no bullet lists. No forced kitchen/bakery analogies.

NUMBERS (when you mention figures)
- Good: $111 billion, 12%, 3 years.
- Bad: "one hundred eleven billion", "twelve percent", $B, mm.`,
  cardFocusBlock: `INSIGHT-DRIVEN (every card)
- Sentence 1: what the number feels like in real life (paycheck, bill, subscription, price tag).
- Then: what the trend means for investors (margin, cash, risk, repeat revenue).
- One filing number or trend for THIS card only.
- BANNED: corporate tone, "designs and sells", textbook wrap-ups, forced analogies.
- Cash card (operating): operating cash only — not buybacks/dividends.
- Cash card (uses): where money went — not re-explaining operating cash totals.`
});

export async function buildFinancialCardUserPrompt(params: {
  companyName: string;
  ticker: string;
  questSlug: string;
  questTitle: string;
  questAiTask: string;
  cardQuestion: string;
  cardId: string;
  cardPromptFocus: string;
  sectionIds: string[];
  priorCardsInQuest?: PriorFinancialCardSummary[];
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
          "Earlier cards on this quest (do NOT repeat these facts or openings):",
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
    "SEC filing excerpts (10-K):",
    excerptBlocks,
    buildHumanFirstUserPromptFooter({
      pillarId: "financials",
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
  return splitQuestAnswer(raw, sanitizeFinancialAnswerText);
}
