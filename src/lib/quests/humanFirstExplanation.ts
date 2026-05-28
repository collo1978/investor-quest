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
import {
  answerDriftsFromQuestion,
  CUSTOMER_PROBLEM_FOCUS_RE,
  hasCustomerProblemMetaOpening,
  hasInvestorDriftInMainStory,
  QUEST_CARD_FOCUS_RULES
} from "@/lib/quests/questionFocusGate";
import { splitIntoSentences } from "@/lib/quests/scannableAnswer";
import {
  CUSTOMER_AUDIENCE_HARD_RULES,
  hasGenericCustomerAudiencePhrasing,
  hasTargetCustomerFocus
} from "@/lib/quests/customerAudienceCopy";
import {
  INNOVATION_RD_HARD_RULES,
  hasInnovationRdFocus,
  hasInnovationRdQualityIssue
} from "@/lib/quests/innovationRdCopy";
import { QUEST_COPY_GLOBAL_RULES_TEXT } from "@/lib/quests/questCopyRules";
import {
  DIRECT_PROSE_VOICE_RULES,
  DRAMATIC_NARRATION_RE,
  EM_DASH_IN_COPY_RE
} from "@/lib/quests/directProseCopy";

export type { QuestionIntent, QuestionIntentContext } from "@/lib/quests/questionIntent";
export {
  detectQuestionIntent,
  buildIntentPromptFooter,
  QUESTION_INTENT_LABELS
} from "@/lib/quests/questionIntent";

export const HUMAN_FIRST_MISSION = `MISSION
Investor Quest should feel like a smart friend explaining what matters to investors — NOT a cleaned-up SEC filing, Wikipedia, or textbook.

Target reaction: "Ohhh, now I get why investors care about this company."`;

export const INSIGHT_DRIVEN_STYLE_ANCHOR = `INSIGHT-DRIVEN STYLE (match this rhythm on visible cards)
"Apple makes tech products people use every day, like iPhones, Macs, iPads, AirPods, and Apple Watches.

Apple also earns recurring revenue from services like the App Store, iCloud, and Apple Music after the device is sold.

Why investors care:
Repeat spending from the same customers is steadier than one-off hardware sales."

Every supporting sentence must TEACH something concrete (money, habit, risk, scale). Not dramatic pivots.

Good sentence 2 examples:
- "Apple also earns recurring revenue from services."
- "Services help Apple make money after the device is sold."
- "The ecosystem encourages customers to stay with Apple products."
- "Recurring subscriptions create more stable revenue."

Banned cinematic filler (auto-rejected):
- "But the real story is bigger than the devices."
- "The twist:" / "There's more beneath the surface." / "The deeper story matters."
- Any line that sounds mysterious but teaches nothing.`;

export const HUMAN_FIRST_SIX_STEPS = `HUMAN-FIRST EXPLANATION ARCHITECTURE (flexible mental model)
Match the CARD QUESTION — use the pattern for that question type (see intent footer on each card).

Common patterns (pick ONE that fits the question):
- What they do: what people actually use/buy → where money comes from → investor meaning (no forced analogy)
- Customer problem: what life feels like → what gets easier → everyday benefit (no investor analysis in the main story)
- Market scale: how big it feels in real life → why that position matters → investor meaning
- How they make money: what people pay for → main revenue source → investor meaning
- Risk/force: real-world risk → what could happen → filing fact → investor meaning
- Financials: money comparison → what the number shows → consequence → investor meaning

Always end with "Why investors care:" — one short line on growth, risk, trust, or strength.`;

