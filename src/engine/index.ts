/**
 * Engine — public API.
 *
 * UI code should import from `@/engine` (not the internal submodules).
 * This is the boundary between the React layer and the pure game logic.
 */

export type {
  GameState,
  CompanyProgress,
  PendingConvictionItem,
  PillarState,
  QuestWork,
  OnboardingState,
  QuizProgress,
  BoardProgress,
  TerminalProgress,
  TenKRookieChallengeRecord
} from "@/engine/progression/state";
export {
  initialState,
  initialCompanyProgress,
  emptyPillarStates,
  questWorkKey,
  STATE_VERSION,
  STORAGE_KEY
} from "@/engine/progression/state";

export {
  migrateRaw,
  loadState,
  saveState,
  clearSavedState
} from "@/engine/progression/persistence";

export {
  computeLevel,
  levelBand,
  levelProgress,
  type LevelProgress
} from "@/engine/progression/xp";

export {
  XP_SECTION_QUIZ,
  XP_QUIZ_PERFECT_BONUS,
  XP_ISLAND_COMPLETION,
  XP_STREAK_DAILY_BONUS,
  XP_TEN_Q_COMPLETION,
  XP_EARNINGS_CALL_COMPLETION,
  XP_QUIZ_STREAK_3,
  XP_QUIZ_STREAK_7,
  XP_QUIZ_STREAK_30
} from "@/engine/progression/xpEconomy";

export {
  isPillarComplete,
  allPillarsComplete,
  pillarCompletionPct,
  nextUnlockablePillar,
  applyPillarUnlock
} from "@/engine/progression/unlocks";

export {
  todayYmd,
  yesterdayYmd,
  tickStreak,
  emptyStreaks,
  STREAK_KINDS,
  STREAK_LABELS,
  type StreakState,
  type StreakKind,
  type CompanyStreaks
} from "@/engine/progression/streaks";

export {
  BADGES,
  detectNewBadges,
  type BadgeId,
  type BadgeDef,
  type AwardedBadge
} from "@/engine/progression/badges";

export {
  reduce,
  applyAction,
  type GameAction,
  type RewardEvent,
  type ReduceResult
} from "@/engine/progression/reducer";

export {
  getActiveCompanyProgress,
  getLevelProgress,
  getPillarViews,
  getPillarQuestViews,
  getQuestView,
  getCompletedQuestCount,
  getUnlockedIslandCount,
  isAllPillarsCompleteFor,
  getQuestReward,
  getIslandViews,
  getNextPillarUnlock,
  getQuestProgressPct,
  getCampaignViews,
  isCompanyUnlocked,
  getUnlockedCompanies,
  getActiveQuestPointer,
  getResumeTarget,
  isQuestRead,
  getPillarReadingProgress,
  getReadingProgress,
  isPillarReadingComplete,
  isTenKFinalChallengeUnlocked,
  getTenKFinalChallengeGateRows,
  type PillarView,
  type QuestView,
  type IslandView,
  type CampaignView,
  type ActiveQuestPointer,
  type ReadingProgress,
  type TenKFinalGateRow
} from "@/engine/progression/selectors";

// Persistence adapters: ProgressionStore + concrete implementations.
export {
  defaultStore,
  localStorageStore,
  memoryStore,
  createMemoryStore,
  type ProgressionStore,
  type StoreSubscriber,
  type StoreSync
} from "@/engine/persistence";
