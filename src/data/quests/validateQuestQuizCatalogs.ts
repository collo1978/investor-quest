/**
 * Dev-only guard: all default quest quiz catalogs obey copy + format variety.
 * Imported from quest library bootstrap — no-op in production builds.
 */
import { assertQuizQuestionsCopy } from "@/lib/quests/quizCopy";
import { COMPANY_CONTENT_BY_ID } from "@/data/quests/content";
import { BUSINESS_QUEST_QUIZZES } from "@/data/quests/businessQuestQuizzes";
import { FINANCIALS_QUEST_QUIZZES } from "@/data/quests/financialsQuestQuizzes";
import { MANAGEMENT_QUEST_QUIZZES } from "@/data/quests/managementQuestQuizzes";
import { FORCES_QUEST_QUIZZES } from "@/data/quests/forcesQuestQuizzes";
import { TEN_K_ROOKIE_FINAL_QUIZ } from "@/data/quests/tenKRookieFinalChallenge";
import { hasPlayableQuizConfig } from "@/data/quests/types";

function validateCatalog(
  label: string,
  catalog: Record<string, { questions: readonly import("@/data/quests/types").QuizQuestion[] }>
): void {
  for (const [slug, config] of Object.entries(catalog)) {
    assertQuizQuestionsCopy(config.questions, `${label}/${slug}`);
  }
}

function validateCompanyContentQuizzes(): void {
  for (const [companyId, content] of Object.entries(COMPANY_CONTENT_BY_ID)) {
    if (!content?.overrides) continue;
    for (const [key, override] of Object.entries(content.overrides)) {
      if (!hasPlayableQuizConfig(override.quizConfig)) continue;
      assertQuizQuestionsCopy(
        override.quizConfig.questions,
        `content/${companyId}/${key}`
      );
    }
  }
}

export function validateQuestQuizCatalogs(): void {
  validateCatalog("business", BUSINESS_QUEST_QUIZZES);
  validateCatalog("financials", FINANCIALS_QUEST_QUIZZES);
  validateCatalog("management", MANAGEMENT_QUEST_QUIZZES);
  validateCatalog("forces", FORCES_QUEST_QUIZZES);
  assertQuizQuestionsCopy(TEN_K_ROOKIE_FINAL_QUIZ.questions, "ten-k-rookie");
  validateCompanyContentQuizzes();
}

if (process.env.NODE_ENV !== "production") {
  validateQuestQuizCatalogs();
}