export const HUMAN_FIRST_HARD_RULES = `HARD RULES (auto-rejected before save)
- No technical-first explanations (never open with what the company builds in engineering terms)
- No corporate / MBA / textbook tone ("designs and sells", "provides solutions", "landscape", "leverages", "ecosystem" as filler, "depends heavily on", "consumer demand")
- No SEC/Wikipedia voice — write like a smart friend, not a simplified annual report
- No "In simple terms", "Simple version", or teacher wrap-ups — say it clearly once
- No forced analogies ("Think of it like…", "Picture it like…", "It's like trying to…") — say it plainly instead
- No em dashes (—), en dashes (–), or double hyphens (--) in player copy. Use periods or commas instead.
- No dramatic narration ("that makes every judgment sharper", "the deeper story matters", "beneath the surface")
- No jargon unless translated into normal life in the same breath
- No long article-style answers (max 4 short sentences before "Why investors care:")
- No vague "innovation" unless you show a concrete everyday result
- R&D / moat cards: ${INNOVATION_RD_HARD_RULES.replace(/\n/g, " ")}
- Global card structure: ${QUEST_COPY_GLOBAL_RULES_TEXT.replace(/\n/g, " ").slice(0, 400)}…
- No cinematic filler: "the real story", "the twist", "bigger than the devices", "beneath the surface", "deeper story", or other dramatic lines that teach nothing
- Sentence 2+ must state a fact (revenue, habit, risk, scale) — smart, simple, educational — not marketing mystery
- Answer ONLY the card question; do not drift to investor takeaways, loyalty, or spec comparisons in the main story (exception: customer/audience cards may explain loyalty, ecosystem, and switching costs when the question asks who buys)
- No "spec sheets", "stickiness", or clever meta openings that skip the real customer problem
- Teenager picture test: if they cannot instantly picture it → rewrite`;

export const QUEST_BEGINNER_VOICE = `${HUMAN_FIRST_MISSION}

${INSIGHT_DRIVEN_STYLE_ANCHOR}

${HUMAN_FIRST_SIX_STEPS}

${HUMAN_FIRST_HARD_RULES}

${DIRECT_PROSE_VOICE_RULES}

VOICE
- Smart friend explaining investing — not a textbook, not a filing summary.
- TikTok clarity: one beat per sentence; read it aloud; if it sounds stiff, rewrite.
- Goal: "Ohhh… I get it now."
- Name real products, places, and money moves people already know.

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
- Good: "Apple earns most from iPhone. Services add recurring revenue on top."
- Bad: "The company's diversified revenue streams across multiple product categories…"
- R&D / moat quizzes: state what they invest in and the business impact — no buzzword stacks or "whatever's next."`;

export const WHY_IT_MATTERS_UI_VOICE = `WHY IT MATTERS (template labels on cards — keep under 22 words)
- One punchy line: what changes for people's wallets, habits, or risk if this is true.
- Good: "If people keep buying, the same customers keep paying."
- Bad: "Understanding X helps investors see where the company can grow."`;

export const VALUATION_EXPLANATION_VOICE = `VALUATION / PRICE CARDS (when applicable)
- Anchor price to something familiar: "costs about X movie tickets" or "one month of streaming."
- Pain: paying too much vs what you get; consequence: overpaying for hype.
- Never lead with P/E, EV/EBITDA, or multiples without translating what they mean in plain life.`;

/** Snapshot card-2 — "What problem does it solve for customers?" */
export const TARGET_CUSTOMER_CARD_PROMPT = CUSTOMER_AUDIENCE_HARD_RULES;

export const CUSTOMER_PROBLEM_CARD_PROMPT = `CUSTOMER PROBLEM CARD
The reader must instantly feel the real-world customer problem this company solves.
Pattern: what life feels like with them → concrete everyday example → how that helps (time, frustration, simplicity).
Stay on the problem the question asks. No investor analysis, spec sheets, stickiness, or loyalty economics in the main story.
Never: industries tour, solutions, innovation hype, "technology is crucial."`;

