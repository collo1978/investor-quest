import {
  analyzeHumanFirstStructure,
  type HumanFirstStructureResult
} from "@/lib/quests/humanFirstExplanation";
import {
  analyzeQuestJargonGate,
  findJargonHits,
  type JargonHit,
  type QuestJargonGateContext
} from "@/lib/quests/questJargonGate";
import { extractVisualNarration } from "@/lib/quests/sanitizeQuestAnswer";

/** Heuristic quality analysis for quest answer copy (no extra LLM call). */
export type PromptQualityAnalysis = {
  readability: {
    score: number;
    gradeLevel: number;
    avgWordsPerSentence: number;
    longSentenceCount: number;
    jargonHits: string[];
    tips: string[];
  };
  repetition: {
    score: number;
    openingLine: string;
    openingRepeated: boolean;
    duplicatePhrases: string[];
    priorCardOverlapRatio: number;
    tips: string[];
  };
  teachingFlow: {
    score: number;
    hasWhyInvestorsCare: boolean;
    hasAnalogy: boolean;
    hasRealLifeOpening: boolean;
    humanFirstPass: boolean;
    humanFirstFlags: string[];
    legacyAnalystHeadings: boolean;
    bulletCount: number;
    wordCount: number;
    withinTargetLength: boolean;
    tips: string[];
  };
  humanFirst: HumanFirstStructureResult;
  compositeScore: number;
  flags: string[];
  /** Hard jargon gate — fails teenager picture test. */
  jargonGate: {
    pass: boolean;
    hits: JargonHit[];
    flags: string[];
    rewriteRequired: boolean;
  };
  /** True when answer is ready for production save. */
  productionReady: boolean;
};

const FINANCIAL_JARGON_PATTERNS: Array<{ label: string; re: RegExp }> = [
  { label: "EBITDA", re: /\bebitda\b/i },
  { label: "amortization", re: /\bamortiz/i },
  { label: "macroeconomic", re: /\bmacroeconomic/i },
  { label: "SEC/form jargon", re: /\b10-k\b|\bform 10\b/i },
  { label: "YoY/QoQ", re: /\byoy\b|\bqoq\b/i },
  { label: "basis points", re: /\bbasis points?\b/i },
  { label: "diluted EPS", re: /\bdiluted eps\b/i },
  { label: "covenant", re: /\bcovenant/i },
  { label: "goodwill impairment", re: /\bgoodwill impairment/i }
];

const OPENING_STARTERS = [
  /^bottom line:/i,
  /^in short,/i,
  /^simply put,/i,
  /^here's the picture:/i,
  /^the short answer:/i
];

export function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s%$.]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}

function approxSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const vowels = w.match(/[aeiouy]+/g);
  let count = vowels?.length ?? 1;
  if (w.endsWith("e") && count > 1) count -= 1;
  return Math.max(1, count);
}

function fleschReadingEase(text: string): number {
  const w = words(text);
  const s = sentences(text);
  if (w.length < 10 || s.length < 2) return 50;
  const syllables = w.reduce((n, word) => n + approxSyllables(word), 0);
  const asl = w.length / s.length;
  const asw = syllables / w.length;
  return Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * asl - 84.6 * asw)
  );
}

export function normalizeLine(line: string): string {
  return line
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractOpeningLine(text: string): string {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const cleaned = line.replace(/^bottom line:\s*/i, "").trim();
    if (cleaned.length > 12) return cleaned;
  }
  return lines[0] ?? "";
}

function trigrams(text: string): Set<string> {
  const w = words(text);
  const out = new Set<string>();
  for (let i = 0; i < w.length - 2; i++) {
    out.add(`${w[i]} ${w[i + 1]} ${w[i + 2]}`);
  }
  return out;
}

export function overlapRatio(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  for (const t of ta) {
    if (tb.has(t)) shared++;
  }
  return shared / Math.max(ta.size, tb.size);
}

function findDuplicatePhrases(text: string, minLen = 4): string[] {
  const w = words(text);
  const seen = new Map<string, number>();
  const dupes: string[] = [];
  for (let i = 0; i <= w.length - minLen; i++) {
    const phrase = w.slice(i, i + minLen).join(" ");
    const count = (seen.get(phrase) ?? 0) + 1;
    seen.set(phrase, count);
    if (count === 2 && phrase.length > 14) {
      dupes.push(phrase);
    }
  }
  return dupes.slice(0, 5);
}

