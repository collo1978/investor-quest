/**
 * Dynamic quiz engine — turns canonical multiple-choice checkpoints into
 * varied mini-game interactions per attempt while testing the same knowledge.
 */
import type {
  FillBlankQuestion,
  MultipleChoiceQuestion,
  OddOneOutQuestion,
  OrderQuestion,
  QuizConfig,
  QuizQuestion,
  QuizQuestionKind,
  ScenarioQuestion,
  TrueFalseQuestion
} from "@/data/quests/types";
import { canMcSupportOrderRanking } from "@/lib/quests/quizOrderEligibility";
import {
  canChoiceSupportTrueFalse,
  canMcSupportTrueFalse,
  isObjectiveTrueFalsePrompt,
  normalizeTrueFalseStatement
} from "@/lib/quests/quizTrueFalseEligibility";
import { pickVariedQuizFormats } from "@/lib/quests/quizFormatVariety";
import {
  assertUniqueQuizLayouts,
  quizLayoutProfileForKind,
  type QuizLayoutProfile
} from "@/lib/quests/quizLayoutProfiles";

/** MVP interaction pool — one of each per 5-question section quiz. */
export const MVP_DYNAMIC_QUIZ_FORMATS = [
  "multiple-choice",
  "true-false",
  "fill-blank",
  "odd-one-out",
  "order"
] as const satisfies readonly QuizQuestionKind[];

export type MvpDynamicQuizFormat = (typeof MVP_DYNAMIC_QUIZ_FORMATS)[number];

const NON_ORDER_MVP_FORMATS = MVP_DYNAMIC_QUIZ_FORMATS.filter(
  (kind) => kind !== "order"
);

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function resolveRng(seed?: number): () => number {
  return seed != null ? mulberry32(seed) : Math.random;
}

function isMultipleChoiceQuestion(q: QuizQuestion): q is MultipleChoiceQuestion {
  return q.kind === "multiple-choice";
}

function stripQuestionMark(prompt: string): string {
  return prompt.replace(/\?\s*$/, "").trim();
}

function truncateLabel(text: string, max = 88): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function pickWrongIndex(mc: MultipleChoiceQuestion, rng: () => number): number {
  const wrongIndices = mc.choices
    .map((_, index) => index)
    .filter((index) => index !== mc.correctIndex);
  if (wrongIndices.length === 0) return 0;
  return wrongIndices[Math.floor(rng() * wrongIndices.length)]!;
}

function buildTrueFalseFromChoice(
  mc: MultipleChoiceQuestion,
  choice: string,
  correct: boolean
): TrueFalseQuestion | null {
  const prompt = normalizeTrueFalseStatement(choice);
  if (!isObjectiveTrueFalsePrompt(prompt)) return null;
  return {
    kind: "true-false",
    id: mc.id,
    prompt,
    correct,
    explain: mc.explain
  };
}

function transformMcToTrueFalse(
  mc: MultipleChoiceQuestion,
  rng: () => number
): TrueFalseQuestion | MultipleChoiceQuestion {
  const authored = mc.trueFalseStatement?.trim();
  if (authored && isObjectiveTrueFalsePrompt(authored)) {
    return {
      kind: "true-false",
      id: mc.id,
      prompt: authored,
      correct: mc.trueFalseCorrect ?? true,
      explain: mc.explain
    };
  }

  const correctChoice = mc.choices[mc.correctIndex];
  const eligibleWrongs = mc.choices
    .map((choice, index) => ({ choice, index }))
    .filter(
      ({ index, choice }) =>
        index !== mc.correctIndex && canChoiceSupportTrueFalse(choice)
    );
  const eligibleCorrect =
    correctChoice != null && canChoiceSupportTrueFalse(correctChoice);

  if (!eligibleCorrect && eligibleWrongs.length === 0) {
    return mc;
  }

  const useFalseStatement =
    eligibleWrongs.length > 0 && (!eligibleCorrect || rng() < 0.45);

  if (useFalseStatement) {
    const pick =
      eligibleWrongs[Math.floor(rng() * eligibleWrongs.length)]!;
    return (
      buildTrueFalseFromChoice(mc, pick.choice, false) ?? mc
    );
  }

  return (
    buildTrueFalseFromChoice(mc, correctChoice!, true) ?? mc
  );
}

