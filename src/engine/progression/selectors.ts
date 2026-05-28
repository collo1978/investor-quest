/**
 * Engine — selectors.
 *
 * Pure read-only views over `GameState` for the UI layer to consume.
 * Selectors never mutate; they derive values like pillar % completion,
 * locked status, current level progress, and quest reward XP.
 */

import {
  COMPANIES,
  companyById,
  type Company,
  type CompanyId
} from "@/data/companies";
import {
  PILLAR_META,
  PILLAR_ORDER,
  pillarById,
  type PillarId
} from "@/data/pillars";
import {
  findQuestDefinition,
  getCompanyPillarQuests
} from "@/data/quests/library";
import {
  CONTROLLED_DEMO_COMPANY_ID,
  CONTROLLED_DEMO_MODE
} from "@/lib/demo/controlledDemo";
import type { QuestDefinition } from "@/data/quests/types";
import {
  isPillarComplete,
  nextUnlockablePillar,
  pillarCompletionPct
} from "@/engine/progression/unlocks";
import { levelProgress, type LevelProgress } from "@/engine/progression/xp";
import {
  initialCompanyProgress,
  type CompanyProgress,
  type GameState,
  type QuestWork
} from "@/engine/progression/state";

export function getActiveCompanyProgress(state: GameState): CompanyProgress {
  return state.companies[state.activeCompanyId] ?? initialCompanyProgress();
}

export function getLevelProgress(state: GameState): LevelProgress {
  return levelProgress(getActiveCompanyProgress(state).xp);
}

export type PillarView = {
  id: PillarId;
  unlocked: boolean;
  completed: boolean;
  completedCount: number;
  totalCount: number;
  progressPct: number;
};

export function getPillarViews(state: GameState): PillarView[] {
  const progress = getActiveCompanyProgress(state);
  return PILLAR_ORDER.map((pid) => {
    const ps = progress.pillars[pid];
    const total = getCompanyPillarQuests(state.activeCompanyId, pid).length;
    return {
      id: pid,
      unlocked: ps.unlocked,
      completed: isPillarComplete(progress.pillars, pid),
      completedCount: ps.completedQuestSlugs.length,
      totalCount: total,
      progressPct: pillarCompletionPct(progress.pillars, pid)
    };
  });
}

/** Get all quest definitions + their completion state for a pillar. */
export type QuestView = {
  quest: QuestDefinition;
  /** XP-awarding completion (e.g. quiz passed). */
  completed: boolean;
  /** "Mark as Read" reading-progress flag. No XP, no unlock impact. */
  read: boolean;
  readAt: number | null;
  unlocked: boolean;
  work: QuestWork | null;
};

export function getPillarQuestViews(
  state: GameState,
  pillarId: PillarId
): QuestView[] {
  const progress = getActiveCompanyProgress(state);
  const quests = getCompanyPillarQuests(state.activeCompanyId, pillarId);
  const pillarState = progress.pillars[pillarId];
  const completedSet = new Set(pillarState.completedQuestSlugs);
  const readSet = new Set(pillarState.readQuestSlugs);

  return quests.map((q) => {
    const reqs = q.unlockRequirements;
    const pillarUnlocked = pillarState.unlocked;
    const prereqsMet =
      !reqs.questSlugs || reqs.questSlugs.every((s) => completedSet.has(s));
    const xpMet = (reqs.minXp ?? 0) <= progress.xp;
    const levelMet = (reqs.minLevel ?? 1) <= progress.level;
    const unlocked =
      CONTROLLED_DEMO_MODE &&
      state.activeCompanyId === CONTROLLED_DEMO_COMPANY_ID
        ? pillarUnlocked
        : pillarUnlocked && prereqsMet && xpMet && levelMet;

    const workKey = `${pillarId}:${q.slug}`;
    return {
      quest: q,
      completed: completedSet.has(q.slug),
      read: readSet.has(q.slug),
      readAt: pillarState.readAt[q.slug] ?? null,
      unlocked,
      work: progress.questWork[workKey] ?? null
    };
  });
}

