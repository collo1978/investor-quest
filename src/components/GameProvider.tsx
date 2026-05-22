"use client";

/**
 * GameProvider — React adapter around the pure progression engine.
 *
 * The engine (`@/engine/progression/reducer`) is the single source of
 * truth for player state. This provider:
 *
 *   - Holds the canonical `GameState` in React state.
 *   - Hydrates from / saves to a `ProgressionStore` (swappable adapter:
 *     localStorage today, remote DB tomorrow — same interface).
 *   - Forwards `actions.*` calls into reducer actions via `applyAction`,
 *     which auto-stamps `lastActivityAt` on engagement actions.
 *   - Surfaces `RewardEvent`s emitted by the reducer as toasts + FX triggers.
 *   - Optionally invokes an `onAction` middleware so a future server
 *     sync layer can stream actions to a backend without changes here.
 *
 * Components consume game state and actions through `useGame()`.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  applyAction,
  defaultStore,
  initialCompanyProgress,
  initialState,
  type BadgeId,
  type CompanyProgress,
  type GameAction,
  type GameState,
  type OnboardingState,
  type ProgressionStore,
  type QuestWork,
  type RewardEvent,
  type StreakKind
} from "@/engine";
import type { PillarId } from "@/data/pillars";
import { QuestPrewarmBootstrap } from "@/components/quest/QuestPrewarmBootstrap";
import { useQuestPrewarm } from "@/hooks/useQuestPrewarm";
import { markGameSessionTouched } from "@/lib/gameSession";
import { mergeLoadedGameState } from "@/lib/gameState/mergeLoadedGameState";

type Toast = {
  id: string;
  kind: "xp" | "level" | "unlock";
  title: string;
  detail?: string;
};

export type FxState = {
  /** Triggers a one-shot level-up effect when its key changes. */
  levelUpKey: number | null;
  /** Last achieved level, for FX caption. */
  level: number | null;
  /** Triggers a one-shot unlock effect when its key changes. */
  unlockKey: string | null;
  unlockTitle: string | null;
  /** Triggers quest-completion FX. */
  completionKey: string | null;
  /** XP gained in the most recent completion (for FX caption). */
  completionXp: number | null;
};

const initialFx: FxState = {
  levelUpKey: null,
  level: null,
  unlockKey: null,
  unlockTitle: null,
  completionKey: null,
  completionXp: null
};

type GameActions = {
  setProfile: (profile: { playerName: string; goal: string }) => void;
  setActiveCompany: (companyId: string) => void;
  setActivePillar: (pillarId: PillarId) => void;
  setActiveQuest: (pillarId: PillarId, slug: string | null) => void;
  completeQuest: (
    pillarId: PillarId,
    slug: string,
    opts?: { quizPerfect?: boolean }
  ) => void;
  /**
   * Mark a quest's content card as read.
   * Reading progress only — does NOT award XP. XP is reserved for
   * quiz passes via `completeQuest`.
   */
  markQuestRead: (pillarId: PillarId, slug: string) => void;
  markQuestUnread: (pillarId: PillarId, slug: string) => void;
  awardBonusXp: (amount: number, reason: string) => void;
  /** Advance research consistency streak only (`quiz` advances on quiz passes). */
  touchDailyStreak: () => void;
  /** Research-only; quiz streak is advanced by the engine when you pass quizzes. */
  touchStreak: (kind: StreakKind) => void;
  updateQuestNotes: (pillarId: PillarId, slug: string, notes: string) => void;
  toggleQuestChecklist: (
    pillarId: PillarId,
    slug: string,
    key: string
  ) => void;
  patchQuestWork: (
    pillarId: PillarId,
    slug: string,
    patch: Partial<QuestWork> & Record<string, unknown>
  ) => void;
  unlockCompany: (companyId: string) => void;
  lockCompany: (companyId: string) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  reset: () => void;
  dismissToast: (id: string) => void;
  /** After island conviction modal — applies deferred pillar unlock when applicable. */
  submitConvictionAndAdvance: () => void;
  /** Center-map 10-K Rookie final challenge — pass 0..1 score fraction (≥0.7 clears). */
  completeTenKRookieChallenge: (scoreFraction: number) => void;
  /** Dismiss the cinematic quest-map mission brief (per active company). */
  dismissQuestMapBrief: () => void;
  /** Dismiss the first-visit Business Island mission brief (per active company). */
  dismissBusinessIslandBrief: () => void;
  /** Reset read/completion/quiz work for a pillar (dev testing). */
  clearPillarProgress: (pillarId: PillarId) => void;
  /** Escape hatch for advanced cases — usually you want a named action above. */
  dispatch: (action: GameAction) => void;
};