/** Fallback when T/F is assigned but the MC content is not objective enough. */
function pickTrueFalseFallbackKind(
  mc: MultipleChoiceQuestion,
  rng: () => number
): QuizQuestionKind {
  if (mc.choices.length >= 3) {
    return rng() < 0.5 ? "odd-one-out" : "fill-blank";
  }
  return "fill-blank";
}

/** Shuffle which question slot receives each format so Q1 is not always MC. */
function shuffleFormatAssignment(
  count: number,
  formats: readonly QuizQuestionKind[],
  seed?: number
): QuizQuestionKind[] {
  const assigned: QuizQuestionKind[] = new Array(count);
  const slots = Array.from({ length: count }, (_, index) => index);
  const rng = resolveRng(seed != null ? seed + 104729 : undefined);

  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [slots[i], slots[j]] = [slots[j]!, slots[i]!];
  }

  formats.forEach((kind, index) => {
    const slot = slots[index];
    if (slot != null) assigned[slot] = kind;
  });

  for (let i = 0; i < count; i++) {
    if (!assigned[i]) assigned[i] = "multiple-choice";
  }

  return assigned;
}

const MVP_FALLBACK_CHAIN: Partial<Record<QuizQuestionKind, QuizQuestionKind[]>> = {
  "true-false": ["fill-blank", "odd-one-out", "scenario"],
  order: ["scenario", "odd-one-out", "fill-blank"],
  "fill-blank": ["odd-one-out", "true-false", "scenario"],
  "odd-one-out": ["fill-blank", "true-false", "scenario"],
  scenario: ["fill-blank", "odd-one-out", "true-false"]
};

const MVP_LAYOUT_KINDS: QuizQuestionKind[] = [
  "multiple-choice",
  "true-false",
  "fill-blank",
  "odd-one-out",
  "order",
  "scenario"
];

function uniqueKinds(...groups: readonly (readonly QuizQuestionKind[])[]): QuizQuestionKind[] {
  const seen = new Set<QuizQuestionKind>();
  const out: QuizQuestionKind[] = [];
  for (const group of groups) {
    for (const kind of group) {
      if (seen.has(kind)) continue;
      seen.add(kind);
      out.push(kind);
    }
  }
  return out;
}

function resolveKindAvoidingLayoutRepeat(
  mc: MultipleChoiceQuestion,
  preferred: QuizQuestionKind,
  usedLayouts: Set<QuizLayoutProfile>,
  rng: () => number
): QuizQuestionKind {
  const candidates = uniqueKinds(
    [preferred],
    MVP_FALLBACK_CHAIN[preferred] ?? [],
    MVP_LAYOUT_KINDS
  );

  for (const kind of candidates) {
    const trial = transformMcQuestion(mc, kind, rng);
    const layout = quizLayoutProfileForKind(trial.kind);
    if (!usedLayouts.has(layout)) return kind;
  }

  // Last resort — any MVP kind whose transformed layout is still unused.
  for (const kind of MVP_LAYOUT_KINDS) {
    const trial = transformMcQuestion(mc, kind, rng);
    const layout = quizLayoutProfileForKind(trial.kind);
    if (!usedLayouts.has(layout)) return kind;
  }

  return "multiple-choice";
}

function transformMcToFillBlank(mc: MultipleChoiceQuestion): FillBlankQuestion {
  const stem = stripQuestionMark(mc.prompt);
  return {
    kind: "fill-blank",
    id: mc.id,
    prompt: stem,
    options: mc.choices.map((choice) => truncateLabel(choice)),
    correctIndex: mc.correctIndex,
    explain: mc.explain
  };
}

function transformMcToOddOneOut(
  mc: MultipleChoiceQuestion,
  rng: () => number
): OddOneOutQuestion {
  const oddIndex = pickWrongIndex(mc, rng);
  const stem = stripQuestionMark(mc.prompt);
  return {
    kind: "odd-one-out",
    id: mc.id,
    prompt: `Which answer does NOT fit?\n\n${stem}`,
    choices: mc.choices.map((choice) => truncateLabel(choice, 96)),
    oddIndex,
    explain: mc.explain
  };
}