export const CUSTOMER_PROBLEM_STYLE_REFERENCE = `STYLE REFERENCE (customer problem — tone only):
"Apple makes technology feel simple and connected.

People can move photos, messages, apps, and files easily between devices without needing to think about it too much.

For many customers, Apple products save time, reduce frustration, and work smoothly together in everyday life.

Why investors care:
When daily life feels easier, people tend to stay with the same brand."`;

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
  hasInvestorDriftInMain: boolean;
  hasQuestionDrift: boolean;
  hasCinematicFiller: boolean;
  hasEmDash: boolean;
  hasGenericCustomerAudience: boolean;
  hasInnovationRdIssue: boolean;
  missingInnovationRdFocus: boolean;
  tooLong: boolean;
  missingWhyInvestorsCare: boolean;
};

/** Dramatic pivot lines that teach nothing — reject in player copy. */
export const CINEMATIC_FILLER_RE = DRAMATIC_NARRATION_RE;

const REAL_LIFE_OPENING_RE =
  /\b(when you|if you'?ve|you might|you've|you already|everyday|at home|on your phone|while |when a |if a |before you|after you|most people|anyone who|makes tech|makes everyday|makes technology|people use every|use every day|use constantly|people can move|for many customers)\b/i;

/** Forced analogy patterns — banned on all player-facing cards. */
export const FORCED_ANALOGY_RE =
  /\bthink of [\w']+ (?:like|as)\b|\bit'?s like trying to\b|\bpicture it like\b|\bcompare it to\b/i;

const CORPORATE_PHRASE_RE =
  /\b(designs and sells|operates across|provides solutions|offers a range of|delivers value|depends heavily on|consumer demand|in simple terms|simple version|a range of popular)\b/i;

const PAIN_PROBLEM_RE =
  /\b(without|frustrat|annoy|slow|lag|stutter|broken|expensive|confus|risk|struggle|hard to|can't|cannot|waiting|stuck|worry|lose|miss|fail|hurt)\b/i;

const CONSEQUENCE_RE =
  /\b(so |means |ends up|gets worse|can't |cannot |falls behind|costs more|takes longer|goes wrong|if that|when that)\b/i;

const ANALOGY_RE =
  /\bthink of (?:it|them|this|the|the company|nvidia|nvidia'?s|their|they) like\b|\bit'?s like\b|\bimagine\b|\blike trying to\b|\blike having a\b|\blike the difference\b|\blike a key\b|\blike the (?:engine|supplier|backbone|foundation)\b|\bpicture it like\b|\bcompare it to\b/i;

const SCALE_SIGNAL_RE =
  /\b(biggest|largest|leading|dominant|major player|market position|market share|well[- ]known|household name|scale|size of|one of the (?:big|top|main)|billions? of (?:users|customers|dollars)|global reach|key (?:name|player|supplier)|behind the .+ boom|big name|huge name|top name|powers much of|powering much of|important.{0,25}(?:ai|market|industr)|(?:ai|market).{0,25}important|central to|core of the|heart of the|main supplier|engine supplier|world['']?s)\b/i;

/** Valid market-scale openers — "[Company] is one of the biggest…" is allowed. */
const SCALE_OPENING_RE =
  /\b(is one of the|are one of the|is among the|is a (?:major|dominant|top|key|leading)|is the (?:biggest|largest|leading|world'?s)|has become one of|is a (?:big|huge|giant)|powers much of|behind much of)\b/i;

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
  const openingTwo = splitIntoSentences(mainStory).slice(0, 2).join(" ");
  const wordCount = mainStory.split(/\s+/).filter(Boolean).length;
  const sentenceCount = splitIntoSentences(mainStory).length;

  const hasRealLifeOpening =
    REAL_LIFE_OPENING_RE.test(first) ||
    /\b(investors?|customers?|people|users|shoppers|drivers|listeners)\b/i.test(
      first
    ) ||
    (intent === "market_scale" &&
      (SCALE_SIGNAL_RE.test(first) ||
        SCALE_OPENING_RE.test(first) ||
        SCALE_SIGNAL_RE.test(openingTwo))) ||
    (intent === "financials" &&
      /\b(paycheck|bill|price tag|rent|income|budget|small business|wallet|investor|stock|margin|profit|cash|growth|revenue|earn)\b/i.test(
        first
      )) ||
    (intent === "risk_force" || intent === "force_positive"
      ? /\b(if |when |prices?|rules?|regulat|demand|supply|compet|delay|cost)\b/i.test(
          first
        )
      : false) ||
    (intent === "target_customer" &&
      (hasTargetCustomerFocus(first) ||
        /\b(mainly sells|sells to|buyers?|customers? who|target|segment|enterprise|developers?)\b/i.test(
          first
        ))) ||
    (intent === "innovation_advantage" &&
      (/\b(invest|R&D|research|develop|improve|edge|moat|protect|proprietary|chips?|software|hardware|ecosystem)\b/i.test(
        first
      ) ||
        hasInnovationRdFocus(first)));

  const hasPainOrProblem = PAIN_PROBLEM_RE.test(mainStory);
  const hasConsequence =
    CONSEQUENCE_RE.test(mainStory) || (hasPainOrProblem && /\bwithout\b/i.test(mainStory));
  const hasAnalogy = ANALOGY_RE.test(mainStory);
  const hasScaleSignal = SCALE_SIGNAL_RE.test(mainStory);
  const scaleStyleOpening =
    intent === "market_scale" &&
    (SCALE_OPENING_RE.test(first) ||
      SCALE_SIGNAL_RE.test(first) ||
      SCALE_SIGNAL_RE.test(openingTwo));
  const hasForcedAnalogy = FORCED_ANALOGY_RE.test(mainStory);
  const hasCorporateOpening =
    !scaleStyleOpening &&
    (CORPORATE_PHRASE_RE.test(mainStory) ||
      CORPORATE_OPENING_RE.some((re) => re.test(first)));
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

  const intentCtx: QuestionIntentContext =
    typeof intentOrContext === "object" && intentOrContext
      ? intentOrContext
      : {};

  const hasInvestorDriftInMain =
    intent !== "financials" &&
    intent !== "target_customer" &&
    intent !== "innovation_advantage" &&
    hasInvestorDriftInMainStory(mainStory);

  const hasGenericCustomerAudience =
    intent === "target_customer" && hasGenericCustomerAudiencePhrasing(mainStory);

  const hasQuestionDrift =
    (intent === "customer_problem" &&
      (!CUSTOMER_PROBLEM_FOCUS_RE.test(mainStory) ||
        hasCustomerProblemMetaOpening(mainStory))) ||
    (intent === "target_customer" &&
      (hasGenericCustomerAudience || !hasTargetCustomerFocus(mainStory))) ||
    answerDriftsFromQuestion({
      intent,
      cardQuestion: intentCtx.cardQuestion,
      mainStory
    });

  const hasCinematicFiller = CINEMATIC_FILLER_RE.test(mainStory);
  const hasEmDash = EM_DASH_IN_COPY_RE.test(plainEnglishAnswer);
  const hasInnovationRdIssue =
    intent === "innovation_advantage" && hasInnovationRdQualityIssue(mainStory);
  const missingInnovationRdFocus =
    intent === "innovation_advantage" && !hasInnovationRdFocus(mainStory);

  const flags: string[] = [];
  if (hasCorporateOpening) flags.push("corporate_opening");
  if (hasForcedAnalogy) flags.push("forced_analogy");
  if (!hasRealLifeOpening) flags.push("weak_real_life_opening");
  if (hasWrongIntentTemplate) flags.push("wrong_question_template");
  if (hasInvestorDriftInMain) flags.push("investor_drift_in_main");
  if (hasQuestionDrift) flags.push("question_drift");
  if (hasCinematicFiller) flags.push("cinematic_filler");
  if (hasEmDash) flags.push("em_dash");
  if (hasGenericCustomerAudience) flags.push("generic_customer_audience");
  if (hasInnovationRdIssue) flags.push("innovation_rd_buzzword_or_hype");
  if (missingInnovationRdFocus) flags.push("missing_innovation_rd_focus");
  if (tooLong) flags.push("too_long");
  if (missingWhyInvestorsCare) flags.push("missing_why_investors_care");

  if (intent === "target_customer") {
    if (!hasTargetCustomerFocus(mainStory)) {
      flags.push("missing_target_customer_focus");
    }
  } else if (intent === "how_they_make_money") {
    if (
      !/\b(pay|buy|purchase|subscription|revenue|money|earn|sell|customer|region)\b/i.test(
        mainStory
      )
    ) {
      flags.push("missing_revenue_framing");
    }
  } else if (intent === "customer_problem") {
    if (!CUSTOMER_PROBLEM_FOCUS_RE.test(mainStory)) {
      flags.push("missing_problem_focus");
    }
  } else if (intent === "market_scale") {
    if (!hasScaleSignal) flags.push("missing_scale_or_market_position");
  } else if (intent === "innovation_advantage") {
    if (missingInnovationRdFocus) {
      flags.push("missing_innovation_rd_focus");
    }
  } else if (intent === "financials") {
    if (
      !/\b(paycheck|bill|price|rent|income|budget|wallet|small business|household|everyday|investor|margin|profit|cash|growth|revenue|earn|stock)\b/i.test(
        mainStory
      ) &&
      !/\$|\d+\s*%|\d+\s*(?:billion|million)/i.test(mainStory)
    ) {
      flags.push("missing_money_comparison");
    }
  }

  const strictPass =
    hasRealLifeOpening &&
    !hasCorporateOpening &&
    !hasForcedAnalogy &&
    !hasCinematicFiller &&
    !hasEmDash &&
    !hasGenericCustomerAudience &&
    !tooLong &&
    !missingWhyInvestorsCare &&
    !hasWrongIntentTemplate &&
    !hasInvestorDriftInMain &&
    !hasQuestionDrift &&
    !flags.some((f) =>
      [
        "missing_problem_focus",
        "missing_customer_pain",
        "missing_target_customer_focus",
        "generic_customer_audience",
        "missing_scale_or_market_position",
        "missing_money_comparison",
        "missing_revenue_framing",
        "missing_innovation_rd_focus",
        "innovation_rd_buzzword_or_hype"
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
    hasInvestorDriftInMain,
    hasQuestionDrift,
    hasCinematicFiller,
    hasEmDash,
    hasGenericCustomerAudience,
    hasInnovationRdIssue,
    missingInnovationRdFocus,
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
  if (result.hasInvestorDriftInMain) {
    parts.push("main story drifted into investor/analysis language too early");
  }
  if (result.hasQuestionDrift || result.flags.includes("question_drift")) {
    parts.push("answer does not stay focused on the card question");
  }
  if (result.hasCinematicFiller || result.flags.includes("cinematic_filler")) {
    parts.push(
      'cinematic filler ("the real story", "the twist", etc.). Use a direct educational fact instead'
    );
  }
  if (result.hasEmDash || result.flags.includes("em_dash")) {
    parts.push("em dash or double hyphen. Use periods or commas instead");
  }
  if (result.hasCorporateOpening) parts.push("corporate or SEC-style phrasing");
  if (result.flags.includes("forced_analogy")) {
    parts.push('forced analogy ("Think of it like…") — rewrite in plain language');
  }
  if (!result.hasRealLifeOpening) parts.push("missing real-life opening");
  if (result.flags.includes("missing_problem_focus")) {
    parts.push("missing the everyday customer problem this card asks about");
  }
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
  if (result.hasGenericCustomerAudience) {
    parts.push(
      'vague customer language ("regular people", "everyone", "upgrading phones") — name WHO buys and WHY'
    );
  }
  if (result.flags.includes("missing_target_customer_focus")) {
    parts.push(
      "missing target customer, value proposition, or business-model strength (loyalty, ecosystem, switching costs)"
    );
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
