import { buildAiPromptFromSectionIds } from "@/lib/sec/aiPromptBuilder";
import { extractRelevantRiskExcerpts } from "@/lib/sec/forcesRiskRetrieval";
import type { ForcesTopicSpec } from "@/lib/sec/forcesTopicSectionMap";
import type { PriorQuestCardSummary } from "@/lib/ai/generatePillarQuestAnswers";
import { renderPromptTemplate } from "@/lib/ai/renderPromptTemplate";
import { getDefaultFilingLabel } from "@/lib/ai/promptDefaults";
import type { PillarId } from "@/data/pillars";

export type BuildCardUserPromptParams = {
  pillarId: PillarId;
  userTemplate: string;
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
  forcesSpec?: Pick<
    ForcesTopicSpec,
    "topicTitle" | "valence" | "scope" | "retrievalKeywords" | "promptFocus"
  >;
};

function buildPriorCardsBlock(
  prior?: PriorQuestCardSummary[]
): string {
  if (!prior?.length) return "";
  return [
    "Earlier cards on this quest (do NOT repeat these facts or openings):",
    ...prior.map(
      (p) => `- ${p.cardId} (${p.investorQuestion}): ${p.summary}`
    ),
    ""
  ].join("\n");
}

export async function buildCardUserPromptFromTemplate(
  params: BuildCardUserPromptParams
): Promise<string> {
  const {
    pillarId,
    userTemplate,
    companyName,
    ticker,
    questTitle,
    questAiTask,
    cardQuestion,
    cardId,
    cardPromptFocus,
    sectionIds,
    priorCardsInQuest,
    forcesSpec
  } = params;

  const priorCardsBlock = buildPriorCardsBlock(priorCardsInQuest);

  if (pillarId === "forces" && forcesSpec) {
    const payload = await buildAiPromptFromSectionIds(sectionIds);
    const section = payload.sections[0];
    const fullText = section?.excerpt ?? "";
    const { excerpt, matched } = extractRelevantRiskExcerpts(
      fullText,
      forcesSpec.retrievalKeywords
    );
    const valenceLabel =
      forcesSpec.valence === "positive" ? "Positive" : "Negative";
    const scopeLabel =
      forcesSpec.scope === "inside" ? "Inside" : "Outside";

    return renderPromptTemplate(userTemplate, {
      companyName,
      ticker,
      questTitle,
      questAiTask,
      cardId,
      cardQuestion,
      cardPromptFocus: forcesSpec.promptFocus || cardPromptFocus,
      priorCardsBlock,
      excerptBlocks: "",
      filingLabel: "",
      forceTopicTitle: forcesSpec.topicTitle,
      valenceLabel,
      scopeLabel,
      keywordMatch: matched
        ? "yes"
        : "weak — use best-available paragraphs only",
      filteredExcerpt: excerpt || "[no excerpt available]"
    });
  }

  const payload = await buildAiPromptFromSectionIds(sectionIds);
  const excerptBlocks = payload.sections
    .map(
      (s) =>
        `${s.sectionLabel} (${s.sectionKey})\n${s.excerpt}${
          s.truncated ? "\n[section truncated in source]" : ""
        }`
    )
    .join("\n\n");

  const filingLabel = getDefaultFilingLabel(pillarId);

  return renderPromptTemplate(userTemplate, {
    companyName,
    ticker,
    questTitle,
    questAiTask,
    cardId,
    cardQuestion,
    cardPromptFocus,
    priorCardsBlock,
    excerptBlocks,
    filingLabel,
    forceTopicTitle: "",
    valenceLabel: "",
    scopeLabel: "",
    keywordMatch: "",
    filteredExcerpt: ""
  });
}
