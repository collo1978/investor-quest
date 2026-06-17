/**
 * Engine — progression reducer.
 *
 * Pure reducer. All state transitions go through here so the engine is
 * the single source of truth. The React provider just dispatches actions
 * and surfaces the resulting `RewardEvent[]` to UI for toasts/effects.
 */

import { isCompanyId, type CompanyId } from "@/data/companies";
import { coercePlayableDemoCompanyId } from "@/lib/demo/playableDemo";
import { type PillarId } from "@/data/pillars";
import { findQuestDefinition } from "@/data/quests/library";
import type { QuestDefinition } from "@/data/quests/types";
import { TEN_K_ROOKIE_CHALLENGE_XP } from "@/data/quests/tenKRookieFinalChallenge";
import {
  detectNewBadges,
  type BadgeId
} from "@/engine/progression/badges";
import { tickStreak, type StreakKind } from "@/engine/progression/streaks";
import {
  applyPillarUnlock,
  isPillarComplete,
  nextUnlockablePillar,
  allPillarsComplete
} from "@/engine/progression/unlocks";
import { computeLevel } from "@/engine/progression/xp";
import {
  XP_EARNINGS_CALL_COMPLETION,
  XP_ISLAND_COMPLETION,
  XP_QUIZ_PERFECT_BONUS,
  XP_QUIZ_STREAK_3,
  XP_QUIZ_STREAK_30,
  XP_QUIZ_STREAK_7,
  XP_SECTION_QUIZ,
  XP_TEN_Q_COMPLETION
} from "@/engine/progression/xpEconomy";
import {
  initialCompanyProgress,
  initialState,
  questWorkKey,
  type CompanyProgress,
  type GameState,
  type PillarState,
  type QuestWork
} from "@/engine/progression/state";
import { questCardCompositeSlug } from "@/lib/quests/questCardReadProgress";

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

export type GameAction =
  | { type: "hydrate"; state: GameState }
  | { type: "reset" }
  | { type: "set-profile"; playerName: string; goal: string }
  | { type: "set-onboarding-step"; step: number }
  | { type: "complete-onboarding" }
  | { type: "complete-opening-screen" }
  | { type: "complete-welcome-screen" }
  | { type: "set-active-company"; companyId: string }
  | { type: "set-active-pillar"; pillarId: PillarId }
  | { type: "set-active-quest"; pillarId: PillarId; slug: string | null }
  | { type: "complete-quest"; pillarId: PillarId; slug: string; quizPerfect?: boolean }
  | { type: "award-xp"; amount: number; reason: string }
  | { type: "tick-streak"; kind: StreakKind }
  | {
      type: "update-quest-notes";
      pillarId: PillarId;
      slug: string;
      notes: string;
    }
  | {
      type: "toggle-quest-checklist";
      pillarId: PillarId;
      slug: string;
      key: string;
    }
  | {
      type: "patch-quest-work";
      pillarId: PillarId;
      slug: string;
      patch: Partial<QuestWork> & Record<string, unknown>;
    }
  | { type: "unlock-company"; companyId: string }
  | { type: "lock-company"; companyId: string }
  | { type: "mark-quest-read"; pillarId: PillarId; slug: string }
  | { type: "mark-quest-unread"; pillarId: PillarId; slug: string }
  /** Clears read/completion/work for one pillar (testing). Keeps pillar unlocked. */
  | { type: "clear-pillar-progress"; pillarId: PillarId }
  /** Mission Control repair — patch read state for a quest (any company). */
  | {
      type: "repair-quest-progress";
      companyId: CompanyId;
      pillarId: PillarId;
      questSlug: string;
      cardIds: string[];
      mode: "repair" | "reset" | "unlock_quiz";
    }
  | { type: "submit-conviction-and-advance" }
  | {
      type: "enqueue-pillar-conviction";
      pillarId: PillarId;
      /** Omit to auto-unlock next pillar; pass `null` to skip island unlock (Schools tile demo). */
      pillarToUnlock?: PillarId | null;
    }
  | { type: "complete-ten-k-rookie-challenge"; scoreFraction: number }
  | { type: "dismiss-quest-map-brief" }
  | { type: "dismiss-business-island-brief" };

