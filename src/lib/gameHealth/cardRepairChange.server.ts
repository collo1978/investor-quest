import { companyByTicker } from "@/data/companies";
import { getCompanyPillarQuests } from "@/data/quests/library";
import type { PillarId } from "@/data/pillars";
import { auditCommunicationText } from "@/lib/communicationQuality/auditText";
import { findRemovedJargonPhrases } from "@/lib/communicationQuality/copyChangeDiff";
import { splitSentences } from "@/lib/communicationQuality/patterns";
import type { CommunicationWarning } from "@/lib/communicationQuality/types";
import type { CardRepairChange, CardRepairFixMethod } from "@/lib/gameHealth/missionControlRepairSync";
import { extractFlaggedSentence } from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";
import { resolveQuestCardDisplayContent } from "@/lib/quests/questCardContentSource";
import { fetchQuestCardAnswersForSlug } from "@/lib/supabase/questCardAnswers/storage";

const IMPROVEMENT_BY_CATEGORY: Record<string, string> = {
  jargon_detection: "Fewer finance and tech buzzwords",
  beginner_friendliness: "Better beginner readability",
  conversational_tone: "More conversational, less robotic tone",
  human_tone: "Sounds more human, less like AI filler",
  cognitive_load: "Fewer stacked concepts per sentence",
  question_alignment: "Stays closer to the card question",
  emotional_clarity: "Clearer real-life hook for readers",
  investor_clarity: "Investor takeaway is easier to follow"
};

function afterExcerptFromBody(bodyText: string, maxLen = 420): string {
  const sentences = splitSentences(bodyText.trim());
  let out = "";
  for (const s of sentences.slice(0, 3)) {
    if ((out + s).length > maxLen) break;
    out += (out ? " " : "") + s;
  }
  return out.trim() || bodyText.slice(0, maxLen);
}

function improvementReasonsFromWarnings(
  beforeWarnings: CommunicationWarning[],
  afterWarnings: CommunicationWarning[]
): string[] {
  const fixed = beforeWarnings.filter((w) => !afterWarnings.some((a) => a.code === w.code));
  const reasons: string[] = [];

  for (const w of fixed) {
    const cat = w.categoryId ? IMPROVEMENT_BY_CATEGORY[w.categoryId] : null;
    if (cat && !reasons.includes(cat)) reasons.push(cat);
  }

  if (reasons.length === 0 && afterWarnings.length === 0) {
    reasons.push("Simpler wording overall");
    reasons.push("Easier for beginner investors to follow");
  }

  if (beforeWarnings.length > afterWarnings.length) {
    reasons.push(`Resolved ${beforeWarnings.length - afterWarnings.length} flagged pattern(s)`);
  }

  return reasons.slice(0, 6);
}

function summarizeImprovement(
  beforeWarnings: CommunicationWarning[],
  afterWarnings: CommunicationWarning[],
  removedPhrases: string[]
): string {
  const reasons = improvementReasonsFromWarnings(beforeWarnings, afterWarnings);
  if (removedPhrases.length > 0) {
    return `${reasons[0] ?? "Simpler wording"} — removed jargon like “${removedPhrases.slice(0, 2).join('”, “')}”.`;
  }
  if (reasons.length > 0) return reasons.join(" · ");
  if (afterWarnings.length === 0) {
    return "Copy reads clearly for beginner investors with no flagged communication issues.";
  }
  return "Score improved; review remaining flags if polish is needed.";
}

function whyPassesNow(score: number, warnings: CommunicationWarning[]): string {
  const parts: string[] = [];
  if (score >= 85 && !warnings.some((w) => w.severity === "critical")) {
    parts.push("Passes plain-language and beginner-friendly checks for this card");
  } else if (score >= 70) {
    parts.push("Meets the minimum communication bar for this card");
  } else {
    parts.push("Still below target — consider another regenerate or manual edit");
  }

  if (warnings.length === 0) {
    parts.push("no jargon or tone flags remain on this sentence");
  } else {
    parts.push(`${warnings.length} lighter flag(s) may remain elsewhere on the card`);
  }

  return `${parts[0]} — ${parts[1]}.`;
}

export async function buildCardRepairChange(input: {
  ticker: string;
  pillarId: string;
  questSlug: string;
  cardId: string;
  beforeFlaggedText: string;
  fixMethod: CardRepairFixMethod;
  beforeWarnings?: CommunicationWarning[];
  beforeScore?: number | null;
}): Promise<CardRepairChange | null> {
  const ticker = input.ticker.toUpperCase();
  const company = companyByTicker(ticker);
  if (!company) return null;

  const pillarId = input.pillarId as PillarId;
  const quests = getCompanyPillarQuests(company.id, pillarId);
  const quest = quests.find((q) => q.slug === input.questSlug);
  if (!quest) return null;

  const cardDef = quest.cards?.find((c) => c.id === input.cardId);
  const generated = await fetchQuestCardAnswersForSlug({
    ticker,
    pillarId,
    questSlug: input.questSlug
  });
  const row = generated[input.cardId];
  const display = resolveQuestCardDisplayContent({
    companyId: company.id,
    pillarId,
    questSlug: input.questSlug,
    cardId: input.cardId,
    instantiatedCard: cardDef ?? null,
    generatedCard: row ?? null
  });

  const bodyText =
    row?.plainEnglishAnswer?.trim() ?? display.plainEnglishAnswer?.trim() ?? "";
  if (!bodyText) return null;

  const beforeSentence = input.beforeFlaggedText.trim();
  const afterSentence =
    extractFlaggedSentence(bodyText, beforeSentence) ||
    splitSentences(bodyText)[0]?.trim() ||
    bodyText.slice(0, 220);

  const afterAudit = auditCommunicationText({
    text: bodyText,
    contentId: `${ticker}:${input.questSlug}:${input.cardId}`,
    kind: "quest_card",
    ticker,
    companyName: company.name,
    pillarId,
    questSlug: input.questSlug,
    cardId: input.cardId,
    source: row ? "supabase" : display.source,
    question: cardDef?.investorQuestion
  });

  const beforeWarnings = input.beforeWarnings ?? [];
  const removedPhrases = findRemovedJargonPhrases(beforeSentence, afterSentence);
  const improvementReasons = improvementReasonsFromWarnings(
    beforeWarnings,
    afterAudit.warnings
  );

  return {
    ticker,
    pillarId: input.pillarId,
    questSlug: input.questSlug,
    cardId: input.cardId,
    fixMethod: input.fixMethod,
    fixedAt: new Date().toISOString(),
    beforeSentence,
    afterSentence,
    afterExcerpt: afterExcerptFromBody(bodyText),
    whatImproved: summarizeImprovement(
      beforeWarnings,
      afterAudit.warnings,
      removedPhrases
    ),
    improvementReasons,
    whyPasses: whyPassesNow(afterAudit.score, afterAudit.warnings),
    removedPhrases,
    cardScoreBefore: input.beforeScore ?? null,
    cardScoreAfter: afterAudit.score,
    contentSource: row ? "Database (AI generated)" : display.sourceLabel
  };
}
