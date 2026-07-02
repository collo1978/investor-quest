/**
 * Data Layer — canonical quest schema.
 *
 * A `QuestTemplate` is company-agnostic content authored by hand or
 * generated later by the SEC -> AI pipeline. A `QuestDefinition` is a
 * fully resolved template bound to a specific company.
 *
 * No React, no game state, no side effects — pure data types.
 */

import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";

export const QUEST_TYPES = [
  "snapshot",
  "revenue",
  "everyday",
  "operations",
  "advantage",
  "industry",
  "risk",
  "timeline",
  "valuation",
  "earnings-call",
  "quiz"
] as const;

export type QuestType = (typeof QUEST_TYPES)[number];

export type Difficulty = "intro" | "core" | "deep" | "expert";

export type ArtifactType =
  | "one-pager"
  | "map"
  | "scorecard"
  | "note"
  | "checklist"
  | "matrix"
  | "model"
  | "transcript-summary"
  | "quiz-result"
  | "memo";

/** Hint for the UI layer on how to render the quest interior. */
export type VisualStyle =
  | "card"
  | "panel"
  | "terminal"
  | "board"
  | "transcript"
  | "quiz";

/**
 * Quiz question schema — a discriminated union on `kind`. Adding a new
 * style means adding a new variant here and a matching renderer in the
 * UI layer; no engine changes are needed.
 *
 * `multiple-choice` is the legacy shape and remains the default.
 */
export type QuizQuestionBase = {
  id: string;
  prompt: string;
  /**
   * Optional explanation shown in the post-submit review.
   * Human-first rules: 1–2 sentences, real-life anchor, no corporate jargon
   * (@see lib/quests/humanFirstExplanation QUIZ_EXPLANATION_VOICE).
   */
  explain?: string;
};

/** Standard 1-of-N pick. */
export type MultipleChoiceQuestion = QuizQuestionBase & {
  kind: "multiple-choice";
  choices: string[];
  correctIndex: number;
};

/** Scenario framing ("If X happens, what's most likely?"). Same input as MC. */
export type ScenarioQuestion = QuizQuestionBase & {
  kind: "scenario";
  choices: string[];
  correctIndex: number;
};

/** "Pick the item that doesn't belong." */
export type OddOneOutQuestion = QuizQuestionBase & {
  kind: "odd-one-out";
  choices: string[];
  /** Index of the item that does NOT belong with the others. */
  oddIndex: number;
};

/** "Which of these would be a warning sign?" */
export type RedFlagQuestion = QuizQuestionBase & {
  kind: "red-flag";
  choices: string[];
  /** Index of the red-flag answer. */
  flagIndex: number;
};

/** "Apple's ___ makes it harder for customers to switch." */
export type FillBlankQuestion = QuizQuestionBase & {
  kind: "fill-blank";
  /** Prompt contains one or more `___` / `______` placeholders; one option fills them correctly. */
  options: string[];
  correctIndex: number;
};

/** "True or False." */
export type TrueFalseQuestion = QuizQuestionBase & {
  kind: "true-false";
  correct: boolean;
};

/** "Pair each item on the left with the right item on the right." */
export type MatchQuestion = QuizQuestionBase & {
  kind: "match";
  /** Pairs in correct correspondence (`pairs[i].right` is the truth for `pairs[i].left`). */
  pairs: ReadonlyArray<{ left: string; right: string }>;
};

/** "Order the steps." */
export type OrderQuestion = QuizQuestionBase & {
  kind: "order";
  /** Steps in their *correct* order; the UI shuffles them deterministically. */
  steps: string[];
};

// ===========================================================================
// Investor-specific kinds
// ===========================================================================

/**
 * Bull vs Bear — pick one stance on a thesis. Visually two large stacked
 * decision cards (bull = green up, bear = red down). Stored as the chosen
 * stance string.
 */
export type BullBearQuestion = QuizQuestionBase & {
  kind: "bull-bear";
  correct: "bull" | "bear";
  /** Optional headline shown over the choice cards. */
  caption?: string;
  /** Override the Bull / Bear labels (e.g. "Buy" / "Avoid"). */
  labels?: { bull: string; bear: string };
};

/**
 * Risk Meter — pick a risk level from a color-ramped scale.
 * Stored as the chosen level (1..scaleMax). `correctLevel` is the true level.
 */
export type RiskMeterQuestion = QuizQuestionBase & {
  kind: "risk-meter";
  /** Defaults to 5. */
  scaleMax?: number;
  correctLevel: number;
  /** Optional label per level (length = scaleMax). */
  levelLabels?: string[];
};

