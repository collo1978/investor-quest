/**
 * Investor Quest — quiz format variety (global design rule).
 *
 * Within a single quiz:
 * 1. Never place two questions with the same `kind` next to each other.
 * 2. Standard 3-question checkpoints: all three kinds must differ
 *    (e.g. MC → T/F → fill-blank — recall, understanding, completion).
 *
 * @see QUIZ_FORMAT_VARIETY_GUIDELINES
 */
import type { QuizQuestion } from "@/data/quests/types";
import { QUIZ_FORMAT_REGISTRY } from "@/data/quests/types";

/** Player-facing labels for authoring docs and error messages. */
export const QUIZ_FORMAT_LABELS: Readonly<Record<QuizQuestion["kind"], string>> =
  Object.fromEntries(
    QUIZ_FORMAT_REGISTRY.map((f) => [f.kind, f.label])
  ) as Record<QuizQuestion["kind"], string>;

export const QUIZ_FORMAT_VARIETY_GUIDELINES = `
Quiz format variety (every quest checkpoint)

Rules:
1. Never use the same question format twice in a row.
2. Standard 3-question quizzes: use three different formats (not MC → T/F → MC).

Reference pattern (Quest Card 1 / what-they-do):
- Q1 Multiple choice — recall what the company sells
- Q2 True / false — test understanding of a core idea
- Q3 Complete the sentence (fill-blank) — finish the insight in your own head

Other allowed formats (rotate in):
- Scenario-based
- Which customer? / investor lens
- Match the concept (when renderer ships)

Good (3 questions):
- MC → T/F → fill-blank
- MC → T/F → scenario
- fill-blank → MC → scenario

Avoid:
- MC → MC → MC
- MC → T/F → MC (Q3 feels like Q1 again)
- T/F → T/F → MC

Applies to Schools demos, company overrides, pillar defaults, and generated quizzes.
`.trim();

export type QuizFormatVarietyViolation = {
  index: number;
  kind: QuizQuestion["kind"];
  label: string;
  previousKind?: QuizQuestion["kind"];
  previousLabel?: string;
  /** Repeated kind elsewhere in the quiz (3-question unique rule). */
  repeatedAt?: number;
};

export function formatQuizKindLabel(kind: QuizQuestion["kind"]): string {
  return QUIZ_FORMAT_LABELS[kind] ?? kind;
}

/** Returns adjacent same-kind pairs (empty = passes). */
export function findAdjacentFormatViolations(
  questions: readonly QuizQuestion[]
): QuizFormatVarietyViolation[] {
  const violations: QuizFormatVarietyViolation[] = [];
  for (let i = 1; i < questions.length; i++) {
    const kind = questions[i]!.kind;
    const previousKind = questions[i - 1]!.kind;
    if (kind === previousKind) {
      violations.push({
        index: i,
        kind,
        label: formatQuizKindLabel(kind),
        previousKind,
        previousLabel: formatQuizKindLabel(previousKind)
      });
    }
  }
  return violations;
}

/** Standard 3-question checkpoints: every kind must appear once. */
export function findRepeatedFormatViolations(
  questions: readonly QuizQuestion[]
): QuizFormatVarietyViolation[] {
  if (questions.length !== 3) return [];

  const violations: QuizFormatVarietyViolation[] = [];
  const seen = new Map<QuizQuestion["kind"], number>();

  questions.forEach((q, index) => {
    const firstIndex = seen.get(q.kind);
    if (firstIndex != null) {
      violations.push({
        index,
        kind: q.kind,
        label: formatQuizKindLabel(q.kind),
        repeatedAt: firstIndex
      });
    } else {
      seen.set(q.kind, index);
    }
  });

  return violations;
}

/** Adjacent + 3-question unique-kind violations. */
export function findQuizFormatVarietyViolations(
  questions: readonly QuizQuestion[]
): QuizFormatVarietyViolation[] {
  return [
    ...findAdjacentFormatViolations(questions),
    ...findRepeatedFormatViolations(questions)
  ];
}

export function assertQuizFormatVariety(
  questions: readonly QuizQuestion[],
  context?: string
): void {
  const violations = findQuizFormatVarietyViolations(questions);
  if (violations.length === 0) return;

  const prefix = context ? `${context}: ` : "";
  const detail = violations
    .map((v) => {
      if (v.repeatedAt != null) {
        return `Q${v.index + 1} repeats "${v.label}" (same as Q${v.repeatedAt + 1}) — use three different formats in a 3-question quiz`;
      }
      return `Q${v.index + 1} and Q${v.index} are both "${v.label}" (${v.kind})`;
    })
    .join("; ");
  throw new Error(
    `${prefix}Quiz format variety rule violated — ${detail}. Alternate formats within the quiz.`
  );
}

/**
 * Pick `count` formats with no adjacent duplicates when played in order.
 * Pass `previousKind` when appending to an existing quiz.
 */
export function pickVariedQuizFormats(
  count: number,
  opts: {
    category?: (typeof QUIZ_FORMAT_REGISTRY)[number]["category"];
    exclude?: ReadonlyArray<QuizQuestion["kind"]>;
    /** Restrict random picks to this subset (e.g. MVP dynamic pool). */
    include?: ReadonlyArray<QuizQuestion["kind"]>;
    previousKind?: QuizQuestion["kind"];
    /** Deterministic shuffle seed for tests/build scripts only — not SSR. */
    seed?: number;
  } = {}
): QuizQuestion["kind"][] {
  let pool = QUIZ_FORMAT_REGISTRY.filter((f) => {
    if (opts.include && !opts.include.includes(f.kind)) return false;
    if (opts.category && f.category !== opts.category) return false;
    if (opts.exclude?.includes(f.kind)) return false;
    return true;
  }).map((f) => f.kind);

  if (pool.length === 0) return [];

  const rng = opts.seed != null ? mulberry32(opts.seed) : Math.random;
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  const picked: QuizQuestion["kind"][] = [];
  let last = opts.previousKind;

  while (picked.length < count && shuffled.length > 0) {
    const nextIdx = shuffled.findIndex((k) => k !== last && !picked.includes(k));
    if (nextIdx === -1) {
      // Exhausted non-adjacent options — reshuffle full pool minus last.
      pool = QUIZ_FORMAT_REGISTRY.filter((f) => {
        if (opts.include && !opts.include.includes(f.kind)) return false;
        if (opts.category && f.category !== opts.category) return false;
        if (opts.exclude?.includes(f.kind)) return false;
        return f.kind !== last;
      }).map((f) => f.kind);
      if (pool.length === 0) break;
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [pool[i], pool[j]] = [pool[j]!, pool[i]!];
      }
      shuffled.splice(0, shuffled.length, ...pool);
      continue;
    }
    const [next] = shuffled.splice(nextIdx, 1);
    picked.push(next!);
    last = next!;
  }

  return picked;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
