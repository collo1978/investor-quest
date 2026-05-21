/**
 * Engine — legacy persistence helpers + raw-migration utility.
 *
 * The canonical persistence boundary is the `ProgressionStore`
 * interface in `@/engine/persistence`. This file:
 *
 *   - Exposes `migrateRaw(raw)` — the pure migration function used by
 *     every store adapter (localStorage, remote DB, etc.).
 *   - Keeps `loadState`/`saveState`/`clearSavedState` as thin
 *     synchronous wrappers around the localStorage adapter so legacy
 *     callers (and the simple SSR fall-through path) keep working.
 *
 * Migration handles:
 *   v1 — pre-companies (top-level xp/pillars)
 *   v2 — companies dict, no badges/onboarding/active-quest tracking
 *   v3 — adds badges, onboarding, active pillar/quest, pillarState.unlockedAt
 *   v4 — adds `unlockedCompanyIds`, `lastActivityAt`, per-quest `completedAt`
 *   v5 — adds per-pillar `readQuestSlugs` / `readAt`
 *   v6 — adds `pendingConvictionQueue` (conviction gate before
 *          applying the next pillar unlock)
 *   v7 — adds `pillarConvictionSubmittedAt`, `tenKRookieChallenge`,
 *        `futureArcRevealedAt` (center-map final challenge + teaser)
 *   v10 — `quiz` streak key (was `quiz_mastery`), quiz streak milestone XP +
 *        `quizStreakMilestoneXpClaimed`, quiz streak badges
 *   v11 — sequential pillar unlock (business first), `questMapBriefDismissedAt`
 */

import {
  COMPANIES,
  DEFAULT_COMPANY_ID,
  isCompanyId,
  type CompanyId
} from "@/data/companies";
import { PILLAR_ORDER, type PillarId } from "@/data/pillars";
import { getCompanyPillarQuests } from "@/data/quests/library";
import type { BadgeId } from "@/engine/progression/badges";
import { isQuestMapDefaultUnlocked } from "@/engine/progression/pillarUnlockPolicy";
import { isPillarComplete } from "@/engine/progression/unlocks";
import {
  initialCompanyProgress,
  initialState,
  STATE_VERSION,
  STORAGE_KEY,
  type CompanyProgress,
  type GameState,
  type OnboardingState,
  type PendingConvictionItem,
  type PillarState,
  type TenKRookieChallengeRecord
} from "@/engine/progression/state";
import { computeLevel } from "@/engine/progression/xp";
import {
  emptyStreaks,
  STREAK_KINDS,
  type CompanyStreaks,
  type StreakState
} from "@/engine/progression/streaks";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function migratePillars(raw: unknown): Record<PillarId, PillarState> {
  const out = {} as Record<PillarId, PillarState>;
  for (let i = 0; i < PILLAR_ORDER.length; i++) {
    const pid = PILLAR_ORDER[i];
    const pillarRaw = isPlainObject(raw) ? raw[pid] : undefined;
    const v = isPlainObject(pillarRaw) ? pillarRaw : undefined;
    const slugsRaw =
      v != null
        ? (v.completedQuestSlugs as unknown) ?? (v.completedQuestIds as unknown)
        : undefined;
    const slugs = Array.isArray(slugsRaw)
      ? (slugsRaw as unknown[]).filter((x): x is string => typeof x === "string")
      : [];
    const completedAt: Record<string, number> = {};
    if (v != null && isPlainObject(v.completedAt)) {
      for (const [k, ts] of Object.entries(v.completedAt)) {
        if (typeof ts === "number") completedAt[k] = ts;
      }
    }
    const readSlugsRaw = v != null ? (v.readQuestSlugs as unknown) : [];
    const readSlugs = Array.isArray(readSlugsRaw)
      ? (readSlugsRaw as unknown[]).filter(
          (x): x is string => typeof x === "string"
        )
      : [];
    const readAt: Record<string, number> = {};
    if (v != null && isPlainObject(v.readAt)) {
      for (const [k, ts] of Object.entries(v.readAt)) {
        if (typeof ts === "number") readAt[k] = ts;
      }
    }
    const prev = i > 0 ? PILLAR_ORDER[i - 1] : null;
    const savedUnlocked =
      isPlainObject(v) && v.unlocked === true;
    const unlocked =
      savedUnlocked ||
      isQuestMapDefaultUnlocked(pid) ||
      (prev !== null && isPillarComplete(out, prev));
    const savedUnlockedAt =
      isPlainObject(v) && typeof v.unlockedAt === "number"
        ? (v.unlockedAt as number)
        : null;
    out[pid] = {
      unlocked,
      unlockedAt: unlocked ? savedUnlockedAt ?? Date.now() : null,
      completedQuestSlugs: slugs,
      completedAt,
      readQuestSlugs: readSlugs,
      readAt
    };
  }
  return out;
}

