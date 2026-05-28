/**
 * Engine — canonical game state shape.
 *
 * Single source of truth for player progression. Persisted via
 * `ProgressionStore` adapters (localStorage today, remote DB tomorrow).
 * Mutated only via reducer actions — never edited directly from the UI.
 */

import { DEFAULT_COMPANY_ID, type CompanyId } from "@/data/companies";
import {
  CONTROLLED_DEMO_MODE,
  getControlledDemoDefaultCompanyId
} from "@/lib/demo/controlledDemo";
import { PLAYABLE_DEMO_COMPANY_IDS } from "@/lib/demo/playableDemo";
import { PILLAR_ORDER, type PillarId } from "@/data/pillars";
import type { BadgeId } from "@/engine/progression/badges";
import type { CompanyStreaks } from "@/engine/progression/streaks";
import { isQuestMapDefaultUnlocked } from "@/engine/progression/pillarUnlockPolicy";
import { emptyStreaks } from "@/engine/progression/streaks";

export const STATE_VERSION = 13;
export const STORAGE_KEY = "investor-quest::state";

export type QuizProgress = {
  attempts: number;
  bestScore: number; // 0..1
  streak: number;
  lastPlayedAt: number;
  passed?: boolean;
};

export type BoardProgress = {
  bull: string[];
  base: string[];
  bear: string[];
  conviction: number; // 0..100
  lastPlayedAt: number;
};

export type TerminalProgress = {
  revenueGrowth: number; // -10..20
  margin: number; // 5..45
  discountRate: number; // 6..14
  score: number; // 0..100
  lastPlayedAt: number;
};

export type QuestWork = {
  notes: string;
  checklist: Record<string, boolean>;
  mini?: {
    quiz?: QuizProgress;
    board?: BoardProgress;
    terminal?: TerminalProgress;
  };
  /** Free-form, per-quest scratch (forwards-compatible with new quest types). */
  meta?: Record<string, unknown>;
};

export type PillarState = {
  unlocked: boolean;
  unlockedAt: number | null;
  /**
   * Quest "completion" is the XP-awarding outcome (e.g. quiz passed).
   * Not the same as "read" — reading the content card is a lighter signal.
   */
  completedQuestSlugs: string[];
  /** Per-quest completion timestamps (key = slug). */
  completedAt: Record<string, number>;
  /**
   * Quests where the user has hit "Mark as Read" on the content card.
   * Reading does NOT award XP and does NOT count as completion — it only
   * tracks reading progress for the dashboard / HUD.
   */
  readQuestSlugs: string[];
  /** Per-quest read timestamps (key = slug). */
  readAt: Record<string, number>;
};

/** Cleared after the player submits conviction on the modal. */
export type PendingConvictionItem = {
  completedPillarId: PillarId;
  /** Next pillar in order that was locked and will unlock after submit; `null` if none. */
  pillarToUnlock: PillarId | null;
};

/** Set when the player clears the center-map 10-K Rookie final challenge. */
export type TenKRookieChallengeRecord = {
  passedAt: number;
  /** Best fraction correct across successful runs (0..1). */
  bestScoreFraction: number;
  /** True if the player ever scored ≥ 0.9 on a passing run. */
  highConviction: boolean;
};

export type CompanyProgress = {
  xp: number;
  level: number;
  /** Independent calendar-day streaks (research vs quiz, etc.). */
  streaks: CompanyStreaks;
  pillars: Record<PillarId, PillarState>;
  questWork: Record<string, QuestWork>; // key = `${pillarId}:${slug}`
  badges: Record<BadgeId, { awardedAt: number }>;
  /** The pillar the player is currently focused on (per-company). */
  activePillarId: PillarId;
  /** The quest the player most recently opened (per-company). */
  activeQuestSlug: string | null;
  /** Epoch ms of the last engine-affecting action for this company. */
  lastActivityAt: number | null;
  /**
   * FIFO: each time a pillar is fully cleared (all quests + quiz), an entry
   * is appended. The next island unlock applies only after conviction for the
   * head item (`submit-conviction-and-advance`).
   */
  pendingConvictionQueue: PendingConvictionItem[];
  /**
   * Per-pillar conviction modal cleared — required with reads + quizzes for
   * the center-map 10-K Rookie final challenge unlock.
   */
  pillarConvictionSubmittedAt: Partial<Record<PillarId, number>>;
  /** Final map challenge — awarded once; replays update bestScoreFraction. */
  tenKRookieChallenge: TenKRookieChallengeRecord | null;
  /** Narrative / map teaser — set when the 10-K rookie challenge is first passed. */
  futureArcRevealedAt: number | null;
  /**
   * Pillars for which the one-time island completion XP bonus was granted
   * (after conviction modal following full pillar clear).
   */
  pillarIslandBonusClaimed: PillarId[];
  /**
   * Quiz streak tiers (3 / 7 / 30) that already paid their one-time XP bonus.
   */
  quizStreakMilestoneXpClaimed: readonly (3 | 7 | 30)[];
  /** Epoch ms when the player dismissed the first-visit `/map` mission brief. */
  questMapBriefDismissedAt: number | null;
  /** Epoch ms when the player dismissed the first-visit Business Island brief. */
  businessIslandBriefDismissedAt: number | null;
  /**
   * Bumped on destructive progress edits (pillar clear, quest reset).
   * Merge prefers the side with the higher revision for pillar/questWork state.
   */
  progressRevision: number;
};

