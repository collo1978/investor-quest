/**
 * Data Layer, company-specific quest content overrides.
 *
 * Companies share the same {@link QuestTemplate} blueprints (so quest
 * structure stays company-agnostic), but the *actual* plain-English
 * answers and quiz questions need to be company-specific. This file
 * defines the override types; the per-company content lives in
 * sibling files (e.g. `apple.ts`) and is registered in `./index.ts`.
 *
 * Future: the SEC -> AI pipeline will populate `CompanyQuestContent`
 * records by parsing each company's filings. For the MVP we hand-author
 * the content as a structured data file.
 */
import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import type { QuizConfig, SecSectionRef } from "@/data/quests/types";

/**
 * Resolved per-sub-card content for a multi-card quest. Maps to the
 * fields of `QuestSubCard` that may need a company-specific override.
 */
export type SubCardContent = {
  plainEnglishAnswer: string;
  /** Elite one-liner for the reading HUD (optional). */
  investorInsight?: string;
  /** Optional per-card question override (demo / curated copy). */
  investorQuestion?: string;
};

/**
 * Override for a single quest, keyed inside `CompanyContent.overrides`
 * by the composite key `${pillarId}:${slug}`.
 */
export type QuestContentOverride = {
  /** Optional display title override. */
  title?: string;
  /** Hub tile + hero subtitle hook. */
  investorQuestion?: string;
  /** Short quest blurb on detail screens. */
  objective?: string;
  description?: string;
  whyItMatters?: string;
  /** Optional source line override (form + section label). */
  secSection?: SecSectionRef;
  /** Single-card quests: the plain-English answer for the parent quest. */
  plainEnglishAnswer?: string;
  /** Single-card: optional investor insight line for the HUD. */
  investorInsight?: string;
  /**
   * Multi-card quests: per-sub-card overrides keyed by `QuestSubCard.id`.
   * Only the listed cards are overridden; the rest fall back to the
   * template's default content (typically `null` -> placeholder).
   */
  cards?: Record<string, SubCardContent>;
  /**
   * Optional quiz config. When present, the quest's quiz panel becomes
   * available once the parent quest is marked read (which, for
   * multi-card quests, happens automatically after every sub-card is
   * marked read). Passing the quiz dispatches `complete-quest` and
   * awards the template's `rewardXp`.
   */
  quizConfig?: QuizConfig;
};

/** All overrides for a single company. */
export type CompanyContent = {
  companyId: CompanyId;
  /** Keyed by `${pillarId}:${slug}`. */
  overrides: Record<string, QuestContentOverride>;
};

/** Build the lookup key used inside `CompanyContent.overrides`. */
export function contentKey(pillarId: PillarId, slug: string): string {
  return `${pillarId}:${slug}`;
}