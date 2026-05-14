# Investor Quest — Architecture

A scalable gamified investor progression platform. The app is separated
into four explicit layers so each one evolves independently.

```
┌──────────────────────────────────────────────────────────────────┐
│ UI Layer (React)                                                 │
│   src/ui/components, src/ui/effects, src/ui/hooks                │
│   src/components, src/components/gameHooks.ts, src/app           │
├──────────────────────────────────────────────────────────────────┤
│ Game Logic Layer (pure)                                          │
│   src/engine/progression/{reducer,xp,unlocks,streaks,badges,...} │
│   src/engine/persistence/{store,localStorageStore,memoryStore}   │
│   src/engine/index.ts (public API)                               │
├──────────────────────────────────────────────────────────────────┤
│ Data Layer (pure)                                                │
│   src/data/companies, src/data/pillars                           │
│   src/data/quests/{types,templates,library}                      │
│   src/data/sec/{types,mappings}                                  │
├──────────────────────────────────────────────────────────────────┤
│ SEC Content Layer (stubs)                                        │
│   src/sec/{types,fetcher,parser,ai-summarizer,quest-generator}   │
└──────────────────────────────────────────────────────────────────┘
```

## Game Progression Engine (the heart of Step 2)

Single source of truth for **all** player progression:

- **XP** & level math (`engine/progression/xp.ts`)
- **Completed quests** per pillar with per-quest `completedAt` timestamps
- **Unlocked pillars** with `unlockedAt` timestamps (per company)
- **Unlocked islands / campaigns** — top-level `unlockedCompanyIds`
- **Badges** — earned milestones with `awardedAt` (`engine/progression/badges.ts`)
- **Streaks** — daily research streaks with last-day tracking (`engine/progression/streaks.ts`)
- **Active company / pillar / quest** — pointer state for "where am I?"
- **Quest progress %** — checklist, quiz, minigame, or notes-driven
- **Activity timestamps** — `lastActivityAt` at global and per-company levels
- **Onboarding state** — step + completion timestamp

### Mutation flow

```
UI               GameProvider               applyAction()              ProgressionStore
─────────  ─────────────────────────  ───────────────────────────  ──────────────────
useGame()  dispatch(action)           reduce(state, action) +      load() / save()
.actions   ─────────────►             stamps lastActivityAt        (localStorage |
.completeQuest()                                                    memory | remote)
                                      ─► { state, events }
                                                │
                                                ▼
                                          RewardEvent[] → toasts, FX
```

All UI mutations go through reducer actions. The reducer is pure:
`reduce(state, action) → { state, events }`. `applyAction` is the
host-facing wrapper that also stamps `lastActivityAt`.

### Persistence is swappable

```ts
interface ProgressionStore {
  id: string;
  load(): Promise<GameState | null>;
  save(state): Promise<void>;
  clear(): Promise<void>;
  subscribe?(handler): () => void; // cross-tab / remote pushes
}
```

Adapters provided today:

- `localStorageStore` — browser localStorage + cross-tab `storage` events
- `memoryStore` — in-memory (SSR / tests)
- `createMemoryStore(initial?)` — factory for isolated test stores

Use `<GameProvider store={…}>` to swap in any implementation. A future
remote database / authenticated profile only needs a new class that
satisfies `ProgressionStore`. The reducer, selectors, and UI don't
change.

### Action middleware

```tsx
<GameProvider onAction={({ action, state }) => sendToServer({ action, state })}>
  …
</GameProvider>
```

`onAction` fires after every reducer action with the resulting state.
Designed for future server sync — stream actions to a backend without
modifying anything inside the engine.

### Selectors

Pure read-only views over `GameState` (in `engine/progression/selectors.ts`):

- `getLevelProgress`, `getActiveCompanyProgress`
- `getPillarViews`, `getIslandViews` (rich view-model with metadata,
  active pip, prerequisite pillar)
- `getPillarQuestViews`, `getQuestView`, `getQuestProgressPct`
- `getCampaignViews`, `isCompanyUnlocked`, `getUnlockedCompanies`
- `getActiveQuestPointer`, `getResumeTarget`
- `getCompletedQuestCount`, `getUnlockedIslandCount`, `getNextPillarUnlock`

### Reactive hooks

Components consume the engine through typed hooks in
`src/components/gameHooks.ts`:

- `useActiveProgress`, `useLevelProgress`, `useXp`, `useStreak`, `useBadges`
- `usePillarViews`, `useIslandViews`
- `usePillarQuestViews`, `useQuestView`, `useQuestProgressPct`
- `useActiveQuest`, `useResumeTarget`, `useNextPillarUnlock`
- `useCampaignViews`, `useIsCompanyUnlocked`, `useActiveCompany`
- `useCompletedQuestCount`, `useUnlockedIslandCount`, `useAllPillarsComplete`

Each is a thin `useMemo` over the canonical state — re-renders are
scoped to what the hook actually reads.

### State versioning

Persisted state is migrated automatically:

| Version | Shape |
|---------|-------|
| v1      | Single-company top-level state |
| v2      | `companies` dict, no badges |
| v3      | Adds badges, onboarding, active pillar/quest, pillar `unlockedAt` |
| **v4**  | Adds `unlockedCompanyIds`, `lastActivityAt`, per-quest `completedAt` |

Migration lives in `engine/progression/persistence.ts::migrateRaw` and
is shared by every store adapter.

## Other layers

(unchanged from Phase 1)

### Data Layer (`src/data/*`)

Pure typed data — no React, no IO. Companies, pillars, quest templates
(`{Company.name}` tokens substituted at instantiation), SEC mappings.

### UI Layer (`src/ui/*` + `src/components/*` + `src/app/*`)

Re-usable primitives: `QuestCard`, `ProgressBar`, `XpBadge`, `Modal`,
`LevelUpFx`, `UnlockFx`, `QuestCompletionFx`, `useImageFrame`.

### SEC Content Layer (`src/sec/*`)

Stubs only. See `src/sec/README.md` for the pipeline shape.

## Backward compatibility

Files under `src/lib/*` are thin shims that re-export from the new
layers. Older modules importing `@/lib/demoData`, `@/lib/gameState`, or
`@/lib/pillarOrder` continue to work; new code should import from
`@/data/*`, `@/engine`, `@/ui`, and `@/components/gameHooks`.
