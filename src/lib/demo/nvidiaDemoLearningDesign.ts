/**
 * NVIDIA controlled demo — wires Investor Quest content rules into demo copy.
 * Does not change routes or Supabase; enriches pillar/quest labels from the rules brain.
 */
import type { PillarId } from "@/data/pillars";
import { contentKey } from "@/data/quests/content";
import type { QuestContentOverride } from "@/data/quests/content/types";
import type { CompanyId } from "@/data/companies";
import {
  collectGlobalAvoidPhrases,
  formatContentRuleBriefForPrompt,
  formatIslandQuizBriefForPrompt,
  getIslandRule,
  resolveContentRules,
  resolveSectionId,
  type ResolvedContentRules
} from "@/data/contentRules";
/** Local mirrors — avoid importing `controlledDemo` (cycle with quest content index). */
const NVIDIA_CONTROLLED_DEMO_MODE =
  process.env.NEXT_PUBLIC_CONTROLLED_DEMO !== "false";
const NVIDIA_DEMO_COMPANY_ID = "nvda" as const satisfies CompanyId;

export function useInvestorQuestLearningDesign(): boolean {
  return NVIDIA_CONTROLLED_DEMO_MODE;
}

/** Island subtitle + description from island rules (adaptive learning design). */
export function demoPillarCopyFromRules(pillarId: PillarId): {
  subtitle: string;
  description: string;
  playerFeeling: string;
} {
  const island = getIslandRule(pillarId);
  return {
    subtitle: island.teachingGoal,
    description: `${island.emotionalTone} ${island.presentationStyle}`,
    playerFeeling: island.playerFeeling
  };
}

export function resolveDemoQuestLearningRules(
  pillarId: PillarId,
  slug: string,
  investorQuestion?: string | null
): ResolvedContentRules | null {
  if (!NVIDIA_CONTROLLED_DEMO_MODE) return null;
  return resolveContentRules({ pillarId, questSlug: slug, investorQuestion });
}

/**
 * Optional dev metadata merged into quest overrides — documents which rules apply.
 * Stripped from player UI; useful for authors and future generators.
 */
export function learningDesignAuthorNote(
  pillarId: PillarId,
  slug: string,
  investorQuestion?: string | null
): Pick<QuestContentOverride, "whyItMatters"> | undefined {
  const resolved = resolveDemoQuestLearningRules(
    pillarId,
    slug,
    investorQuestion
  );
  if (!resolved) return undefined;
  const sectionId = resolveSectionId(pillarId, slug);
  return {
    whyItMatters: `[LD:${pillarId}/${sectionId ?? slug}] ${resolved.section.teachingGoal} · Feel: ${resolved.island.playerFeeling}`
  };
}

/** Island checkpoint quiz brief for quiz authoring / generation (MVP). */
export function demoIslandQuizPromptBlock(pillarId: PillarId): string | null {
  if (!NVIDIA_CONTROLLED_DEMO_MODE) return null;
  return formatIslandQuizBriefForPrompt(pillarId);
}

/** Full prompt block for quest-generation pipelines (MVP). */
export function demoQuestGenerationPromptBlock(
  pillarId: PillarId,
  slug: string,
  investorQuestion?: string | null
): string | null {
  const resolved = resolveDemoQuestLearningRules(
    pillarId,
    slug,
    investorQuestion
  );
  if (!resolved) return null;
  const brief = formatContentRuleBriefForPrompt(resolved);
  const globalAvoid = collectGlobalAvoidPhrases();
  return [
    brief,
    `Platform-wide avoid (never use): ${globalAvoid.join("; ")}`
  ].join("\n");
}

export const DEMO_LEARNING_DESIGN_USER_APPEND_HEADER =
  "--- ADAPTIVE LEARNING DESIGN (NVIDIA demo — must follow) ---";

export function shouldInjectDemoLearningDesign(companyId: CompanyId): boolean {
  return NVIDIA_CONTROLLED_DEMO_MODE && companyId === NVIDIA_DEMO_COMPANY_ID;
}

/** Appends island + section + question-type rules to a card user prompt. */
export function appendDemoLearningDesignToUserPrompt(
  userPrompt: string,
  pillarId: PillarId,
  questSlug: string,
  investorQuestion?: string | null
): string {
  const block = demoQuestGenerationPromptBlock(
    pillarId,
    questSlug,
    investorQuestion
  );
  if (!block) return userPrompt;
  return [
    userPrompt,
    "",
    DEMO_LEARNING_DESIGN_USER_APPEND_HEADER,
    block,
    "",
    "Requirements:",
    "- Match the card question exactly (do not dodge or answer a different question).",
    "- Follow island + section teaching style AND question-type style above.",
    "- Use the example tone as a pattern, not a script to paste verbatim.",
    "- Respect every avoid phrase; prefer plain English the player already understands."
  ].join("\n");
}

export const DEMO_PILLAR_RULE_ORDER = [
  "business",
  "financials",
  "forces",
  "management"
] as const satisfies readonly PillarId[];

export function demoContentKey(
  pillarId: PillarId,
  slug: string
): string {
  return contentKey(pillarId, slug);
}
