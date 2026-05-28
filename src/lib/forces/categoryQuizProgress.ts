import type { ForcesCategoryId } from "@/data/quests/forcesCategories";
import { islandQuizSectionTitle } from "@/lib/quests/islandQuizStyle";
import {
  hasPlayableQuizConfig,
  normalizeQuizConfig,
  type QuizConfig
} from "@/data/quests/types";

export type ForcesCategoryQuizProgress = {
  topicSlugs: string[];
  topicsRead: number;
  topicsRequired: number;
  allTopicsRead: boolean;
  missingTopicSlugs: string[];
  hasQuiz: boolean;
  quizUnlocked: boolean;
  hubCompleted: boolean;
  categoryComplete: boolean;
};

export function computeForcesCategoryQuizProgress(input: {
  topicSlugs: readonly string[];
  readQuestSlugs: readonly string[];
  completedQuestSlugs: readonly string[];
  quizConfig?: QuizConfig | null;
  hubSlug: string;
}): ForcesCategoryQuizProgress {
  const { topicSlugs, readQuestSlugs, completedQuestSlugs, quizConfig, hubSlug } =
    input;

  const readSet = new Set(readQuestSlugs);
  const missingTopicSlugs = topicSlugs.filter((s) => !readSet.has(s));
  const topicsRead = topicSlugs.length - missingTopicSlugs.length;
  const topicsRequired = topicSlugs.length;
  const allTopicsRead =
    topicsRequired > 0 && missingTopicSlugs.length === 0;
  const quiz = normalizeQuizConfig(quizConfig);
  const hasQuiz = hasPlayableQuizConfig(quiz);
  const quizUnlocked = allTopicsRead && hasQuiz;
  const hubCompleted = completedQuestSlugs.includes(hubSlug);
  const categoryComplete = allTopicsRead && hubCompleted;

  return {
    topicSlugs: [...topicSlugs],
    topicsRead,
    topicsRequired,
    allTopicsRead,
    missingTopicSlugs,
    hasQuiz,
    quizUnlocked,
    hubCompleted,
    categoryComplete
  };
}

export function forcesCategoryQuizUnlockMessage(
  progress: ForcesCategoryQuizProgress
): string | null {
  if (progress.hubCompleted) return null;
  if (!progress.hasQuiz) return null;
  if (progress.quizUnlocked) return null;
  const left = progress.topicsRequired - progress.topicsRead;
  if (left <= 0) return "Complete all topics to unlock quiz";
  return `Complete all topics to unlock quiz (${progress.topicsRead}/${progress.topicsRequired} read)`;
}

export function forcesCategoryQuizTitle(categoryId: ForcesCategoryId): string {
  const sectionLabel =
    categoryId === "positive-inside"
      ? "Positive Inside"
      : categoryId === "positive-outside"
        ? "Positive Outside"
        : categoryId === "negative-inside"
          ? "Negative Inside"
          : categoryId === "negative-outside"
            ? "Negative Outside"
            : "Forces";
  return islandQuizSectionTitle("forces", sectionLabel);
}
