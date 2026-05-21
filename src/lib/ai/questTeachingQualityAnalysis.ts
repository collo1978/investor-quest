import { extractVisualNarration } from "@/lib/quests/sanitizeQuestAnswer";

import {
  analyzePromptAnswerQuality,
  extractOpeningLine,
  normalizeLine,
  overlapRatio,
  words,
  type PromptQualityAnalysis
} from "./promptQualityAnalysis";

export type QuestCardEvaluation = {
  cardId: string;
  promptFocus: string;
  orderIndex: number;
  plainEnglishAnswer: string;
  quality: PromptQualityAnalysis;
};

export type QuestTeachingQualityAnalysis = {
  questSlug: string;
  cardCount: number;
  overall: {
    compositeScore: number;
    readabilityScore: number;
    repetitionScore: number;
    teachingFlowScore: number;
    beginnerComprehensionScore: number;
  };
  crossCardRepetition: {
    score: number;
    similarOpeningPairs: Array<{
      cardA: string;
      cardB: string;
      reason: string;
    }>;
    questWidePhraseOverlap: number;
    tips: string[];
  };
  teachingProgression: {
    score: number;
    readabilityByCard: Array<{ cardId: string; score: number }>;
    trend: "building" | "flat" | "front_loaded" | "uneven";
    earlyCardsSimpler: boolean;
    tips: string[];
  };
  cognitiveLoad: {
    score: number;
    avgWordCount: number;
    overloadCardIds: string[];
    denseReadabilityCardIds: string[];
    tips: string[];
  };
  narrativeFlow: {
    score: number;
    structureComplianceRate: number;
    missingStructureCards: string[];
    tips: string[];
  };
  explanationVariety: {
    score: number;
    uniqueOpenings: number;
    repeatedOpeningCardIds: string[];
    tips: string[];
  };
  learningProgression: {
    score: number;
    feelsRepetitive: boolean;
    logicalEscalation: boolean;
    tips: string[];
  };
  weakestCards: Array<{ cardId: string; compositeScore: number; reason: string }>;
  strongestCards: Array<{ cardId: string; compositeScore: number }>;
  questTips: string[];
  flags: string[];
};

function summaryForCard(text: string): string {
  return extractVisualNarration(text) ?? text.slice(0, 220).trim();
}

function openingSimilar(a: string, b: string): boolean {
  const na = normalizeLine(extractOpeningLine(a));
  const nb = normalizeLine(extractOpeningLine(b));
  if (!na || !nb) return false;
  if (na === nb) return true;
  const prefix = 28;
  return (
    na.startsWith(nb.slice(0, prefix)) || nb.startsWith(na.slice(0, prefix))
  );
}

function questWideTrigramOverlap(cards: QuestCardEvaluation[]): number {
  if (cards.length < 2) return 0;
  let total = 0;
  let pairs = 0;
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      total += overlapRatio(
        cards[i].plainEnglishAnswer,
        cards[j].plainEnglishAnswer
      );
      pairs++;
    }
  }
  return pairs > 0 ? Math.round((total / pairs) * 100) / 100 : 0;
}

function analyzeCrossCardRepetition(
  cards: QuestCardEvaluation[]
): QuestTeachingQualityAnalysis["crossCardRepetition"] {
  const similarOpeningPairs: QuestTeachingQualityAnalysis["crossCardRepetition"]["similarOpeningPairs"] =
    [];

  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (openingSimilar(cards[i].plainEnglishAnswer, cards[j].plainEnglishAnswer)) {
        similarOpeningPairs.push({
          cardA: cards[i].cardId,
          cardB: cards[j].cardId,
          reason: "Opening hooks sound alike"
        });
      }
    }
  }

  const questWidePhraseOverlap = questWideTrigramOverlap(cards);
  const tips: string[] = [];

  if (similarOpeningPairs.length > 0) {
    tips.push(
      `${similarOpeningPairs.length} card pair(s) open too similarly — rotate your hook phrases.`
    );
  }
  if (questWidePhraseOverlap > 0.18) {
    tips.push(
      "Quest-wide phrasing overlap is high — each card should feel like a new beat, not a re-read."
    );
  }

  let score = 100;
  score -= similarOpeningPairs.length * 15;
  score -= Math.round(questWidePhraseOverlap * 150);
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    similarOpeningPairs,
    questWidePhraseOverlap,
    tips
  };
}

