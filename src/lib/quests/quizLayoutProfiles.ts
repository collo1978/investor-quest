/**
 * Quiz layout profiles — one distinct visual shell per mini-game type.
 * Section quizzes must never repeat the same layout in one 5-question run.
 */
import type { QuizQuestion, QuizQuestionKind } from "@/data/quests/types";

export type QuizLayoutProfile =
  | "mc-vertical-cards"
  | "tf-split-verdict"
  | "fb-drop-zone-chips"
  | "ooo-card-grid"
  | "ord-ranked-steps"
  | "match-pair-columns"
  | "scenario-brief-rows";

const KIND_LAYOUT: Partial<Record<QuizQuestionKind, QuizLayoutProfile>> = {
  "multiple-choice": "mc-vertical-cards",
  scenario: "scenario-brief-rows",
  "true-false": "tf-split-verdict",
  "fill-blank": "fb-drop-zone-chips",
  "odd-one-out": "ooo-card-grid",
  order: "ord-ranked-steps",
  match: "match-pair-columns",
  "red-flag": "ooo-card-grid",
  "bull-bear": "tf-split-verdict",
  "risk-meter": "fb-drop-zone-chips",
  "swipe-cards": "ooo-card-grid"
};

export function quizLayoutProfileForKind(
  kind: QuizQuestionKind
): QuizLayoutProfile {
  return KIND_LAYOUT[kind] ?? "mc-vertical-cards";
}

export function quizLayoutProfileForQuestion(
  question: QuizQuestion
): QuizLayoutProfile {
  return quizLayoutProfileForKind(question.kind);
}

/** Kinds that embed their own prompt inside the interaction shell. */
export function usesIntegratedQuizPrompt(kind: QuizQuestionKind): boolean {
  return (
    kind === "true-false" ||
    kind === "odd-one-out" ||
    kind === "order" ||
    kind === "match"
  );
}

export function layoutProfileLabel(profile: QuizLayoutProfile): string {
  switch (profile) {
    case "mc-vertical-cards":
      return "Multiple choice";
    case "tf-split-verdict":
      return "True or false";
    case "fb-drop-zone-chips":
      return "Fill in the blank";
    case "ooo-card-grid":
      return "Odd one out";
    case "ord-ranked-steps":
      return "Correct order";
    case "match-pair-columns":
      return "Match pairs";
    case "scenario-brief-rows":
      return "Scenario";
  }
}

export function findDuplicateLayoutProfiles(
  questions: readonly QuizQuestion[]
): { index: number; profile: QuizLayoutProfile; firstIndex: number }[] {
  const seen = new Map<QuizLayoutProfile, number>();
  const dupes: { index: number; profile: QuizLayoutProfile; firstIndex: number }[] =
    [];

  questions.forEach((question, index) => {
    const profile = quizLayoutProfileForQuestion(question);
    const first = seen.get(profile);
    if (first != null) {
      dupes.push({ index, profile, firstIndex: first });
    } else {
      seen.set(profile, index);
    }
  });

  return dupes;
}

export function assertUniqueQuizLayouts(
  questions: readonly QuizQuestion[],
  context?: string
): void {
  const dupes = findDuplicateLayoutProfiles(questions);
  if (dupes.length === 0) return;
  const prefix = context ? `${context}: ` : "";
  const detail = dupes
    .map(
      (d) =>
        `Q${d.index + 1} repeats layout "${layoutProfileLabel(d.profile)}" (same as Q${d.firstIndex + 1})`
    )
    .join("; ");
  throw new Error(`${prefix}Quiz layout variety violated — ${detail}`);
}
