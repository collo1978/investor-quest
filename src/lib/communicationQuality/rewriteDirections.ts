import { WARNING_COPY } from "@/lib/communicationQuality/categoryLabels";
import type { CommunicationCategoryId } from "@/lib/communicationQuality/types";

/** Operator-facing rewrite guidance per warning code. */
export const REWRITE_DIRECTION: Record<string, string> = {
  spec_sheets:
    "Replace insider/tech terms with what the product does for a normal person.",
  stickiness:
    "Describe loyalty in plain words — repeat use, habit, or customers coming back.",
  leverages:
    "Use simpler everyday language focused on real customer experience, not corporate strategy verbs.",
  operates_across:
    "Name specific products or customer moments instead of 'operates across' phrasing.",
  provides_solutions:
    "Say what the company sells or delivers in one concrete sentence.",
  designs_and_sells:
    "Open with what customers buy or use, not a corporate capability list.",
  in_simple_terms:
    "Remove teacher wrap-ups — answer the question directly in the first sentence.",
  em_dash:
    "Split into two short sentences; avoid em dashes on mobile.",
  forced_analogy:
    "Drop the forced analogy — explain the fact directly with a real example.",
  investor_drift:
    "Move investor takeaway to the end; lead with the answer to the card question.",
  question_drift:
    "Rewrite so the first sentence answers the card question, then add context.",
  question_drift_problem:
    "Describe the everyday customer problem first, in words a beginner would use.",
  ai_phrasing:
    "Sound like a smart friend — shorter sentences, fewer buzzwords, one clear example.",
  textbook_tone:
    "Use conversational language; imagine explaining to a curious friend, not a textbook.",
  clever_meta:
    "Delete the clever opener — start with the direct answer.",
  too_long:
    "Cut length by ~30%; one idea per sentence; max ~3 short paragraphs.",
  dense_sentences:
    "Break long sentences apart; define any necessary term inline once.",
  missing_real_life:
    "Add one real-world example (product, place, or habit) so readers can picture it.",
  missing_why_investors_care:
    "Add one line on why this matters for investors after explaining the fact.",
  template_fallback:
    "Run regeneration or demo content refresh — no player-facing placeholder text.",
  empty: "Generate real copy before demo — card is blank.",
  corporate_opening:
    "Replace SEC-style opener with what the business does for customers.",
  soft_jargon_stack:
    "Remove stacked buzzwords; pick one plain phrase per idea.",
  innovation_filler:
    "Replace 'innovation' with a concrete result customers notice.",
  landscape: "Name the specific market or competitors instead of 'landscape'.",
  infrastructure:
    "Explain the tech in plain terms — what it enables for users or customers.",
  hyperscaler:
    "Say 'large cloud providers' or name one example if needed.",
  ecosystem_buzz:
    "Describe the network of products/partners plainly without 'ecosystem'.",
  stakeholders:
    "Name who you mean — customers, employees, partners, or investors.",
  solutions: "Say what is sold or delivered instead of 'solutions'.",
  hard_jargon:
    "Define the term inline once, or swap for everyday words a beginner knows."
};

export function reasonForWarningCode(code: string, fallbackMessage?: string): string {
  return WARNING_COPY[code] ?? fallbackMessage ?? `Flagged pattern: ${code.replace(/_/g, " ")}`;
}

export function rewriteDirectionForCode(code: string, categoryId?: CommunicationCategoryId): string {
  if (REWRITE_DIRECTION[code]) return REWRITE_DIRECTION[code];

  if (categoryId === "jargon_detection") {
    return "Swap finance/tech/corporate words for everyday language a first-time investor understands.";
  }
  if (categoryId === "beginner_friendliness") {
    return "Assume zero prior finance knowledge — short sentences, concrete examples.";
  }
  if (categoryId === "conversational_tone" || categoryId === "human_tone") {
    return "Write like a smart friend explaining over coffee, not a press release.";
  }
  if (categoryId === "question_alignment") {
    return "First sentence must answer the card question; cut tangents.";
  }
  if (categoryId === "cognitive_load") {
    return "Reduce density — one idea per sentence, fewer clauses.";
  }
  if (categoryId === "investor_clarity") {
    return "Add why this fact matters for someone deciding whether to own the stock.";
  }

  return "Shorten, simplify, and tie the copy back to the card question.";
}