function analyzeTeachingProgression(
  cards: QuestCardEvaluation[]
): QuestTeachingQualityAnalysis["teachingProgression"] {
  const readabilityByCard = cards.map((c) => ({
    cardId: c.cardId,
    score: c.quality.readability.score
  }));

  const scores = readabilityByCard.map((r) => r.score);
  const first = scores[0] ?? 0;
  const restAvg =
    scores.length > 1
      ? scores.slice(1).reduce((a, b) => a + b, 0) / (scores.length - 1)
      : first;

  const earlyCardsSimpler = first >= restAvg - 5;

  let trend: QuestTeachingQualityAnalysis["teachingProgression"]["trend"] =
    "flat";
  if (scores.length >= 3) {
    const mid = scores.slice(1, -1);
    const rising = mid.every((s, i) => i === 0 || s >= mid[i - 1] - 8);
    const falling = mid.every((s, i) => i === 0 || s <= mid[i - 1] + 8);
    if (first > restAvg + 8) trend = "front_loaded";
    else if (rising) trend = "building";
    else if (!rising && !falling) trend = "uneven";
  }

  const tips: string[] = [];
  if (!earlyCardsSimpler) {
    tips.push(
      "Card 1 should be the gentlest onboarding — simplify the first explanation."
    );
  }
  if (trend === "front_loaded") {
    tips.push(
      "Readability drops after card 1 — ease users in, then deepen gradually."
    );
  }
  if (trend === "uneven") {
    tips.push(
      "Difficulty jumps around — smooth the arc so each card feels like the next step."
    );
  }

  let score = 70;
  if (earlyCardsSimpler) score += 15;
  if (trend === "building" || trend === "flat") score += 15;
  if (trend === "uneven") score -= 12;
  if (trend === "front_loaded") score -= 10;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    readabilityByCard,
    trend,
    earlyCardsSimpler,
    tips
  };
}

function analyzeCognitiveLoad(
  cards: QuestCardEvaluation[]
): QuestTeachingQualityAnalysis["cognitiveLoad"] {
  const wordCounts = cards.map((c) => c.quality.teachingFlow.wordCount);
  const avgWordCount =
    wordCounts.length > 0
      ? Math.round(
          wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
        )
      : 0;

  const overloadCardIds = cards
    .filter(
      (c) =>
        c.quality.teachingFlow.wordCount > 200 ||
        c.quality.readability.avgWordsPerSentence > 20
    )
    .map((c) => c.cardId);

  const denseReadabilityCardIds = cards
    .filter((c) => c.quality.readability.score < 52)
    .map((c) => c.cardId);

  const tips: string[] = [];
  if (overloadCardIds.length > 0) {
    tips.push(
      `Cognitive overload risk on: ${overloadCardIds.join(", ")} — shorten or split ideas.`
    );
  }
  if (avgWordCount > 175) {
    tips.push("Quest average length is heavy — trim across cards for beginners.");
  }

  let score = 100;
  score -= overloadCardIds.length * 12;
  score -= denseReadabilityCardIds.length * 10;
  if (avgWordCount > 190) score -= 15;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    avgWordCount,
    overloadCardIds,
    denseReadabilityCardIds,
    tips
  };
}

function analyzeNarrativeFlow(
  cards: QuestCardEvaluation[]
): QuestTeachingQualityAnalysis["narrativeFlow"] {
  const complete = cards.filter(
    (c) =>
      c.quality.teachingFlow.humanFirstPass &&
      c.quality.teachingFlow.hasWhyInvestorsCare &&
      !c.quality.teachingFlow.legacyAnalystHeadings
  );
  const structureComplianceRate =
    cards.length > 0
      ? Math.round((complete.length / cards.length) * 100)
      : 0;

  const missingStructureCards = cards
    .filter((c) => !complete.includes(c))
    .map((c) => c.cardId);

  const tips: string[] = [];
  if (structureComplianceRate < 100) {
    tips.push(
      "Every card should follow human-first flow: real life → pain → consequence → analogy → what they do → Why investors care."
    );
  }
  if (missingStructureCards.length > 0) {
    tips.push(`Fix human-first structure on: ${missingStructureCards.join(", ")}.`);
  }

  return {
    score: structureComplianceRate,
    structureComplianceRate,
    missingStructureCards,
    tips
  };
}