export type OnboardingState = {
  /** Step the player last reached in the onboarding flow. */
  step: number;
  /** Epoch ms when onboarding was completed; `null` until then. */
  completedAt: number | null;
  /** Epoch ms when the cinematic opening was dismissed; `null` until then. */
  openingScreenSeenAt: number | null;
  /** Epoch ms when the welcome landing CTA was tapped; `null` until then. */
  welcomeScreenSeenAt: number | null;
};

export type GameState = {
  version: number;
  playerName: string | null;
  goal: string | null;
  activeCompanyId: CompanyId;
  companies: Record<string, CompanyProgress>;
  /**
   * "Unlocked islands" — top-level campaign access. Today every company
   * is unlocked from the start; this is the boundary that gates future
   * progression-driven campaign reveals (e.g. clear AAPL to unlock TSLA).
   */
  unlockedCompanyIds: CompanyId[];
  onboarding: OnboardingState;
  /** Epoch ms of the last engine-affecting action across the whole save. */
  lastActivityAt: number | null;
};

export function emptyPillarStates(): Record<PillarId, PillarState> {
  return PILLAR_ORDER.reduce((acc, pid) => {
    const unlocked = isQuestMapDefaultUnlocked(pid);
    acc[pid] = {
      unlocked,
      unlockedAt: unlocked ? Date.now() : null,
      completedQuestSlugs: [],
      completedAt: {},
      readQuestSlugs: [],
      readAt: {}
    };
    return acc;
  }, {} as Record<PillarId, PillarState>);
}

export function initialCompanyProgress(): CompanyProgress {
  return {
    xp: 0,
    level: 1,
    streaks: emptyStreaks(),
    pillars: emptyPillarStates(),
    questWork: {},
    badges: {} as Record<BadgeId, { awardedAt: number }>,
    activePillarId: PILLAR_ORDER[0],
    activeQuestSlug: null,
    lastActivityAt: null,
    pendingConvictionQueue: [],
    pillarConvictionSubmittedAt: {},
    tenKRookieChallenge: null,
    futureArcRevealedAt: null,
    pillarIslandBonusClaimed: [],
    quizStreakMilestoneXpClaimed: [],
    questMapBriefDismissedAt: null,
    businessIslandBriefDismissedAt: null,
    progressRevision: 0
  };
}

export function initialState(): GameState {
  const defaultCompanyId = CONTROLLED_DEMO_MODE
    ? getControlledDemoDefaultCompanyId()
    : DEFAULT_COMPANY_ID;
  return {
    version: STATE_VERSION,
    playerName: null,
    goal: null,
    activeCompanyId: defaultCompanyId,
    companies: {
      [defaultCompanyId]: initialCompanyProgress()
    },
    // Default: every company is an unlocked island. Future progression
    // may gate some behind clearing pillars in the previous campaign.
    unlockedCompanyIds: CONTROLLED_DEMO_MODE
      ? [defaultCompanyId]
      : [...PLAYABLE_DEMO_COMPANY_IDS],
    onboarding: {
      step: 0,
      completedAt: null,
      openingScreenSeenAt: null,
      welcomeScreenSeenAt: null
    },
    lastActivityAt: null
  };
}

/** Build the per-quest work key from pillar + slug. */
export function questWorkKey(pillarId: PillarId, slug: string): string {
  return `${pillarId}:${slug}`;
}