/**
 * Swipe cards — for each statement, decide "good sign" (right) or
 * "warning sign" (left). Stored as an array of verdicts aligned with `cards`.
 */
export type SwipeVerdict = "good" | "warning";
export type SwipeCardsQuestion = QuizQuestionBase & {
  kind: "swipe-cards";
  cards: ReadonlyArray<{ text: string; verdict: SwipeVerdict }>;
};

export type QuizQuestion =
  | MultipleChoiceQuestion
  | ScenarioQuestion
  | OddOneOutQuestion
  | RedFlagQuestion
  | FillBlankQuestion
  | TrueFalseQuestion
  | MatchQuestion
  | OrderQuestion
  | BullBearQuestion
  | RiskMeterQuestion
  | SwipeCardsQuestion;

export type QuizQuestionKind = QuizQuestion["kind"];

export type QuizConfig = {
  questions: QuizQuestion[];
  /** 0..1 — minimum fraction correct to mark quest complete. */
  passThreshold: number;
};

/** True when a quest has at least one runnable quiz question. */
export function hasPlayableQuizConfig(
  quiz: QuizConfig | null | undefined
): quiz is QuizConfig {
  return Array.isArray(quiz?.questions) && quiz.questions.length > 0;
}

/** Legacy CMS rows may still ship `kind: "confidence"` — convert to MC. */
type LegacyConfidenceQuestion = QuizQuestionBase & {
  kind: "confidence";
  scaleMax?: number;
  scaleLabels?: { low: string; high: string };
};

function isLegacyConfidenceQuestion(
  q: QuizQuestion | LegacyConfidenceQuestion
): q is LegacyConfidenceQuestion {
  return (q as { kind: string }).kind === "confidence";
}

function migrateLegacyConfidenceQuestion(
  q: LegacyConfidenceQuestion
): MultipleChoiceQuestion {
  return {
    kind: "multiple-choice",
    id: q.id,
    prompt: q.prompt,
    choices: [
      "I could not explain this yet",
      "I could explain the basics with my notes",
      "I could explain it clearly in one sentence",
      "I could teach a friend without notes"
    ],
    correctIndex: 2,
    explain:
      q.explain ??
      "Keep reviewing until you can explain the idea simply — that is the investor readiness test."
  };
}

function normalizeQuizQuestions(
  questions: readonly (QuizQuestion | LegacyConfidenceQuestion)[]
): QuizQuestion[] {
  return questions.map((q) =>
    isLegacyConfidenceQuestion(q) ? migrateLegacyConfidenceQuestion(q) : q
  );
}

/** Drop CMS stubs that only set passThreshold without questions. */
export function normalizeQuizConfig(
  raw: QuizConfig | null | undefined
): QuizConfig | undefined {
  if (!hasPlayableQuizConfig(raw)) return undefined;
  return {
    questions: normalizeQuizQuestions(raw.questions),
    passThreshold: raw.passThreshold ?? 0.66
  };
}

/** First source with real questions wins (left-to-right priority). */
export function mergeQuizConfig(
  ...sources: (QuizConfig | null | undefined)[]
): QuizConfig | undefined {
  for (const src of sources) {
    const normalized = normalizeQuizConfig(src);
    if (normalized) return normalized;
  }
  return undefined;
}

/**
 * Pure scoring helper. Returns `true` when the user's answer is the
 * correct one for the question kind.
 */
export function isQuizAnswerCorrect(q: QuizQuestion, answer: unknown): boolean {
  switch (q.kind) {
    case "multiple-choice":
    case "scenario":
      return typeof answer === "number" && answer === q.correctIndex;
    case "odd-one-out":
      return typeof answer === "number" && answer === q.oddIndex;
    case "red-flag":
      return typeof answer === "number" && answer === q.flagIndex;
    case "fill-blank":
      return typeof answer === "number" && answer === q.correctIndex;
    case "true-false":
      return typeof answer === "boolean" && answer === q.correct;
    case "match":
      if (!Array.isArray(answer)) return false;
      if (answer.length !== q.pairs.length) return false;
      return q.pairs.every((_, i) => answer[i] === i);
    case "order":
      if (!Array.isArray(answer)) return false;
      if (answer.length !== q.steps.length) return false;
      return q.steps.every((_, i) => answer[i] === i);
    case "bull-bear":
      return (answer === "bull" || answer === "bear") && answer === q.correct;
    case "risk-meter": {
      const max = q.scaleMax ?? 5;
      return (
        typeof answer === "number" &&
        answer >= 1 &&
        answer <= max &&
        answer === q.correctLevel
      );
    }
    case "swipe-cards":
      if (!Array.isArray(answer)) return false;
      if (answer.length !== q.cards.length) return false;
      return q.cards.every((c, i) => answer[i] === c.verdict);
  }
}