// -----------------------------------------------------------------------------
// RewardEvent — emitted side-effects for the UI layer
// -----------------------------------------------------------------------------

export type RewardEvent =
  | { kind: "xp"; amount: number; reason: string }
  | { kind: "level-up"; level: number }
  | { kind: "pillar-unlocked"; pillarId: PillarId }
  | { kind: "pillar-completed"; pillarId: PillarId }
  | { kind: "all-pillars-complete" }
  | { kind: "badge"; badgeId: BadgeId }
  | { kind: "streak"; streakKind: StreakKind; streak: number }
  | { kind: "company-unlocked"; companyId: CompanyId }
  | { kind: "quest-read"; pillarId: PillarId; slug: string }
  | {
      kind: "pillar-awaiting-conviction";
      completedPillarId: PillarId;
      nextPillarId: PillarId | null;
    };

export type ReduceResult = {
  state: GameState;
  events: RewardEvent[];
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getProg(state: GameState): CompanyProgress {
  return state.companies[state.activeCompanyId] ?? initialCompanyProgress();
}

function putProg(state: GameState, prog: CompanyProgress): GameState {
  return {
    ...state,
    companies: {
      ...state.companies,
      [state.activeCompanyId]: prog
    }
  };
}

function getCompanyProg(
  state: GameState,
  companyId: CompanyId
): CompanyProgress {
  return state.companies[companyId] ?? initialCompanyProgress();
}

function putCompanyProg(
  state: GameState,
  companyId: CompanyId,
  prog: CompanyProgress
): GameState {
  return {
    ...state,
    companies: {
      ...state.companies,
      [companyId]: prog
    }
  };
}

function isQuestReadSlug(slug: string, questSlug: string): boolean {
  return slug === questSlug || slug.startsWith(`${questSlug}#`);
}

function slugsForQuestRepair(questSlug: string, cardIds: string[]): string[] {
  const slugs = cardIds.map((id) => questCardCompositeSlug(questSlug, id));
  slugs.push(questSlug);
  return [...new Set(slugs)];
}

function patchPillarReadsForRepair(
  pillar: PillarState,
  questSlug: string,
  cardIds: string[],
  mode: "repair" | "reset" | "unlock_quiz"
): PillarState {
  const existing = new Set(pillar.readQuestSlugs);
  const now = Date.now();
  const readAt = { ...pillar.readAt };

  if (mode === "reset") {
    const nextSlugs = pillar.readQuestSlugs.filter(
      (s) => !isQuestReadSlug(s, questSlug)
    );
    for (const key of Object.keys(readAt)) {
      if (isQuestReadSlug(key, questSlug)) delete readAt[key];
    }
    const completedSlugs = pillar.completedQuestSlugs.filter(
      (s) => !isQuestReadSlug(s, questSlug)
    );
    const completedAt = { ...pillar.completedAt };
    for (const key of Object.keys(completedAt)) {
      if (isQuestReadSlug(key, questSlug)) delete completedAt[key];
    }
    return {
      ...pillar,
      readQuestSlugs: nextSlugs,
      readAt,
      completedQuestSlugs: completedSlugs,
      completedAt
    };
  }

  for (const slug of slugsForQuestRepair(questSlug, cardIds)) {
    if (!existing.has(slug)) {
      existing.add(slug);
      readAt[slug] = now;
    }
  }

  return {
    ...pillar,
    readQuestSlugs: [...existing],
    readAt
  };
}

function stripQuestWorkForQuest(
  questWork: CompanyProgress["questWork"],
  pillarId: PillarId,
  questSlug: string
): CompanyProgress["questWork"] {
  const prefix = `${pillarId}:${questSlug}`;
  const next = { ...questWork };
  for (const key of Object.keys(next)) {
    if (key === prefix || key.startsWith(`${prefix}#`)) {
      delete next[key];
    }
  }
  return next;
}

function bumpCompanyRevision(prog: CompanyProgress): CompanyProgress {
  return {
    ...prog,
    progressRevision: (prog.progressRevision ?? 0) + 1
  };
}

function awardBadgesIfAny(
  prog: CompanyProgress,
  events: RewardEvent[],
  detect: Omit<Parameters<typeof detectNewBadges>[0], "alreadyEarned">
): CompanyProgress {
  const earned = Object.keys(prog.badges) as BadgeId[];
  const newBadges = detectNewBadges({ ...detect, alreadyEarned: earned });
  if (newBadges.length === 0) return prog;
  const next: CompanyProgress = {
    ...prog,
    badges: {
      ...prog.badges,
      ...Object.fromEntries(
        newBadges.map((id) => [id, { awardedAt: Date.now() }])
      )
    } as CompanyProgress["badges"]
  };
  for (const id of newBadges) events.push({ kind: "badge", badgeId: id });
  return next;
}

function countCompletedQuests(prog: CompanyProgress): number {
  return Object.values(prog.pillars).reduce(
    (acc, p) => acc + p.completedQuestSlugs.length,
    0
  );
}

function xpAwardForQuizQuest(
  quest: QuestDefinition | null | undefined,
  quizPerfect: boolean
): number {
  if (!quest) return 0;
  const isQuiz =
    quest.visualStyle === "quiz" ||
    quest.completionState?.kind === "quiz" ||
    Boolean(quest.quizConfig);
  if (!isQuiz) return 0;

  const bonus = quizPerfect ? XP_QUIZ_PERFECT_BONUS : 0;
  if (quest.type === "earnings-call") {
    return XP_EARNINGS_CALL_COMPLETION + bonus;
  }
  if (quest.secSection?.form === "10-Q") {
    return XP_TEN_Q_COMPLETION + bonus;
  }
  return XP_SECTION_QUIZ + bonus;
}

function applyQuizPassStreakEffects(
  prog: CompanyProgress,
  events: RewardEvent[]
): CompanyProgress {
  const tick = tickStreak(prog.streaks.quiz);
  if (!tick.changed) return prog;
  events.push({
    kind: "streak",
    streakKind: "quiz",
    streak: tick.next.streak
  });
  let p: CompanyProgress = {
    ...prog,
    streaks: { ...prog.streaks, quiz: tick.next }
  };
  const s = tick.next.streak;
  const claimed = new Set(p.quizStreakMilestoneXpClaimed);
  const milestones: {
    days: 3 | 7 | 30;
    xp: number;
    reason: string;
  }[] = [
    { days: 3, xp: XP_QUIZ_STREAK_3, reason: "Quiz streak milestone — 3 days" },
    { days: 7, xp: XP_QUIZ_STREAK_7, reason: "Quiz streak milestone — 7 days" },
    { days: 30, xp: XP_QUIZ_STREAK_30, reason: "Quiz streak milestone — 30 days" }
  ];
  for (const m of milestones) {
    if (s < m.days || claimed.has(m.days)) continue;
    claimed.add(m.days);
    const beforeLevel = p.level;
    const nextXp = p.xp + m.xp;
    const nextLevel = computeLevel(nextXp);
    p = {
      ...p,
      xp: nextXp,
      level: nextLevel,
      quizStreakMilestoneXpClaimed: Array.from(claimed).sort((a, b) => a - b)
    };
    events.push({ kind: "xp", amount: m.xp, reason: m.reason });
    if (nextLevel > beforeLevel) {
      events.push({ kind: "level-up", level: nextLevel });
    }
  }
  return p;
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

export function reduce(state: GameState, action: GameAction): ReduceResult {
  const events: RewardEvent[] = [];

  switch (action.type) {
    case "hydrate":
      return { state: action.state, events };

    case "reset":
      return { state: initialState(), events };

    case "set-profile":
      return {
        state: {
          ...state,
          playerName: action.playerName,
          goal: action.goal
        },
        events
      };

    case "set-onboarding-step":
      return {
        state: {
          ...state,
          onboarding: { ...state.onboarding, step: action.step }
        },
        events
      };

    case "complete-onboarding":
      return {
        state: {
          ...state,
          onboarding: { ...state.onboarding, completedAt: Date.now() }
        },
        events
      };

    case "complete-opening-screen":
      return {
        state: {
          ...state,
          onboarding: {
            ...state.onboarding,
            openingScreenSeenAt: Date.now()
          }
        },
        events
      };

    case "complete-welcome-screen":
      return {
        state: {
          ...state,
          onboarding: {
            ...state.onboarding,
            welcomeScreenSeenAt: Date.now()
          }
        },
        events
      };

    case "set-active-company": {
      const companyId = coercePlayableDemoCompanyId(action.companyId);
      if (!isCompanyId(companyId)) return { state, events };
      const exists = state.companies[companyId];
      return {
        state: {
          ...state,
          activeCompanyId: companyId,
          companies: {
            ...state.companies,
            [companyId]: exists ?? initialCompanyProgress()
          }
        },
        events
      };
    }

    case "set-active-pillar": {
      const prog = getProg(state);
      return {
        state: putProg(state, { ...prog, activePillarId: action.pillarId }),
        events
      };
    }

    case "set-active-quest": {
      const prog = getProg(state);
      return {
        state: putProg(state, {
          ...prog,
          activePillarId: action.pillarId,
          activeQuestSlug: action.slug
        }),
        events
      };
    }

    case "complete-quest": {
      const prog0 = getProg(state);
      const pillarState = prog0.pillars[action.pillarId];
      if (!pillarState || !pillarState.unlocked) return { state, events };
      if (pillarState.completedQuestSlugs.includes(action.slug)) {
        return { state, events };
      }
      const quest = findQuestDefinition(
        state.activeCompanyId as CompanyId,
        action.pillarId,
        action.slug
      );
      const quizPerfect = Boolean(action.quizPerfect);
      const gained = xpAwardForQuizQuest(quest, quizPerfect);
      const nextXp = prog0.xp + gained;
      const beforeLevel = prog0.level;
      const nextLevel = computeLevel(nextXp);
      const now = Date.now();

      let prog1: CompanyProgress = {
        ...prog0,
        xp: nextXp,
        level: nextLevel,
        pillars: {
          ...prog0.pillars,
          [action.pillarId]: {
            ...pillarState,
            completedQuestSlugs: [
              ...pillarState.completedQuestSlugs,
              action.slug
            ],
            completedAt: {
              ...pillarState.completedAt,
              [action.slug]: now
            }
          }
        }
      };

      if (gained > 0) {
        events.push({
          kind: "xp",
          amount: gained,
          reason: quizPerfect
            ? "Section quiz passed (perfect bonus)"
            : "Section quiz passed"
        });
        prog1 = applyQuizPassStreakEffects(prog1, events);
      }
      if (nextLevel > beforeLevel) {
        events.push({ kind: "level-up", level: nextLevel });
      }

      let pillarJustCompleted: PillarId | null = null;
      if (isPillarComplete(prog1.pillars, action.pillarId)) {
        pillarJustCompleted = action.pillarId;
        events.push({ kind: "pillar-completed", pillarId: action.pillarId });
        const newlyUnlocked = nextUnlockablePillar(
          prog1.pillars,
          action.pillarId
        );
        const queue = prog1.pendingConvictionQueue.filter(
          (x) => x.completedPillarId !== action.pillarId
        );
        prog1 = {
          ...prog1,
          pendingConvictionQueue: [
            ...queue,
            {
              completedPillarId: action.pillarId,
              pillarToUnlock: newlyUnlocked
            }
          ]
        };
        events.push({
          kind: "pillar-awaiting-conviction",
          completedPillarId: action.pillarId,
          nextPillarId: newlyUnlocked
        });
      }

      const allDone = allPillarsComplete(prog1.pillars);
      if (allDone) events.push({ kind: "all-pillars-complete" });

      prog1 = awardBadgesIfAny(prog1, events, {
        completedQuestsTotal: countCompletedQuests(prog1),
        pillarJustCompleted,
        allPillarsCompleted: allDone,
        newLevel: prog1.level,
        newStreak: prog1.streaks.research.streak,
        newQuizStreak: prog1.streaks.quiz.streak
      });

      return { state: putProg(state, prog1), events };
    }

    case "award-xp": {
      if (action.amount <= 0) return { state, events };
      const prog0 = getProg(state);
      const nextXp = prog0.xp + action.amount;
      const nextLevel = computeLevel(nextXp);
      let prog1: CompanyProgress = {
        ...prog0,
        xp: nextXp,
        level: nextLevel
      };
      events.push({ kind: "xp", amount: action.amount, reason: action.reason });
      if (nextLevel > prog0.level) {
        events.push({ kind: "level-up", level: nextLevel });
      }
      prog1 = awardBadgesIfAny(prog1, events, {
        completedQuestsTotal: countCompletedQuests(prog1),
        newLevel: nextLevel,
        newStreak: prog1.streaks.research.streak,
        newQuizStreak: prog1.streaks.quiz.streak
      });
      return { state: putProg(state, prog1), events };
    }

    case "tick-streak": {
      if (action.kind !== "research") return { state, events };
      const prog0 = getProg(state);
      const { next, changed } = tickStreak(prog0.streaks.research);
      if (!changed) return { state, events };
      const prog1: CompanyProgress = {
        ...prog0,
        streaks: { ...prog0.streaks, research: next }
      };
      events.push({
        kind: "streak",
        streakKind: "research",
        streak: next.streak
      });
      const prog2 = awardBadgesIfAny(prog1, events, {
        completedQuestsTotal: countCompletedQuests(prog1),
        newLevel: prog1.level,
        newStreak: next.streak,
        newQuizStreak: prog1.streaks.quiz.streak
      });
      return { state: putProg(state, prog2), events };
    }

    case "update-quest-notes": {
      const prog = getProg(state);
      const key = questWorkKey(action.pillarId, action.slug);
      const existing = prog.questWork[key] ?? { notes: "", checklist: {} };
      return {
        state: putProg(state, {
          ...prog,
          questWork: {
            ...prog.questWork,
            [key]: { ...existing, notes: action.notes }
          }
        }),
        events
      };
    }

    case "toggle-quest-checklist": {
      const prog = getProg(state);
      const key = questWorkKey(action.pillarId, action.slug);
      const existing = prog.questWork[key] ?? { notes: "", checklist: {} };
      return {
        state: putProg(state, {
          ...prog,
          questWork: {
            ...prog.questWork,
            [key]: {
              ...existing,
              checklist: {
                ...existing.checklist,
                [action.key]: !(existing.checklist[action.key] ?? false)
              }
            }
          }
        }),
        events
      };
    }

    case "patch-quest-work": {
      const prog = getProg(state);
      const key = questWorkKey(action.pillarId, action.slug);
      const existing = prog.questWork[key] ?? { notes: "", checklist: {} };
      return {
        state: putProg(state, {
          ...prog,
          questWork: {
            ...prog.questWork,
            [key]: { ...existing, ...action.patch }
          }
        }),
        events
      };
    }

    case "unlock-company": {
      if (!isCompanyId(action.companyId)) return { state, events };
      if (state.unlockedCompanyIds.includes(action.companyId))
        return { state, events };
      events.push({ kind: "company-unlocked", companyId: action.companyId });
      const exists = state.companies[action.companyId];
      return {
        state: {
          ...state,
          unlockedCompanyIds: [...state.unlockedCompanyIds, action.companyId],
          companies: {
            ...state.companies,
            [action.companyId]: exists ?? initialCompanyProgress()
          }
        },
        events
      };
    }

    case "lock-company": {
      if (!isCompanyId(action.companyId)) return { state, events };
      // Never lock the default campaign — keeps the player from getting stuck.
      if (action.companyId === state.activeCompanyId) return { state, events };
      return {
        state: {
          ...state,
          unlockedCompanyIds: state.unlockedCompanyIds.filter(
            (id) => id !== action.companyId
          )
        },
        events
      };
    }

    case "enqueue-pillar-conviction": {
      const prog0 = getProg(state);
      if (typeof prog0.pillarConvictionSubmittedAt[action.pillarId] === "number") {
        return { state, events };
      }
      const queue = prog0.pendingConvictionQueue.filter(
        (x) => x.completedPillarId !== action.pillarId
      );
      const pillarToUnlock =
        action.pillarToUnlock === null
          ? null
          : action.pillarToUnlock !== undefined
            ? action.pillarToUnlock
            : nextUnlockablePillar(prog0.pillars, action.pillarId);
      const prog1: CompanyProgress = {
        ...prog0,
        pendingConvictionQueue: [
          ...queue,
          {
            completedPillarId: action.pillarId,
            pillarToUnlock
          }
        ]
      };
      events.push({
        kind: "pillar-awaiting-conviction",
        completedPillarId: action.pillarId,
        nextPillarId: pillarToUnlock
      });
      return { state: putProg(state, prog1), events };
    }

    case "submit-conviction-and-advance": {
      const prog0 = getProg(state);
      const queue = prog0.pendingConvictionQueue;
      if (queue.length === 0) return { state, events };
      const [head, ...rest] = queue;
      let prog1: CompanyProgress = {
        ...prog0,
        pendingConvictionQueue: rest,
        pillarConvictionSubmittedAt: {
          ...prog0.pillarConvictionSubmittedAt,
          [head.completedPillarId]: Date.now()
        },
        pillarIslandBonusClaimed: [...(prog0.pillarIslandBonusClaimed ?? [])]
      };
      if (head.pillarToUnlock) {
        const pid = head.pillarToUnlock;
        const wasUnlocked = prog1.pillars[pid]?.unlocked ?? false;
        prog1 = {
          ...prog1,
          pillars: applyPillarUnlock(prog1.pillars, pid)
        };
        if (!wasUnlocked) {
          events.push({ kind: "pillar-unlocked", pillarId: pid });
        }
      }

      const bonusPid = head.completedPillarId;
      if (!prog1.pillarIslandBonusClaimed.includes(bonusPid)) {
        const islandXp = XP_ISLAND_COMPLETION;
        const nextXp = prog1.xp + islandXp;
        const beforeLevel = prog1.level;
        const nextLevel = computeLevel(nextXp);
        prog1 = {
          ...prog1,
          xp: nextXp,
          level: nextLevel,
          pillarIslandBonusClaimed: [...prog1.pillarIslandBonusClaimed, bonusPid]
        };
        events.push({
          kind: "xp",
          amount: islandXp,
          reason: "Island mastery bonus"
        });
        if (nextLevel > beforeLevel) {
          events.push({ kind: "level-up", level: nextLevel });
        }
        prog1 = awardBadgesIfAny(prog1, events, {
          completedQuestsTotal: countCompletedQuests(prog1),
          newLevel: prog1.level,
          newStreak: prog1.streaks.research.streak,
          newQuizStreak: prog1.streaks.quiz.streak
        });
      }

      return { state: putProg(state, prog1), events };
    }

    case "complete-ten-k-rookie-challenge": {
      const frac = Math.min(1, Math.max(0, action.scoreFraction));
      if (frac < 0.7) return { state, events };
      const prog0 = getProg(state);
      const existing = prog0.tenKRookieChallenge;
      const now = Date.now();
      const high = frac >= 0.9;

      if (!existing) {
        const nextXp = prog0.xp + TEN_K_ROOKIE_CHALLENGE_XP;
        const beforeLevel = prog0.level;
        const nextLevel = computeLevel(nextXp);
        let prog1: CompanyProgress = {
          ...prog0,
          xp: nextXp,
          level: nextLevel,
          tenKRookieChallenge: {
            passedAt: now,
            bestScoreFraction: frac,
            highConviction: high
          },
          futureArcRevealedAt: prog0.futureArcRevealedAt ?? now
        };
        events.push({
          kind: "xp",
          amount: TEN_K_ROOKIE_CHALLENGE_XP,
          reason: "Final Challenge: 10-K Rookie"
        });
        if (nextLevel > beforeLevel) {
          events.push({ kind: "level-up", level: nextLevel });
        }
        prog1 = applyQuizPassStreakEffects(prog1, events);
        prog1 = awardBadgesIfAny(prog1, events, {
          completedQuestsTotal: countCompletedQuests(prog1),
          newLevel: prog1.level,
          newStreak: prog1.streaks.research.streak,
          newQuizStreak: prog1.streaks.quiz.streak,
          tenKChallengePassed: true
        });
        return { state: putProg(state, prog1), events };
      }

      const nextBest = Math.max(existing.bestScoreFraction, frac);
      const prog2: CompanyProgress = {
        ...prog0,
        tenKRookieChallenge: {
          ...existing,
          bestScoreFraction: nextBest,
          highConviction: existing.highConviction || high
        }
      };
      return { state: putProg(state, prog2), events };
    }

    case "mark-quest-read": {
      const prog0 = getProg(state);
      const pillarState = prog0.pillars[action.pillarId];
      if (!pillarState) return { state, events };
      if (pillarState.readQuestSlugs.includes(action.slug)) {
        return { state, events };
      }
      const now = Date.now();
      let prog1: CompanyProgress = {
        ...prog0,
        pillars: {
          ...prog0.pillars,
          [action.pillarId]: {
            ...pillarState,
            readQuestSlugs: [...pillarState.readQuestSlugs, action.slug],
            readAt: { ...pillarState.readAt, [action.slug]: now }
          }
        }
      };
      events.push({
        kind: "quest-read",
        pillarId: action.pillarId,
        slug: action.slug
      });

      const quest = findQuestDefinition(
        state.activeCompanyId as CompanyId,
        action.pillarId,
        action.slug
      );
      const ps1 = prog1.pillars[action.pillarId];
      if (
        quest?.completionState?.kind === "read" &&
        ps1 &&
        !ps1.completedQuestSlugs.includes(action.slug)
      ) {
        prog1 = {
          ...prog1,
          pillars: {
            ...prog1.pillars,
            [action.pillarId]: {
              ...ps1,
              completedQuestSlugs: [...ps1.completedQuestSlugs, action.slug],
              completedAt: { ...ps1.completedAt, [action.slug]: now }
            }
          }
        };

        let pillarJustCompleted: PillarId | null = null;
        if (isPillarComplete(prog1.pillars, action.pillarId)) {
          pillarJustCompleted = action.pillarId;
          events.push({ kind: "pillar-completed", pillarId: action.pillarId });
          const newlyUnlocked = nextUnlockablePillar(
            prog1.pillars,
            action.pillarId
          );
          const queue = prog1.pendingConvictionQueue.filter(
            (x) => x.completedPillarId !== action.pillarId
          );
          prog1 = {
            ...prog1,
            pendingConvictionQueue: [
              ...queue,
              {
                completedPillarId: action.pillarId,
                pillarToUnlock: newlyUnlocked
              }
            ]
          };
          events.push({
            kind: "pillar-awaiting-conviction",
            completedPillarId: action.pillarId,
            nextPillarId: newlyUnlocked
          });
        }

        const allDone = allPillarsComplete(prog1.pillars);
        if (allDone) events.push({ kind: "all-pillars-complete" });

        prog1 = awardBadgesIfAny(prog1, events, {
          completedQuestsTotal: countCompletedQuests(prog1),
          pillarJustCompleted,
          allPillarsCompleted: allDone,
          newLevel: prog1.level,
          newStreak: prog1.streaks.research.streak,
          newQuizStreak: prog1.streaks.quiz.streak
        });
      }

      return { state: putProg(state, prog1), events };
    }

    case "dismiss-quest-map-brief": {
      const prog = getProg(state);
      if (prog.questMapBriefDismissedAt != null) return { state, events };
      return {
        state: putProg(state, {
          ...prog,
          questMapBriefDismissedAt: Date.now()
        }),
        events
      };
    }

    case "dismiss-business-island-brief": {
      const prog = getProg(state);
      if (prog.businessIslandBriefDismissedAt != null) return { state, events };
      return {
        state: putProg(state, {
          ...prog,
          businessIslandBriefDismissedAt: Date.now()
        }),
        events
      };
    }

    case "mark-quest-unread": {
      const prog0 = getProg(state);
      const pillarState = prog0.pillars[action.pillarId];
      if (!pillarState) return { state, events };
      if (!pillarState.readQuestSlugs.includes(action.slug)) {
        return { state, events };
      }
      const nextReadAt = { ...pillarState.readAt };
      delete nextReadAt[action.slug];
      const prog1: CompanyProgress = {
        ...prog0,
        pillars: {
          ...prog0.pillars,
          [action.pillarId]: {
            ...pillarState,
            readQuestSlugs: pillarState.readQuestSlugs.filter(
              (s) => s !== action.slug
            ),
            readAt: nextReadAt
          }
        }
      };
      return { state: putProg(state, prog1), events };
    }

    case "clear-pillar-progress": {
      const prog0 = getProg(state);
      const pillarState = prog0.pillars[action.pillarId];
      if (!pillarState) return { state, events };
      const freshPillar = initialCompanyProgress().pillars[action.pillarId];
      const prefix = `${action.pillarId}:`;
      const nextWork = { ...prog0.questWork };
      for (const key of Object.keys(nextWork)) {
        if (key.startsWith(prefix)) delete nextWork[key];
      }
      return {
        state: putProg(state, bumpCompanyRevision({
          ...prog0,
          pillars: {
            ...prog0.pillars,
            [action.pillarId]: {
              ...freshPillar,
              unlocked: pillarState.unlocked,
              unlockedAt: pillarState.unlockedAt
            }
          },
          questWork: nextWork
        })),
        events
      };
    }

    case "repair-quest-progress": {
      const prog0 = getCompanyProg(state, action.companyId);
      const pillarState = prog0.pillars[action.pillarId];
      if (!pillarState) return { state, events };
      const nextPillar = patchPillarReadsForRepair(
        pillarState,
        action.questSlug,
        action.cardIds,
        action.mode
      );
      const nextQuestWork =
        action.mode === "reset"
          ? stripQuestWorkForQuest(prog0.questWork, action.pillarId, action.questSlug)
          : prog0.questWork;
      const nextProg =
        action.mode === "reset"
          ? bumpCompanyRevision({
              ...prog0,
              pillars: {
                ...prog0.pillars,
                [action.pillarId]: nextPillar
              },
              questWork: nextQuestWork
            })
          : {
              ...prog0,
              pillars: {
                ...prog0.pillars,
                [action.pillarId]: nextPillar
              },
              questWork: nextQuestWork
            };
      return {
        state: putCompanyProg(state, action.companyId, nextProg),
        events
      };
    }

    default:
      return { state, events };
  }
}

// -----------------------------------------------------------------------------
// Activity stamping wrapper.
// -----------------------------------------------------------------------------

/** Actions that count as player engagement: stamp `lastActivityAt`. */
const ACTIVITY_ACTIONS: ReadonlySet<GameAction["type"]> = new Set<
  GameAction["type"]
>([
  "complete-quest",
  "award-xp",
  "tick-streak",
  "update-quest-notes",
  "toggle-quest-checklist",
  "patch-quest-work",
  "set-active-pillar",
  "set-active-quest",
  "mark-quest-read",
  "repair-quest-progress",
  "clear-pillar-progress",
  "submit-conviction-and-advance",
  "enqueue-pillar-conviction",
  "complete-ten-k-rookie-challenge"
]);

/**
 * Wraps `reduce` and updates `lastActivityAt` on the global state and
 * on the active company's progress whenever a meaningful action runs.
 * Pure: still returns `{ state, events }`. Hosts (the GameProvider, or
 * a future server-side reducer pipeline) should call this instead of
 * `reduce` directly.
 */
export function applyAction(
  state: GameState,
  action: GameAction
): ReduceResult {
  const result = reduce(state, action);
  if (!ACTIVITY_ACTIONS.has(action.type)) return result;
  const now = Date.now();
  const activeId = result.state.activeCompanyId;
  const prog = result.state.companies[activeId];
  if (!prog) return result;
  return {
    state: {
      ...result.state,
      lastActivityAt: now,
      companies: {
        ...result.state.companies,
        [activeId]: { ...prog, lastActivityAt: now }
      }
    },
    events: result.events
  };
}
