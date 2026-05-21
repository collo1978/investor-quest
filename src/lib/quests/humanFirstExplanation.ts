/**
 * Human-First Explanation Architecture — platform-wide voice for Investor Quest.
 * All AI quest answers, rewrites, Prompt Studio scoring, and quiz copy should align here.
 */

import { splitIntoSentences } from "@/lib/quests/scannableAnswer";

export const HUMAN_FIRST_MISSION = `MISSION
Investor Quest should feel like a smart friend showing how companies work in normal life — NOT "AI summaries of financial filings."`;

export const HUMAN_FIRST_SIX_STEPS = `HUMAN-FIRST EXPLANATION ARCHITECTURE (required mental model)
1. REAL LIFE — Where does the reader already see or feel this? (phone, games, shopping, bills, work, health, travel)
2. PAIN / PROBLEM — What frustration, risk, or need exists?
3. CONSEQUENCE — What goes wrong if it stays unsolved? (slow, broken, expensive, confusing, unsafe)
4. MENTAL PICTURE — One "Think of it like…" analogy only if it helps (skip if the pain is already crystal clear)
5. WHAT THE COMPANY DOES — Plain everyday language; translate any jargon into what people notice
6. WHY INVESTORS CARE — One short line: growth, risk, trust, or business strength (after the label only)`;

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
- Sentence 1 MUST be everyday life — never open with what the company builds technically.
- Good: "If you've used a popular AI chat app…", "When your paycheck hits the account…"
- Bad: "[Company] develops…", "They provide solutions…", "Their technology is crucial…"

JARGON (zero tolerance — rewrite if found)
- BANNED: GPU, SDK, infrastructure, analytics, accelerated computing, data center, semiconductor, computing platform, cloud platform, hyperscaler, workload, ecosystem (buzzword), solutions (corporate), industries (vague tour), innovation (filler).
- Prefer: "chips that keep games smooth", "money left after bills", "rules that protect your data".

CUSTOMER PROBLEM QUESTIONS
- Lead: pain WITHOUT them → consequence → analogy → benefit WITH them.
- Good: "without this, games lag, AI feels slow, apps struggle to respond quickly."

BANNED IN STORY
- Section headings, bullets, "Bottom line", "What we know", corporate filler.`;

export const QUEST_ANSWER_FORMAT = `FORMAT (strict — maps to the 6-step architecture)
- NO markdown: no **, #, bullets (• - *), or backticks.
- NO headings inside the main story.

Write at most 4 short sentences, then one blank line and exactly:

Why investors care:
(one short sentence — growth, risk, trust, or strength)

Sentence map (flexible but keep this order in spirit):
1. REAL LIFE + PAIN — familiar moment and what's annoying or risky
2. CONSEQUENCE — what happens if it stays broken (or ANALOGY if consequence is already obvious)
3. WHAT THE COMPANY DOES — plain role in everyday life for THIS card only
4. OPTIONAL — one filing fact you cannot fold into sentence 3

- Answer ONLY this card's question. Do not repeat earlier cards.

STYLE REFERENCE (tone only — use THIS company's facts):
"If you've used a popular AI chat app or played a sharp-looking game, you've already bumped into NVIDIA's world.

Think of them like the shop that sells the engine inside many smart computers — not the app you tap on.

They make the powerful chips helping AI tools, games, and smart technology run faster and smoother.

Why investors care:
If AI and gaming keep growing, demand for those engines can keep rising."`;

export const HUMAN_FIRST_WRITE_INSTRUCTION =
  "Write the answer using the 6-step architecture (real life → pain → consequence → [analogy] → what they do); max 4 short sentences; then Why investors care:";

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
}): boolean {
  if (params.questSlug === "snapshot" && params.cardId === "card-2") return true;
  const q = params.cardQuestion?.toLowerCase() ?? "";
  return q.includes("problem") && q.includes("customer");
}

export function buildHumanFirstUserPromptFooter(options?: {
  customerProblem?: boolean;
}): string {
  if (options?.customerProblem) {
    return [
      "",
      CUSTOMER_PROBLEM_CARD_PROMPT,
      "",
      CUSTOMER_PROBLEM_STYLE_REFERENCE,
      "",
      "Write: pain WITHOUT them → consequence → analogy → benefit WITH them (max 4 sentences); then Why investors care:"
    ].join("\n");
  }
  return `\n${HUMAN_FIRST_WRITE_INSTRUCTION}`;
}

export type HumanFirstStructureResult = {
  pass: boolean;
  flags: string[];
  hasRealLifeOpening: boolean;
  hasPainOrProblem: boolean;
  hasConsequence: boolean;
  hasAnalogy: boolean;
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
  /\bthink of (?:it|them|this|the) like\b|\bit'?s like\b|\bimagine\b/i;

const CORPORATE_OPENING_RE = [
  /^(?:[A-Z][A-Za-z0-9&.'-]+\s+){0,2}(?:is|provides?|offers?|delivers?|specializes|develops?)\b/i,
  /^they\s+(?:provide|offer|deliver|mainly|primarily)\b/i,
  /^the company\s+(?:is|provides?|offers?)\b/i,
  /^(?:their|the company'?s?)\s+(?:solutions?|technology|innovation)\b/i
];

export function analyzeHumanFirstStructure(
  plainEnglishAnswer: string,
  investorInsight?: string | null
): HumanFirstStructureResult {
  const mainStory = extractMainStoryForAnalysis(plainEnglishAnswer);
  const combined = [mainStory, investorInsight].filter(Boolean).join(" ");
  const first = splitIntoSentences(mainStory)[0] ?? mainStory.slice(0, 180);
  const wordCount = mainStory.split(/\s+/).filter(Boolean).length;
  const sentenceCount = splitIntoSentences(mainStory).length;

  const hasRealLifeOpening = REAL_LIFE_OPENING_RE.test(first);
  const hasPainOrProblem = PAIN_PROBLEM_RE.test(mainStory);
  const hasConsequence =
    CONSEQUENCE_RE.test(mainStory) || (hasPainOrProblem && /\bwithout\b/i.test(mainStory));
  const hasAnalogy = ANALOGY_RE.test(mainStory);
  const hasCorporateOpening = CORPORATE_OPENING_RE.some((re) => re.test(first));
  const tooLong = wordCount > 95 || sentenceCount > 4;
  const missingWhyInvestorsCare =
    !/why investors care:/i.test(plainEnglishAnswer) &&
    !investorInsight?.trim();

  const flags: string[] = [];
  if (hasCorporateOpening) flags.push("corporate_opening");
  if (!hasRealLifeOpening) flags.push("weak_real_life_opening");
  if (!hasAnalogy) flags.push("missing_analogy");
  if (tooLong) flags.push("too_long");
  if (missingWhyInvestorsCare) flags.push("missing_why_investors_care");

  const strictPass =
    hasRealLifeOpening &&
    hasAnalogy &&
    !hasCorporateOpening &&
    !tooLong &&
    !missingWhyInvestorsCare;

  return {
    pass: strictPass,
    flags,
    hasRealLifeOpening,
    hasPainOrProblem,
    hasConsequence,
    hasAnalogy,
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
  if (result.hasCorporateOpening) parts.push("opens like a corporate brochure");
  if (!result.hasRealLifeOpening) parts.push("missing real-life opening");
  if (!result.hasAnalogy) parts.push('missing "Think of it like…" analogy');
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