/**
 * Was the user able to commit *any* answer for this question? Used to
 * gate "Submit Quiz" so it only enables once every question has input.
 */
export function isQuizAnswerProvided(
  q: QuizQuestion,
  answer: unknown
): boolean {
  switch (q.kind) {
    case "multiple-choice":
    case "scenario":
    case "odd-one-out":
    case "red-flag":
    case "fill-blank":
    case "risk-meter":
      return typeof answer === "number";
    case "true-false":
      return typeof answer === "boolean";
    case "match":
      return (
        Array.isArray(answer) &&
        answer.length === q.pairs.length &&
        answer.every((v) => typeof v === "number")
      );
    case "order":
      return Array.isArray(answer) && answer.length === q.steps.length;
    case "bull-bear":
      return answer === "bull" || answer === "bear";
    case "swipe-cards":
      return (
        Array.isArray(answer) &&
        answer.length === q.cards.length &&
        answer.every((v) => v === "good" || v === "warning")
      );
  }
}

// ===========================================================================
// Quiz format registry — single source of truth for what formats exist.
// Adding a new kind = add to the union + add an entry here + add a renderer.
// ===========================================================================

export type QuizFormatCategory = "core" | "investor" | "future";

export type QuizFormatDescriptor = {
  kind: QuizQuestion["kind"];
  /** Beginner-friendly display label. */
  label: string;
  /** Category — drives random selection pools. */
  category: QuizFormatCategory;
  /** One-line summary used by the SEC/AI generator to pick fits. */
  summary: string;
};

/**
 * Registry of all quiz formats the engine can render today. Future formats
 * (tap-the-hotspot, card-flip-memory, build-the-thesis, …) belong in
 * `FUTURE_QUIZ_FORMATS` until their renderers ship.
 */
export const QUIZ_FORMAT_REGISTRY: readonly QuizFormatDescriptor[] = [
  // Core — reusable on any pillar.
  {
    kind: "multiple-choice",
    label: "Multiple choice",
    category: "core",
    summary: "Pick the correct answer from a list of options."
  },
  {
    kind: "true-false",
    label: "True or false",
    category: "core",
    summary: "Decide whether a statement is true or false."
  },
  {
    kind: "odd-one-out",
    label: "Pick the odd one out",
    category: "core",
    summary: "Spot the item that does not belong with the others."
  },
  {
    kind: "fill-blank",
    label: "Fill in the blank",
    category: "core",
    summary: "Pick the word that completes a sentence."
  },
  {
    kind: "match",
    label: "Match the concept",
    category: "core",
    summary: "Pair items on the left with items on the right."
  },
  {
    kind: "order",
    label: "Order the steps",
    category: "core",
    summary: "Drag cards into the correct order. Doubles as ranking / timeline."
  },
  // Investor-specific — designed for finance content.
  {
    kind: "scenario",
    label: "Quick scenario",
    category: "investor",
    summary: "Read a short investor scenario and pick the best decision."
  },
  {
    kind: "red-flag",
    label: "Spot the red flag",
    category: "investor",
    summary: "Find the warning sign among a list of statements."
  },
  {
    kind: "bull-bear",
    label: "Bull vs bear",
    category: "investor",
    summary: "Take a stance — pro (bull) or against (bear)."
  },
  {
    kind: "risk-meter",
    label: "Risk meter",
    category: "investor",
    summary: "Calibrate a risk level on a color-ramped 1-5 scale."
  },
  {
    kind: "swipe-cards",
    label: "Good sign / warning sign",
    category: "investor",
    summary: "For each statement, swipe good (right) or warning (left)."
  }
];

/**
 * Future formats that aren't shipped yet. Listed here so the SEC/AI pipeline
 * can plan around them and the UI can advertise "coming soon" if needed.
 *
 * Each entry will graduate to `QUIZ_FORMAT_REGISTRY` once a renderer ships.
 */