type ContextState = {
  playerName: string | null;
  goal: string | null;
  activeCompanyId: string;
  xp: number;
  level: number;
  streaks: CompanyProgress["streaks"];
  pillars: CompanyProgress["pillars"];
  questWork: CompanyProgress["questWork"];
  badges: Record<BadgeId, { awardedAt: number }>;
  activePillarId: PillarId;
  activeQuestSlug: string | null;
  onboarding: OnboardingState;
  unlockedCompanyIds: string[];
  lastActivityAt: number | null;
  pendingConvictionQueue: CompanyProgress["pendingConvictionQueue"];
};

type GameContextValue = {
  state: ContextState;
  /** Full canonical engine state, for selectors. */
  raw: GameState;
  actions: GameActions;
  toasts: Toast[];
  fx: FxState;
  hydrated: boolean;
  /** Engine version (useful for diagnostics / compat checks). */
  storeId: string;
};

const GameContext = createContext<GameContextValue | null>(null);

/**
 * Module-level toast-id counter — monotonic across the session.
 * Local-only counters reset every call, which causes duplicate ids when two
 * batches of events fire in the same millisecond (e.g. read → unlock + xp).
 */
let toastSeq = 0;

function eventsToToasts(events: RewardEvent[]): Toast[] {
  const out: Toast[] = [];
  const next = () => `evt_${Date.now()}_${(toastSeq += 1)}`;
  for (const e of events) {
    if (e.kind === "xp") {
      const title =
        e.reason === "Island mastery bonus"
          ? `+${e.amount} XP — island mastery secured`
          : e.reason.startsWith("Section quiz")
            ? `+${e.amount} XP — quiz mastery`
            : `+${e.amount} XP`;
      out.push({
        id: next(),
        kind: "xp",
        title,
        detail: "Your investor journey advances."
      });
    } else if (e.kind === "level-up") {
      out.push({
        id: next(),
        kind: "level",
        title: `Level ${e.level} unlocked`,
        detail: "New trails open as your conviction deepens."
      });
    } else if (e.kind === "pillar-unlocked") {
      out.push({
        id: next(),
        kind: "unlock",
        title: `Next island unlocked`,
        detail: `${e.pillarId.charAt(0).toUpperCase()}${e.pillarId.slice(1)} is ready on the map.`
      });
    } else if (e.kind === "pillar-completed") {
      out.push({
        id: next(),
        kind: "unlock",
        title: `Island conquered`,
        detail: "Chart your conviction to power up the bridge to the next expedition."
      });
    } else if (e.kind === "all-pillars-complete") {
      out.push({
        id: next(),
        kind: "unlock",
        title: "Full thesis assembled",
        detail: "You've cleared every pillar for this company."
      });
    } else if (e.kind === "badge") {
      out.push({
        id: next(),
        kind: "unlock",
        title: `Badge earned: ${e.badgeId}`,
        detail: "View it on your profile."
      });
    } else if (e.kind === "streak") {
      if (e.streakKind === "research") {
        out.push({
          id: next(),
          kind: "unlock",
          title: `Research consistency · ${e.streak} day${e.streak === 1 ? "" : "s"}`,
          detail: "Habit signal only — no XP. Quiz streaks reward demonstrated understanding."
        });
      } else {
        out.push({
          id: next(),
          kind: "unlock",
          title: `Quiz streak · ${e.streak} day${e.streak === 1 ? "" : "s"} of mastery`,
          detail: "Milestone XP unlocks at 3, 7, and 30 consecutive quiz days."
        });
      }
    } else if (e.kind === "company-unlocked") {
      out.push({
        id: next(),
        kind: "unlock",
        title: `Campaign unlocked: ${e.companyId.toUpperCase()}`,
        detail: "A new company island is now playable."
      });
    }
  }
  return out;
}

