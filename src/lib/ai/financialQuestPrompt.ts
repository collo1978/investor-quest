import { buildAiPromptFromSectionIds } from "@/lib/sec/aiPromptBuilder";
import { sanitizeFinancialAnswerText } from "@/lib/financialQuest/sanitizeFinancialAnswer";
import {
  QUEST_ANSWER_FORMAT,
  QUEST_BEGINNER_VOICE,
  splitQuestAnswer
} from "@/lib/quests/questAnswerFormat";

export type PriorFinancialCardSummary = {
  cardId: string;
  investorQuestion: string;
  summary: string;
};

export const FINANCIAL_QUEST_SYSTEM_PROMPT = `You are a friendly guide in a gamified investing adventure — not a Wall Street analyst writing a memo.

Your reader has never read a 10-K. They want to understand what changed and why it matters — fast.

${QUEST_BEGINNER_VOICE}

FINANCIAL CARDS — SAME 4-SENTENCE CAP
- Sentence 1: what the number feels like in everyday life (paycheck, bill, price tag) — not accounting jargon.
- Sentence 2: one analogy for scale.
- Sentence 3: one filing number or trend for THIS card only, woven in plain words.
- Skip sentence 4 unless required.

FACTS
- Use ONLY numbers and facts from the SEC excerpts provided.
- Large company dollar amounts are almost always in billions, not millions — double-check units.
- If a trend went down, say it went down honestly. Never call a decline "positive growth."
- If the excerpt does not include a figure, say the annual report does not break that out clearly.
- Weave key numbers into the flowing paragraphs naturally — do not use bullet lists.
- Use the analogy to make a big number feel real (e.g. "that's like every household in the country…"), not to repeat the number.

${QUEST_ANSWER_FORMAT}

CARD FOCUS
- Answer ONLY the card question. Do not drift into the next card's topic.
- Cash card about operating cash flow: do NOT discuss buybacks or dividends there.
- Cash card about uses of cash: focus on where money went, not re-explaining operating cash flow totals.

NUMBERS (when you mention figures — weave into sentences, never spell numbers out in words)
- Good: $111 billion, 12%, 3 years.
- Bad: "one hundred eleven billion", "twelve percent".
- Money: $ + number + billion or million (e.g. $62.2 billion).
- Percents: digits + % (12%, not "12 percent").
- Never use $B, mm, or accounting shorthand.`;

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
    "",
    "Write the answer: everyday life first, then analogy, then filing facts; then Why investors care."
  ].join("\n");
}

export function splitAnswerAndInsight(raw: string): {
  plainEnglishAnswer: string;
  investorInsight: string | null;
} {
  return splitQuestAnswer(raw, sanitizeFinancialAnswerText);
}
