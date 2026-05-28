/**
 * Dev-only guard: all default quest quiz catalogs obey copy standards.
 * Imported from quest library bootstrap — no-op in production builds.
 */
import { assertQuizQuestionsCopy } from "@/lib/quests/quizCopy";
import { BUSINESS_QUEST_QUIZZES } from "@/data/quests/businessQuestQuizzes";
import { FINANCIALS_QUEST_QUIZZES } from "@/data/quests/financialsQuestQuizzes";
import { MANAGEMENT_QUEST_QUIZZES } from "@/data/quests/managementQuestQuizzes";
import { FORCES_QUEST_QUIZZES } from "@/data/quests/forcesQuestQuizzes";
import { TEN_K_ROOKIE_FINAL_QUIZ } from "@/data/quests/tenKRookieFinalChallenge";

function validateCatalog(
  label: string,
  catalog: Record<string, { questions: readonly import("@/data/quests/types").QuizQuestion[] }>
): void {
  for (const [slug, config] of Object.entries(catalog)) {
    assertQuizQuestionsCopy(config.questions, `${label}/${slug}`);
  }
}

export function validateQuestQuizCatalogs(): void {
  validateCatalog("business", BUSINESS_QUEST_QUIZZES);
  validateCatalog("financials", FINANCIALS_QUEST_QUIZZES);
  validateCatalog("management", MANAGEMENT_QUEST_QUIZZES);
  validateCatalog("forces", FORCES_QUEST_QUIZZES);
  assertQuizQuestionsCopy(TEN_K_ROOKIE_FINAL_QUIZ.questions, "ten-k-rookie");
}

if (process.env.NODE_ENV !== "production") {
  validateQuestQuizCatalogs();
}
