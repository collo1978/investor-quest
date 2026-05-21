/**
 * Human-First Explanation Architecture — platform-wide voice for Investor Quest.
 * All AI quest answers, rewrites, Prompt Studio scoring, and quiz copy should align here.
 *
 * Answers adapt to question intent (see questionIntent.ts) — not one customer-pain template.
 */

import {
  buildIntentPromptFooter,
  detectQuestionIntent,
  INTENT_ADAPTIVE_PRINCIPLE,
  type QuestionIntent,
  type QuestionIntentContext
} from "@/lib/quests/questionIntent";
import { splitIntoSentences } from "@/lib/quests/scannableAnswer";

export type { QuestionIntent, QuestionIntentContext } from "@/lib/quests/questionIntent";
export {
  detectQuestionIntent,
  buildIntentPromptFooter,
  QUESTION_INTENT_LABELS
} from "@/lib/quests/questionIntent";

export const HUMAN_FIRST_MISSION = `MISSION
Investor Quest should feel like a smart friend showing how companies work in normal life — NOT "AI summaries of financial filings."`;

export const HUMAN_FIRST_SIX_STEPS = `HUMAN-FIRST EXPLANATION ARCHITECTURE (flexible mental model)
Match the CARD QUESTION — use the pattern for that question type (see intent footer on each card).

Common patterns (pick ONE that fits the question):
- What they do: everyday experience → analogy → what they sell/do → investor meaning
- Customer problem: pain → consequence → how they help → investor meaning
- Market scale: scale comparison → market importance → analogy → investor meaning
- How they make money: what people pay for → example → main revenue source → investor meaning
- Risk/force: real-world risk → what could happen → filing fact → investor meaning
- Financials: money comparison → what the number shows → consequence → investor meaning

Always end with "Why investors care:" — one short line on growth, risk, trust, or strength.`;

export const HUMAN_FIRST_HARD_RULES = `HARD RULES (auto-rejected before save)
- No technical-first explanations (never open with what the company builds in engineering terms)
- No corporate / MBA language ("solutions are essential", "landscape", "leverages", "synergies", "strategic")
- No jargon unless translated into normal life in the same breath
- No long article-style answers (max 4 short sentences before "Why investors care:")
- No vague "innovation" unless you show a concrete everyday result
- Teenager picture test: if they cannot instantly picture it → rewrite`;

export const QUEST_BEGINNER_VOICE = `${HUMAN_FIRST_MISSION}

${HUMAN_FIRST_SIX_STEPS}

${HUMAN_FIRST_HARD_RULES}

VOICE
- TikTok clarity + Apple simplicity: one beat per sentence, spoken aloud in your head.
- Goal: "Ohhh… I get what this company does now."
- Conversational, light, fast — one idea per card.

TEENAGER PICTURE TEST (enforced before save)
- A normal teenager must instantly picture where this shows up in real life.
- They understand what it helps power and why people use it — NOT product categories or industry tours.

LENGTH (hard cap)
- Before "Why investors care:" at most 4 short sentences (3 is ideal).
- Each sentence: ~8–14 words. No stacked "and / which / while" chains.
- Main story: ~45–75 words total.

REAL-WORLD FIRST
- Sentence 1 MUST hook normal life — never open with what the company builds technically.
- Good: "If you've used a popular AI chat app…", "When your paycheck hits the account…", "They're one of the biggest names in…"
- Bad: "[Company] develops…", "They provide solutions…", "Their technology is crucial…"

JARGON (zero tolerance — rewrite if found)
- BANNED: GPU, SDK, infrastructure, analytics, accelerated computing, data center, semiconductor, computing platform, cloud platform, hyperscaler, workload, ecosystem (buzzword), solutions (corporate), industries (vague tour), innovation (filler).
- Prefer: "chips that keep games smooth", "money left after bills", "rules that protect your data".

${INTENT_ADAPTIVE_PRINCIPLE}

BANNED IN STORY
- Section headings, bullets, "Bottom line", "What we know", corporate filler.`;

