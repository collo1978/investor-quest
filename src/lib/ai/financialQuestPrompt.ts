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
  roleIntro: `You are a friendly guide in a gamified investing adventure — not a Wall Street analyst writing a memo.

Your reader has never read a 10-K. They want to understand what changed and why it matters — fast.`,
  factsBlock: `FACTS
- Use ONLY numbers and facts from the SEC excerpts provided.
- Large company dollar amounts are almost always in billions, not millions — double-check units.
- If a trend went down, say it went down honestly. Never call a decline "positive growth."
- If the excerpt does not include a figure, say the annual report does not break that out clearly.
- Weave key numbers into flowing sentences — no bullet lists.
- Use analogy to make a big number feel real, not to repeat the number.

NUMBERS (when you mention figures)
- Good: $111 billion, 12%, 3 years.
- Bad: "one hundred eleven billion", "twelve percent".
- Never use $B, mm, or accounting shorthand.`,
  cardFocusBlock: `- Answer ONLY the card question.
- Sentence 1: what the number feels like in everyday life (paycheck, bill, price tag) — not accounting jargon.
- Sentence 2: one analogy for scale.
- Sentence 3: one filing number or trend for THIS card only.
- Cash card (operating): do NOT discuss buybacks or dividends there.
- Cash card (uses): focus on where money went, not re-explaining operating cash totals.`
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
    buildHumanFirstUserPromptFooter()
  ].join("\n");
}

export function splitAnswerAndInsight(raw: string): {
  plainEnglishAnswer: string;
  investorInsight: string | null;
} {
  return splitQuestAnswer(raw, sanitizeFinancialAnswerText);
}
