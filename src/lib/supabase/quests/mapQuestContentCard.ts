import { isForcesCategoryId } from "@/data/quests/forcesCategories";
import type { QuestTemplate } from "@/data/quests/types";
import { normalizeQuizConfig } from "@/data/quests/types";
import type {
  QuestContentCardInput,
  QuestContentCardRow
} from "@/lib/supabase/quests/types";

function completionFromRow(row: QuestContentCardRow): QuestTemplate["completionState"] {
  const quiz = normalizeQuizConfig(row.quiz_config ?? undefined);
  if (quiz) {
    return { kind: "quiz", passPct: quiz.passThreshold };
  }
  if (row.pillar_id === "forces") {
    return { kind: "read" };
  }
  return { kind: "quiz", passPct: 0.66 };
}

export function mapRowToQuestTemplate(row: QuestContentCardRow): QuestTemplate {
  const forcesCategory =
    row.forces_category && isForcesCategoryId(row.forces_category)
      ? row.forces_category
      : undefined;

  return {
    slug: row.slug,
    type: row.quest_type,
    pillarId: row.pillar_id,
    title: row.title,
    objective: row.objective,
    description: row.description,
    investorQuestion: row.investor_question,
    plainEnglishAnswer: row.plain_english_answer,
    whyItMatters: row.why_this_matters,
    secSection: {
      form: row.source_filing_type,
      section: row.source_section_label,
      hint: `section_key:${row.source_section_key}`
    },
    aiTask: row.ai_prompt_template,
    artifactType: "one-pager",
    rewardXp: row.xp_reward,
    unlockRequirements: { pillar: row.pillar_id },
    completionState: completionFromRow(row),
    difficulty: "intro",
    visualStyle: "card",
    estimatedTime: 3,
    displayOrder: row.display_order,
    hubIcon: row.hub_icon,
    hubSubtitle: row.hub_subtitle,
    hubCardCount: row.hub_card_count,
    hubRoute: row.hub_route,
    hubLocked: row.hub_locked,
    forcesCategory,
    tags: [row.quest_type, row.pillar_id, ...(forcesCategory ? [forcesCategory] : [])],
    quizConfig: normalizeQuizConfig(row.quiz_config ?? undefined)
  };
}

export function mapInputToRow(
  input: QuestContentCardInput
): Omit<QuestContentCardRow, "id" | "created_at" | "updated_at"> {
  return {
    slug: input.slug.trim(),
    pillar_id: input.pillarId,
    quest_type: input.questType,
    title: input.title.trim(),
    objective: input.objective?.trim() ?? "",
    description: input.description?.trim() ?? "",
    investor_question: input.investorQuestion.trim(),
    why_this_matters: input.whyThisMatters.trim(),
    plain_english_answer: input.plainEnglishAnswer?.trim() ?? null,
    source_filing_type: input.sourceFilingType,
    source_section_key: input.sourceSectionKey,
    source_section_label: input.sourceSectionLabel,
    ai_prompt_template: input.aiPromptTemplate.trim(),
    xp_reward: input.xpReward,
    quiz_format: input.quizFormat,
    quiz_config: input.quizConfig ?? null,
    display_order: input.displayOrder ?? 0,
    hub_icon: input.hubIcon ?? null,
    hub_subtitle: input.hubSubtitle ?? null,
    hub_card_count: input.hubCardCount ?? null,
    hub_route: input.hubRoute ?? null,
    hub_locked: input.hubLocked ?? null,
    forces_category: input.forcesCategory ?? null,
    partner_ids: input.partnerIds ?? [],
    is_active: input.isActive ?? true
  };
}

export function mapRowToAdminDto(row: QuestContentCardRow) {
  return {
    id: row.id,
    slug: row.slug,
    pillarId: row.pillar_id,
    questType: row.quest_type,
    title: row.title,
    objective: row.objective,
    description: row.description,
    investorQuestion: row.investor_question,
    whyThisMatters: row.why_this_matters,
    plainEnglishAnswer: row.plain_english_answer,
    sourceFilingType: row.source_filing_type,
    sourceSectionKey: row.source_section_key,
    sourceSectionLabel: row.source_section_label,
    aiPromptTemplate: row.ai_prompt_template,
    xpReward: row.xp_reward,
    quizFormat: row.quiz_format,
    quizConfig: row.quiz_config,
    displayOrder: row.display_order,
    hubIcon: row.hub_icon,
    hubSubtitle: row.hub_subtitle,
    hubCardCount: row.hub_card_count,
    hubRoute: row.hub_route,
    hubLocked: row.hub_locked,
    forcesCategory: row.forces_category,
    partnerIds: row.partner_ids ?? [],
    isActive: row.is_active,
    updatedAt: row.updated_at
  };
}