export function getQuestView(
  state: GameState,
  pillarId: PillarId,
  slug: string
): QuestView | null {
  const quest = findQuestDefinition(state.activeCompanyId, pillarId, slug);
  if (!quest) return null;
  const all = getPillarQuestViews(state, pillarId);
  return all.find((v) => v.quest.slug === slug) ?? null;
}

/** Total quests completed across all pillars for the active company. */
export function getCompletedQuestCount(state: GameState): number {
  const progress = getActiveCompanyProgress(state);
  return PILLAR_ORDER.reduce(
    (acc, pid) => acc + progress.pillars[pid].completedQuestSlugs.length,
    0
  );
}

export function isAllPillarsCompleteFor(state: GameState): boolean {
  const progress = getActiveCompanyProgress(state);
  return PILLAR_ORDER.every((pid) => isPillarComplete(progress.pillars, pid));
}

/** Sum of unlocked-island counts for HUD displays. */
export function getUnlockedIslandCount(state: GameState): number {
  const progress = getActiveCompanyProgress(state);
  return PILLAR_ORDER.filter((pid) => progress.pillars[pid].unlocked).length;
}

/** Convenience: lookup XP reward for a quest by pillar + slug. */
export function getQuestReward(
  companyId: CompanyId,
  pillarId: PillarId,
  slug: string
): number {
  return findQuestDefinition(companyId, pillarId, slug)?.rewardXp ?? 0;
}

// ---------------------------------------------------------------------------
// Island views (the map's primary view-model).
// ---------------------------------------------------------------------------

export type IslandView = PillarView & {
  /** Display metadata for the island (title, subtitle, accent, glyph). */
  title: string;
  subtitle: string;
  accent: string;
  glyph: string;
  /** Whether the active player is currently focused on this island. */
  active: boolean;
  /** Pillar that must be cleared to unlock this island, if any. */
  prerequisitePillarId: PillarId | null;
};

/**
 * Map-friendly view of every island for the active company. Combines
 * static pillar metadata with engine-derived progression state.
 */
export function getIslandViews(state: GameState): IslandView[] {
  const progress = getActiveCompanyProgress(state);
  const base = getPillarViews(state);
  const baseById = Object.fromEntries(base.map((v) => [v.id, v]));

  return PILLAR_META.map((meta) => {
    const view = baseById[meta.id];
    // Find the previous pillar in order — if it's not complete, that's the prerequisite.
    const idx = PILLAR_ORDER.indexOf(meta.id);
    const prevId = idx > 0 ? PILLAR_ORDER[idx - 1] : null;
    const prereq =
      prevId && !isPillarComplete(progress.pillars, prevId) ? prevId : null;

    return {
      ...view,
      title: meta.title,
      subtitle: meta.subtitle,
      accent: meta.accent,
      glyph: meta.glyph,
      active: progress.activePillarId === meta.id,
      prerequisitePillarId: prereq
    };
  });
}

/**
 * What the next pillar unlock would be for the active company (or
 * `null` if everything is already unlocked / there's no progress to
 * apply yet). Useful for "Up next: …" UI.
 */
