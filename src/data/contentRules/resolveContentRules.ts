/**
 * Lookups for Investor Quest adaptive learning rules (MVP).
 */
import type { PillarId } from "@/data/pillars";
import {
  QUIZ_STANDALONE_RULE_TEXT,
  TRUE_FALSE_RULE_TEXT
} from "@/lib/quests/quizTrueFalseEligibility";
import type { ForcesCategoryId } from "@/data/quests/forcesCategories";
import { isForcesCategoryId } from "@/data/quests/forcesCategories";
import {
  BUSINESS_SECTION_QUIZ_RULES,
  BUSINESS_SECTION_RULES,
  FINANCIALS_SECTION_RULES,
  FORCES_SECTION_RULES,
  ISLAND_QUIZ_RULES,
  ISLAND_RULES,
  MANAGEMENT_SECTION_RULES,
  QUESTION_TYPE_RULES,
  type BusinessSectionQuizRule,
  type IslandQuizRule,
  type BusinessSectionId,
  type FinancialsSectionId,
  type IslandRule,
  type ManagementSectionId,
  type QuestionTypeId,
  type QuestionTypeRule,
  type SectionRule
} from "@/data/contentRules/investorQuestContentRules";
import { canonicalBusinessQuestSlug } from "@/lib/business/businessSlugMigration";
import { isForcesHubSlug } from "@/lib/sec/forcesTopicSectionMap";

export type ResolvedContentRules = {
  island: IslandRule;
  section: SectionRule;
  questionType: QuestionTypeRule;
};

const MANAGEMENT_SLUG_TO_SECTION: Record<string, ManagementSectionId> = {
  "mgmt-1": "leadership",
  "mgmt-quiz": "incentives",
  "mgmt-2": "board",
  "mgmt-governance": "board",
  "mgmt-financial-strength": "capital-allocation",
  "management-summary": "leadership"
};

/** Map quest slug → section rule id for a pillar. */
export function resolveSectionId(
  pillarId: PillarId,
  questSlug: string
): string | null {
  if (pillarId === "business") {
    const canonical = canonicalBusinessQuestSlug(questSlug);
    if (canonical in BUSINESS_SECTION_RULES) return canonical;
    return null;
  }
  if (pillarId === "financials") {
    if (questSlug in FINANCIALS_SECTION_RULES) return questSlug;
    return null;
  }
  if (pillarId === "forces") {
    if (isForcesHubSlug(questSlug)) {
      const cat = questSlug.replace(/^forces-hub-/, "");
      return isForcesCategoryId(cat) ? cat : null;
    }
    const prefix = questSlug.split("-").slice(0, 2).join("-");
    if (isForcesCategoryId(prefix)) return prefix;
    if (questSlug.startsWith("positive-inside")) return "positive-inside";
    if (questSlug.startsWith("positive-outside")) return "positive-outside";
    if (questSlug.startsWith("negative-inside")) return "negative-inside";
    if (questSlug.startsWith("negative-outside")) return "negative-outside";
    return null;
  }
  if (pillarId === "management") {
    return MANAGEMENT_SLUG_TO_SECTION[questSlug] ?? null;
  }
  return null;
}

export function getIslandRule(pillarId: PillarId): IslandRule {
  return ISLAND_RULES[pillarId];
}

/** Island checkpoint quiz — understanding / health / strategy / trust. */
export function getIslandQuizRule(pillarId: PillarId): IslandQuizRule {
  return ISLAND_QUIZ_RULES[pillarId];
}

/** Business sections use per-section checkpoint copy (six distinct feels). */
export function getBusinessSectionQuizRule(
  questSlug: string
): BusinessSectionQuizRule | null {
  const sectionId = canonicalBusinessQuestSlug(questSlug);
  if (sectionId in BUSINESS_SECTION_QUIZ_RULES) {
    return BUSINESS_SECTION_QUIZ_RULES[sectionId as BusinessSectionId];
  }
  return null;
}

/** Pillar quiz rule, or Business section override when applicable. */
export function getQuestQuizRule(
  pillarId: PillarId,
  questSlug?: string
): IslandQuizRule | BusinessSectionQuizRule {
  if (pillarId === "business" && questSlug) {
    const section = getBusinessSectionQuizRule(questSlug);
    if (section) return section;
  }
  return getIslandQuizRule(pillarId);
}

export function getSectionRule(
  pillarId: PillarId,
  sectionId: string
): SectionRule | null {
  switch (pillarId) {
    case "business":
      return BUSINESS_SECTION_RULES[sectionId as BusinessSectionId] ?? null;
    case "financials":
      return FINANCIALS_SECTION_RULES[sectionId as FinancialsSectionId] ?? null;
    case "forces":
      return FORCES_SECTION_RULES[sectionId as ForcesCategoryId] ?? null;
    case "management":
      return MANAGEMENT_SECTION_RULES[sectionId as ManagementSectionId] ?? null;
    default:
      return null;
  }
}

export function getQuestionTypeRule(id: QuestionTypeId): QuestionTypeRule {
  return QUESTION_TYPE_RULES[id];
}