function migrateBadges(raw: unknown): Record<BadgeId, { awardedAt: number }> {
  const out = {} as Record<BadgeId, { awardedAt: number }>;
  if (!isPlainObject(raw)) return out;
  for (const [k, v] of Object.entries(raw)) {
    if (!isPlainObject(v)) continue;
    const at = typeof v.awardedAt === "number" ? (v.awardedAt as number) : Date.now();
    (out as Record<string, { awardedAt: number }>)[k] = { awardedAt: at };
  }
  return out;
}

function pillarReadCompleteForMigrate(
  prog: CompanyProgress,
  companyId: CompanyId,
  pid: PillarId
): boolean {
  const quests = getCompanyPillarQuests(companyId, pid);
  const valid = new Set(quests.map((q) => q.slug));
  const read = (prog.pillars[pid]?.readQuestSlugs ?? []).filter((s) =>
    valid.has(s)
  ).length;
  return quests.length > 0 && read >= quests.length;
}

function migratePillarConvictionSubmittedAt(
  raw: Record<string, unknown>,
  prog: CompanyProgress,
  companyId: CompanyId
): Partial<Record<PillarId, number>> {
  const from = raw.pillarConvictionSubmittedAt;
  if (isPlainObject(from)) {
    const out: Partial<Record<PillarId, number>> = {};
    for (const pid of PILLAR_ORDER) {
      const v = from[pid];
      if (typeof v === "number") out[pid] = v;
    }
    if (Object.keys(out).length > 0) return out;
  }
  if (prog.pendingConvictionQueue.length > 0) return {};
  const ts = prog.lastActivityAt ?? Date.now();
  for (const pid of PILLAR_ORDER) {
    if (!isPillarComplete(prog.pillars, pid)) return {};
    if (!pillarReadCompleteForMigrate(prog, companyId, pid)) return {};
  }
  return Object.fromEntries(PILLAR_ORDER.map((p) => [p, ts])) as Partial<
    Record<PillarId, number>
  >;
}

function migratePillarIslandBonusClaimed(raw: unknown): PillarId[] {
  if (!Array.isArray(raw)) return [];
  const out: PillarId[] = [];
  for (const x of raw) {
    if (typeof x === "string" && PILLAR_ORDER.includes(x as PillarId)) {
      out.push(x as PillarId);
    }
  }
  return out;
}

function migrateTenKRookieChallenge(
  raw: unknown
): TenKRookieChallengeRecord | null {
  if (!isPlainObject(raw)) return null;
  const passedAt = typeof raw.passedAt === "number" ? raw.passedAt : NaN;
  const bestScoreFraction =
    typeof raw.bestScoreFraction === "number" ? raw.bestScoreFraction : NaN;
  if (!Number.isFinite(passedAt) || !Number.isFinite(bestScoreFraction)) {
    return null;
  }
  return {
    passedAt,
    bestScoreFraction: Math.min(1, Math.max(0, bestScoreFraction)),
    highConviction: Boolean(raw.highConviction)
  };
}

function parseStreakCell(raw: unknown): StreakState {
  if (!isPlainObject(raw)) return { streak: 0, lastDay: null };
  const lastDayRaw = raw.lastDay;
  const lastDay =
    typeof lastDayRaw === "string"
      ? lastDayRaw
      : lastDayRaw === null
        ? null
        : null;
  return {
    streak: typeof raw.streak === "number" ? raw.streak : 0,
    lastDay
  };
}

function migrateQuizStreakMilestoneXpClaimed(raw: unknown): (3 | 7 | 30)[] {
  if (!Array.isArray(raw)) return [];
  const out: (3 | 7 | 30)[] = [];
  for (const x of raw) {
    if (x === 3 || x === 7 || x === 30) out.push(x);
  }
  return out;
}