export function getNextPillarUnlock(state: GameState): PillarId | null {
  const progress = getActiveCompanyProgress(state);
  for (const pid of PILLAR_ORDER) {
    if (!progress.pillars[pid].unlocked) {
      // Find the predecessor; only unlockable if it's complete.
      const idx = PILLAR_ORDER.indexOf(pid);
      const prev = idx > 0 ? PILLAR_ORDER[idx - 1] : null;
      if (prev && isPillarComplete(progress.pillars, prev)) return pid;
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Quest progress %.
// ---------------------------------------------------------------------------

/**
 * Per-quest progress as a number in 0..100. Honors the quest's
 * `completionState` rule:
 *   - completed: always 100
 *   - checklist: % of checklist items checked
 *   - quiz:      bestScore (0..1) × 100
 *   - minigame:  terminal score, or 50 if any board lanes filled
 *   - manual:    50 if notes have content, else 0
 */
export function getQuestProgressPct(
  view: QuestView | null,
  fallbackQuest?: QuestDefinition | null
): number {
  if (!view) return 0;
  if (view.completed) return 100;
  const q = view.quest ?? fallbackQuest;
  if (!q) return 0;
  const work = view.work;
  const rule = q.completionState;

  if (rule.kind === "checklist") {
    if (rule.checklistKeys.length === 0) return 0;
    const checked = rule.checklistKeys.filter(
      (k) => work?.checklist?.[k]
    ).length;
    return Math.round((checked / rule.checklistKeys.length) * 100);
  }

  if (rule.kind === "quiz") {
    const score = work?.mini?.quiz?.bestScore ?? 0;
    return Math.min(100, Math.round(score * 100));
  }

  if (rule.kind === "read") {
    return view.read ? 100 : 0;
  }

  if (rule.kind === "minigame") {
    if (rule.key === "terminal") {
      return Math.min(100, Math.round(work?.mini?.terminal?.score ?? 0));
    }
    if (rule.key === "board") {
      const lanes = (work?.mini?.board?.bull?.length ?? 0) +
        (work?.mini?.board?.base?.length ?? 0) +
        (work?.mini?.board?.bear?.length ?? 0);
      return lanes > 0 ? 50 : 0;
    }
    if (rule.key === "quiz") {
      const score = work?.mini?.quiz?.bestScore ?? 0;
      return Math.min(100, Math.round(score * 100));
    }
  }

  // Manual: notes engagement is a soft signal.
  return work?.notes && work.notes.trim().length > 0 ? 50 : 0;
}

// ---------------------------------------------------------------------------
// Companies / "unlocked islands" (top-level campaign access).
// ---------------------------------------------------------------------------

export type CampaignView = {
  company: Company;
  unlocked: boolean;
  active: boolean;
  /** Sum of completed quests across all pillars for this company. */
  completedQuestsTotal: number;
  xp: number;
  level: number;
  /** Epoch ms or null. */
  lastActivityAt: number | null;
};

export function getCampaignViews(state: GameState): CampaignView[] {
  const unlocked = new Set(state.unlockedCompanyIds);
  return COMPANIES.map((c) => {
    const prog = state.companies[c.id];
    const completedQuestsTotal = prog
      ? PILLAR_ORDER.reduce(
          (acc, pid) => acc + prog.pillars[pid].completedQuestSlugs.length,
          0
        )
      : 0;
    return {
      company: c,
      unlocked: unlocked.has(c.id),
      active: state.activeCompanyId === c.id,
      completedQuestsTotal,
      xp: prog?.xp ?? 0,
      level: prog?.level ?? 1,
      lastActivityAt: prog?.lastActivityAt ?? null
    };
  });
}

export function isCompanyUnlocked(
  state: GameState,
  companyId: CompanyId
): boolean {
  return state.unlockedCompanyIds.includes(companyId);
}

export function getUnlockedCompanies(state: GameState): Company[] {
  return state.unlockedCompanyIds.map((id) => companyById(id));
}

// ---------------------------------------------------------------------------
// Active quest pointer.
// ---------------------------------------------------------------------------

export type ActiveQuestPointer = {
  pillarId: PillarId;
  slug: string | null;
  quest: QuestDefinition | null;
};

export function getActiveQuestPointer(state: GameState): ActiveQuestPointer {
  const progress = getActiveCompanyProgress(state);
  const quest = progress.activeQuestSlug
    ? findQuestDefinition(
        state.activeCompanyId,
        progress.activePillarId,
        progress.activeQuestSlug
      )
    : null;
  return {
    pillarId: progress.activePillarId,
    slug: progress.activeQuestSlug,
    quest
  };
}

/**
 * "Resume" helper: find a sensible quest to resume — preferring the
 * currently-active one, then the first incomplete quest in the active
 * pillar, then any incomplete quest in any unlocked pillar.
 */
export function getResumeTarget(state: GameState): {
  pillarId: PillarId;
  slug: string;
} | null {
  const progress = getActiveCompanyProgress(state);

  if (progress.activeQuestSlug) {
    return {
      pillarId: progress.activePillarId,
      slug: progress.activeQuestSlug
    };
  }

  const pillarsToScan: PillarId[] = [
    progress.activePillarId,
    ...PILLAR_ORDER.filter((p) => p !== progress.activePillarId)
  ];

  for (const pid of pillarsToScan) {
    if (!progress.pillars[pid].unlocked) continue;
    const quests = getCompanyPillarQuests(state.activeCompanyId, pid);
    const completedSet = new Set(progress.pillars[pid].completedQuestSlugs);
    const remaining = quests.find((q) => !completedSet.has(q.slug));
    if (remaining) return { pillarId: pid, slug: remaining.slug };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Reading-progress selectors (Mark as Read tracking — no XP).
// ---------------------------------------------------------------------------

/** True iff the active player has marked this quest's card as read. */
export function isQuestRead(
  state: GameState,
  pillarId: PillarId,
  slug: string
): boolean {
  const progress = getActiveCompanyProgress(state);
  return progress.pillars[pillarId]?.readQuestSlugs.includes(slug) ?? false;
}

export type ReadingProgress = {
  read: number;
  total: number;
  /** 0..100 rounded. */
  pct: number;
};

/**
 * Reading progress across a single pillar for the active company.
 *
 * Composite sub-card slugs (`${parent}#${cardId}`) are stored alongside
 * regular slugs in `readQuestSlugs` but must NOT inflate the pillar
 * percentage: the denominator is the number of quests, and the
 * numerator counts only fully-read parent quests.
 */
export function getPillarReadingProgress(
  state: GameState,
  pillarId: PillarId
): ReadingProgress {
  const progress = getActiveCompanyProgress(state);
  const quests = getCompanyPillarQuests(state.activeCompanyId, pillarId);
  const total = quests.length;
  const validSlugs = new Set(quests.map((q) => q.slug));
  const readSlugs = progress.pillars[pillarId]?.readQuestSlugs ?? [];
  const read = readSlugs.filter((s) => validSlugs.has(s)).length;
  const pct = total === 0 ? 0 : Math.round((read / total) * 100);
  return { read, total, pct };
}

/**
 * Reading progress across every pillar for the active company. Same
 * composite-slug filtering as {@link getPillarReadingProgress}.
 */
export function getReadingProgress(state: GameState): ReadingProgress {
  const progress = getActiveCompanyProgress(state);
  let read = 0;
  let total = 0;
  for (const pid of PILLAR_ORDER) {
    const quests = getCompanyPillarQuests(state.activeCompanyId, pid);
    const validSlugs = new Set(quests.map((q) => q.slug));
    const readSlugs = progress.pillars[pid]?.readQuestSlugs ?? [];
    read += readSlugs.filter((s) => validSlugs.has(s)).length;
    total += quests.length;
  }
  const pct = total === 0 ? 0 : Math.round((read / total) * 100);
  return { read, total, pct };
}

/** Every quest in the pillar has parent-level read credit (see reading selectors). */
export function isPillarReadingComplete(
  state: GameState,
  pillarId: PillarId
): boolean {
  const r = getPillarReadingProgress(state, pillarId);
  return r.total > 0 && r.read >= r.total;
}

/** Center-map final challenge — all pillars cleared, read, and conviction submitted. */
export function isTenKFinalChallengeUnlocked(state: GameState): boolean {
  const prog = getActiveCompanyProgress(state);
  return PILLAR_ORDER.every((pid) => {
    if (!isPillarComplete(prog.pillars, pid)) return false;
    if (!isPillarReadingComplete(state, pid)) return false;
    return typeof prog.pillarConvictionSubmittedAt[pid] === "number";
  });
}

export type TenKFinalGateRow = {
  pillarComplete: boolean;
  readingComplete: boolean;
  convictionDone: boolean;
};

export function getTenKFinalChallengeGateRows(
  state: GameState
): Record<PillarId, TenKFinalGateRow> {
  const prog = getActiveCompanyProgress(state);
  const out = {} as Record<PillarId, TenKFinalGateRow>;
  for (const pid of PILLAR_ORDER) {
    out[pid] = {
      pillarComplete: isPillarComplete(prog.pillars, pid),
      readingComplete: isPillarReadingComplete(state, pid),
      convictionDone: typeof prog.pillarConvictionSubmittedAt[pid] === "number"
    };
  }
  return out;
}

// Re-export pillar lookup convenience (used by FX captions).
export { pillarById };