export const QUEST_ANSWER_FORMAT = `FORMAT (strict)
- NO markdown: no **, #, bullets (• - *), or backticks.
- NO headings inside the main story.

Write at most 4 short sentences, then one blank line and exactly:

Why investors care:
(one short sentence — growth, risk, trust, or strength)

- Follow the QUESTION TYPE sentence map in the user message (not a generic pain template).
- Answer ONLY this card's question. Do not repeat earlier cards.`;

export const HUMAN_FIRST_WRITE_INSTRUCTION =
  "Write using the QUESTION TYPE pattern in the user message; max 4 short sentences; then Why investors care:";

export const QUIZ_EXPLANATION_VOICE = `QUIZ EXPLANATION RULES (post-answer "Why" copy)
- 1–2 short sentences max.
- Start with what the player should picture in real life, then the one fact they missed.
- No filing jargon, no "incorrect", no lecture.
- Good: "Apple earns most from iPhone — services add recurring revenue on top."
- Bad: "The company's diversified revenue streams across multiple product categories…"`;

export const WHY_IT_MATTERS_UI_VOICE = `WHY IT MATTERS (template labels on cards — keep under 20 words)
- Tie to a human stake: trust, money, time, safety, or staying competitive.
- Not: abstract strategy or industry overview.`;

export const VALUATION_EXPLANATION_VOICE = `VALUATION / PRICE CARDS (when applicable)
- Anchor price to something familiar: "costs about X movie tickets" or "one month of streaming."
- Pain: paying too much vs what you get; consequence: overpaying for hype.
- Never lead with P/E, EV/EBITDA, or multiples without translating what they mean in plain life.`;

/** Snapshot card-2 — customer problem (hardest test). */
export const CUSTOMER_PROBLEM_CARD_PROMPT = `CUSTOMER PROBLEM CARD
The reader must feel: "What pain disappears because this company exists?"
Arc: everyday frustration WITHOUT them → consequence → one analogy → benefit WITH them.
Never: industries tour, solutions, innovation hype, "technology is crucial."`;

export const CUSTOMER_PROBLEM_STYLE_REFERENCE = `STYLE REFERENCE (customer problem — tone only):
"When a game stutters or an AI chat takes forever to reply, devices aren't fast enough.

Think of it like a phone running too many apps — everything slows down.

This company makes the parts inside devices so games and apps feel quick again.

Why investors care:
If people keep demanding faster tech, demand for those parts can keep growing."`;

export function isCustomerProblemCard(params: {
  questSlug: string;
  cardId: string;
  cardQuestion?: string;
  pillarId?: string;
}): boolean {
  return (
    detectQuestionIntent({
      pillarId: params.pillarId,
      questSlug: params.questSlug,
      cardId: params.cardId,
      cardQuestion: params.cardQuestion
    }) === "customer_problem"
  );
}

export function buildHumanFirstUserPromptFooter(
  ctx?: QuestionIntentContext
): string {
  if (ctx) return buildIntentPromptFooter(ctx);
  return `\n${HUMAN_FIRST_WRITE_INSTRUCTION}`;
}

export type HumanFirstStructureResult = {
  pass: boolean;
  flags: string[];
  intent: QuestionIntent;
  hasRealLifeOpening: boolean;
  hasPainOrProblem: boolean;
  hasConsequence: boolean;
  hasAnalogy: boolean;
  hasScaleSignal: boolean;
  hasWrongIntentTemplate: boolean;
  hasCorporateOpening: boolean;
  tooLong: boolean;
  missingWhyInvestorsCare: boolean;
};

const REAL_LIFE_OPENING_RE =
  /\b(when you|if you'?ve|you might|you've|you already|everyday|at home|on your phone|while |when a |if a |before you|after you|most people|anyone who)\b/i;