function transformMcToOrder(mc: MultipleChoiceQuestion): OrderQuestion {
  const stem = stripQuestionMark(mc.prompt);
  const steps =
    mc.rankingSteps && mc.rankingSteps.length >= 3
      ? mc.rankingSteps
      : (() => {
          const correct = mc.choices[mc.correctIndex]!;
          const wrongs = mc.choices.filter((_, index) => index !== mc.correctIndex);
          return [correct, ...wrongs];
        })();

  return {
    kind: "order",
    id: mc.id,
    prompt: `Put these in order — most accurate first:\n\n${stem}`,
    steps: steps.map((step) => truncateLabel(step, 96)),
    explain: mc.explain
  };
}

/** Fallback when order is assigned but the MC content cannot support ranking. */
function pickOrderFallbackKind(
  mc: MultipleChoiceQuestion,
  rng: () => number
): QuizQuestionKind {
  const roll = rng();
  if (mc.choices.length >= 3) {
    if (roll < 0.34) return "scenario";
    if (roll < 0.67) return "odd-one-out";
    return "fill-blank";
  }
  return roll < 0.5 ? "scenario" : "fill-blank";
}

function transformMcToScenario(mc: MultipleChoiceQuestion): ScenarioQuestion {
  return {
    kind: "scenario",
    id: mc.id,
    prompt: mc.prompt,
    choices: mc.choices.map((choice) => truncateLabel(choice)),
    correctIndex: mc.correctIndex,
    explain: mc.explain
  };
}

function transformMcQuestion(
  mc: MultipleChoiceQuestion,
  kind: QuizQuestionKind,
  rng: () => number
): QuizQuestion {
  let resolvedKind = kind;
  if (resolvedKind === "order" && !canMcSupportOrderRanking(mc)) {
    resolvedKind = pickOrderFallbackKind(mc, rng);
  }
  if (resolvedKind === "true-false" && !canMcSupportTrueFalse(mc)) {
    resolvedKind = pickTrueFalseFallbackKind(mc, rng);
  }

  switch (resolvedKind) {
    case "multiple-choice":
      return mc;
    case "scenario":
      return transformMcToScenario(mc);
    case "true-false":
      return transformMcToTrueFalse(mc, rng);
    case "fill-blank":
      return transformMcToFillBlank(mc);
    case "odd-one-out":
      if (mc.choices.length < 3) return mc;
      return transformMcToOddOneOut(mc, rng);
    case "order":
      if (mc.choices.length < 3) return mc;
      return transformMcToOrder(mc);
    default:
      return mc;
  }
}

function pickOrderQuestionIndex(
  questions: readonly MultipleChoiceQuestion[],
  seed?: number
): number | null {
  const eligible = questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => canMcSupportOrderRanking(question));

  if (eligible.length === 0) return null;

  const explicit = eligible.filter(
    ({ question }) =>
      question.supportsRanking === true ||
      (question.rankingSteps?.length ?? 0) >= 3
  );
  const pool = explicit.length > 0 ? explicit : eligible;
  const rng = resolveRng(seed);
  return pool[Math.floor(rng() * pool.length)]!.index;
}

function resolveAdjacentFormatConflicts(
  formats: QuizQuestionKind[],
  swapPool: readonly QuizQuestionKind[],
  rng: () => number
): QuizQuestionKind[] {
  const result = formats.slice();

  for (let pass = 0; pass < 10; pass++) {
    let fixed = false;
    for (let i = 1; i < result.length; i++) {
      if (result[i] !== result[i - 1]) continue;

      const candidates = swapPool.filter(
        (kind) =>
          kind !== result[i - 1] && (i + 1 >= result.length || kind !== result[i + 1])
      );
      if (candidates.length === 0) continue;

      result[i] = candidates[Math.floor(rng() * candidates.length)]!;
      fixed = true;
    }
    if (!fixed) break;
  }

  return result;
}

