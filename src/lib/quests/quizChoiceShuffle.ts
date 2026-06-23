import type {
  FillBlankQuestion,
  MultipleChoiceQuestion,
  OddOneOutQuestion,
  QuizQuestion,
  RedFlagQuestion,
  ScenarioQuestion
} from "@/data/quests/types";

function shuffleInPlace<T>(arr: T[], rng: () => number = Math.random): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
}

/** Avoid repeating the same correct-answer slot on back-to-back questions. */
function pickCorrectSlot(n: number, recentSlots: readonly number[]): number {
  if (n <= 1) return 0;

  const banned = new Set(recentSlots.slice(-2));
  let candidates = Array.from({ length: n }, (_, i) => i).filter(
    (i) => !banned.has(i)
  );

  if (candidates.length === 0) {
    const last = recentSlots.at(-1);
    candidates = Array.from({ length: n }, (_, i) => i).filter((i) => i !== last);
  }

  if (candidates.length === 0) {
    candidates = Array.from({ length: n }, (_, i) => i);
  }

  // Slight bias away from always picking first/last when other slots exist.
  const weights = candidates.map((i) => {
    if (candidates.length <= 2) return 1;
    if (i === 0 || i === n - 1) return 0.82;
    return 1;
  });
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) return candidates[i]!;
  }
  return candidates[candidates.length - 1]!;
}

function shuffleIndexedChoices(
  choices: readonly string[],
  correctIndex: number,
  recentSlots: readonly number[]
): { choices: string[]; correctIndex: number } {
  const n = choices.length;
  if (n <= 1) {
    return { choices: [...choices], correctIndex };
  }

  const targetSlot = pickCorrectSlot(n, recentSlots);
  const correctLabel = choices[correctIndex]!;
  const others = choices.filter((_, i) => i !== correctIndex);
  shuffleInPlace(others);

  const out: string[] = new Array(n);
  out[targetSlot] = correctLabel;
  let otherIdx = 0;
  for (let i = 0; i < n; i++) {
    if (i === targetSlot) continue;
    out[i] = others[otherIdx++]!;
  }

  return { choices: out, correctIndex: targetSlot };
}

function shuffleQuestionChoices(
  question: QuizQuestion,
  recentSlots: readonly number[]
): { question: QuizQuestion; correctSlot: number } | null {
  switch (question.kind) {
    case "multiple-choice": {
      const q = question as MultipleChoiceQuestion;
      const shuffled = shuffleIndexedChoices(q.choices, q.correctIndex, recentSlots);
      return {
        question: { ...q, ...shuffled },
        correctSlot: shuffled.correctIndex
      };
    }
    case "scenario": {
      const q = question as ScenarioQuestion;
      const shuffled = shuffleIndexedChoices(q.choices, q.correctIndex, recentSlots);
      return {
        question: { ...q, ...shuffled },
        correctSlot: shuffled.correctIndex
      };
    }
    case "odd-one-out": {
      const q = question as OddOneOutQuestion;
      const shuffled = shuffleIndexedChoices(q.choices, q.oddIndex, recentSlots);
      return {
        question: { ...q, choices: shuffled.choices, oddIndex: shuffled.correctIndex },
        correctSlot: shuffled.correctIndex
      };
    }
    case "red-flag": {
      const q = question as RedFlagQuestion;
      const shuffled = shuffleIndexedChoices(q.choices, q.flagIndex, recentSlots);
      return {
        question: { ...q, choices: shuffled.choices, flagIndex: shuffled.correctIndex },
        correctSlot: shuffled.correctIndex
      };
    }
    case "fill-blank": {
      const q = question as FillBlankQuestion;
      const shuffled = shuffleIndexedChoices(q.options, q.correctIndex, recentSlots);
      return {
        question: { ...q, options: shuffled.choices, correctIndex: shuffled.correctIndex },
        correctSlot: shuffled.correctIndex
      };
    }
    default:
      return null;
  }
}

/**
 * Shuffle indexed-choice questions for one quiz attempt.
 * Processes questions in play order so correct-answer slots do not repeat in a row.
 */
export function shuffleQuizChoicesForAttempt(
  questions: readonly QuizQuestion[],
  playOrder: readonly number[]
): QuizQuestion[] {
  const result = questions.map((q) => q);
  const recentCorrectSlots: number[] = [];

  for (const origIdx of playOrder) {
    const q = questions[origIdx];
    if (!q) continue;
    const shuffled = shuffleQuestionChoices(q, recentCorrectSlots);
    if (!shuffled) continue;
    result[origIdx] = shuffled.question;
    recentCorrectSlots.push(shuffled.correctSlot);
    if (recentCorrectSlots.length > 2) recentCorrectSlots.shift();
  }

  return result;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const out = arr.slice();
  shuffleInPlace(out);
  return out;
}

export function createQuizAttemptLayout(
  questions: readonly QuizQuestion[],
  shuffle: boolean
): { order: number[]; displayQuestions: QuizQuestion[] } {
  const order = shuffle
    ? shuffleArray(questions.map((_, i) => i))
    : questions.map((_, i) => i);
  const displayQuestions = shuffle
    ? shuffleQuizChoicesForAttempt(questions, order)
    : questions.map((q) => q);
  return { order, displayQuestions };
}