function analyzeReadability(text: string): PromptQualityAnalysis["readability"] {
  const sents = sentences(text);
  const w = words(text);
  const flesch = fleschReadingEase(text);
  const avgWordsPerSentence =
    sents.length > 0 ? w.length / sents.length : w.length;
  const longSentenceCount = sents.filter(
    (s) => words(s).length > 16
  ).length;

  const questJargon = findJargonHits(text);
  const financialJargon = FINANCIAL_JARGON_PATTERNS.filter((j) =>
    j.re.test(text)
  ).map((j) => j.label);
  const jargonHits = [
    ...questJargon.map((h) => h.label),
    ...financialJargon
  ];

  const tips: string[] = [];
  if (flesch < 55) tips.push("Sentences may be dense — aim for shorter, spoken lines.");
  if (avgWordsPerSentence > 14) {
    tips.push("Sentences are too long — aim for 8–14 words each.");
  }
  if (longSentenceCount > 0) {
    tips.push("Split long sentences — max ~14 words per sentence.");
  }
  if (questJargon.some((h) => h.severity === "hard")) {
    tips.push(
      "Technical jargon blocked — explain what the company helps people do in everyday language."
    );
  } else if (jargonHits.length > 0) {
    tips.push(`Define or replace jargon: ${jargonHits.join(", ")}.`);
  }

  let score = Math.round(flesch);
  score -= longSentenceCount * 6;
  score -= questJargon.filter((h) => h.severity === "hard").length * 18;
  score -= questJargon.filter((h) => h.severity === "soft").length * 6;
  score -= financialJargon.length * 6;
  if (avgWordsPerSentence > 16) score -= 8;
  score = Math.max(0, Math.min(100, score));

  const gradeLevel = Math.max(
    4,
    Math.min(14, Math.round(20 - flesch / 5))
  );

  return {
    score,
    gradeLevel,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    longSentenceCount,
    jargonHits,
    tips
  };
}

function analyzeRepetition(
  text: string,
  priorCardSummaries: string[]
): PromptQualityAnalysis["repetition"] {
  const openingLine = extractOpeningLine(text);
  const normOpening = normalizeLine(openingLine);

  let openingRepeated = false;
  let priorCardOverlapRatio = 0;

  for (const prior of priorCardSummaries) {
    const priorOpen = normalizeLine(extractOpeningLine(prior));
    if (
      priorOpen &&
      normOpening &&
      (priorOpen === normOpening ||
        priorOpen.startsWith(normOpening.slice(0, 24)) ||
        normOpening.startsWith(priorOpen.slice(0, 24)))
    ) {
      openingRepeated = true;
    }
    priorCardOverlapRatio = Math.max(
      priorCardOverlapRatio,
      overlapRatio(text, prior)
    );
  }

  const duplicatePhrases = findDuplicatePhrases(text);

  const tips: string[] = [];
  if (openingRepeated) {
    tips.push("Opening line echoes an earlier card — vary the hook.");
  }
  if (priorCardOverlapRatio > 0.22) {
    tips.push("Facts/phrasing overlap prior cards on this quest.");
  }
  if (duplicatePhrases.length > 0) {
    tips.push("Repeated phrase patterns inside this answer.");
  }

  let score = 100;
  if (openingRepeated) score -= 28;
  score -= Math.round(priorCardOverlapRatio * 120);
  score -= duplicatePhrases.length * 10;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    openingLine,
    openingRepeated,
    duplicatePhrases,
    priorCardOverlapRatio: Math.round(priorCardOverlapRatio * 100) / 100,
    tips
  };
}

function analyzeTeachingFlow(text: string): PromptQualityAnalysis["teachingFlow"] {
  const body = extractVisualNarration(text) ?? text;
  const mainMatch = body.match(/^([\s\S]*?)(?:\n\s*Why investors care:|\n\s*Why it matters:)/i);
  const mainStory = (mainMatch?.[1] ?? body).trim();
  const wordCount = words(mainStory).length;
  const legacyAnalystHeadings =
    /bottom line:/i.test(body) || /what we know:/i.test(body);
  const hasWhyInvestorsCare =
    /why investors care:/i.test(body) || /why it matters:/i.test(body);
  const bulletCount = (body.match(/•\s/g) ?? []).length;
  const humanFirst = analyzeHumanFirstStructure(text);
  const withinTargetLength = wordCount >= 30 && wordCount <= 90;
  const sentenceCount = sentences(mainStory).length;

  const tips: string[] = [];
  if (legacyAnalystHeadings) {
    tips.push("Remove analyst headings — use the human-first 6-step flow in plain sentences.");
  }
  if (!humanFirst.hasAnalogy) tips.push('Add one "Think of it like…" analogy line.');
  if (!humanFirst.hasRealLifeOpening) {
    tips.push("Open with real life — where the reader already sees or feels this.");
  }
  if (!hasWhyInvestorsCare) tips.push('End with "Why investors care:" (one sentence).');
  if (wordCount > 90) tips.push("Too long — cap the main story at ~75 words (max 4 sentences).");
  if (wordCount < 28) tips.push("Too thin — add everyday pain or one filing fact.");
  if (sentenceCount > 4) tips.push("Too many sentences before Why investors care — max 4.");
  if (bulletCount > 0) tips.push("Remove bullet points — flowing sentences only.");
  if (humanFirst.hasCorporateOpening) {
    tips.push("Sounds like a brochure — start with everyday life, not company description.");
  }

  let score = 0;
  if (humanFirst.hasAnalogy) score += 28;
  if (humanFirst.hasRealLifeOpening) score += 28;
  if (hasWhyInvestorsCare) score += 22;
  if (withinTargetLength) score += 18;
  if (sentenceCount >= 2 && sentenceCount <= 4) score += 12;
  if (!legacyAnalystHeadings) score += 8;
  if (bulletCount === 0) score += 4;
  if (legacyAnalystHeadings) score -= 25;
  if (wordCount > 100) score -= 25;
  if (!humanFirst.pass) score -= 20;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    hasWhyInvestorsCare,
    hasAnalogy: humanFirst.hasAnalogy,
    hasRealLifeOpening: humanFirst.hasRealLifeOpening,
    humanFirstPass: humanFirst.pass,
    humanFirstFlags: humanFirst.flags,
    legacyAnalystHeadings,
    bulletCount,
    wordCount,
    withinTargetLength,
    tips
  };
}