/** Infer question-type rule from investor question text + pillar context. */
export function inferQuestionTypeId(input: {
  pillarId: PillarId;
  questSlug: string;
  investorQuestion?: string | null;
}): QuestionTypeId {
  const q = (input.investorQuestion ?? "").toLowerCase();

  if (
    /what problem|solve for customer|frustration|slow|lag|annoy/.test(q)
  ) {
    return "problem-solved";
  }
  if (
    /how do they make money|make money|products? or services|what do they sell|where does.*money|revenue come/.test(
      q
    )
  ) {
    return "business-model";
  }
  if (
    /why.*choose|trust|protect|edge|advantage|hard to beat|moat|stick with/.test(
      q
    )
  ) {
    return "competitive-advantage";
  }
  if (/how big|position|market share|important in the market/.test(q)) {
    return "market-position";
  }
  if (
    /profit|margin|cash flow|balance sheet|financial strength|debt|earn per share|eps/.test(
      q
    )
  ) {
    return "financial-health";
  }
  if (/trust|board|ceo|executive|pay|compensation|governance|who runs/.test(q)) {
    return "management-trust";
  }
  if (/could go wrong|risk|regulation|export|hurt|headwind|threat/.test(q)) {
    return input.pillarId === "forces" ? "force-hurt" : "risk-awareness";
  }
  if (/help|tailwind|strength|positive|could help/.test(q) && input.pillarId === "forces") {
    return "force-help";
  }
  if (/what does.*do|actually do|what is.*company/.test(q)) {
    return "company-understanding";
  }

  if (input.pillarId === "financials") return "financial-health";
  if (input.pillarId === "forces") {
    const section = resolveSectionId("forces", input.questSlug);
    if (section?.startsWith("negative")) return "force-hurt";
    return "force-help";
  }
  if (input.pillarId === "management") return "management-trust";
  if (input.pillarId === "business") return "company-understanding";
  return "company-understanding";
}

export function resolveContentRules(input: {
  pillarId: PillarId;
  questSlug: string;
  investorQuestion?: string | null;
}): ResolvedContentRules | null {
  const sectionId = resolveSectionId(input.pillarId, input.questSlug);
  if (!sectionId) return null;
  const section = getSectionRule(input.pillarId, sectionId);
  if (!section) return null;
  const questionTypeId = inferQuestionTypeId(input);
  return {
    island: getIslandRule(input.pillarId),
    section,
    questionType: getQuestionTypeRule(questionTypeId)
  };
}

/** All avoid phrases across rules — for copy guards and lint. */
export function collectGlobalAvoidPhrases(): readonly string[] {
  const sets: string[][] = [];
  for (const r of Object.values(ISLAND_RULES)) sets.push([...r.avoid]);
  for (const r of Object.values(QUESTION_TYPE_RULES)) sets.push([...r.avoid]);
  return [...new Set(sets.flat())];
}

/**
 * Compact brief for LLM / pipeline prompts (future content generation).
 */
export function formatContentRuleBriefForPrompt(
  resolved: ResolvedContentRules
): string {
  const { island, section, questionType } = resolved;
  const quiz = getIslandQuizRule(island.pillarId);
  return [
    `Island (${island.pillarId}): ${island.teachingGoal}`,
    `Island tone: ${island.emotionalTone}`,
    `Section (${section.sectionLabel}): ${section.teachingGoal}`,
    `Section tone: ${section.emotionalTone}`,
    `Question type (${questionType.label}): ${questionType.answerStyle}`,
    `Quiz checkpoint (${quiz.quizKind}): ${quiz.checkpointGoal}`,
    `Quiz interaction: ${quiz.interactionStyle}`,
    `Preferred quiz kinds: ${quiz.preferredQuestionKinds.join(", ")}`,
    `Player should feel: ${island.playerFeeling}`,
    `Avoid: ${[...new Set([...island.avoid, ...section.avoid, ...questionType.avoid])].join("; ")}`,
    `Example style: ${questionType.exampleAnswerStyle}`
  ].join("\n");
}

/** Compact quiz-only brief for section checkpoint generation. */
export function formatIslandQuizBriefForPrompt(
  pillarId: PillarId,
  questSlug?: string
): string {
  const quiz = getQuestQuizRule(pillarId, questSlug);
  const island = getIslandRule(pillarId);
  const preferred =
    "preferredQuestionKinds" in quiz
      ? quiz.preferredQuestionKinds.join(", ")
      : getIslandQuizRule(pillarId).preferredQuestionKinds.join(", ");
  return [
    `Checkpoint: ${quiz.quizKind}`,
    `Goal: ${quiz.checkpointGoal}`,
    `Tone: ${quiz.emotionalTone}`,
    `Interaction: ${quiz.interactionStyle}`,
    `Preferred kinds: ${preferred}`,
    `Island teaching: ${island.teachingGoal}`,
    `Player payoff: ${island.playerFeeling}`,
    TRUE_FALSE_RULE_TEXT,
    QUIZ_STANDALONE_RULE_TEXT
  ].join("\n");
}