function migrateStreaks(
  raw: Record<string, unknown>,
  fallbackDaily: { streak: number; lastDay: string | null }
): CompanyStreaks {
  const base = emptyStreaks();
  const streaksRaw = raw.streaks;
  if (isPlainObject(streaksRaw)) {
    for (const k of STREAK_KINDS) {
      const s = streaksRaw[k];
      if (isPlainObject(s)) {
        base[k] = parseStreakCell(s);
      }
    }
    const legacyQuiz = streaksRaw["quiz_mastery"];
    if (isPlainObject(legacyQuiz) && !isPlainObject(streaksRaw["quiz"])) {
      base.quiz = parseStreakCell(legacyQuiz);
    }
    return base;
  }
  return {
    ...base,
    research: {
      streak: fallbackDaily.streak,
      lastDay: fallbackDaily.lastDay
    }
  };
}

function migrateCompanyProgress(
  raw: unknown,
  companyId: CompanyId
): CompanyProgress {
  const base = initialCompanyProgress();
  if (!isPlainObject(raw)) return base;
  const rawObj = raw;
  const xp = typeof rawObj.xp === "number" ? rawObj.xp : 0;
  const dailyRaw = isPlainObject(rawObj.daily) ? rawObj.daily : {};
  const fallbackDaily = {
    streak:
      typeof (dailyRaw as Record<string, unknown>).streak === "number"
        ? ((dailyRaw as Record<string, unknown>).streak as number)
        : 0,
    lastDay:
      typeof (dailyRaw as Record<string, unknown>).lastDay === "string"
        ? ((dailyRaw as Record<string, unknown>).lastDay as string)
        : null
  };
  const streaks = migrateStreaks(rawObj, fallbackDaily);
  const activePillarRaw = rawObj.activePillarId;
  const activePillarId = PILLAR_ORDER.includes(activePillarRaw as PillarId)
    ? (activePillarRaw as PillarId)
    : PILLAR_ORDER[0];
  const activeQuestSlug =
    typeof rawObj.activeQuestSlug === "string"
      ? (rawObj.activeQuestSlug as string)
      : null;
  const lastActivityAt =
    typeof rawObj.lastActivityAt === "number"
      ? (rawObj.lastActivityAt as number)
      : null;

  const pendingConvictionQueue = migratePendingConvictionQueue(
    rawObj.pendingConvictionQueue
  );

  const mid: CompanyProgress = {
    ...base,
    xp,
    level: computeLevel(xp),
    streaks,
    pillars: migratePillars(rawObj.pillars),
    questWork: isPlainObject(rawObj.questWork)
      ? (rawObj.questWork as CompanyProgress["questWork"])
      : {},
    badges: migrateBadges(rawObj.badges),
    activePillarId,
    activeQuestSlug,
    lastActivityAt,
    pendingConvictionQueue
  };

  const pillarConvictionSubmittedAt = migratePillarConvictionSubmittedAt(
    rawObj,
    mid,
    companyId
  );
  const tenKRookieChallenge = migrateTenKRookieChallenge(
    rawObj.tenKRookieChallenge
  );
  const futureArcRevealedAt =
    typeof rawObj.futureArcRevealedAt === "number"
      ? (rawObj.futureArcRevealedAt as number)
      : null;
  const pillarIslandBonusClaimed = migratePillarIslandBonusClaimed(
    rawObj.pillarIslandBonusClaimed
  );
  const quizStreakMilestoneXpClaimed = migrateQuizStreakMilestoneXpClaimed(
    rawObj.quizStreakMilestoneXpClaimed
  );
  const questMapBriefDismissedAt =
    typeof rawObj.questMapBriefDismissedAt === "number"
      ? (rawObj.questMapBriefDismissedAt as number)
      : null;
  const businessIslandBriefDismissedAt =
    typeof rawObj.businessIslandBriefDismissedAt === "number"
      ? (rawObj.businessIslandBriefDismissedAt as number)
      : null;

  return {
    ...mid,
    pillarConvictionSubmittedAt,
    tenKRookieChallenge,
    futureArcRevealedAt,
    pillarIslandBonusClaimed,
    quizStreakMilestoneXpClaimed,
    questMapBriefDismissedAt,
    businessIslandBriefDismissedAt
  };
}

