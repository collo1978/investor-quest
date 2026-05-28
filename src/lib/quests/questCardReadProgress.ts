import type { QuestSubCard } from "@/data/quests/types";
import { hasPlayableQuizConfig, normalizeQuizConfig } from "@/data/quests/types";
import type { QuizConfig } from "@/data/quests/types";

export function questCardCompositeSlug(parentSlug: string, cardId: string): string {
  return `${parentSlug}#${cardId}`;
}

export type QuestCardReadProgress = {
  /** Composite slugs marked read (e.g. `snapshot#card-1`). */
  readSlugs: string[];
  cardIds: string[];
  cardReadFlags: boolean[];
  cardsRead: number;
  cardsRequired: number;
  allCardsRead: boolean;
  missingCardIds: string[];
  hasQuiz: boolean;
  quizUnlocked: boolean;
  /** Human-readable reasons the quiz CTA stays disabled. */
  lockReasons: string[];
};

export function computeQuestCardReadProgress(input: {
  parentSlug: string;
  cards: readonly QuestSubCard[];
  readQuestSlugs: readonly string[];
  quizConfig?: QuizConfig | null;
  /** Parent slug alone marked read (legacy / single-card). */
  parentSelfRead?: boolean;
}): QuestCardReadProgress {
  const { parentSlug, cards, readQuestSlugs, quizConfig, parentSelfRead = false } =
    input;

  const cardIds =
    cards.length > 0 ? cards.map((c) => c.id) : ["__single__"];

  const cardReadFlags =
    cards.length > 0
      ? cards.map((c) =>
          readQuestSlugs.includes(questCardCompositeSlug(parentSlug, c.id))
        )
      : [parentSelfRead || readQuestSlugs.includes(parentSlug)];

  const missingCardIds =
    cards.length > 0
      ? cards.filter((c, i) => !cardReadFlags[i]).map((c) => c.id)
      : cardReadFlags[0]
        ? []
        : ["__single__"];

  const cardsRead = cardReadFlags.filter(Boolean).length;
  const cardsRequired = cardIds.length;
  const allCardsRead = cardReadFlags.every(Boolean);
  const quiz = normalizeQuizConfig(quizConfig);
  const hasQuiz = hasPlayableQuizConfig(quiz);
  const quizUnlocked = allCardsRead && hasQuiz;

  const lockReasons: string[] = [];
  if (!hasQuiz) {
    lockReasons.push("no_playable_quiz_config");
  }
  if (!allCardsRead) {
    lockReasons.push(
      missingCardIds.length === 1
        ? "cards_incomplete:1"
        : `cards_incomplete:${missingCardIds.length}`
    );
  }

  return {
    readSlugs: [...readQuestSlugs],
    cardIds: cards.length > 0 ? cardIds : [],
    cardReadFlags,
    cardsRead,
    cardsRequired,
    allCardsRead,
    missingCardIds,
    hasQuiz,
    quizUnlocked,
    lockReasons
  };
}

/** Player-facing unlock hints — omitted; card progress UI carries the state. */
export function questQuizUnlockUserMessage(
  _progress: QuestCardReadProgress,
  _cards?: readonly QuestSubCard[]
): string | null {
  return null;
}

/** Admin/debug: why Next: Quiz or quiz CTA stays inactive. */
export function questQuizButtonDisabledReason(
  progress: QuestCardReadProgress
): string | null {
  if (progress.quizUnlocked) return null;
  if (!progress.hasQuiz) {
    return "No playable quiz configured for this quest.";
  }
  if (!progress.allCardsRead) {
    const n = progress.missingCardIds.length;
    return n > 0
      ? `Waiting on ${n} card(s): ${progress.missingCardIds.join(", ")}`
      : "Not all cards marked as read.";
  }
  return progress.lockReasons.length
    ? progress.lockReasons.join("; ")
    : "Quiz unlock conditions not met.";
}