export type GameProviderProps = {
  children: React.ReactNode;
  /**
   * Backing store. Defaults to `localStorage` in the browser and an
   * in-memory store on the server. Pass a custom store to wire up a
   * remote database or any other persistence backend.
   */
  store?: ProgressionStore;
  /**
   * Middleware invoked after every reducer action with the action and
   * the resulting state. Use this to stream events to a backend, a
   * telemetry pipeline, or a debug log.
   */
  onAction?: (input: {
    action: GameAction;
    state: GameState;
    events: RewardEvent[];
  }) => void;
};

function GameProviderInner({
  children,
  activeCompanyId
}: {
  children: React.ReactNode;
  activeCompanyId: string;
}) {
  useQuestPrewarm(activeCompanyId);
  return (
    <>
      <QuestPrewarmBootstrap />
      {children}
    </>
  );
}

export function GameProvider({
  children,
  store: storeProp,
  onAction
}: GameProviderProps) {
  const store = useMemo(() => storeProp ?? defaultStore(), [storeProp]);

  const [state, setState] = useState<GameState>(() => initialState());
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [fx, setFx] = useState<FxState>(initialFx);
  const fxSeq = useRef(0);

  // -----------------------------------------------------------------
  // Hydrate from the store, then subscribe to remote updates (if any).
  // -----------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await store.load();
      if (!cancelled && loaded) {
        setState((prev) => mergeLoadedGameState(prev, loaded));
      }
      if (!cancelled) setHydrated(true);
    })();
    const unsub = store.subscribe?.((next) => setState(next));
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [store]);

  // -----------------------------------------------------------------
  // Persist on change (after hydration so we don't overwrite the load).
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!hydrated) return;
    void store.save(state);
  }, [hydrated, state, store]);

  // -----------------------------------------------------------------
  // Single dispatch funnel: applyAction → state, toasts, FX, middleware.
  // -----------------------------------------------------------------
  const dispatch = useCallback(
    (action: GameAction) => {
      markGameSessionTouched();
      setState((prev) => {
        const result = applyAction(prev, action);

        if (
          action.type === "dismiss-quest-map-brief" ||
          action.type === "dismiss-business-island-brief"
        ) {
          void store.save(result.state);
        }

        if (result.events.length > 0) {
          const newToasts = eventsToToasts(result.events);
          if (newToasts.length > 0) {
            setToasts((prevToasts) =>
              [...newToasts, ...prevToasts].slice(0, 3)
            );
            for (const t of newToasts) {
              window.setTimeout(() => {
                setToasts((cur) => cur.filter((x) => x.id !== t.id));
              }, 2800);
            }
          }

          let nextFx: FxState | null = null;
          for (const e of result.events) {
            if (e.kind === "level-up") {
              nextFx = {
                ...(nextFx ?? initialFx),
                levelUpKey: (fxSeq.current += 1),
                level: e.level
              };
            } else if (
              e.kind === "pillar-unlocked" ||
              e.kind === "company-unlocked"
            ) {
              const titleSrc =
                e.kind === "pillar-unlocked" ? e.pillarId : e.companyId;
              nextFx = {
                ...(nextFx ?? initialFx),
                unlockKey: `${e.kind}:${titleSrc}:${(fxSeq.current += 1)}`,
                unlockTitle: titleSrc
              };
            } else if (
              e.kind === "xp" &&
              (e.reason.startsWith("Section quiz") ||
                e.reason === "Island mastery bonus")
            ) {
              nextFx = {
                ...(nextFx ?? initialFx),
                completionKey: `done:${(fxSeq.current += 1)}`,
                completionXp: e.amount
              };
            }
          }
          if (nextFx) setFx((prevFx) => ({ ...prevFx, ...nextFx }));
        }

        onAction?.({
          action,
          state: result.state,
          events: result.events
        });
        return result.state;
      });
    },
    [onAction, store]
  );

  const actions = useMemo<GameActions>(
    () => ({
      setProfile: ({ playerName, goal }) =>
        dispatch({ type: "set-profile", playerName, goal }),
      setActiveCompany: (companyId) =>
        dispatch({ type: "set-active-company", companyId }),
      setActivePillar: (pillarId) =>
        dispatch({ type: "set-active-pillar", pillarId }),
      setActiveQuest: (pillarId, slug) =>
        dispatch({ type: "set-active-quest", pillarId, slug }),
      completeQuest: (pillarId, slug, opts) =>
        dispatch({
          type: "complete-quest",
          pillarId,
          slug,
          quizPerfect: opts?.quizPerfect
        }),
      markQuestRead: (pillarId, slug) =>
        dispatch({ type: "mark-quest-read", pillarId, slug }),
      markQuestUnread: (pillarId, slug) =>
        dispatch({ type: "mark-quest-unread", pillarId, slug }),
      awardBonusXp: (amount, reason) =>
        dispatch({ type: "award-xp", amount, reason }),
      touchDailyStreak: () =>
        dispatch({ type: "tick-streak", kind: "research" }),
      touchStreak: (kind) => dispatch({ type: "tick-streak", kind }),
      updateQuestNotes: (pillarId, slug, notes) =>
        dispatch({ type: "update-quest-notes", pillarId, slug, notes }),
      toggleQuestChecklist: (pillarId, slug, key) =>
        dispatch({ type: "toggle-quest-checklist", pillarId, slug, key }),
      patchQuestWork: (pillarId, slug, patch) =>
        dispatch({ type: "patch-quest-work", pillarId, slug, patch }),
      unlockCompany: (companyId) =>
        dispatch({ type: "unlock-company", companyId }),
      lockCompany: (companyId) =>
        dispatch({ type: "lock-company", companyId }),
      setOnboardingStep: (step) =>
        dispatch({ type: "set-onboarding-step", step }),
      completeOnboarding: () => dispatch({ type: "complete-onboarding" }),
      reset: () => {
        dispatch({ type: "reset" });
        setToasts([]);
        setFx(initialFx);
      },
      dismissToast: (id) =>
        setToasts((prev) => prev.filter((t) => t.id !== id)),
      submitConvictionAndAdvance: () =>
        dispatch({ type: "submit-conviction-and-advance" }),
      completeTenKRookieChallenge: (scoreFraction) =>
        dispatch({
          type: "complete-ten-k-rookie-challenge",
          scoreFraction
        }),
      dismissQuestMapBrief: () =>
        dispatch({ type: "dismiss-quest-map-brief" }),
      dismissBusinessIslandBrief: () =>
        dispatch({ type: "dismiss-business-island-brief" }),
      clearPillarProgress: (pillarId) =>
        dispatch({ type: "clear-pillar-progress", pillarId }),
      dispatch
    }),
    [dispatch]
  );

  const value = useMemo<GameContextValue>(() => {
    const prog =
      state.companies[state.activeCompanyId] ?? initialCompanyProgress();
    return {
      state: {
        playerName: state.playerName,
        goal: state.goal,
        activeCompanyId: state.activeCompanyId,
        xp: prog.xp,
        level: prog.level,
        streaks: prog.streaks,
        pillars: prog.pillars,
        questWork: prog.questWork,
        badges: prog.badges,
        activePillarId: prog.activePillarId,
        activeQuestSlug: prog.activeQuestSlug,
        onboarding: state.onboarding,
        unlockedCompanyIds: state.unlockedCompanyIds,
        lastActivityAt: state.lastActivityAt,
        pendingConvictionQueue: prog.pendingConvictionQueue
      },
      raw: state,
      actions,
      toasts,
      fx,
      hydrated,
      storeId: store.id
    };
  }, [state, actions, toasts, fx, hydrated, store.id]);

  return (
    <GameContext.Provider value={value}>
      <GameProviderInner activeCompanyId={state.activeCompanyId}>
        {children}
      </GameProviderInner>
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