export function analyzePromptAnswerQuality(
  plainEnglishAnswer: string,
  options?: {
    priorCardSummaries?: string[];
    jargonContext?: QuestJargonGateContext;
  }
): PromptQualityAnalysis {
  const text = plainEnglishAnswer.trim();
  const prior = options?.priorCardSummaries ?? [];

  const readability = analyzeReadability(text);
  const repetition = analyzeRepetition(text, prior);
  const teachingFlow = analyzeTeachingFlow(text);
  const humanFirst = analyzeHumanFirstStructure(text);
  const jargonGate = analyzeQuestJargonGate(
    text,
    null,
    options?.jargonContext
  );

  let compositeScore = Math.round(
    readability.score * 0.32 +
      repetition.score * 0.28 +
      teachingFlow.score * 0.4
  );

  if (!jargonGate.pass) compositeScore = Math.min(compositeScore, 42);
  if (!humanFirst.pass) compositeScore = Math.min(compositeScore, 48);
  if (teachingFlow.humanFirstPass && jargonGate.pass) {
    compositeScore = Math.min(100, compositeScore + 8);
  }

  const flags: string[] = [];
  if (!jargonGate.pass) flags.push("technical_jargon");
  if (!humanFirst.pass) flags.push("human_first_structure");
  if (jargonGate.technicalOpening) flags.push("technical_opening");
  if (jargonGate.finalSentenceTooTechnical) {
    flags.push("final_sentence_too_technical");
  }
  if (readability.score < 55) flags.push("low_readability");
  if (repetition.openingRepeated) flags.push("repeated_opening");
  if (repetition.priorCardOverlapRatio > 0.25) flags.push("prior_overlap");
  if (!teachingFlow.hasWhyInvestorsCare) flags.push("missing_why_investors_care");
  if (!teachingFlow.withinTargetLength) flags.push("length_off_target");
  if (teachingFlow.wordCount > 95) flags.push("too_long");
  if (humanFirst.pass && jargonGate.pass) flags.push("human_first_ready");

  for (const re of OPENING_STARTERS) {
    if (re.test(text.split("\n")[0] ?? "")) {
      flags.push("standard_opening_ok");
      break;
    }
  }

  const productionReady = jargonGate.pass && humanFirst.pass;

  return {
    readability,
    repetition,
    teachingFlow,
    humanFirst,
    compositeScore,
    flags,
    productionReady,
    jargonGate: {
      pass: jargonGate.pass,
      hits: jargonGate.hits,
      flags: jargonGate.flags,
      rewriteRequired: jargonGate.rewriteRequired
    }
  };
}

/** True when answer must be rewritten before production save. */
export function shouldRegenerateForJargon(plainEnglishAnswer: string): boolean {
  return analyzeQuestJargonGate(plainEnglishAnswer).rewriteRequired;
}

export const PROMPT_STUDIO_TAG_SUGGESTIONS = [
  "beginner-friendly",
  "human-first",
  "instant-clarity",
  "shorter",
  "warmer-tone",
  "stricter-facts",
  "less-repetition",
  "less-jargon",
  "teaching-flow",
  "experimental",
  "production-candidate"
] as const;

/** Score quiz `explain` copy (1–2 sentences). */
export function analyzeQuizExplanationQuality(explain: string): {
  score: number;
  tips: string[];
  jargonHits: string[];
} {
  const text = explain.trim();
  if (!text) return { score: 0, tips: ["Missing explanation."], jargonHits: [] };

  const jargonHits = findJargonHits(text).map((h) => h.label);
  const wordCount = words(text).length;
  const tips: string[] = [];
  let score = 85;

  if (wordCount > 45) {
    tips.push("Quiz explanation too long — max ~2 short sentences.");
    score -= 20;
  }
  if (jargonHits.length > 0) {
    tips.push(`Simplify jargon: ${jargonHits.join(", ")}.`);
    score -= jargonHits.length * 12;
  }
  if (!/\b(you|your|people|everyday|feels|means)\b/i.test(text)) {
    tips.push("Anchor to what the player should picture in real life.");
    score -= 15;
  }
  score = Math.max(0, Math.min(100, score));

  return { score, tips, jargonHits };
}
