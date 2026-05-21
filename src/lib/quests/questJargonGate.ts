/**
 * Hard quality gate: quest answers must pass a "teenager picture test".
 * Technical/jargon-heavy copy is flagged and must be rewritten before save.
 */

import { splitIntoSentences } from "@/lib/quests/scannableAnswer";

export type JargonSeverity = "hard" | "soft";

export type JargonHit = {
  label: string;
  severity: JargonSeverity;
  /** Snippet that matched (for rewrite prompts). */
  snippet: string;
};

export type QuestJargonGateResult = {
  pass: boolean;
  hits: JargonHit[];
  flags: string[];
  /** Sentence 1 opens with engineering/product-category framing. */
  technicalOpening: boolean;
  /** Last main-story sentence still sounds like a tech article. */
  finalSentenceTooTechnical: boolean;
  rewriteRequired: boolean;
};

/** Hard-ban patterns — any match fails the gate. */
export const HARD_JARGON_PATTERNS: ReadonlyArray<{
  label: string;
  re: RegExp;
}> = [
  { label: "GPU", re: /\bgpu\b|\bgraphics processing units?\b/i },
  { label: "SDK", re: /\bsdk\b|\bsoftware development kit\b/i },
  { label: "computing platform", re: /\bcomputing platforms?\b/i },
  { label: "cloud platform", re: /\bcloud platforms?\b/i },
  { label: "data center platform", re: /\bdata center platforms?\b/i },
  { label: "accelerated computing", re: /\baccelerat(?:e|ed|ing)\s+comput/i },
  { label: "infrastructure", re: /\binfrastructure\b/i },
  { label: "rendering", re: /\brendering\b/i },
  { label: "analytics", re: /\banalytics\b/i },
  { label: "semiconductor", re: /\bsemiconductor/i },
  { label: "complex tasks", re: /\bcomplex tasks?\b/i },
  { label: "training AI models", re: /\btraining ai models?\b/i },
  { label: "data center", re: /\bdata centers?\b/i },
  { label: "hyperscaler", re: /\bhyperscalers?\b/i },
  { label: "workload", re: /\bworkloads?\b/i },
  { label: "processing units", re: /\bprocessing units?\b/i },
  {
    label: "networks of computers",
    re: /\bnetworks of computers\b/i
  },
  {
    label: "rendering realistic graphics",
    re: /\brendering realistic graphics\b/i
  },
  {
    label: "ecosystem (buzzword)",
    re: /\b(?:platform|technology|compute|computing)\s+ecosystem\b|\becosystem of\b/i
  },
  {
    label: "tech platform (generic)",
    re: /\b(?:software|hardware|compute|computing|technology)\s+platforms?\b/i
  }
];

/** Softer signals — two or more fail the gate. */
export const SOFT_JARGON_PATTERNS: ReadonlyArray<{
  label: string;
  re: RegExp;
}> = [
  { label: "platform (standalone)", re: /\bplatforms?\b/i },
  { label: "computing (noun)", re: /\bcomputing\b/i },
  { label: "compute (noun)", re: /\bcompute\b/i },
  { label: "solutions", re: /\bsolutions\b/i },
  { label: "leverages", re: /\bleverages?\b/i },
  { label: "specialized chips", re: /\bspecialized chips?\b/i }
];

