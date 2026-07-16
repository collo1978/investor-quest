import type {
  InvestorChallengeConceptGroup,
  InvestorChallengeDef,
  InvestorChallengeOutcome
} from "@/lib/business/businessInvestorChallengeFlow";

export type InvestorChallengeEvaluation = {
  outcome: InvestorChallengeOutcome;
  headline: string;
  matchedLabels: readonly string[];
  missedLabels: readonly string[];
  wordCount: number;
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Escape for safe RegExp construction from stems/phrases. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Schools-friendly concept match: stem/phrase appears as a word (or start of a word),
 * so "chip" matches chips/chipset, "graphic" matches graphics, etc.
 */
function tokenOrPhraseMatched(needle: string, normalized: string): boolean {
  const stem = needle.toLowerCase().trim();
  if (!stem) return false;

  if (stem.includes(" ")) {
    return normalized.includes(stem);
  }

  const pattern = new RegExp(`(?:^|\\s)${escapeRegExp(stem)}[a-z0-9]*\\b`);
  return pattern.test(normalized);
}

function groupMatched(group: InvestorChallengeConceptGroup, normalized: string): boolean {
  return group.keywords.some((keyword) => tokenOrPhraseMatched(keyword, normalized));
}

/**
 * Schools Investor Challenge grade.
 * Rewards plain-English understanding of the core idea — not grammar,
 * length, or full keyword coverage. Fail only when the idea is missing.
 */
export function evaluateInvestorChallengeResponse(
  response: string,
  def: InvestorChallengeDef
): InvestorChallengeEvaluation {
  const trimmed = response.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const normalized = normalizeText(trimmed);

  if (wordCount < def.minWords || normalized.length < 4) {
    return {
      outcome: "retry",
      headline: "📖 Say a bit more in your own words — what is the key idea?",
      matchedLabels: [],
      missedLabels: def.conceptGroups.map((group) => group.label),
      wordCount
    };
  }

  const matchedLabels: string[] = [];
  const missedLabels: string[] = [];

  for (const group of def.conceptGroups) {
    if (groupMatched(group, normalized)) {
      matchedLabels.push(group.label);
    } else {
      missedLabels.push(group.label);
    }
  }

  // Schools bar: capturing any core idea is enough to pass and progress.
  if (matchedLabels.length > 0) {
    const outcome: InvestorChallengeOutcome =
      matchedLabels.length === def.conceptGroups.length ? "great" : "good";
    return {
      outcome,
      headline:
        outcome === "great"
          ? "✅ Nice — you explained the key idea in your own words"
          : "✅ Good understanding — you got the main idea",
      matchedLabels,
      missedLabels,
      wordCount
    };
  }

  return {
    outcome: "retry",
    headline: "📖 Close — focus on the main idea from the evidence, then try again",
    matchedLabels: [],
    missedLabels: def.conceptGroups.map((group) => group.label),
    wordCount
  };
}

export function buildInvestorChallengeFeedback(
  evaluation: InvestorChallengeEvaluation
): string {
  if (evaluation.outcome === "great" || evaluation.outcome === "good") {
    return evaluation.headline;
  }

  const hint = evaluation.missedLabels[0];
  if (hint) {
    return `${evaluation.headline} Think about: ${hint}.`;
  }
  return evaluation.headline;
}
