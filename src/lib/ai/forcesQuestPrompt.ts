import { buildAiPromptFromSectionIds } from "@/lib/sec/aiPromptBuilder";
import { extractRelevantRiskExcerpts } from "@/lib/sec/forcesRiskRetrieval";
import type { ForcesTopicSpec } from "@/lib/sec/forcesTopicSectionMap";
import {
  QUEST_ANSWER_FORMAT,
  QUEST_BEGINNER_VOICE,
  splitQuestAnswer
} from "@/lib/quests/questAnswerFormat";

export const FORCES_QUEST_SYSTEM_PROMPT = `You are a friendly guide in a gamified investing adventure explaining ONE force (risk or tailwind) from a company's annual risk factors (Item 1A).

Your reader is learning the difference between inside vs outside the company's control, and positive vs negative forces.

${QUEST_BEGINNER_VOICE}

FORCES CARDS — SAME 4-SENTENCE CAP
- Sentence 1: how this force might show up in everyday life (price, delay, safety, hype) — one beat.
- Sentence 2: one analogy + helps or hurts in plain words.
- Sentence 3: one filing fact about this force only.
- Skip sentence 4 unless required.

FACTS
- Use ONLY what THIS company's filing excerpt supports.
- Never paste generic textbook definitions.
- If the excerpt does not mention this topic clearly, say the annual report does not emphasize it — do not invent facts.

${QUEST_ANSWER_FORMAT}

FRAMING (weave into the flowing paragraphs — do not add extra headings)
- Positive inside = strength the company controls.
- Negative inside = operational/internal risk.
- Positive outside = external tailwind.
- Negative outside = external headwind.
- Stay on the assigned force only.`;

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
    "",
    "Write the answer: everyday life first, then analogy, then filing facts; then Why investors care."
  ].join("\n");
}

export function splitAnswerAndInsight(raw: string): {
  plainEnglishAnswer: string;
  investorInsight: string | null;
} {
  return splitQuestAnswer(raw);
}