const PAIN_PROBLEM_RE =
  /\b(without|frustrat|annoy|slow|lag|stutter|broken|expensive|confus|risk|struggle|hard to|can't|cannot|waiting|stuck|worry|lose|miss|fail|hurt)\b/i;

const CONSEQUENCE_RE =
  /\b(so |means |ends up|gets worse|can't |cannot |falls behind|costs more|takes longer|goes wrong|if that|when that)\b/i;

const ANALOGY_RE =
  /\bthink of (?:it|them|this|the) like\b|\bit'?s like\b|\bimagine\b|\blike trying to\b|\blike having a\b|\blike the difference\b|\blike a key\b/i;

const SCALE_SIGNAL_RE =
  /\b(biggest|largest|leading|dominant|major player|market position|market share|well[- ]known|household name|scale|size of|one of the (?:big|top|main)|billions? of (?:users|customers|dollars)|global reach|key (?:name|player|supplier)|behind the .+ boom)\b/i;

/** Valid market-scale openers — "[Company] is one of the biggest…" is allowed. */
const SCALE_OPENING_RE =
  /\b(is one of the|are one of the|is among the|is a (?:major|dominant|top|key)|is the (?:biggest|largest|leading)|has become one of)\b/i;

/** Customer-pain template wrongly applied to scale / revenue / financials cards. */
const CUSTOMER_PAIN_DRIFT_RE =
  /\b(lag|stutter|slow down|feels slow|apps? struggle|without (?:this|them)|devices aren'?t fast|running too many apps|AI (?:chat )?takes forever)\b/i;

const CORPORATE_OPENING_RE = [
  /^(?:[A-Z][A-Za-z0-9&.'-]+\s+){0,2}(?:is|provides?|offers?|delivers?|specializes|develops?)\b/i,
  /^they\s+(?:provide|offer|deliver|mainly|primarily)\b/i,
  /^the company\s+(?:is|provides?|offers?)\b/i,
  /^(?:their|the company'?s?)\s+(?:solutions?|technology|innovation)\b/i
];

export function analyzeHumanFirstStructure(
  plainEnglishAnswer: string,
  investorInsight?: string | null,
  intentOrContext?: QuestionIntent | QuestionIntentContext
): HumanFirstStructureResult {
  const intent =
    typeof intentOrContext === "string"
      ? intentOrContext
      : intentOrContext
        ? detectQuestionIntent(intentOrContext)
        : "general";

  const mainStory = extractMainStoryForAnalysis(plainEnglishAnswer);
  const first = splitIntoSentences(mainStory)[0] ?? mainStory.slice(0, 180);
  const wordCount = mainStory.split(/\s+/).filter(Boolean).length;
  const sentenceCount = splitIntoSentences(mainStory).length;

  const hasRealLifeOpening =
    REAL_LIFE_OPENING_RE.test(first) ||
    (intent === "market_scale" &&
      (SCALE_SIGNAL_RE.test(first) || SCALE_OPENING_RE.test(first))) ||
    (intent === "financials" &&
      /\b(paycheck|bill|price tag|rent|income|budget|small business|wallet)\b/i.test(
        first
      ));

  const hasPainOrProblem = PAIN_PROBLEM_RE.test(mainStory);
  const hasConsequence =
    CONSEQUENCE_RE.test(mainStory) || (hasPainOrProblem && /\bwithout\b/i.test(mainStory));
  const hasAnalogy = ANALOGY_RE.test(mainStory);
  const hasScaleSignal = SCALE_SIGNAL_RE.test(mainStory);
  const scaleStyleOpening =
    intent === "market_scale" &&
    (SCALE_OPENING_RE.test(first) || SCALE_SIGNAL_RE.test(first));
  const hasCorporateOpening =
    !scaleStyleOpening && CORPORATE_OPENING_RE.some((re) => re.test(first));
  const tooLong = wordCount > 95 || sentenceCount > 4;
  const missingWhyInvestorsCare =
    !/why investors care:/i.test(plainEnglishAnswer) &&
    !investorInsight?.trim();

  const painDriftIntents: QuestionIntent[] = [
    "market_scale",
    "how_they_make_money",
    "financials",
    "what_company_does"
  ];
  const hasWrongIntentTemplate =
    painDriftIntents.includes(intent) &&
    CUSTOMER_PAIN_DRIFT_RE.test(mainStory) &&
    !(intent === "market_scale" && hasScaleSignal);

  const flags: string[] = [];
  if (hasCorporateOpening) flags.push("corporate_opening");
  if (!hasRealLifeOpening) flags.push("weak_real_life_opening");
  if (hasWrongIntentTemplate) flags.push("wrong_question_template");
  if (tooLong) flags.push("too_long");
  if (missingWhyInvestorsCare) flags.push("missing_why_investors_care");

  let needsAnalogy = true;
  if (intent === "customer_problem") {
    if (!hasPainOrProblem) flags.push("missing_customer_pain");
    if (!hasAnalogy && !hasConsequence) flags.push("missing_analogy");
  } else if (intent === "market_scale") {
    if (!hasScaleSignal) flags.push("missing_scale_or_market_position");
    needsAnalogy = true;
  } else if (intent === "financials") {
    needsAnalogy = false;
    if (
      !/\b(paycheck|bill|price|rent|income|budget|wallet|small business|household|everyday)\b/i.test(
        mainStory
      ) &&
      !/\$|\d+\s*%|\d+\s*(?:billion|million)/i.test(mainStory)
    ) {
      flags.push("missing_money_comparison");
    }
  } else if (intent === "how_they_make_money") {
    needsAnalogy = false;
    if (!/\b(pay|buy|purchase|subscription|revenue|money|earn|sell|customer|region)\b/i.test(mainStory)) {
      flags.push("missing_revenue_framing");
    }
  }

  if (needsAnalogy && !hasAnalogy) flags.push("missing_analogy");

  const strictPass =
    hasRealLifeOpening &&
    !hasCorporateOpening &&
    !tooLong &&
    !missingWhyInvestorsCare &&
    !hasWrongIntentTemplate &&
    (needsAnalogy ? hasAnalogy : true) &&
    !flags.some((f) =>
      [
        "missing_customer_pain",
        "missing_scale_or_market_position",
        "missing_money_comparison",
        "missing_revenue_framing"
      ].includes(f)
    );

  return {
    pass: strictPass,
    flags,
    intent,
    hasRealLifeOpening,
    hasPainOrProblem,
    hasConsequence,
    hasAnalogy,
    hasScaleSignal,
    hasWrongIntentTemplate,
    hasCorporateOpening,
    tooLong,
    missingWhyInvestorsCare
  };
}

function extractMainStoryForAnalysis(text: string): string {
  const trimmed = text.trim();
  const cut = trimmed.match(/\n\s*Why investors care:\s*/i);
  if (cut?.index != null) return trimmed.slice(0, cut.index).trim();
  return trimmed.replace(/\n\s*Why it matters:\s*[\s\S]*$/i, "").trim();
}

export function describeHumanFirstFailure(result: HumanFirstStructureResult): string {
  const parts: string[] = [];
  if (result.hasWrongIntentTemplate) {
    parts.push(
      `answered like a customer-pain card but question type is ${result.intent} — match the card question`
    );
  }
  if (result.hasCorporateOpening) parts.push("opens like a corporate brochure");
  if (!result.hasRealLifeOpening) parts.push("missing real-life opening");
  if (result.flags.includes("missing_customer_pain")) {
    parts.push("missing everyday customer pain for this problem card");
  }
  if (result.flags.includes("missing_scale_or_market_position")) {
    parts.push("missing how big / market position — not customer lag");
  }
  if (result.flags.includes("missing_money_comparison")) {
    parts.push("missing everyday money comparison for financials");
  }
  if (result.flags.includes("missing_revenue_framing")) {
    parts.push("missing how/where the company makes money");
  }
  if (!result.hasAnalogy && result.flags.includes("missing_analogy")) {
    parts.push('missing "Think of it like…" analogy');
  }
  if (result.tooLong) parts.push("too long — max 4 short sentences");
  if (result.missingWhyInvestorsCare) parts.push('missing "Why investors care:" line');
  return parts.join("; ") || "failed human-first structure";
}

export function buildPillarSystemPrompt(params: {
  roleIntro: string;
  factsBlock: string;
  cardFocusBlock: string;
  extraBlock?: string;
}): string {
  return [
    params.roleIntro,
    "",
    QUEST_BEGINNER_VOICE,
    "",
    params.factsBlock,
    "",
    QUEST_ANSWER_FORMAT,
    "",
    "CARD FOCUS",
    params.cardFocusBlock,
    params.extraBlock ? `\n${params.extraBlock}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}