function analyzeExplanationVariety(
  cards: QuestCardEvaluation[]
): QuestTeachingQualityAnalysis["explanationVariety"] {
  const openings = cards.map((c) =>
    normalizeLine(extractOpeningLine(c.plainEnglishAnswer))
  );
  const unique = new Set(openings.filter(Boolean));
  const repeatedOpeningCardIds: string[] = [];

  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (openings[i] && openings[i] === openings[j]) {
        if (!repeatedOpeningCardIds.includes(cards[i].cardId)) {
          repeatedOpeningCardIds.push(cards[i].cardId);
        }
        if (!repeatedOpeningCardIds.includes(cards[j].cardId)) {
          repeatedOpeningCardIds.push(cards[j].cardId);
        }
      }
    }
  }

  const tips: string[] = [];
  if (unique.size < cards.length) {
    tips.push("Vary how each card starts — curiosity hooks should not clone each other.");
  }
  if (repeatedOpeningCardIds.length > 0) {
    tips.push(
      `Identical openings on: ${repeatedOpeningCardIds.join(", ")}.`
    );
  }

  let score = 100;
  score -= (cards.length - unique.size) * 18;
  score -= repeatedOpeningCardIds.length * 8;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    uniqueOpenings: unique.size,
    repeatedOpeningCardIds,
    tips
  };
}

function analyzeLearningProgression(
  cards: QuestCardEvaluation[],
  crossCard: QuestTeachingQualityAnalysis["crossCardRepetition"],
  progression: QuestTeachingQualityAnalysis["teachingProgression"],
  variety: QuestTeachingQualityAnalysis["explanationVariety"]
): QuestTeachingQualityAnalysis["learningProgression"] {
  const feelsRepetitive =
    crossCard.score < 62 ||
    crossCard.similarOpeningPairs.length >= 2 ||
    crossCard.questWidePhraseOverlap > 0.2;

  const logicalEscalation =
    progression.earlyCardsSimpler &&
    (progression.trend === "building" ||
      progression.trend === "flat" ||
      progression.trend === "front_loaded");

  const tips: string[] = [];
  if (feelsRepetitive) {
    tips.push(
      "Quest may feel repetitive to players — refresh facts and voice per card."
    );
  }
  if (!logicalEscalation) {
    tips.push(
      "Learning arc unclear — card 1 should welcome, later cards add depth without repeating."
    );
  }
  if (variety.score < 65) {
    tips.push("Low explanation variety — players need distinct 'aha' moments each card.");
  }

  let score = Math.round(
    (crossCard.score * 0.35 +
      progression.score * 0.35 +
      variety.score * 0.3)
  );
  if (feelsRepetitive) score = Math.min(score, 55);

  return {
    score,
    feelsRepetitive,
    logicalEscalation,
    tips
  };
}