function shuffleKindList(
  kinds: readonly QuizQuestionKind[],
  rng: () => number
): QuizQuestionKind[] {
  const result = kinds.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/**
 * Assign one MVP format per question.
 * Five-question section quizzes use each MVP format exactly once.
 * Order/ranking prefers MC sources that support meaningful ordering.
 */
export function assignMvpDynamicFormats(
  questions: readonly MultipleChoiceQuestion[],
  opts: { seed?: number } = {}
): QuizQuestionKind[] {
  const count = questions.length;
  if (count === 0) return [];

  const rng = resolveRng(opts.seed);

  if (count === MVP_DYNAMIC_QUIZ_FORMATS.length) {
    const formats = shuffleKindList(MVP_DYNAMIC_QUIZ_FORMATS, rng);
    const orderIndex = pickOrderQuestionIndex(questions, opts.seed);
    if (orderIndex != null) {
      const orderSlot = formats.indexOf("order");
      if (orderSlot >= 0 && orderSlot !== orderIndex) {
        const swap = formats[orderIndex]!;
        formats[orderIndex] = "order";
        formats[orderSlot] = swap;
      }
    } else {
      // No rankable MC sources — swap order for scenario (distinct layout shell).
      const orderSlot = formats.indexOf("order");
      if (orderSlot >= 0) formats[orderSlot] = "scenario";
    }
    const swapPool: QuizQuestionKind[] = orderIndex != null
      ? [...MVP_DYNAMIC_QUIZ_FORMATS]
      : MVP_DYNAMIC_QUIZ_FORMATS.map((kind) =>
          kind === "order" ? "scenario" : kind
        );
    return resolveAdjacentFormatConflicts(formats, swapPool, rng);
  }

  const orderIndex = pickOrderQuestionIndex(questions, opts.seed);
  if (orderIndex == null) {
    return pickVariedQuizFormats(count, {
      seed: opts.seed,
      include: MVP_DYNAMIC_QUIZ_FORMATS,
      exclude: ["order"]
    });
  }

  const otherFormats = pickVariedQuizFormats(count - 1, {
    seed: opts.seed != null ? opts.seed + 7919 : undefined,
    include: MVP_DYNAMIC_QUIZ_FORMATS,
    exclude: ["order"]
  });

  const formats: QuizQuestionKind[] = new Array(count);
  formats[orderIndex] = "order";

  let otherIdx = 0;
  for (let i = 0; i < count; i++) {
    if (i === orderIndex) continue;
    formats[i] = otherFormats[otherIdx++] ?? "multiple-choice";
  }

  return resolveAdjacentFormatConflicts(formats, NON_ORDER_MVP_FORMATS, rng);
}

/** Pick varied MVP formats — no adjacent duplicates when played in order. */
export function pickMvpDynamicFormats(
  count: number,
  opts: { seed?: number; previousKind?: QuizQuestionKind } = {}
): QuizQuestionKind[] {
  return pickVariedQuizFormats(count, {
    ...opts,
    include: MVP_DYNAMIC_QUIZ_FORMATS
  });
}

/**
 * Transform an all-MC quiz into varied mini-game questions for one attempt.
 * Already-mixed quizzes pass through unchanged.
 */
export function buildDynamicQuizConfig(
  config: QuizConfig,
  opts: { seed?: number } = {}
): QuizConfig {
  if (config.questions.length === 0) return config;

  const allMc = config.questions.every(isMultipleChoiceQuestion);
  if (!allMc) return config;

  const rng = resolveRng(opts.seed);
  const mcQuestions = config.questions as MultipleChoiceQuestion[];
  let formats = shuffleFormatAssignment(
    mcQuestions.length,
    assignMvpDynamicFormats(mcQuestions, { seed: opts.seed }),
    opts.seed
  );
  const orderEligible = pickOrderQuestionIndex(mcQuestions, opts.seed) != null;
  const formatSwapPool: QuizQuestionKind[] = orderEligible
    ? [...MVP_DYNAMIC_QUIZ_FORMATS]
    : MVP_DYNAMIC_QUIZ_FORMATS.map((kind) =>
        kind === "order" ? "scenario" : kind
      );
  formats = resolveAdjacentFormatConflicts(formats, formatSwapPool, rng);

  const usedLayouts = new Set<QuizLayoutProfile>();
  const questions = mcQuestions.map((question, index) => {
    const preferred = formats[index] ?? "multiple-choice";
    const kind = resolveKindAvoidingLayoutRepeat(
      question,
      preferred,
      usedLayouts,
      rng
    );
    const transformed = transformMcQuestion(question, kind, rng);
    usedLayouts.add(quizLayoutProfileForKind(transformed.kind));
    return transformed;
  });

  if (process.env.NODE_ENV !== "production") {
    assertUniqueQuizLayouts(questions, "dynamic-quiz");
  }

  return {
    passThreshold: config.passThreshold,
    questions
  };
}
