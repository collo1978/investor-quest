/**
 * Ensures generated answers stay tied to the card question — not investor meta-commentary.
 */

import type { QuestionIntent } from "@/lib/quests/questionIntent";

/** Main story talks about the customer problem or how life gets easier. */
export const CUSTOMER_PROBLEM_FOCUS_RE =
  /\b(simple|connected|save time|sav(?:e|es|ing) time|reduce frustration|frustrat|hassle|without (?:needing|thinking)|work smoothly|work together|feel simple|easily between|between devices|everyday life|solve|helps? (?:people|customers|users)|make(?:s)? (?:tech|technology|life|things) (?:feel )?simple|move (?:photos|messages|apps|files)|photos|messages|apps|files)\b/i;

/** Investor/analysis language in the main story (too early for most cards). */
export const INVESTOR_DRIFT_IN_MAIN_RE =
  /\b(spec sheets?|stickiness|investors? (?:watch|care|pay attention)|pricing power|margins?|recurring revenue|market position|ecosystem strength|customer loyalty|valuation|the product, not|revenue driver|top[- ]line|bottom line|shareholders?)\b/i;

/** Clever meta framing that skips the actual problem. */
export const CUSTOMER_PROBLEM_META_OPENING_RE =
  /\bmost people don'?t buy .+ because they (?:love|care about)\b/i;

const INTENT_QUESTION_KEYWORDS: Partial<
  Record<QuestionIntent, readonly RegExp[]>
> = {
  target_customer: [
    /\b(customer|buyer|user|client|audience|segment|premium|enterprise|loyal|ecosystem|switch)\b/i
  ],
  customer_problem: [
    /\b(problem|solve|pain|frustrat|help|simple|connected|save time|hassle)\b/i
  ],
  what_company_does: [
    /\b(use|buy|sell|product|service|make|does|offer)\b/i
  ],
  market_scale: [/\b(big|large|scale|size|position|leading|major|phenomenon)\b/i],
  how_they_make_money: [
    /\b(money|revenue|earn|pay|buy|subscription|region|customer)\b/i
  ],
  innovation_advantage: [
    /\b(r&d|research|develop|innovation|moat|advantage|protect|patent|proprietary|ecosystem|competitor|copy)\b/i
  ],
  financials: [/\b(growth|profit|cash|margin|revenue|debt|earn|money)\b/i],
  risk_force: [/\b(risk|wrong|hurt|threat|could|if|when|regulat|compet)\b/i],
  force_positive: [/\b(strength|help|advantage|tailwind|upside|better)\b/i]
};

/** Question asks X but answer never touches related ideas. */
export function answerDriftsFromQuestion(params: {
  intent: QuestionIntent;
  cardQuestion?: string | null;
  mainStory: string;
}): boolean {
  const q = params.cardQuestion?.trim() ?? "";
  const story = params.mainStory.trim();
  if (!q || !story) return false;

  const intentPatterns = INTENT_QUESTION_KEYWORDS[params.intent];
  if (!intentPatterns?.length) return false;

  const qLower = q.toLowerCase();
  const questionSignals = intentPatterns.some((re) => re.test(qLower));
  if (!questionSignals) return false;

  const storyMatchesIntent = intentPatterns.some((re) => re.test(story));
  if (storyMatchesIntent) return false;

  if (params.intent === "customer_problem") {
    return !CUSTOMER_PROBLEM_FOCUS_RE.test(story);
  }

  if (params.intent === "target_customer") {
    return !/\b(customer|buyer|user|client|segment|premium|enterprise|loyal|ecosystem|switch|pay)\b/i.test(
      story
    );
  }

  return true;
}

export function hasInvestorDriftInMainStory(mainStory: string): boolean {
  return INVESTOR_DRIFT_IN_MAIN_RE.test(mainStory);
}

export function hasCustomerProblemMetaOpening(mainStory: string): boolean {
  const first =
    mainStory.split(/\n+/)[0]?.trim() ?? mainStory.slice(0, 160);
  return CUSTOMER_PROBLEM_META_OPENING_RE.test(first);
}

export const QUEST_CARD_FOCUS_RULES = `QUESTION FOCUS (critical)
- Answer ONLY the card question in the main story. Do not drift to a different angle.
- Do NOT open with investor analysis, loyalty economics, or "why investors care" ideas in the main story.
- Do NOT use meta lines like "Most people don't buy X because they love Y" unless you immediately explain the real customer problem.
- BANNED in main story: spec sheets, stickiness, pricing power, margins, recurring revenue (unless the card asks about money).
- Name concrete everyday moments (photos, messages, devices, bills, lines at the store) the reader can picture.`;