function migratePendingConvictionQueue(raw: unknown): PendingConvictionItem[] {
  if (!Array.isArray(raw)) return [];
  const out: PendingConvictionItem[] = [];
  for (const item of raw) {
    if (!isPlainObject(item)) continue;
    const c = item.completedPillarId;
    const u = item.pillarToUnlock;
    if (!PILLAR_ORDER.includes(c as PillarId)) continue;
    const pillarToUnlock =
      u === null || u === undefined
        ? null
        : PILLAR_ORDER.includes(u as PillarId)
          ? (u as PillarId)
          : null;
    out.push({
      completedPillarId: c as PillarId,
      pillarToUnlock
    });
  }
  return out;
}

function migrateOnboarding(raw: unknown): OnboardingState {
  if (!isPlainObject(raw)) return { step: 0, completedAt: null };
  const step = typeof raw.step === "number" ? raw.step : 0;
  const completedAt =
    typeof raw.completedAt === "number" ? raw.completedAt : null;
  return { step, completedAt };
}

function migrateUnlockedCompanies(raw: unknown): CompanyId[] {
  const all = COMPANIES.map((c) => c.id);
  if (!Array.isArray(raw)) return all;
  const filtered = raw.filter((x): x is CompanyId => {
    return typeof x === "string" && isCompanyId(x);
  });
  // Always include the default company so the user can't lock themselves out.
  if (!filtered.includes(DEFAULT_COMPANY_ID)) filtered.push(DEFAULT_COMPANY_ID);
  return filtered;
}

/**
 * Pure migration entry point. Accepts any previously-persisted shape
 * and returns a fully-resolved `GameState` for the current version.
 * Returns `null` if `raw` is not recognizable.
 */
export function migrateRaw(raw: unknown): GameState | null {
  if (!isPlainObject(raw)) return null;

  // v1 detection: legacy top-level xp/pillars without `companies`.
  if (!raw.companies && (typeof raw.xp === "number" || raw.pillars)) {
    const migratedProg = migrateCompanyProgress(raw, DEFAULT_COMPANY_ID);
    return {
      version: STATE_VERSION,
      playerName: typeof raw.playerName === "string" ? raw.playerName : null,
      goal: typeof raw.goal === "string" ? raw.goal : null,
      activeCompanyId: DEFAULT_COMPANY_ID,
      companies: { [DEFAULT_COMPANY_ID]: migratedProg },
      unlockedCompanyIds: COMPANIES.map((c) => c.id),
      onboarding: { step: 0, completedAt: null },
      lastActivityAt: null
    };
  }

  const companiesRaw = isPlainObject(raw.companies) ? raw.companies : {};
  const companies: Record<string, CompanyProgress> = {};
  for (const [cid, prog] of Object.entries(companiesRaw)) {
    if (!isCompanyId(cid)) continue;
    companies[cid] = migrateCompanyProgress(prog, cid);
  }
  if (Object.keys(companies).length === 0) {
    companies[DEFAULT_COMPANY_ID] = initialCompanyProgress();
  }

  let activeCompanyId: CompanyId = DEFAULT_COMPANY_ID;
  if (
    typeof raw.activeCompanyId === "string" &&
    isCompanyId(raw.activeCompanyId) &&
    companies[raw.activeCompanyId]
  ) {
    activeCompanyId = raw.activeCompanyId;
  } else {
    const first = Object.keys(companies)[0];
    if (first && isCompanyId(first)) activeCompanyId = first;
  }

  return {
    version: STATE_VERSION,
    playerName: typeof raw.playerName === "string" ? raw.playerName : null,
    goal: typeof raw.goal === "string" ? raw.goal : null,
    activeCompanyId,
    companies,
    unlockedCompanyIds: migrateUnlockedCompanies(raw.unlockedCompanyIds),
    onboarding: migrateOnboarding(raw.onboarding),
    lastActivityAt:
      typeof raw.lastActivityAt === "number"
        ? (raw.lastActivityAt as number)
        : null
  };
}

// ---------------------------------------------------------------------------
// Legacy synchronous helpers.
// ---------------------------------------------------------------------------

export function loadState(): GameState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as unknown;
    return migrateRaw(parsed) ?? initialState();
  } catch {
    return initialState();
  }
}

export function saveState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function clearSavedState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
