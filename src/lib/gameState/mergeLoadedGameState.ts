import { PILLAR_ORDER, type PillarId } from "@/data/pillars";
import {
  CONTROLLED_DEMO_COMPANY_ID,
  CONTROLLED_DEMO_MODE
} from "@/lib/demo/controlledDemo";
import { initialCompanyProgress } from "@/engine/progression/state";
import type { BadgeId } from "@/engine/progression/badges";
import {
  STREAK_KINDS,
  type CompanyStreaks,
  type StreakState
} from "@/engine/progression/streaks";
import type {
  CompanyProgress,
  GameState,
  PillarState,
  QuestWork,
  QuizProgress,
  SchoolsLearnerProfile
} from "@/engine/progression/state";
import { computeLevel } from "@/engine/progression/xp";
import { migrateBusinessIslandProgress } from "@/lib/business/businessSlugMigration";

function mergeSchoolsProfile(
  inMemory: SchoolsLearnerProfile,
  loaded: SchoolsLearnerProfile
): SchoolsLearnerProfile {
  return {
    avatarId: inMemory.avatarId ?? loaded.avatarId,
    armorId: inMemory.armorId ?? loaded.armorId,
    learnerType: [
      ...new Set([...loaded.learnerType, ...inMemory.learnerType])
    ],
    interests: [...new Set([...loaded.interests, ...inMemory.interests])],
    updatedAt: Math.max(inMemory.updatedAt ?? 0, loaded.updatedAt ?? 0) || null
  };
}

function mergeStreakState(a: StreakState, b: StreakState): StreakState {
  if (a.streak > b.streak) return a;
  if (b.streak > a.streak) return b;
  if (a.lastDay && b.lastDay) {
    return a.lastDay >= b.lastDay ? a : b;
  }
  return a.lastDay ? a : b;
}

function mergeStreaks(a: CompanyStreaks, b: CompanyStreaks): CompanyStreaks {
  const out = { ...a };
  for (const kind of STREAK_KINDS) {
    out[kind] = mergeStreakState(a[kind], b[kind]);
  }
  return out;
}

function mergeQuizProgress(a: QuizProgress, b: QuizProgress): QuizProgress {
  const bestScore = Math.max(a.bestScore, b.bestScore);
  return {
    attempts: Math.max(a.attempts, b.attempts),
    bestScore,
    streak: Math.max(a.streak, b.streak),
    lastPlayedAt: Math.max(a.lastPlayedAt, b.lastPlayedAt),
    passed: a.passed || b.passed || bestScore >= 0.7
  };
}

function mergeQuestWorkEntry(a: QuestWork, b: QuestWork): QuestWork {
  const aQuiz = a.mini?.quiz;
  const bQuiz = b.mini?.quiz;
  const mergedQuiz =
    aQuiz && bQuiz
      ? mergeQuizProgress(aQuiz, bQuiz)
      : aQuiz ?? bQuiz;

  return {
    notes: a.notes.length >= b.notes.length ? a.notes : b.notes,
    checklist: { ...b.checklist, ...a.checklist },
    mini: mergedQuiz
      ? {
          ...a.mini,
          ...b.mini,
          quiz: mergedQuiz
        }
      : a.mini ?? b.mini,
    meta: { ...b.meta, ...a.meta }
  };
}

function mergeQuestWork(
  inMemory: CompanyProgress["questWork"],
  loaded: CompanyProgress["questWork"]
): CompanyProgress["questWork"] {
  const keys = new Set([...Object.keys(inMemory), ...Object.keys(loaded)]);
  const out: CompanyProgress["questWork"] = {};
  for (const key of keys) {
    const mem = inMemory[key];
    const load = loaded[key];
    if (mem && load) out[key] = mergeQuestWorkEntry(mem, load);
    else out[key] = mem ?? load!;
  }
  return out;
}

function mergeBadges(
  inMemory: CompanyProgress["badges"],
  loaded: CompanyProgress["badges"]
): CompanyProgress["badges"] {
  const out = { ...loaded, ...inMemory };
  for (const id of Object.keys(out) as BadgeId[]) {
    const mem = inMemory[id];
    const load = loaded[id];
    if (mem && load) {
      out[id] = {
        awardedAt: Math.min(mem.awardedAt, load.awardedAt)
      };
    }
  }
  return out;
}

function mergePillarProgressState(
  inMemory: PillarState,
  loaded: PillarState
): PillarState {
  const readSet = new Set([
    ...loaded.readQuestSlugs,
    ...inMemory.readQuestSlugs
  ]);
  const completedSet = new Set([
    ...loaded.completedQuestSlugs,
    ...inMemory.completedQuestSlugs
  ]);
  return {
    unlocked: inMemory.unlocked || loaded.unlocked,
    unlockedAt:
      inMemory.unlockedAt && loaded.unlockedAt
        ? Math.min(inMemory.unlockedAt, loaded.unlockedAt)
        : inMemory.unlockedAt ?? loaded.unlockedAt,
    readQuestSlugs: [...readSet],
    readAt: { ...loaded.readAt, ...inMemory.readAt },
    completedQuestSlugs: [...completedSet],
    completedAt: { ...loaded.completedAt, ...inMemory.completedAt }
  };
}

