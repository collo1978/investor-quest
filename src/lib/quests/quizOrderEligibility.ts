/**
 * Ranking / order quiz eligibility.
 *
 * Order questions require every step to be plausibly rankable (revenue size,
 * sequence, importance). Standard multiple-choice distractors — one correct
 * answer plus joke or obviously wrong options — must NOT become ranking tasks.
 */
import type { MultipleChoiceQuestion, OrderQuestion } from "@/data/quests/types";

/** Prompt language that signals intentional ordering content. */
const ORDERING_PROMPT_PATTERNS = [
  /\b(rank|ranking|order|sequence|chronolog)/i,
  /\b(most to least|least to most|largest to smallest|smallest to largest)\b/i,
  /\b(first to last|last to first|earliest to latest|latest to earliest)\b/i,
  /\b(put these in order|arrange these|timeline)\b/i
] as const;

/**
 * Distractor phrases that are clearly not part of a meaningful ranking set.
 * Used to block MC → order transforms for recall-style checkpoints.
 */
const OBVIOUS_ABSURD_DISTRACTOR_PATTERNS = [
  /lottery/i,
  /collect stamps?/i,
  /coffee shop/i,
  /grocery store/i,
  /office furniture/i,
  /paper money/i,
  /prints? paper/i,
  /logo colou?r/i,
  /exact share price/i,
  /tomorrow'?s exact/i,
  /phone app in 20\d{2}/i,
  /copied a phone/i,
  /nobody outside/i,
  /one small town/i,
  /never changed since/i,
  /refuses to work with/i,
  /only need the logo/i,
  /replace(s)? reading any financial/i,
  /passenger airline/i,
  /movie theatre/i,
  /posters for/i,
  /paper notebooks/i,
  /chain of grocery/i,
  /household goods/i,
  /won a lottery/i,
  /stamp collectors?/i,
  /headquarters only/i,
  /only sells? office/i,
  /only one product with no software/i,
  /stopped making chips and only sells cloud/i
] as const;

/** Domains that signal a choice is a joke option, not a rankable business fact. */
const UNRELATED_BUSINESS_DOMAIN_PATTERNS = [
  /\b(grocery|supermarket|furniture|airline|coffee|cafe|stamp|lottery|banknote|posters?|theatre|theater)\b/i
] as const;

export function promptSuggestsOrdering(prompt: string): boolean {
  return ORDERING_PROMPT_PATTERNS.some((pattern) => pattern.test(prompt));
}

export function isObviousAbsurdDistractor(choice: string): boolean {
  const trimmed = choice.trim();
  if (!trimmed) return true;
  if (OBVIOUS_ABSURD_DISTRACTOR_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return true;
  }
  return UNRELATED_BUSINESS_DOMAIN_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function wrongChoices(mc: MultipleChoiceQuestion): string[] {
  return mc.choices.filter((_, index) => index !== mc.correctIndex);
}

function hasExplicitRankingSteps(mc: MultipleChoiceQuestion): boolean {
  return Array.isArray(mc.rankingSteps) && mc.rankingSteps.length >= 3;
}

/**
 * True when a multiple-choice source can become a meaningful order/ranking question.
 */
export function canMcSupportOrderRanking(mc: MultipleChoiceQuestion): boolean {
  if (mc.supportsRanking === false) return false;
  if (mc.supportsRanking === true) return true;
  if (hasExplicitRankingSteps(mc)) return true;

  if (mc.choices.length < 3) return false;

  const wrongs = wrongChoices(mc);
  if (wrongs.length < 2) return false;

  if (wrongs.some(isObviousAbsurdDistractor)) return false;

  // Standard recall MC: one best answer + interchangeable wrongs — not rankable.
  if (!promptSuggestsOrdering(mc.prompt)) return false;

  // Ordering prompt but every option must still look like a real, gradable fact.
  return mc.choices.every((choice) => !isObviousAbsurdDistractor(choice));
}

/** Validate a native order question before shipping or scoring. */
export function canOrderQuestionSupportRanking(question: OrderQuestion): boolean {
  if (question.steps.length < 3) return false;
  return !question.steps.some(isObviousAbsurdDistractor);
}
