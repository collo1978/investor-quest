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

export function questQuizUnlockUserMessage(
  progress: QuestCardReadProgress,
  cards?: readonly QuestSubCard[]
): string | null {
  if (progress.quizUnlocked) return null;
  if (!progress.hasQuiz) {
    return "Mastery quiz is not available for this quest yet.";
  }
  const n = progress.missingCardIds.length;
  if (n === 0) return null;
  if (n === 1 && cards?.length) {
    const id = progress.missingCardIds[0];
    const card = cards.find((c) => c.id === id);
    if (card) {
      return "You still need to mark 1 card as read — finish the current card above.";
    }
  }
  return `You still need to complete ${n} card${n === 1 ? "" : "s"} before the quiz unlocks.`;
}