function mergePendingConvictionQueue(
  inMemory: CompanyProgress["pendingConvictionQueue"],
  loaded: CompanyProgress["pendingConvictionQueue"]
): CompanyProgress["pendingConvictionQueue"] {
  const seen = new Set<PillarId>();
  const out: CompanyProgress["pendingConvictionQueue"] = [];
  for (const item of [...loaded, ...inMemory]) {
    if (seen.has(item.completedPillarId)) continue;
    seen.add(item.completedPillarId);
    out.push(item);
  }
  return out;
}

function mergeCompanyProgressUnion(
  inMemory: CompanyProgress,
  loaded: CompanyProgress
): CompanyProgress {
  const pillars = { ...loaded.pillars };
  for (const pillarId of PILLAR_ORDER) {
    const mem = inMemory.pillars[pillarId];
    const load = loaded.pillars[pillarId];
    if (mem && load) {
      pillars[pillarId] = mergePillarProgressState(mem, load);
    }
  }

  const xp = Math.max(inMemory.xp, loaded.xp);

  const pillarConvictionSubmittedAt = {
    ...loaded.pillarConvictionSubmittedAt,
    ...inMemory.pillarConvictionSubmittedAt
  };
  for (const pid of PILLAR_ORDER) {
    const mem = inMemory.pillarConvictionSubmittedAt[pid];
    const load = loaded.pillarConvictionSubmittedAt[pid];
    if (mem != null && load != null) {
      pillarConvictionSubmittedAt[pid] = Math.max(mem, load);
    }
  }

  const tenKRookieChallenge =
    inMemory.tenKRookieChallenge && loaded.tenKRookieChallenge
      ? inMemory.tenKRookieChallenge.bestScoreFraction >=
        loaded.tenKRookieChallenge.bestScoreFraction
        ? {
            ...loaded.tenKRookieChallenge,
            ...inMemory.tenKRookieChallenge,
            highConviction:
              inMemory.tenKRookieChallenge.highConviction ||
              loaded.tenKRookieChallenge.highConviction
          }
        : {
            ...inMemory.tenKRookieChallenge,
            ...loaded.tenKRookieChallenge,
            highConviction:
              inMemory.tenKRookieChallenge.highConviction ||
              loaded.tenKRookieChallenge.highConviction
          }
      : inMemory.tenKRookieChallenge ?? loaded.tenKRookieChallenge;

  const pillarIslandBonusClaimed = [
    ...new Set([
      ...loaded.pillarIslandBonusClaimed,
      ...inMemory.pillarIslandBonusClaimed
    ])
  ] as PillarId[];

  const quizStreakMilestoneXpClaimed = [
    ...new Set([
      ...loaded.quizStreakMilestoneXpClaimed,
      ...inMemory.quizStreakMilestoneXpClaimed
    ])
  ] as (3 | 7 | 30)[];

  return {
    ...loaded,
    xp,
    level: computeLevel(xp),
    streaks: mergeStreaks(inMemory.streaks, loaded.streaks),
    pillars,
    questWork: mergeQuestWork(inMemory.questWork, loaded.questWork),
    badges: mergeBadges(inMemory.badges, loaded.badges),
    activeQuestSlug: inMemory.activeQuestSlug ?? loaded.activeQuestSlug,
    activePillarId: inMemory.activePillarId ?? loaded.activePillarId,
    lastActivityAt: Math.max(
      inMemory.lastActivityAt ?? 0,
      loaded.lastActivityAt ?? 0
    ) || null,
    pendingConvictionQueue: mergePendingConvictionQueue(
      inMemory.pendingConvictionQueue,
      loaded.pendingConvictionQueue
    ),
    pillarConvictionSubmittedAt,
    tenKRookieChallenge,
    futureArcRevealedAt:
      inMemory.futureArcRevealedAt ?? loaded.futureArcRevealedAt,
    pillarIslandBonusClaimed,
    quizStreakMilestoneXpClaimed,
    questMapBriefDismissedAt:
      inMemory.progressRevision >= (loaded.progressRevision ?? 0)
        ? inMemory.questMapBriefDismissedAt
        : (inMemory.questMapBriefDismissedAt ?? loaded.questMapBriefDismissedAt),
    businessIslandBriefDismissedAt:
      inMemory.businessIslandBriefDismissedAt ??
      loaded.businessIslandBriefDismissedAt,
    progressRevision: Math.max(
      inMemory.progressRevision ?? 0,
      loaded.progressRevision ?? 0
    )
  };
}

function mergeCompanyProgress(
  inMemory: CompanyProgress | undefined,
  loaded: CompanyProgress
): CompanyProgress {
  if (!inMemory) return loaded;

  const memRev = inMemory.progressRevision ?? 0;
  const loadRev = loaded.progressRevision ?? 0;
  const merged = mergeCompanyProgressUnion(inMemory, loaded);

  if (memRev > loadRev) {
    return {
      ...merged,
      pillars: inMemory.pillars,
      questWork: { ...loaded.questWork, ...inMemory.questWork },
      progressRevision: memRev
    };
  }
  if (loadRev > memRev) {
    return {
      ...merged,
      pillars: loaded.pillars,
      questWork: { ...inMemory.questWork, ...loaded.questWork },
      progressRevision: loadRev
    };
  }
  return merged;
}