export const FUTURE_QUIZ_FORMATS: ReadonlyArray<{
  key: string;
  label: string;
  summary: string;
}> = [
  {
    key: "what-matters-most",
    label: "What matters most",
    summary:
      "Currently rendered via `multiple-choice` with custom framing — promote when a unique UI lands."
  },
  {
    key: "portfolio-decision",
    label: "Portfolio decision",
    summary:
      "Currently rendered via `scenario` with portfolio-action choices — promote when a position-management UI lands."
  },
  {
    key: "earnings-reaction",
    label: "Earnings reaction",
    summary:
      "Currently rendered via `scenario` framed around a fresh result — promote when reaction-rating UI lands."
  },
  {
    key: "ranking-exercise",
    label: "Ranking exercise",
    summary:
      "Currently rendered via `order` framed as a rank list — promote when explicit ranking UI lands."
  },
  {
    key: "timeline-reconstruction",
    label: "Timeline reconstruction",
    summary:
      "Currently rendered via `order` with date markers — promote when a true timeline UI lands."
  },
  {
    key: "build-the-thesis",
    label: "Build the thesis",
    summary:
      "Currently rendered via `match` (premise → conclusion) — promote when a thesis-composer UI lands."
  },
  {
    key: "tap-the-hotspot",
    label: "Tap the hotspot",
    summary:
      "Image / chart with tappable regions. Requires hotspot authoring tooling before MVP."
  },
  {
    key: "card-flip-memory",
    label: "Card flip memory",
    summary: "Pair-matching memory game. Requires paired-content authoring before MVP."
  }
];

/**
 * Returns up to `n` random quiz format kinds. By default samples from the
 * full registry; pass `category` to restrict the pool.
 *
 * Determinism: callers should pass a `seed` only when they need reproducible
 * output (e.g. inside a deterministic test). The default uses `Math.random`,
 * so call this in user-driven flows or build scripts — never during SSR.
 */
export function pickRandomFormats(
  n: number,
  opts: {
    category?: QuizFormatCategory;
    exclude?: ReadonlyArray<QuizQuestion["kind"]>;
  } = {}
): QuizQuestion["kind"][] {
  const pool = QUIZ_FORMAT_REGISTRY.filter((f) => {
    if (opts.category && f.category !== opts.category) return false;
    if (opts.exclude && opts.exclude.includes(f.kind)) return false;
    return true;
  });
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(n, shuffled.length)).map((f) => f.kind);
}

// ===========================================================================
// SEC / AI integration seam
// ===========================================================================

/**
 * Minimal card-shape used by the quiz-generator. Decoupled from `QuestSubCard`
 * so the generator can be fed synthetic content too.
 */
export type GeneratableCard = {
  investorQuestion: string;
  plainEnglishAnswer: string | null;
  whyItMatters: string;
};

export type GenerateQuizOptions = {
  /** How many questions to produce. Defaults to 3 (MVP). */
  count?: number;
  /** 0..1, defaults to 0.66. */
  passThreshold?: number;
  /** Restrict to a category — useful for "core only" tests. */
  category?: QuizFormatCategory;
  /** Kinds the generator should *not* pick. */
  exclude?: ReadonlyArray<QuizQuestion["kind"]>;
};

/**
 * Future seam where the SEC/AI pipeline produces `QuizQuestion`s from card
 * content. Today this is a stub — it returns `null` to indicate "no
 * auto-generated quiz available" so callers fall back to the hand-authored
 * `quest.quizConfig`.
 *
 * Contract for the eventual implementation:
 *  1. Receive a list of `GeneratableCard`s (the parent quest's sub-cards).
 *  2. Pick `count` varied formats via `pickVariedQuizFormats(count, opts)`.
 *  3. For each chosen format, ask an LLM to author a beginner-friendly
 *     question grounded in the card content (investor question, plain-English
 *     answer, why-it-matters).
 *  4. Validate the AI output against the discriminated union shape, retry
 *     once on shape failure, then drop the question if still invalid.
 *  5. Return a `QuizConfig`.
 *
 * Until that pipeline ships, this stub keeps the call-site stable.
 */
export function generateQuizFromCards(
  _cards: ReadonlyArray<GeneratableCard>,
  _opts: GenerateQuizOptions = {}
): QuizConfig | null {
  return null;
}

/** Reference to a section of an SEC filing (10-K, 10-Q, 8-K, DEF 14A, etc.) */
export type SecSectionRef = {
  /** Filing kind, e.g. "10-K". */
  form: "10-K" | "10-Q" | "8-K" | "DEF 14A" | "S-1" | "13F" | "other";
  /** Section label, e.g. "Item 1 — Business". */
  section: string;
  /** Free-text guidance for the SEC parser. */
  hint?: string;
};

/** Conditions that must be true for a quest to be playable. */
export type UnlockRequirements = {
  /** Pillar must be unlocked for the active company. */
  pillar?: PillarId;
  /** Slugs of quests (same pillar) that must be completed first. */
  questSlugs?: string[];
  /** Minimum player level (per company) required. */
  minLevel?: number;
  /** Minimum XP (per company) required. */
  minXp?: number;
};

