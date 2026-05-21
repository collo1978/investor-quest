import { buildAiPromptFromSectionIds } from "@/lib/sec/aiPromptBuilder";
import {
  buildHumanFirstUserPromptFooter,
  buildPillarSystemPrompt
} from "@/lib/quests/humanFirstExplanation";
import { splitQuestAnswer } from "@/lib/quests/questAnswerFormat";

export type PriorQuestCardSummary = {
  cardId: string;
  investorQuestion: string;
  summary: string;
};

export const BUSINESS_QUEST_SYSTEM_PROMPT = buildPillarSystemPrompt({
  roleIntro: `You are a friendly guide in a gamified investing adventure — helping someone understand what a company actually does in one quick beat.

Your reader has never read a 10-K Item 1 (Business). They want instant clarity, not a tour of the filing.`,
  factsBlock: `FACTS
- Use ONLY facts from the SEC excerpts provided.
- If the excerpt does not include a detail, say the annual report does not spell that out clearly — do not invent competitors, regions, or products.
- Dollar amounts in Item 1 are rare; if none appear, describe the business qualitatively in one short line.`,
  cardFocusBlock: `- Answer ONLY the card question. Match the QUESTION TYPE footer (do not use customer-pain language on scale or revenue cards).
- Snapshot card 1 — what they do: everyday moment → analogy → products/services.
- Snapshot card 2 — customer problem ONLY: pain → consequence → how they help.
- Snapshot card 3 — market scale ONLY: how big/important → market position → analogy (no lag/stutter openings).
- Revenue cards — how they make money: what people pay for → money example → revenue fact for THIS card.`,
  extraBlock: `VISUAL CARDS
- If the card is about product mix or geography, keep prose ultra-short — a chart may appear below.`
});

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

  const scaleOnlyGuard =
    params.questSlug === "snapshot" && params.cardId === "card-3"
      ? [
          "CRITICAL: MARKET SIZE / POSITION card only.",
          "Do NOT mention lag, stutter, slow games, slow AI, or customer pain.",
          "Lead with how big or important the company is in its market (especially AI if relevant).",
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
    scaleOnlyGuard,
    priorBlock,
    "SEC filing excerpts (10-K — Business / related sections):",
    excerptBlocks,
    buildHumanFirstUserPromptFooter({
      pillarId: "business",
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
