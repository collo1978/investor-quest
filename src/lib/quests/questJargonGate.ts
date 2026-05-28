/**
 * Hard quality gate: quest answers must pass a "teenager picture test".
 * Technical/jargon-heavy copy is flagged and must be rewritten before save.
 */

import { isCustomerProblemCard } from "@/lib/quests/customerProblemCard";
import {
  analyzeHumanFirstStructure,
  describeHumanFirstFailure,
  HUMAN_FIRST_SIX_STEPS,
  type HumanFirstStructureResult,
  type QuestionIntentContext
} from "@/lib/quests/humanFirstExplanation";
import { buildIntentPromptFooter } from "@/lib/quests/questionIntent";
import { QUEST_CARD_FOCUS_RULES } from "@/lib/quests/questionFocusGate";
import { splitIntoSentences } from "@/lib/quests/scannableAnswer";

export type QuestJargonGateContext = {
  cardQuestion?: string;
  questSlug?: string;
  cardId?: string;
  pillarId?: string;
};

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
  /** Human-first 6-step architecture compliance. */
  humanFirst: HumanFirstStructureResult;
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
  },
  { label: "essential for industries", re: /\bessential for industries\b/i },
  { label: "solutions are essential", re: /\bsolutions are essential\b/i },
  { label: "technology is crucial", re: /\btechnology is crucial\b/i },
  { label: "provide solutions", re: /\bprovides? solutions\b/i },
  { label: "their solutions", re: /\btheir solutions\b/i },
  { label: "designs and sells", re: /\bdesigns and sells\b/i },
  { label: "spec sheets", re: /\bspec sheets?\b/i },
  { label: "stickiness", re: /\bstickiness\b/i },
  { label: "em dash", re: /[—–]|\s--\s/ },
  { label: "operates across", re: /\boperates across\b/i },
  { label: "offers a range of", re: /\boffers a range of\b/i },
  { label: "delivers value", re: /\bdelivers value\b/i },
  { label: "in simple terms", re: /\bin simple terms\b/i },
  { label: "simple version", re: /\bsimple version\b/i },
  {
    label: "forced analogy",
    re: /\bthink of [\w']+ (?:like|as)\b|\bit'?s like trying to\b|\bpicture it like\b/i
  },
  {
    label: "forced kitchen analogy",
    re: /\bthink of (?:it|them|this) like a (?:kitchen|bakery)\b|\bphone running too many apps\b/i
  },
  { label: "cutting-edge AI", re: /\bcutting[- ]edge ai\b/i },
  { label: "transformative", re: /\btransformative\b/i },
  { label: "next-generation", re: /\bnext[- ]generation\b/i },
  { label: "synergies", re: /\bsynergies\b/i },
  { label: "best-in-class", re: /\bbest[- ]in[- ]class\b/i },
  { label: "industry-leading", re: /\bindustry[- ]leading\b/i },
  { label: "mission-critical", re: /\bmission[- ]critical\b/i },
  { label: "world-class", re: /\bworld[- ]class\b/i },
  {
    label: "innovation filler",
    re: /\b(?:the )?innovation behind\b|\bmight not realize the innovation\b|\binnovation hype\b/i
  }
];

/** Softer signals — two or more fail the gate. */
export const SOFT_JARGON_PATTERNS: ReadonlyArray<{
  label: string;
  re: RegExp;
}> = [
  { label: "data center (prefer plain words)", re: /\bdata centers?\b/i },
  { label: "platform (standalone)", re: /\bplatforms?\b/i },
  { label: "computing (noun)", re: /\bcomputing\b/i },
  { label: "compute (noun)", re: /\bcompute\b/i },
  { label: "solutions", re: /\bsolutions\b/i },
  { label: "leverages", re: /\bleverages?\b/i },
  { label: "specialized chips", re: /\bspecialized chips?\b/i },
  { label: "industries (corporate)", re: /\bindustries\b/i },
  { label: "innovation (buzzword)", re: /\binnovation\b/i },
  { label: "strategic", re: /\bstrategic\b/i },
  { label: "landscape", re: /\blandscape\b/i },
  { label: "enables businesses", re: /\benables? businesses\b/i },
  { label: "robust", re: /\brobust\b/i },
  { label: "leveraging", re: /\bleveraging\b/i },
  { label: "stakeholders", re: /\bstakeholders\b/i },
  { label: "value proposition", re: /\bvalue proposition\b/i }
];

