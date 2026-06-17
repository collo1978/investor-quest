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
  useLayoutEffect,
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
import { StartupPrefetchBootstrap } from "@/components/startup/StartupPrefetchBootstrap";
import { CorruptSaveRecoveryOverlay } from "@/components/CorruptSaveRecoveryOverlay";
import { useQuestPrewarm } from "@/hooks/useQuestPrewarm";
import { markGameSessionTouched } from "@/lib/gameSession";
import {
  clearPersistedSnapshots,
  probePersistLoadStatus,
  savePersistedSnapshot
} from "@/engine/progression/persistence";
import { isProgressPersistAction } from "@/lib/gameState/persistenceGate";
import { mergeLoadedGameState } from "@/lib/gameState/mergeLoadedGameState";
import {
  logQuestProgress,
  readClientGameState,
  summarizeReadProgress
} from "@/lib/gameState/progressionPersistence";
import type { QuestProgressClientRepairParams } from "@/lib/gameHealth/questProgressClientRepair";
import { buildRepairQuestProgressAction } from "@/lib/gameHealth/questProgressClientRepair";
import {
  CONTROLLED_DEMO_COMPANY_ID,
  CONTROLLED_DEMO_MODE
} from "@/lib/demo/controlledDemo";
import { isIsolatedDemoStoryModeActive } from "@/lib/demo/isolatedDemoStoryMode";

type Toast = {
  id: string;
  kind: "xp" | "level" | "unlock";
  title: string;
  detail?: string;
};

export type FxState = {
  levelUpKey: number | null;
  level: number | null;
  unlockKey: string | null;
  unlockTitle: string | null;
  completionKey: string | null;
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
  markQuestRead: (pillarId: PillarId, slug: string) => void;
  markQuestUnread: (pillarId: PillarId, slug: string) => void;
  awardBonusXp: (amount: number, reason: string) => void;
  touchDailyStreak: () => void;
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
  completeOpeningScreen: () => void;
  completeWelcomeScreen: () => void;
  reset: () => void;
  /** Replace entire save (demo profiles) — writes disk without stale-tab merge. */
  replaceGameState: (next: GameState) => void;
  dismissToast: (id: string) => void;
  submitConvictionAndAdvance: () => void;
  enqueuePillarConviction: (
    pillarId: PillarId,
    opts?: { pillarToUnlock?: PillarId | null }
  ) => void;
  completeTenKRookieChallenge: (scoreFraction: number) => void;
  dismissQuestMapBrief: () => void;
  dismissBusinessIslandBrief: () => void;
  clearPillarProgress: (pillarId: PillarId) => void;
  repairQuestProgress: (params: QuestProgressClientRepairParams) => void;
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
  raw: GameState;
  actions: GameActions;
  toasts: Toast[];
  fx: FxState;
  /** True after async hydrate merge has committed — safe to persist. */
  hydrated: boolean;
  /** True when progress reads/writes are safe (hydrated and save not corrupt). */
  persistenceReady: boolean;
  /** True when local save is corrupt and progress actions are blocked. */
  corruptSaveBlocked: boolean;
  storeId: string;
};

const GameContext = createContext<GameContextValue | null>(null);

let toastSeq = 0;