/** How the engine decides this quest is complete. */
export type CompletionRule =
  | { kind: "manual" }
  | { kind: "checklist"; checklistKeys: string[] }
  | { kind: "quiz"; passPct?: number }
  | { kind: "minigame"; key: "quiz" | "board" | "terminal" }
  /** Mark-as-read completes the quest (no quiz XP). Used for FORCES topic cards. */
  | { kind: "read" };

/**
 * One Q/A/Why "facet" inside a multi-card quest.
 *
 * Some quests (e.g. Business → "A Quick Snapshot") naturally split into
 * a small set of beginner-friendly sub-questions that all live under
 * the same parent title. Each sub-card has its own Mark-as-Read state
 * (tracked under the composite slug `${quest.slug}#${card.id}`).
 *
 * Token substitution applies to all string fields.
 */
export type QuestSubCard = {
  /** Stable id — unique within the parent quest's `cards` array. */
  id: string;
  investorQuestion: string;
  /** Plain-English answer. `null` renders the "awaiting SEC/AI content" placeholder. */
  plainEnglishAnswer: string | null;
  whyItMatters: string;
  /**
   * Optional elite insight (one sharp line). When absent, the UI may
   * derive a short teaser from `whyItMatters`.
   */
  investorInsight?: string | null;
};

/**
 * A company-agnostic quest blueprint. `{Company.name}` placeholders in
 * `description`, `aiTask`, `investorQuestion`, `plainEnglishAnswer`,
 * `whyItMatters`, and every field inside each `cards[]` entry are
 * substituted when instantiated.
 */
export type QuestTemplate = {
  /** Stable slug — unique within (pillarId). Used as the saved-state key. */
  slug: string;
  type: QuestType;
  pillarId: PillarId;
  title: string;
  objective: string;
  description: string;
  /** One simple, beginner-friendly investor question for the card front. */
  investorQuestion: string;
  /**
   * Short plain-English answer shown under the question. Optional;
   * when `null` the card renders an "awaiting SEC/AI content" placeholder.
   * The SEC -> AI -> quest-generator pipeline fills this in per company.
   */
  plainEnglishAnswer: string | null;
  /** One short sentence explaining why the investor should care. */
  whyItMatters: string;
  /**
   * Optional elite insight for single-card quests (HUD "Investor insight").
   */
  investorInsight?: string | null;
  secSection: SecSectionRef | null;
  aiTask: string;
  artifactType: ArtifactType;
  /** XP reward awarded ONLY after a successful quiz pass (not Mark as Read). */
  rewardXp: number;
  unlockRequirements: UnlockRequirements;
  completionState: CompletionRule;
  difficulty: Difficulty;
  visualStyle: VisualStyle;
  quizConfig?: QuizConfig;
  /** Estimated time in minutes. */
  estimatedTime: number;
  tags: string[];
  /**
   * Optional sub-cards. When present, the quest detail screen renders
   * one stacked gold card per entry instead of a single card. Each
   * sub-card has its own Mark-as-Read state. The parent quest itself
   * is marked as read once every sub-card has been marked.
   */
  cards?: readonly QuestSubCard[];
  /** FORCES pillar — groups topic cards into four island categories. */
  forcesCategory?:
    | "positive-inside"
    | "negative-inside"
    | "positive-outside"
    | "negative-outside";
  /** Sort order within pillar (and within `forcesCategory` when set). */
  displayOrder?: number;
  /** Business hub map — icon key (see `businessHubIcons`). */
  hubIcon?: string | null;
  /** Business hub map — subtitle under title; falls back to `investorQuestion`. */
  hubSubtitle?: string | null;
  /** Business hub map — question/card count badge. */
  hubCardCount?: number | null;
  /** Business hub map — route override (default `/business/[slug]`). */
  hubRoute?: string | null;
  /**
   * Business hub map — force locked state.
   * `null` = auto policy (card 1 open; TODO: engine progression).
   */
  hubLocked?: boolean | null;
};

/**
 * A quest bound to a specific company. `id` is globally unique:
 * `${companyId}.${pillarId}.${slug}`.
 */
export type QuestDefinition = QuestTemplate & {
  id: string;
  companyId: CompanyId;
};

/** Lightweight artifact label for UI. */
export function artifactLabel(type: ArtifactType): string {
  switch (type) {
    case "one-pager":
      return "One-pager";
    case "map":
      return "Map";
    case "scorecard":
      return "Scorecard";
    case "note":
      return "Note";
    case "checklist":
      return "Checklist";
    case "matrix":
      return "Matrix";
    case "model":
      return "Model";
    case "transcript-summary":
      return "Transcript summary";
    case "quiz-result":
      return "Quiz result";
    case "memo":
      return "Memo";
  }
}
