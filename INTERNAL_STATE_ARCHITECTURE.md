# Internal State Architecture

Single source of truth for player progression in Investor Quest. Read this before adding state mutations, persistence, or repair flows.

## Canonical stack

```
UI components
    ↓ actions.* / dispatch(GameAction)
GameProvider (React adapter)
    ↓ applyAction → reduce
Engine reducer (pure)
    ↓ GameState
GameProvider persist effect
    ↓ ProgressionStore.save
localStorageStore → savePersistedSnapshot (envelope + backup)
```

**Rule:** All player progression mutations go through `GameAction` → reducer → `GameProvider` → `ProgressionStore`. No direct `localStorage` writes to `investor-quest::state`.

## State shape

- **File:** `src/engine/progression/state.ts`
- **Key:** `investor-quest::state` (`STORAGE_KEY`)
- **Version:** `STATE_VERSION` (currently 11)
- Per-company: XP, streaks, badges, pillars, `questWork`, conviction queue, brief flags
- Per-pillar: `readQuestSlugs` / `readAt` (reading) vs `completedQuestSlugs` / `completedAt` (XP/completion)

## Reducer flow

- **File:** `src/engine/progression/reducer.ts`
- **Entry:** `applyAction(state, action)` — stamps `lastActivityAt` on engagement actions
- **Pure:** `reduce(state, action)` returns `{ state, events }`
- **Reward events:** surfaced by GameProvider as toasts/FX

### Allowed mutation actions (examples)

| Action | Purpose |
|--------|---------|
| `mark-quest-read` | Card/parent read (no XP unless quest is read-kind) |
| `mark-quest-unread` | Remove read marker |
| `complete-quest` | Quiz pass → XP, completion slugs |
| `repair-quest-progress` | Mission Control read-state repair (any company) |
| `clear-pillar-progress` | Dev reset for one pillar |
| `patch-quest-work` | Quiz attempts, notes, checklist |
| `submit-conviction-and-advance` | Conviction gate → pillar unlock |
| `reset` | Full game reset |

## Persistence flow

### Store interface

- **File:** `src/engine/persistence/store.ts`
- Adapters: `localStorageStore` (browser), `memoryStore` (SSR/tests)

### Save path

1. `GameProvider` `useEffect([hydrated, state])` calls `store.save(state)` **only after** `persistReadyRef` is true (post-hydrate).
2. `localStorageStore.save` → `savePersistedSnapshot` in `persistence.ts`.
3. Before write: if disk activity timestamp is newer than memory, **merge** disk into memory (stale-tab protection).
4. Rotate current primary → backup key, write envelope `{ envelopeVersion: 1, savedAt, state }`.

### Load path

1. Sync bootstrap: `readClientGameState()` → `loadState()` → `loadPersistedSnapshot()` (first paint, no empty flash).
2. Async hydrate: `store.load()` → `mergeLoadedGameState(inMemory, loaded)` → set `hydrated = true`.
3. Cross-tab: `storage` event → subscribe → merge into React state.

### Corrupt save protection

- Primary parse failure → try `investor-quest::state::backup`
- Console warnings via `[investor-quest:persist]`
- `hasUnrecoverableCorruptSave()` blocks saves that would overwrite a corrupt primary with fresh state

## Hydration lifecycle

```
Mount
  ├─ useState(readClientGameState)     // sync disk read + migrateRaw
  ├─ user actions OK in memory         // NOT persisted until hydrate completes
  └─ useEffect: store.load()
        ├─ mergeLoadedGameState(prev, loaded)
        ├─ persistReadyRef = true
        └─ hydrated = true
              └─ persist effect saves merged state
```

**Pre-hydrate reads/completions** are kept via merge union — never wiped when async hydrate finishes.

**Components that gate on `hydrated`:** quest pages, mission brief, business hub (recommended pattern for progress-sensitive UI).

## Read / completion lifecycle

1. User marks card read → `markQuestRead(pillar, compositeSlug)` → `readQuestSlugs`
2. All cards read → parent slug marked read → quiz unlock (client: `computeQuestCardReadProgress`)
3. Quiz pass → `completeQuest` → `completedQuestSlugs` + XP

Composite slugs: `{parentSlug}#{cardId}` stored in engine; parent slug used for single-card quests.

## Company switching

- `setActiveCompany(companyId)` → reducer updates `activeCompanyId`
- Progress is per-company in `state.companies[companyId]`
- UI selectors use `state.activeCompanyId` via `useGame().state` or `raw`

## Repair flow (Mission Control)

```
POST /api/admin/game-health/issues/[id]/fix
  → executeFixAction (server: DB/content fixes)
  → returns clientRepair payload (quest_progress)

OpsInlineIssueRepair
  → applyQuestProgressClientRepair(params, actions.dispatch)
  → repair-quest-progress reducer action
  → GameProvider persist effect
  → UI updates immediately (no refresh)
```

**Do not** write `localStorage` from repair code. Use `actions.repairQuestProgress` or `dispatch(buildRepairQuestProgressAction(...))`.

## Where mutations are allowed

| Location | Allowed? |
|----------|----------|
| `reducer.ts` | Yes — canonical |
| `GameProvider.dispatch` / `actions.*` | Yes — forwards to reducer |
| `ProgressionStore.save` | Yes — persists reducer output only |
| `questProgressClientRepair.ts` | Dispatch only — no storage |
| `BusinessIslandDevReset` | Yes — via `clearPillarProgress` action |
| Direct `localStorage.setItem(STORAGE_KEY)` | **Never** |

## Merge strategy (`mergeLoadedGameState`)

- **File:** `src/lib/gameState/mergeLoadedGameState.ts`
- Used on: hydrate, cross-tab subscribe, stale-tab save
- Unions: reads, completions, badges, conviction queue, unlocked companies
- Max: XP, streak counts, quiz best scores, activity timestamps
- In-memory wins: active quest/pillar, profile fields when set

## Related but separate storage

Not in `GameState` — do not merge with progression:

- `investor-quest::conviction-records::v1` — conviction UI records
- `iq-analytics-*` — telemetry buffer
- `mission-control-simple-mode` — admin UI preference

## Debugging

- Enable: `localStorage.setItem('iq-quest-progress-debug','1')` or `?questProgressDebug=1`
- Logs: `[quest-progress]` hydrate/persist events in GameProvider

## Adding new progress fields

1. Add to `CompanyProgress` / `GameState` in `state.ts`
2. Add migration step in `migrateRaw` (`persistence.ts`) if persisted shape changes
3. Handle in reducer action(s)
4. Extend `mergeLoadedGameState` so hydrate/cross-tab never drops the field
5. Update this document