/**
 * Apply persisted state without dropping in-tab progress (Strict Mode remount,
 * slow hydration after "Mark as read", or cross-tab merge).
 *
 * `inMemory` is the current React state; `loaded` is from disk or another tab.
 * Progress fields union or take the max/newer value so hydration never wipes
 * newer in-memory state.
 */
function ensureControlledDemoSave(state: GameState): GameState {
  if (!CONTROLLED_DEMO_MODE) return state;

  const nvdaId = CONTROLLED_DEMO_COMPANY_ID;
  let companies = { ...state.companies };
  let changed = false;

  if (!companies[nvdaId]) {
    companies[nvdaId] = initialCompanyProgress();
    changed = true;
  }

  let progress = companies[nvdaId];
  const pillars = { ...progress.pillars };
  for (const pillarId of ["forces", "management"] as const) {
    const ps = pillars[pillarId];
    if (!ps?.unlocked) {
      pillars[pillarId] = {
        ...ps,
        unlocked: true,
        unlockedAt: ps.unlockedAt ?? Date.now()
      };
      changed = true;
    }
  }
  if (changed) {
    companies[nvdaId] = { ...progress, pillars };
    progress = companies[nvdaId];
  }

  const pruned: GameState["companies"] = { [nvdaId]: companies[nvdaId] };

  return {
    ...state,
    activeCompanyId: nvdaId,
    unlockedCompanyIds: [nvdaId],
    companies: changed ? pruned : pruned
  };
}

export function mergeLoadedGameState(
  inMemory: GameState,
  loaded: GameState
): GameState {
  const memTs = inMemory.lastActivityAt ?? 0;
  const loadTs = loaded.lastActivityAt ?? 0;

  // Demo reset / mid-funnel: never let a stale disk snapshot with completed
  // onboarding overwrite an in-memory fresh or in-progress funnel.
  const staleCompletedOnDisk =
    inMemory.onboarding.completedAt == null &&
    loaded.onboarding.completedAt != null;

  // Demo reset / latest tab wins — do not resurrect opening/onboarding from an
  // older snapshot that was loaded before the in-memory replace finished.
  if (memTs >= loadTs || staleCompletedOnDisk) {
    return ensureControlledDemoSave({
      ...inMemory,
      version: Math.max(inMemory.version, loaded.version)
    });
  }

  const companyIds = new Set([
    ...Object.keys(loaded.companies),
    ...Object.keys(inMemory.companies)
  ]);

  const companies = { ...loaded.companies };
  for (const companyId of companyIds) {
    const mem = inMemory.companies[companyId];
    const load = loaded.companies[companyId];
    if (load) {
      companies[companyId] = migrateBusinessIslandProgress(
        mergeCompanyProgress(mem, load)
      );
    } else if (mem) {
      companies[companyId] = migrateBusinessIslandProgress(mem);
    }
  }

  const unlockedCompanyIds = [
    ...new Set([
      ...loaded.unlockedCompanyIds,
      ...inMemory.unlockedCompanyIds
    ])
  ] as GameState["unlockedCompanyIds"];

  const onboardingStep = Math.max(
    inMemory.onboarding.step,
    loaded.onboarding.step
  );
  // Never resurrect completed onboarding from an older/stale disk snapshot after a
  // demo reset or mid-funnel progress (opening seen, onboarding not finished).
  const onboardingCompletedAt =
    inMemory.onboarding.completedAt ?? loaded.onboarding.completedAt;
  // Prefer explicit null from a fresh demo reset over resurrecting funnel flags from disk.
  const openingScreenSeenAt =
    inMemory.onboarding.openingScreenSeenAt === null
      ? null
      : (inMemory.onboarding.openingScreenSeenAt ??
        loaded.onboarding.openingScreenSeenAt);
  const welcomeScreenSeenAt =
    inMemory.onboarding.welcomeScreenSeenAt === null
      ? null
      : (inMemory.onboarding.welcomeScreenSeenAt ??
        loaded.onboarding.welcomeScreenSeenAt);

  return ensureControlledDemoSave({
    ...loaded,
    version: Math.max(inMemory.version, loaded.version),
    playerName: inMemory.playerName ?? loaded.playerName,
    goal: inMemory.goal ?? loaded.goal,
    activeCompanyId: inMemory.activeCompanyId || loaded.activeCompanyId,
    companies,
    unlockedCompanyIds,
    onboarding: {
      step: onboardingStep,
      completedAt: onboardingCompletedAt,
      openingScreenSeenAt,
      welcomeScreenSeenAt
    },
    lastActivityAt: Math.max(
      inMemory.lastActivityAt ?? 0,
      loaded.lastActivityAt ?? 0
    ) || null,
    schoolsProfile: mergeSchoolsProfile(
      inMemory.schoolsProfile,
      loaded.schoolsProfile
    )
  });
}