function eventsToToasts(events: RewardEvent[]): Toast[] {
  const out: Toast[] = [];
  const next = () => `evt_${Date.now()}_${(toastSeq += 1)}`;
  for (const e of events) {
    if (e.kind === "xp") {
      const title =
        e.reason === "Island mastery bonus"
          ? `+${e.amount} XP. Island mastery secured.`
          : e.reason.startsWith("Section quiz")
            ? `+${e.amount} XP. Quiz passed.`
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
  store?: ProgressionStore;
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
      <StartupPrefetchBootstrap />
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

  const [corruptSaveBlocked, setCorruptSaveBlocked] = useState(false);
  /** SSR + first client paint must match — load local save after hydration. */
  const [state, setState] = useState<GameState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const persistReadyRef = useRef(false);
  /** Blocks stale async store.load merges right after demo reset / replaceGameState. */
  const bootstrapLockUntilRef = useRef(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [fx, setFx] = useState<FxState>(initialFx);
  const fxSeq = useRef(0);

  useLayoutEffect(() => {
    const status = probePersistLoadStatus();
    if (status.kind === "corrupt_unrecoverable") {
      setCorruptSaveBlocked(true);
      return;
    }
    setState(readClientGameState());
    persistReadyRef.current = true;
    setHydrated(true);
  }, []);

  const handleCorruptRecovery = useCallback((mode: "backup" | "fresh") => {
    setCorruptSaveBlocked(false);
    if (mode === "fresh") {
      setState(initialState());
    } else {
      const status = probePersistLoadStatus();
      if (status.kind === "loaded") {
        setState(status.state);
      }
    }
    persistReadyRef.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (corruptSaveBlocked) return;
    let cancelled = false;

    const reconcileFromStore = async () => {
      if (isIsolatedDemoStoryModeActive()) return;
      const loaded = await store.load();
      if (cancelled) return;
      setState((prev) => {
        if (!loaded) {
          logQuestProgress("hydrate.empty", summarizeReadProgress(prev));
          return prev;
        }
        if (isIsolatedDemoStoryModeActive() || Date.now() < bootstrapLockUntilRef.current) {
          return prev;
        }
        const merged = mergeLoadedGameState(prev, loaded);
        const onboardingUnchanged =
          merged.onboarding.openingScreenSeenAt ===
            prev.onboarding.openingScreenSeenAt &&
          merged.onboarding.welcomeScreenSeenAt ===
            prev.onboarding.welcomeScreenSeenAt &&
          merged.onboarding.completedAt === prev.onboarding.completedAt;
        if (onboardingUnchanged && merged.activeCompanyId === prev.activeCompanyId) {
          return prev;
        }
        logQuestProgress("hydrate.merged", summarizeReadProgress(merged));
        return merged;
      });
    };

    const useIdle = typeof requestIdleCallback !== "undefined";
    const idleId = useIdle
      ? requestIdleCallback(() => void reconcileFromStore(), { timeout: 2500 })
      : window.setTimeout(() => void reconcileFromStore(), 50);

    const unsub = store.subscribe?.((next) => {
      if (isIsolatedDemoStoryModeActive() || Date.now() < bootstrapLockUntilRef.current) {
        return;
      }
      logQuestProgress("hydrate.subscribe", summarizeReadProgress(next));
      setState((prev) => mergeLoadedGameState(prev, next));
    });
    return () => {
      cancelled = true;
      if (useIdle) {
        cancelIdleCallback(idleId as number);
      } else {
        window.clearTimeout(idleId as number);
      }
      unsub?.();
    };
  }, [store, corruptSaveBlocked]);

  useEffect(() => {
    if (isIsolatedDemoStoryModeActive()) return;
    if (!persistReadyRef.current || corruptSaveBlocked) return;
    void store.save(state).then(() => {
      logQuestProgress("persist.saved", summarizeReadProgress(state));
    });
  }, [hydrated, state, store, corruptSaveBlocked]);

  const dispatch = useCallback(
    (action: GameAction) => {
      if (corruptSaveBlocked) return;
      if (
        !hydrated &&
        isProgressPersistAction(action.type) &&
        !isIsolatedDemoStoryModeActive()
      ) {
        logQuestProgress("persist.gated", { type: action.type });
        return;
      }
      markGameSessionTouched();
      setState((prev) => {
        const result = applyAction(prev, action);

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
    [onAction, corruptSaveBlocked, hydrated]
  );

  const actions = useMemo<GameActions>(
    () => ({
      setProfile: ({ playerName, goal }) =>
        dispatch({ type: "set-profile", playerName, goal }),
      setActiveCompany: (companyId) =>
        dispatch({
          type: "set-active-company",
          companyId: CONTROLLED_DEMO_MODE
            ? CONTROLLED_DEMO_COMPANY_ID
            : companyId
        }),
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
      completeOpeningScreen: () =>
        dispatch({ type: "complete-opening-screen" }),
      completeWelcomeScreen: () =>
        dispatch({ type: "complete-welcome-screen" }),
      reset: () => {
        dispatch({ type: "reset" });
        setToasts([]);
        setFx(initialFx);
      },
      replaceGameState: (next) => {
        const stamped: GameState = {
          ...next,
          version: next.version,
          lastActivityAt: Date.now()
        };
        bootstrapLockUntilRef.current = Date.now() + 4000;
        if (!isIsolatedDemoStoryModeActive()) {
          clearPersistedSnapshots();
          savePersistedSnapshot(stamped, { mergeIfDiskNewer: false });
        }
        setState(stamped);
        persistReadyRef.current = true;
        setHydrated(true);
        setToasts([]);
        setFx(initialFx);
        logQuestProgress("demo.replace", summarizeReadProgress(stamped));
      },
      dismissToast: (id) =>
        setToasts((prev) => prev.filter((t) => t.id !== id)),
      submitConvictionAndAdvance: () =>
        dispatch({ type: "submit-conviction-and-advance" }),
      enqueuePillarConviction: (pillarId, opts) =>
        dispatch({
          type: "enqueue-pillar-conviction",
          pillarId,
          pillarToUnlock: opts?.pillarToUnlock
        }),
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
      repairQuestProgress: (params) =>
        dispatch(buildRepairQuestProgressAction(params)),
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
      persistenceReady: hydrated && !corruptSaveBlocked,
      corruptSaveBlocked,
      storeId: store.id
    };
  }, [state, actions, toasts, fx, hydrated, corruptSaveBlocked, store.id]);

  return (
    <GameContext.Provider value={value}>
      <GameProviderInner activeCompanyId={state.activeCompanyId}>
        {children}
      </GameProviderInner>
      {corruptSaveBlocked ? (
        <CorruptSaveRecoveryOverlay onRestored={handleCorruptRecovery} />
      ) : null}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

/** Poster screens under `/schools/demo/*` skip GameProvider — use for optional FX bridges. */
export function useOptionalGame(): GameContextValue | null {
  return useContext(GameContext);
}
