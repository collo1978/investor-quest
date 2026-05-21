import { buildAiPromptFromSectionIds } from "@/lib/sec/aiPromptBuilder";
import {
  CUSTOMER_PROBLEM_CARD_PROMPT,
  CUSTOMER_PROBLEM_STYLE_REFERENCE,
  isCustomerProblemCard
} from "@/lib/quests/customerProblemCard";
import {
  QUEST_ANSWER_FORMAT,
  QUEST_BEGINNER_VOICE,
  splitQuestAnswer
} from "@/lib/quests/questAnswerFormat";

export type PriorQuestCardSummary = {
  cardId: string;
  investorQuestion: string;
  summary: string;
};

export const BUSINESS_QUEST_SYSTEM_PROMPT = `You are a friendly guide in a gamified investing adventure — helping someone understand what a company actually does in one quick beat.

Your reader has never read a 10-K Item 1 (Business). They want instant clarity, not a tour of the filing.

${QUEST_BEGINNER_VOICE}

FACTS
- Use ONLY facts from the SEC excerpts provided.
- If the excerpt does not include a detail, say the annual report does not spell that out clearly — do not invent competitors, regions, or products.
- Dollar amounts in Item 1 are rare; if none appear, describe the business qualitatively in one short line.

${QUEST_ANSWER_FORMAT}

CARD FOCUS
- Answer ONLY the card question. Do not drift into the next card's topic.
- Snapshot card 1 (first card): lightest possible — one everyday product moment, one analogy, one line on what they help power in real life (chips/apps/games/phones — never GPU/platform/infrastructure language). No tech stack, no customer list, no industry tour.
- Snapshot card 2 (customer problem): pain WITHOUT them → consequence → analogy → benefit WITH them. Never industries/solutions/innovation/corporate summary. See CUSTOMER PROBLEM CARD rules in the user prompt when applicable.
- Snapshot card 3: one line on how well-known/big they feel, one analogy optional, one filing fact on position/scale — still max 4 sentences.
- Revenue cards: one everyday "where money shows up" moment, one analogy, one revenue fact for THIS card only (product line OR region OR customer type — not all three).

VISUAL CARDS
- If the card is about product mix or geography, keep the story ultra-short — a chart may appear below your text.`;

export async function buildBusinessCardUserPrompt(params: {
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
          "Earlier cards on this quest (do NOT repeat these facts or openings):",
          ...params.priorCardsInQuest.map(
            (p) =>
              `- ${p.cardId} (${p.investorQuestion}): ${p.summary}`
          ),
          ""
        ].join("\n")
      : "";

  const customerProblem = isCustomerProblemCard({
    questSlug: params.questSlug,
    cardId: params.cardId,
    cardQuestion: params.cardQuestion
  });

  const structureHint = customerProblem
    ? "Write the answer: max 4 short sentences (everyday pain WITHOUT them → consequence → analogy → benefit WITH them); then one-line Why investors care."
    : "Write the answer: max 4 short sentences (everyday moment → analogy → what they do for THIS card); then one-line Why investors care.";

  const customerProblemBlocks = customerProblem
    ? ["", CUSTOMER_PROBLEM_CARD_PROMPT, "", CUSTOMER_PROBLEM_STYLE_REFERENCE, ""]
    : [];

  return [
    `Company: ${params.companyName} (${params.ticker})`,
    `Quest: ${params.questTitle}`,
    `Quest goal: ${params.questAiTask}`,
    `This card: ${params.cardId}`,
    `Card question: ${params.cardQuestion}`,
    `Focus ONLY on: ${params.cardPromptFocus}`,
    priorBlock,
    "SEC filing excerpts (10-K — Business / related sections):",
    excerptBlocks,
    ...customerProblemBlocks,
    structureHint
  ].join("\n");
}

export function splitAnswerAndInsight(raw: string): {
  plainEnglishAnswer: string;
  investorInsight: string | null;
} {
  return splitQuestAnswer(raw);
}
