/**
 * Lightweight, encouraging recall check for repeated Key Terms.
 * Mirrors the Investor Challenge grader: lenient plain-English matching,
 * never punishes — any signal of the core idea counts as remembered.
 */

export type TermRecallEvaluation = {
  correct: boolean;
  wordCount: number;
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordMatched(needle: string, normalized: string): boolean {
  const stem = needle.toLowerCase().trim();
  if (!stem) return false;
  if (stem.includes(" ")) {
    return normalized.includes(stem);
  }
  const pattern = new RegExp(`(?:^|\\s)${escapeRegExp(stem)}[a-z0-9]*\\b`);
  return pattern.test(normalized);
}

/**
 * Passes when the learner's sentence shows they remember the idea.
 * @param response  Learner's one-sentence explanation.
 * @param keywords  Plain-English stems that signal understanding.
 * @param minWords  Soft floor so blank/one-word answers don't pass.
 */
export function evaluateTermRecall(
  response: string,
  keywords: readonly string[],
  minWords = 3
): TermRecallEvaluation {
  const trimmed = response.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const normalized = normalizeText(trimmed);

  if (wordCount < minWords || normalized.length < 4) {
    return { correct: false, wordCount };
  }

  const correct = keywords.some((keyword) => keywordMatched(keyword, normalized));
  return { correct, wordCount };
}