const TECHNICAL_OPENING_RE = [
  /^(?:[A-Z][A-Za-z0-9&.'-]+\s+){0,2}(?:develops?|provides?|specializes|offers|designs?|manufactures|builds?)\b/i,
  /^they\s+(?:mainly|primarily|mostly)\s+(?:sell|make|build|provide|develop|design)\b/i,
  /^the company\s+(?:develops?|provides?|specializes|offers|builds?)\b/i,
  /^their\s+(?:main|core|primary)\s+(?:business|focus)\s+is\b/i
];

const TECHNICAL_OPENING_JARGON_RE =
  /\b(gpu|graphics processing|platform|infrastructure|semiconductor|computing|rendering|analytics|data center|accelerated)\b/i;

const FINAL_SENTENCE_TECH_RE =
  /\b(gpu|graphics processing|platform|infrastructure|semiconductor|computing|rendering|analytics|data center|processing units?|complex tasks?|accelerated|workloads?|hyperscalers?)\b/i;

export function extractMainStory(text: string): string {
  const trimmed = text.trim();
  const cut = trimmed.match(/\n\s*Why investors care:\s*/i);
  if (cut?.index != null) {
    return trimmed.slice(0, cut.index).trim();
  }
  return trimmed.replace(/\n\s*Why it matters:\s*[\s\S]*$/i, "").trim();
}

export function findJargonHits(text: string): JargonHit[] {
  const hits: JargonHit[] = [];
  const seen = new Set<string>();

  const scan = (
    patterns: ReadonlyArray<{ label: string; re: RegExp }>,
    severity: JargonSeverity
  ) => {
    for (const { label, re } of patterns) {
      const m = text.match(re);
      if (m && !seen.has(label)) {
        seen.add(label);
        hits.push({
          label,
          severity,
          snippet: m[0]
        });
      }
    }
  };

  scan(HARD_JARGON_PATTERNS, "hard");
  scan(SOFT_JARGON_PATTERNS, "soft");
  return hits;
}

function hasTechnicalOpening(mainStory: string): boolean {
  const first = splitIntoSentences(mainStory)[0] ?? mainStory.slice(0, 160);
  if (!first.trim()) return false;
  const opener = TECHNICAL_OPENING_RE.some((re) => re.test(first));
  if (!opener) return false;
  return TECHNICAL_OPENING_JARGON_RE.test(first);
}

function isFinalSentenceTooTechnical(mainStory: string): boolean {
  const sentences = splitIntoSentences(mainStory);
  if (sentences.length === 0) return false;
  const last = sentences[sentences.length - 1]!;
  if (FINAL_SENTENCE_TECH_RE.test(last)) return true;
  const lastHits = findJargonHits(last).filter((h) => h.severity === "hard");
  return lastHits.length > 0;
}

/**
 * Teenager picture test — must instantly picture where company shows up in real life.
 */
export function analyzeQuestJargonGate(
  plainEnglishAnswer: string,
  investorInsight?: string | null
): QuestJargonGateResult {
  const combined = [plainEnglishAnswer, investorInsight]
    .filter(Boolean)
    .join("\n\n");
  const mainStory = extractMainStory(plainEnglishAnswer);
  const hits = findJargonHits(combined);

  const hardHits = hits.filter((h) => h.severity === "hard");
  const softHits = hits.filter((h) => h.severity === "soft");
  const technicalOpening = hasTechnicalOpening(mainStory);
  const finalSentenceTooTechnical = isFinalSentenceTooTechnical(mainStory);

  const flags: string[] = [];
  if (hardHits.length > 0) flags.push("hard_jargon");
  if (softHits.length >= 2) flags.push("soft_jargon_stack");
  if (technicalOpening) flags.push("technical_opening");
  if (finalSentenceTooTechnical) flags.push("final_sentence_too_technical");

  const rewriteRequired =
    hardHits.length > 0 ||
    softHits.length >= 2 ||
    technicalOpening ||
    finalSentenceTooTechnical;

  return {
    pass: !rewriteRequired,
    hits,
    flags,
    technicalOpening,
    finalSentenceTooTechnical,
    rewriteRequired
  };
}

export function passesQuestJargonGate(
  plainEnglishAnswer: string,
  investorInsight?: string | null
): boolean {
  return analyzeQuestJargonGate(plainEnglishAnswer, investorInsight).pass;
}

export function describeJargonGateFailure(result: QuestJargonGateResult): string {
  const parts: string[] = [];
  if (result.technicalOpening) {
    parts.push("opens with technical/product-category framing");
  }
  if (result.finalSentenceTooTechnical) {
    parts.push("final sentence still sounds like a tech article");
  }
  const labels = result.hits.map((h) => h.label);
  if (labels.length) {
    parts.push(`jargon: ${labels.join(", ")}`);
  }
  return parts.join("; ") || "failed teenager picture test";
}

export const JARGON_REWRITE_SYSTEM_PROMPT = `You are an editor for Investor Quest — a gamified app that explains companies in normal language.

Your ONLY job: rewrite an answer so a normal teenager instantly pictures:
- where this company shows up in everyday life
- what it helps power (apps, games, phones, shopping, driving — things people recognize)
- why people use those things

HARD BANS (remove or replace — never keep these):
GPU, graphics processing unit, SDK, rendering, infrastructure, analytics, accelerated computing, data center, semiconductor, computing platform, cloud platform, ecosystem (as buzzword), complex tasks, workload, hyperscaler, processing units, "networks of computers", specialized technical categories.

NEVER open with what the company builds technically.
NEVER explain product categories — explain what the technology helps people DO.

GOOD final sentence style:
"They make the powerful chips helping AI tools, games, and smart technology run faster and smoother."

BAD final sentence style:
"They mainly sell powerful graphics processing units for computing platforms."

Keep the same facts from the original. Do not invent products or numbers.
Keep max 4 short sentences in the main story, then:

Why investors care:
(one short sentence)

No markdown, bullets, or section headings.`;

export function buildJargonRewriteUserPrompt(params: {
  companyName: string;
  cardQuestion: string;
  plainEnglishAnswer: string;
  investorInsight: string | null;
  gate: QuestJargonGateResult;
}): string {
  const issues = describeJargonGateFailure(params.gate);
  const whyBlock = params.investorInsight
    ? `\n\nWhy investors care:\n${params.investorInsight}`
    : "";

  return [
    `Company: ${params.companyName}`,
    `Card question: ${params.cardQuestion}`,
    "",
    "Problems to fix:",
    issues,
    "",
    "Rewrite this entire answer in plain everyday language:",
    "",
    params.plainEnglishAnswer + whyBlock,
    "",
    "Return ONLY the rewritten answer in the same format (main story + Why investors care:)."
  ].join("\n");
}
