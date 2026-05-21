import { buildAiPromptFromSectionIds } from "@/lib/sec/aiPromptBuilder";
import { extractRelevantRiskExcerpts } from "@/lib/sec/forcesRiskRetrieval";
import type { ForcesTopicSpec } from "@/lib/sec/forcesTopicSectionMap";
import {
  buildHumanFirstUserPromptFooter,
  buildPillarSystemPrompt
} from "@/lib/quests/humanFirstExplanation";
import { splitQuestAnswer } from "@/lib/quests/questAnswerFormat";

export const FORCES_QUEST_SYSTEM_PROMPT = buildPillarSystemPrompt({
  roleIntro: `You are a friendly guide explaining ONE force (risk or tailwind) from a company's annual risk factors (Item 1A).

Your reader is learning inside vs outside the company's control, and positive vs negative forces.`,
  factsBlock: `FACTS
- Use ONLY what THIS company's filing excerpt supports.
- Never paste generic textbook definitions.
- If the excerpt does not mention this topic clearly, say the annual report does not emphasize it — do not invent facts.

FRAMING (weave into sentences — no extra headings)
- Positive inside = strength the company controls.
- Negative inside = operational/internal risk.
- Positive outside = external tailwind.
- Negative outside = external headwind.
- Stay on the assigned force only.`,
  cardFocusBlock: `- Sentence 1: how this force might show up in everyday life (price, delay, safety, hype).
- Sentence 2: REQUIRED — one analogy starting with "Think of it like…" or "It's like…".
- Sentence 3: one filing fact about this force only (plain words, no jargon).`
});

export async function buildForcesTopicUserPrompt(
  spec: ForcesTopicSpec,
  params: {
    companyName: string;
    ticker: string;
    questTitle: string;
    questAiTask: string;
    cardQuestion: string;
    sectionIds: string[];
  }
): Promise<string> {
  const payload = await buildAiPromptFromSectionIds(params.sectionIds);
  const section = payload.sections[0];
  const fullText = section?.excerpt ?? "";
  const { excerpt, matched } = extractRelevantRiskExcerpts(
    fullText,
    spec.retrievalKeywords
  );

  const valenceLabel = spec.valence === "positive" ? "Positive" : "Negative";
  const scopeLabel = spec.scope === "inside" ? "Inside" : "Outside";

  return [
    `Company: ${params.companyName} (${params.ticker})`,
    `Force topic: ${spec.topicTitle}`,
    `Category: ${valenceLabel} ${scopeLabel} force`,
    `Quest: ${params.questTitle}`,
    `Question: ${params.cardQuestion}`,
    `Focus: ${spec.promptFocus}`,
    `Keyword match in Item 1A: ${matched ? "yes" : "weak — use best-available paragraphs only"}`,
    "",
    "Item 1A — Risk Factors (filtered excerpt):",
    excerpt || "[no excerpt available]",
    buildHumanFirstUserPromptFooter({
      pillarId: "forces",
      questSlug: spec.questSlug,
      cardId: "main",
      cardQuestion: params.cardQuestion,
      promptFocus: spec.promptFocus
    })
  ].join("\n");
}

export function splitAnswerAndInsight(raw: string): {
  plainEnglishAnswer: string;
  investorInsight: string | null;
} {
  return splitQuestAnswer(raw);
}
