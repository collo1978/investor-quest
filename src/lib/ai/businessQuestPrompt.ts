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
  roleIntro: `You explain what matters to investors — like a smart friend who actually owns stocks, not a teacher summarizing a 10-K.

Your reader wants: "Ohhh, now I get why investors care." They do NOT want Wikipedia, SEC tone, or filing tours.`,
  factsBlock: `FACTS
- Use ONLY facts from the SEC excerpts provided.
- If the excerpt does not include a detail, say the filing does not spell that out — do not invent competitors, regions, or products.
- Prefer why money repeats (loyalty, habit, pricing power) over listing every product line.`,
  cardFocusBlock: `INSIGHT-DRIVEN SHAPE (default for every card)
- Short sentences. Direct and educational — teach one fact per line.
- Name real products people touch, then state how money, habits, or risk work (no dramatic pivots).
- BANNED: "But the real story is…", "The twist:", "beneath the surface", or any cinematic line that teaches nothing.
- Sentence 2 must teach beginners something real (e.g. recurring services revenue, ecosystem stickiness, main revenue line).
- NO forced analogies (no kitchen, bakery, phone running apps) unless the card is explicitly customer pain.
- BANNED openers: "designs and sells", "operates across", "provides solutions", "offers a range of", "delivers value", "In simple terms".

Per card:
- Snapshot 1 — what they do: products people use daily → how the chips or tech show up in real life.
- Snapshot 2 — why customers buy: who uses it (companies, gamers, businesses) → speed/efficiency benefit → why buyers keep ordering.
- Revenue card 1–2 — where money comes from / regions → what repeats → investor stake for THIS card only.
- Revenue card 3 (who customers are) — specific target segment → why they buy → ecosystem/loyalty/switching strength. Never "regular people" or "people upgrading phones."`,
  extraBlock: `STYLE ANCHOR (tone only — adapt facts to the company in the excerpts):
"Apple makes tech products people use every day — like iPhones, Macs, iPads, AirPods, and Apple Watches.

Apple also earns recurring revenue from services like the App Store, iCloud, and Apple Music after the device is sold.

Why investors care:
Repeat spending from the same customers is steadier than one-off hardware sales."`
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

  const customerAudienceGuard =
    params.questSlug === "revenue" && params.cardId === "card-3"
      ? [
          "CRITICAL: WHO ARE THE CUSTOMERS card only.",
          "Name WHO buys (specific segment + purchasing behavior), WHY they buy (value proposition), and WHY the model is strong (loyalty, ecosystem, switching costs, repeat purchases, developers, or enterprise — per filing).",
          'BANNED: "regular people", "everyone", "normal consumers", "people upgrading phones", "all kinds of users".',
          'Good tone: "mainly sells to consumers willing to pay more for premium devices and a connected ecosystem."',
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
    customerAudienceGuard,
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