export function analyzeQuestTeachingQuality(
  questSlug: string,
  cards: QuestCardEvaluation[]
): QuestTeachingQualityAnalysis {
  if (cards.length === 0) {
    throw new Error("No cards to analyze.");
  }

  const crossCardRepetition = analyzeCrossCardRepetition(cards);
  const teachingProgression = analyzeTeachingProgression(cards);
  const cognitiveLoad = analyzeCognitiveLoad(cards);
  const narrativeFlow = analyzeNarrativeFlow(cards);
  const explanationVariety = analyzeExplanationVariety(cards);
  const learningProgression = analyzeLearningProgression(
    cards,
    crossCardRepetition,
    teachingProgression,
    explanationVariety
  );

  const avg = (key: keyof PromptQualityAnalysis) => {
    if (key === "compositeScore" || key === "flags") return 0;
    return (
      cards.reduce((n, c) => {
        if (key === "readability") return n + c.quality.readability.score;
        if (key === "repetition") return n + c.quality.repetition.score;
        if (key === "teachingFlow") return n + c.quality.teachingFlow.score;
        return n;
      }, 0) / cards.length
    );
  };

  const readabilityScore = Math.round(avg("readability"));
  const repetitionScore = Math.round(
    cards.reduce((n, c) => n + c.quality.repetition.score, 0) / cards.length
  );
  const teachingFlowScore = Math.round(avg("teachingFlow"));
  const compositeScore = Math.round(
    cards.reduce((n, c) => n + c.quality.compositeScore, 0) / cards.length
  );

  const beginnerComprehensionScore = Math.round(
    readabilityScore * 0.4 +
      crossCardRepetition.score * 0.25 +
      cognitiveLoad.score * 0.2 +
      narrativeFlow.score * 0.15
  );

  const sorted = [...cards].sort(
    (a, b) => a.quality.compositeScore - b.quality.compositeScore
  );
  const weakestCards = sorted.slice(0, Math.min(2, sorted.length)).map((c) => ({
    cardId: c.cardId,
    compositeScore: c.quality.compositeScore,
    reason:
      c.quality.readability.score < 55
        ? "Low readability"
        : c.quality.repetition.openingRepeated
          ? "Repeats prior card"
          : !c.quality.teachingFlow.humanFirstPass
            ? "Weak human-first structure"
            : "Low composite score"
  }));
  const strongestCards = [...cards]
    .sort((a, b) => b.quality.compositeScore - a.quality.compositeScore)
    .slice(0, 2)
    .map((c) => ({
      cardId: c.cardId,
      compositeScore: c.quality.compositeScore
    }));

  const questTips = [
    ...crossCardRepetition.tips,
    ...teachingProgression.tips,
    ...cognitiveLoad.tips,
    ...narrativeFlow.tips,
    ...explanationVariety.tips,
    ...learningProgression.tips
  ].filter((t, i, arr) => arr.indexOf(t) === i);

  const flags: string[] = [];
  if (learningProgression.feelsRepetitive) flags.push("quest_feels_repetitive");
  if (!learningProgression.logicalEscalation) flags.push("weak_learning_arc");
  if (cognitiveLoad.overloadCardIds.length > 0) flags.push("cognitive_overload");
  if (crossCardRepetition.similarOpeningPairs.length > 0) {
    flags.push("similar_openings");
  }
  if (beginnerComprehensionScore >= 75) flags.push("beginner_friendly_quest");

  return {
    questSlug,
    cardCount: cards.length,
    overall: {
      compositeScore,
      readabilityScore,
      repetitionScore,
      teachingFlowScore,
      beginnerComprehensionScore
    },
    crossCardRepetition,
    teachingProgression,
    cognitiveLoad,
    narrativeFlow,
    explanationVariety,
    learningProgression,
    weakestCards,
    strongestCards,
    questTips: questTips.slice(0, 8),
    flags
  };
}

/** Build card evaluations from answers using in-quest prior context (batch order). */
export function evaluateQuestCardsInOrder(
  questSlug: string,
  ordered: Array<{
    cardId: string;
    promptFocus: string;
    plainEnglishAnswer: string;
  }>
): { cards: QuestCardEvaluation[]; quest: QuestTeachingQualityAnalysis } {
  const cards: QuestCardEvaluation[] = [];
  const priorSummaries: string[] = [];

  for (let i = 0; i < ordered.length; i++) {
    const row = ordered[i];
    const quality = analyzePromptAnswerQuality(row.plainEnglishAnswer, {
      priorCardSummaries: priorSummaries,
      jargonContext: { questSlug, cardId: row.cardId }
    });
    cards.push({
      cardId: row.cardId,
      promptFocus: row.promptFocus,
      orderIndex: i,
      plainEnglishAnswer: row.plainEnglishAnswer,
      quality
    });
    priorSummaries.push(summaryForCard(row.plainEnglishAnswer));
  }

  return {
    cards,
    quest: analyzeQuestTeachingQuality(questSlug, cards)
  };
}