const TECHNICAL_OPENING_RE = [
  /^(?:[A-Z][A-Za-z0-9&.'-]+\s+){0,2}(?:develops?|provides?|specializes|offers|designs?|manufactures|builds?|operates)\b/i,
  /^(?:[A-Z][A-Za-z0-9&.'-]+\s+){0,2}designs and sells\b/i,
  /^they\s+(?:mainly|primarily|mostly)\s+(?:sell|make|build|provide|develop|design)\b/i,
  /^the company\s+(?:develops?|provides?|specializes|offers|builds?)\b/i,
  /^their\s+(?:main|core|primary)\s+(?:business|focus)\s+is\b/i
];

const TECHNICAL_OPENING_JARGON_RE =
  /\b(gpu|graphics processing|platform|infrastructure|semiconductor|computing|rendering|analytics|data center|accelerated)\b/i;

const FINAL_SENTENCE_TECH_RE =
  /\b(gpu|graphics processing|platform|infrastructure|semiconductor|computing|rendering|analytics|data center|processing units?|complex tasks?|accelerated|workloads?|hyperscalers?)\b/i;

const CORPORATE_PROBLEM_OPENING_RE = [
  /^(?:their|the company'?s?|this company'?s?)\s+(?:solutions?|technology|innovation|products?)\b/i,
  /^(?:[A-Z][A-Za-z0-9&.'-]+\s+){0,2}(?:provides?|offers?|delivers?)\s+(?:solutions?|innovative|cutting[- ]edge)\b/i,
  /^they\s+(?:provide|offer|deliver)\s+solutions\b/i,
  /^their\s+solutions\s+are\b/i
];

function hasCorporateProblemOpening(mainStory: string): boolean {
  const first = splitIntoSentences(mainStory)[0] ?? mainStory.slice(0, 200);
  return CORPORATE_PROBLEM_OPENING_RE.some((re) => re.test(first));
}

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
  investorInsight?: string | null,
  context?: QuestJargonGateContext
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
  const customerProblem = isCustomerProblemCard({
    pillarId: context?.pillarId,
    questSlug: context?.questSlug ?? "",
    cardId: context?.cardId ?? "",
    cardQuestion: context?.cardQuestion
  });
  const corporateProblemOpening =
    customerProblem && hasCorporateProblemOpening(mainStory);

  const intentCtx: QuestionIntentContext = {
    pillarId: context?.pillarId,
    questSlug: context?.questSlug,
    cardId: context?.cardId,
    cardQuestion: context?.cardQuestion
  };
  const humanFirst = analyzeHumanFirstStructure(
    plainEnglishAnswer,
    investorInsight,
    intentCtx
  );

  const flags: string[] = [];
  if (hardHits.length > 0) flags.push("hard_jargon");
  if (softHits.length >= 2) flags.push("soft_jargon_stack");
  if (technicalOpening) flags.push("technical_opening");
  if (finalSentenceTooTechnical) flags.push("final_sentence_too_technical");
  if (corporateProblemOpening) flags.push("corporate_problem_opening");
  if (!humanFirst.pass) flags.push(...humanFirst.flags);

  const rewriteRequired =
    hardHits.length > 0 ||
    softHits.length >= 2 ||
    technicalOpening ||
    finalSentenceTooTechnical ||
    corporateProblemOpening ||
    !humanFirst.pass;

  return {
    pass: !rewriteRequired,
    hits,
    flags,
    technicalOpening,
    finalSentenceTooTechnical,
    humanFirst,
    rewriteRequired
  };
}

export function passesQuestJargonGate(
  plainEnglishAnswer: string,
  investorInsight?: string | null,
  context?: QuestJargonGateContext
): boolean {
  return analyzeQuestJargonGate(plainEnglishAnswer, investorInsight, context).pass;
}

export function describeJargonGateFailure(result: QuestJargonGateResult): string {
  const parts: string[] = [];
  if (result.technicalOpening) {
    parts.push("opens with technical/product-category framing");
  }
  if (result.finalSentenceTooTechnical) {
    parts.push("final sentence still sounds like a tech article");
  }
  if (result.flags.includes("corporate_problem_opening")) {
    parts.push(
      "opens like a corporate brochure — start with everyday pain WITHOUT the company, not solutions/industries/innovation"
    );
  }
  if (!result.humanFirst.pass) {
    parts.push(describeHumanFirstFailure(result.humanFirst));
  }
  const labels = result.hits.map((h) => h.label);
  if (labels.length) {
    parts.push(`jargon: ${labels.join(", ")}`);
  }
  return parts.join("; ") || "failed teenager picture test";
}

export const JARGON_REWRITE_SYSTEM_PROMPT = `You are an editor for Investor Quest — rewrite so it sounds like a smart friend explaining what matters to investors.

${HUMAN_FIRST_SIX_STEPS}

${QUEST_CARD_FOCUS_RULES}

Match the QUESTION TYPE and CARD QUESTION in the user message — do NOT force customer-pain / lag language on market-size or revenue cards.

HARD BANS (remove or replace):
designs and sells, operates across, provides solutions, offers a range of, delivers value, in simple terms, simple version, spec sheets, stickiness, em dashes (— or –), kitchen/bakery/phone-running-apps analogies (unless true customer-pain card), GPU, SDK, infrastructure, analytics, semiconductor, computing platform, solutions (corporate), industries (vague), innovation (filler), synergies, landscape, leverages.

Use insight-driven rhythm: answer the card question first with everyday moments the reader can picture.
Short sentences. No bullet dumps. No Wikipedia tone. No investor analysis in the main story unless the card asks for money or risk.

Keep the same facts. Do not invent products or numbers.
Max 4 short sentences in the main story, then:

Why investors care:
(one short sentence — growth, risk, trust, or strength)

No markdown, bullets, or section headings.`;

export function buildJargonRewriteUserPrompt(params: {
  companyName: string;
  cardQuestion: string;
  plainEnglishAnswer: string;
  investorInsight: string | null;
  gate: QuestJargonGateResult;
  pillarId?: string;
  questSlug?: string;
  cardId?: string;
}): string {
  const issues = describeJargonGateFailure(params.gate);
  const whyBlock = params.investorInsight
    ? `\n\nWhy investors care:\n${params.investorInsight}`
    : "";

  const intentFooter = buildIntentPromptFooter({
    pillarId: params.pillarId,
    questSlug: params.questSlug,
    cardId: params.cardId,
    cardQuestion: params.cardQuestion
  });

  const scaleRewriteHint =
    params.gate.humanFirst.intent === "market_scale"
      ? [
          "",
          "MARKET SIZE card (required):",
          "- Say how BIG or IMPORTANT the company is (biggest, leading, major player, market position, scale).",
          "- Mention AI market importance if relevant to this company.",
          "- DELETE all lag, stutter, slow-game, and slow-AI language.",
          "- Do NOT use \"Think of it like\" or other forced analogies.",
          ""
        ].join("\n")
      : "";

  const problemCardHint = [
    "",
    "Match the QUESTION TYPE below — do not default to customer-pain / lag language unless that is the question.",
    scaleRewriteHint,
    intentFooter,
    ""
  ].join("\n");

  return [
    `Company: ${params.companyName}`,
    `Card question: ${params.cardQuestion}`,
    "",
    "Problems to fix:",
    issues,
    problemCardHint,
    "Rewrite this entire answer in plain everyday language:",
    "",
    params.plainEnglishAnswer + whyBlock,
    "",
    "Return ONLY the rewritten answer in the same format (main story + Why investors care:)."
  ].join("\n");
}
