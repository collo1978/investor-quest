# Investor Quest — Developer Handoff

**Prototype status:** Schools presenter demo + **Business Island** are the polished priority. The other three islands (Forces/Risks, Financials, Management) exist in the wider product concept but are **not** at the same level of refinement.

**Your main job:** Polish and extend the existing experience — onboarding, map, Business Island, quest cards, quizzes, XP/progression, profile, mobile/desktop quality — without needing to rebuild the core architecture.

---

## Live Demo

| Environment | URL |
|-------------|-----|
| **Production (Vercel)** | **https://investor-quest.vercel.app/schools/demo** |
| Business island (prod) | https://investor-quest.vercel.app/schools/business → redirects into zoomed map hub |
| Schools map (prod) | https://investor-quest.vercel.app/schools/map |
| Schools profile (prod) | https://investor-quest.vercel.app/schools/profile |
| Main quest map (prod) | https://investor-quest.vercel.app/map |

### Matching local URLs (same flow)

| URL | Notes |
|-----|-------|
| http://localhost:3003/schools/demo | Local presenter entry (sidebar **Schools Live Demo** launches here) |
| http://localhost:3003/schools/map | Prodigy overworld map |
| http://localhost:3003/schools/business | Legacy route → map zoom hub |
| http://localhost:3003/schools/business/what-they-do | First Business quest (Schools context) |
| http://localhost:3003/schools/profile | Schools profile dashboard |
| http://localhost:3003/admin/game-health | Dev ops / route probes (needs env) |

**Port:** Always **3003** (`npm run dev`). Bookmarks and Capacitor local sync assume this port.

**Deploy:** Pushes to `main` on GitHub (`collo1978/investor-quest`) auto-deploy to Vercel. Production origin is hard-coded in `src/lib/schools/schoolsDemoPwa.ts` as `https://investor-quest.vercel.app`. Capacitor wrappers also point at `/schools/demo` on that host (`capacitor.config.ts`, `docs/CAPACITOR.md`).

---

## 1. Tech stack & tooling

| Area | Choice | Notes |
|------|--------|-------|
| Framework | **Next.js 15.4** (App Router) | `src/app/**/page.tsx` routing |
| Language | **TypeScript 5.8** | Strict types in `src/data/quests/types.ts`, engine layer |
| React | **19.1** | Client components marked `"use client"` |
| Styling | **Tailwind CSS 4** + **large custom CSS** | `postcss.config.mjs` → `@tailwindcss/postcss`. Most Schools/Business polish lives in `src/app/globals.css` (`iq-*` classes). Utility merge via `clsx` + `tailwind-merge` (`src/lib/utils.ts`) |
| Animation | **Framer Motion 12** (`framer-motion`, `motion`) | Quest transitions, map zoom, quiz micro-interactions |
| Confetti | **canvas-confetti** | Correct-answer celebrations (`src/lib/quests/fireQuizCorrectConfetti.ts`) |
| 3D (limited) | **three**, **@react-three/fiber**, **cobe** | Globe/visual flourishes; not core to Schools demo |
| UI primitives | **Radix UI** + many generated components under `src/components/ui/` | Accordion, scroll-area, buttons, magic cards, etc. — treat as shadcn-style building blocks |
| State | **React Context + pure reducer** | `GameProvider` + `src/engine/progression/reducer.ts` — not Redux/Zustand |
| Persistence | **localStorage** (primary) | `src/engine/persistence/localStorageStore.ts`, key `investor-quest::state` |
| Backend (optional) | **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) | Quest card generation pipeline, admin — Schools demo works offline with hand-authored content |
| Mobile shell | **Capacitor 8** | Wraps Vercel `/schools/demo`; see `docs/CAPACITOR.md` |
| Node | **>= 20.9.0** | `package.json` `engines` |

### Key dependency versions (`package.json`)

```
next ^15.4.0
react ^19.1.0
typescript ^5.8.3
tailwindcss ^4.1.10
framer-motion ^12.42.0
@supabase/supabase-js ^2.105.4
@capacitor/core ^8.3.4
canvas-confetti ^1.9.4
```

### AI-generated code & assets (obvious patterns)

**Code likely AI-assisted or pipeline-generated:**
- SEC → OpenAI quest card pipeline (`src/lib/sec/`, `src/lib/ai/`, admin `/admin/quest-generation`)
- Large batch of `src/components/ui/*` effect components (animated beams, neon cards, etc.)
- Quest templates with `plainEnglishAnswer: null` awaiting generation (`src/data/quests/templates/*.ts`)
- Dynamic quiz transforms (`src/lib/quests/dynamicQuizEngine.ts`) — turns MC into T/F, fill-blank, odd-one-out, order, scenario per attempt

**Assets that appear AI-generated / painted raster art:**
- Fullscreen onboarding posters in `public/logos/` (`opening-new-screen.png`, `schools-sounds-like-you.png`, `screen2-onboarding.png` … `screen5-onboarding.png`, `choose-your-investor-armor.png`, mission briefs)
- Island hub paintings in `public/screens/` (`biz-quest.webp`, `financial-quest.webp`, `forces-quest.webp`, `management-quest.webp`)
- Schools identity avatars `public/images/schools/avatars/{alex,zoe,jayden,...}.png`
- Schools map raster `public/logos/new-map.png`, `latest-map-schools.png` (preview/legacy — **live map uses SVG**)
- **Dev artifacts at repo root:** `tmp-zone-*.jpg` — hotspot calibration images; **not shipped**, safe to delete

**Coded (non-AI) visuals:**
- **Prodigy map** — pure SVG (`src/components/schools/prodigyMap/ProdigyMapWorld.tsx`, `ProdigyMapLandmarks.tsx`)
- **Schools Business hub hydration scene** — coded SVG (`src/components/schools/SchoolsBusinessHubCodedScene.tsx`)
- Company logos in `public/logos/companies/*.svg` — simple geometric marks (some extras are placeholders)

---

## 2. Project structure

```
investor-quest/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React UI (game + schools + business + ui/)
│   ├── data/                   # Pure content: companies, pillars, quests, progression
│   ├── engine/                 # Pure game logic: reducer, XP, badges, persistence
│   ├── hooks/                  # React hooks bridging UI ↔ engine/framework storage
│   ├── lib/                    # Feature logic (schools, business, quests, profile, …)
│   ├── platform/               # Quest catalog registry (demo vs Supabase)
│   ├── sec/                    # SEC fetch/parse stubs
│   ├── ui/                     # Shared effects (confetti, level-up FX)
│   └── middleware.ts           # Pathname header for SSR layout
├── public/                     # Static assets (logos, screens, sounds, schools PWA)
├── scripts/                    # Dev server, quest regen, game-health cron, doc gen
├── supabase/migrations/        # DB schema (game health, quest cards) — optional locally
├── docs/                       # CAPACITOR.md, etc.
├── capacitor.config.ts         # Mobile app entry → Vercel /schools/demo
├── HANDOFF.md                  # This file
└── README.md                   # Local dev quick start
```

### Directory purposes (important ones)

| Path | Purpose |
|------|---------|
| `src/app/schools/` | **Schools demo routes** — onboarding, map, business, profile, preview lab |
| `src/app/schools/demo/` | Presenter PWA mirror of `/schools/*` with `/schools/demo` prefix |
| `src/app/schools/preview/` | **Experimental** map/mission-brief style explorations (not live tour) |
| `src/app/business/` | Canonical Business Island quest routes (`/business/[questSlug]`) |
| `src/app/map/` | Main cinematic quest map (`desktop-map.png`) — separate from Schools Prodigy map |
| `src/app/profile/` | Profile hub (`InvestorProfileHub`) |
| `src/app/admin/` | Ops: quest generation, game health, branding, analytics |
| `src/components/schools/` | Schools-only screens (map, onboarding, mission brief, celebrations) |
| `src/components/business/` | Business hub markers, checklist, investor framework/quality UI |
| `src/components/QuestQuizPanel.tsx` | **Core quiz runner** (all islands) |
| `src/components/QuizQuestionView.tsx` | Per-question renderers (MC, T/F, fill-blank, order, …) |
| `src/components/BusinessIslandQuestReading.tsx` | **Main Business quest reading + quiz + checklist orchestration** |
| `src/components/profile/InvestorProfileDashboard.tsx` | Live-coded profile dashboard (not a static image) |
| `src/data/companies/` | 6 playable companies (AAPL, MSFT, TSLA, NVDA, NKE, SPOT) |
| `src/data/quests/templates/business.ts` | 7 Business quest templates + card structure |
| `src/data/quests/businessQuestQuizzes.ts` | Per-quest quiz definitions (MC base content) |
| `src/lib/business/` | Investor checklist, evidence, section quizzes, hub cards |
| `src/lib/schools/` | Demo story mode, navigation, rewards, map config, PWA |
| `src/lib/quests/dynamicQuizEngine.ts` | Section quiz format variety (5 distinct mini-game layouts) |
| `src/engine/progression/` | Reducer, XP, badges, unlocks, persistence migration |
| `src/lib/screenAssetUrls.ts` | Central registry for hub/map image paths + cache-bust revisions |

### Files to open first (Business Island + demo)

1. `src/lib/schools/launchSchoolsProductionDemo.ts` — how presenter demo starts
2. `src/lib/schools/schoolsDemoStoryMode.ts` — scripted tour steps + routes
3. `src/app/schools/map/SchoolsMapPageClient.tsx` — map + envelope brief + Business zoom
4. `src/components/business/hub/SchoolsBusinessHubIslandLayout.tsx` — hub gameplay UI
5. `src/components/BusinessIslandQuestReading.tsx` — quest cards → quiz → quality check → checklist
6. `src/components/QuestQuizPanel.tsx` + `src/components/QuizQuestionView.tsx` — quiz UX
7. `src/lib/business/businessInvestorFramework.ts` + `businessChecklistSectionQuizzes.ts` — checklist content
8. `src/components/profile/InvestorProfileDashboard.tsx` — profile polish target
9. `src/components/GameProvider.tsx` + `src/engine/progression/reducer.ts` — XP/progression

See also `src/ARCHITECTURE.md` for engine layer overview (slightly older but accurate on reducer/store split).

---

## 3. Run it locally

### Install

```bash
# Node >= 20.9.0
npm install
```

### Dev server

```bash
npm run dev
# → http://localhost:3003  (Ctrl+Shift+B in Cursor also works)
```

Other scripts:

| Command | Use |
|---------|-----|
| `npm run dev:fresh` | Clear `.next` cache + restart |
| `npm run dev:kill-port` | Free port 3003 |
| `npm run build` | Production build (Vercel uses this) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Typecheck without emit |

### Start the Schools demo locally

1. Run `npm run dev`
2. Open app with sidebar → click **Schools Live Demo** (calls `launchSchoolsProductionDemo` in `src/components/AppShell.tsx`)
3. Or navigate directly to http://localhost:3003/schools/demo

This clears prior saves, seeds demo game state, activates story mode, and hard-navigates to the mission invitation screen.

### Environment variables

**Needs verification:** Full list lives in `.env.local` (not committed). The Schools **presenter demo does not require** Supabase or OpenAI to run — it uses hand-authored quest content and localStorage.

Variables referenced in project docs / code paths (set in `.env.local` for full platform features):

| Variable | Purpose | Where used |
|----------|---------|------------|
| `NEXT_PUBLIC_APP_URL` | Canonical app origin fallback | `src/lib/schools/schoolsDemoPwa.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Admin quest generation, company cards |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Client fetches |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase | API routes / admin |
| `OPENAI_API_KEY` | Quest card AI generation | SEC pipeline, `/admin/quest-generation` |
| `QUEST_FAST_DEV` / `NEXT_PUBLIC_QUEST_FAST_DEV` | Skip slow jargon loops in dev | Quest pipeline (see `.cursor/rules/dev-server-port.mdc`) |
| `GAME_HEALTH_BASE_URL` | Health probe target | `http://localhost:3003` locally |
| `GAME_HEALTH_CRON_SECRET` | Cron auth for health checks | Optional |
| `RESEND_API_KEY`, `GAME_HEALTH_ALERT_EMAIL` | Email alerts | Optional ops |

**For handoff polish work:** You can ignore most of these. Only add Supabase/OpenAI if you are extending the AI quest pipeline.

### External services (optional)

- **Vercel** — hosting (GitHub `main` → production)
- **Supabase** — generated quest card storage, game health migration (`supabase/migrations/`)
- **OpenAI** — quest content generation (admin)
- **Resend** — optional game-health email alerts

---

## 4. Live deployment

| Item | Value |
|------|-------|
| Production URL | **https://investor-quest.vercel.app/schools/demo** |
| Git remote | `https://github.com/collo1978/investor-quest.git` |
| Deploy branch | `main` |
| PWA SW version | `src/lib/schools/schoolsDemoPwa.ts` → `SCHOOLS_DEMO_SW_VERSION` (bump when shipping Schools fixes) |

If the Vercel URL ever changes, update:

- `src/lib/schools/schoolsDemoPwa.ts` (`SCHOOLS_DEMO_PRODUCTION_ORIGIN`)
- `capacitor.config.ts`
- `docs/CAPACITOR.md`
- `README.md` (Live production section)
- iOS/Android `capacitor.config.json` allowlists

---

## 5. Architecture & data flow

### High-level mutation flow

```
UI (useGame().actions.*)
  → GameProvider.dispatch
  → applyAction → reducer.ts (pure)
  → new GameState + RewardEvent[]
  → ProgressionStore.save() (localStorage)
  → Toasts / FX (ToastHost, QuestCompletionFx, ConvictionQueueHost)
```

### Game state

| Concern | File(s) |
|---------|---------|
| Canonical state shape | `src/engine/progression/state.ts` (`GameState`, `STATE_VERSION = 13`, `STORAGE_KEY`) |
| All mutations | `src/engine/progression/reducer.ts` |
| React adapter | `src/components/GameProvider.tsx` |
| Load/save/migrate | `src/engine/progression/persistence.ts` |
| localStorage adapter | `src/engine/persistence/localStorageStore.ts` |
| Hydration gate | `src/lib/gameState/persistenceGate.ts` |
| Cross-tab merge | `src/lib/gameState/mergeLoadedGameState.ts` |

**Important:** `markQuestRead` tracks reading progress (no XP). `completeQuest` on quiz pass awards XP and marks quest complete.

### XP & levels

| Concern | File(s) |
|---------|---------|
| Engine XP constants | `src/engine/progression/xpEconomy.ts` — section quiz 50, perfect bonus 25, island 200, 10-K 300 |
| Level ladder | `src/data/progression/investorLadder.ts` |
| Level math | `src/engine/progression/xp.ts` |
| Schools micro-XP | `src/lib/schools/schoolsQuestRewardFlow.ts` — **10 XP/correct**, **75 quest-clear bonus** (UI layer; separate from engine constants) |
| XP UI | `src/components/LevelBar.tsx`, profile hero in `InvestorProfileDashboard.tsx` |

**Schools quest reward path:** Read cards → `QuestQuizPanel` → `SchoolsQuizPassResultsCelebration` (micro-XP recap) → Investor Quality Check → `SchoolsQuestQuizCompletionFlow` (quest XP + skill copy) → back to hub.

### Unlocks & pillars

| Concern | File(s) |
|---------|---------|
| Pillar metadata | `src/data/pillars/index.ts` |
| Unlock policy | `src/engine/progression/unlocks.ts`, `pillarUnlockPolicy.ts` |
| Business quest chain | Templates set `unlockRequirements` in `src/data/quests/templates/business.ts` |

Schools demo starts with Business pillar active; other islands are reachable via menu but less polished.

### Badges

| Concern | File(s) |
|---------|---------|
| Badge definitions | `src/engine/progression/badges.ts` |
| Detection on state change | `detectNewBadges()` called from reducer / `useInvestorProfileSnapshot` |
| Checklist badges | Awarded when investor framework milestones hit |

### Quiz completion

| Flow | File(s) |
|------|---------|
| Standard island quiz | `QuestQuizPanel.tsx` → `actions.completeQuest(pillarId, slug, { quizPerfect })` |
| Section checklist quiz (5 questions) | `BusinessChecklistSectionQuizFlow.tsx` → `buildDynamicQuizConfig()` → `QuestQuizPanel` → `markSectionQuizPassed()` in `businessInvestorFrameworkStorage.ts` |
| Dynamic format variety | `src/lib/quests/dynamicQuizEngine.ts`, `quizLayoutProfiles.ts` |
| Answer rendering | `src/components/QuizQuestionView.tsx` |

### Conviction / confidence

| Concern | File(s) |
|---------|---------|
| Post-island conviction queue | `src/components/conviction/ConvictionQueueHost.tsx` |
| Modal UI | `src/components/conviction/ConvictionFeedbackModal.tsx` |
| Storage | `src/lib/conviction/storage.ts` |
| Schools copy | `schoolsConvictionHeading()` etc. in `schoolsQuestRewardFlow.ts` |

After Business island completion in Schools playthrough, learner is routed through conviction → profile → XP ladder → final challenge.

### Profile updates

| Concern | File(s) |
|---------|---------|
| Live snapshot hook | `src/hooks/useInvestorProfileSnapshot.ts` |
| Resolver | `src/lib/profile/resolveInvestorProfileSnapshot.ts` |
| Types | `src/lib/profile/investorProfileTypes.ts` |
| Dashboard UI | `src/components/profile/InvestorProfileDashboard.tsx` |
| Schools wrapper | `src/app/schools/profile/SchoolsProfileHub.tsx` |

Profile reads **two sources:** engine `GameState` + Business framework localStorage (`iq-business-investor-framework:{companyId}`).

### Persistence summary

| Storage key / area | Contents |
|--------------------|----------|
| `investor-quest::state` (localStorage) | XP, completed quests, badges, pillar unlocks, active company |
| `iq-business-investor-framework:{companyId}` | Evidence ratings, section quiz passed flags, checklist progress |
| `sessionStorage` | Schools demo story flags, map brief dismiss, hub celebrate return, PWA hints |
| Supabase | Generated quest cards (when pipeline used) — not required for demo |

**Schools demo** persists quest chain progress (unlike bank `/demo` in-memory mode). Reset via `SchoolsDemoHubResetButton` → `resetSchoolsDemoProgress.ts`.

---

## 6. Content model

### Companies (playable)

**File:** `src/data/companies/index.ts`

Six companies with CIK, ticker, logo, tagline: `aapl`, `msft`, `tsla`, `nvda`, `nke`, `spot`.

Schools pick-company UI (`src/lib/schools/schoolsPickCompanyCatalog.ts`) shows **many more names** — most are **presentation-only** and not wired to `COMPANIES`.

### Quest cards & learning content

**Resolution priority** (`src/lib/quests/questCardContentSource.ts`):

1. **Curated override** — `src/data/quests/content/{apple,nvidia,nike}.ts` (hand-polished)
2. **Database generated** — Supabase `company_quest_card_answers`
3. **Template fallback** — `plainEnglishAnswer: null` in templates (shows shimmer / pipeline pending)
4. **Generating** — in-flight pipeline state

**Templates:** `src/data/quests/templates/business.ts` (7 quests), plus `financials.ts`, `forces.ts`, `management.ts`.

**Library binding:** `src/data/quests/library.ts` — merges template + company + overrides.

**Business quest slugs:** `what-they-do`, `why-buying`, `everyday-life`, `how-it-works`, `why-they-stay`, `competition`, `who-competes` (see `src/lib/business/businessSlugMigration.ts` for legacy aliases).

### Quiz questions

| Content | File |
|---------|------|
| Business per-quest quizzes | `src/data/quests/businessQuestQuizzes.ts` |
| Section checklist quizzes (5 MC each) | `src/lib/business/businessChecklistSectionQuizzes.ts` |
| Dynamic transforms | `src/lib/quests/dynamicQuizEngine.ts` |
| T/F eligibility rules | `src/lib/quests/quizTrueFalseEligibility.ts` |
| Order/ranking eligibility | `src/lib/quests/quizOrderEligibility.ts` |
| Token fill (`{Company.name}`) | `src/lib/quests/fillQuestTokens.ts` |
| Copy validation | `src/lib/quests/quizCopy.ts` |

### Business Island checklist content

| Content | File |
|---------|------|
| Section + principle definitions | `src/lib/business/businessInvestorFramework.ts` |
| Evidence card copy | `src/lib/business/businessInvestorEvidenceCards.ts` |
| Master principles ladder | `src/lib/business/masterInvestingPrinciples.ts` |
| Hub card models | `src/lib/business/buildBusinessHubCards.ts` |
| Quest marker positions | `src/lib/business/businessIslandQuestMarkerPositions.ts` |

### Map / island labels

| Content | File |
|---------|------|
| Schools Prodigy map layout | `src/lib/schools/schoolsProdigyMapConfig.ts` |
| Prodigy landmarks (SVG) | `src/components/schools/prodigyMap/ProdigyMapLandmarks.tsx` |
| Main game map hotspots | `src/lib/map/questMapDesktopConfig.ts` |
| Pillar screen images | `src/data/pillars/index.ts` + `src/lib/screenAssetUrls.ts` |

### How to add/edit content

**Edit a Business quiz question (section checkpoint):**
1. Open `src/lib/business/businessChecklistSectionQuizzes.ts`
2. Edit the `questions` array for the section id (e.g. `company-overview`)
3. Run `npx tsc --noEmit` — dev build also asserts layout variety via `assertUniqueQuizLayouts` in `dynamicQuizEngine.ts`

**Edit a per-quest island quiz:**
1. `src/data/quests/businessQuestQuizzes.ts` for the slug key
2. Or company override in `src/data/quests/content/nvidia.ts` etc.

**Edit quest reading cards:**
1. Template structure: `src/data/quests/templates/business.ts`
2. Company-specific copy: `src/data/quests/content/*.ts`
3. For AI generation: admin `/admin/quest-generation` (needs Supabase + OpenAI)

**Edit checklist sections/principles:**
1. `src/lib/business/businessInvestorFramework.ts` — section defs, principle defs, emoji, quest slug mapping

---

## 7. Routing & screens

### Schools presenter demo flow (polished — **priority**)

Story steps from `src/lib/schools/schoolsDemoStoryMode.ts`:

| Step | Route(s) | Status |
|------|----------|--------|
| `mission-brief-invitation` | `/schools/demo/mission-brief-invitation` | Polished — confidential invitation |
| `onboarding` | `/schools/screen5-onboarding`, `pick-interests`, `company-reveal`, `avatar` | Polished — multi-screen onboarding |
| `map-brief` / `map` | `/schools/map` | Polished — envelope brief + Prodigy SVG map |
| `business-island` | Map zoom (no separate page) | Polished — camera zoom into Business zone |
| `business-quest` | `/schools/business/[questSlug]` | Polished — reading + quiz + checklist |
| `conviction` | Modal overlay in playthrough | Polished |
| `profile` | `/schools/profile` | Polished (dashboard coded; some sub-routes stubbed) |
| `xp-ladder` | `/schools/xp-ladder` | Polished (re-exports main ladder) |
| `final-challenge` | `/schools/final-challenge` | Functional |
| `map-return` | `/schools/map` | Functional |

**Entry:** `/schools` → redirects to `/schools/demo` (`src/app/schools/page.tsx`).

### Schools side menu routes (`SCHOOLS_DEMO_MENU_ITEMS` in `schoolsDemoMenu.ts`)

| Route | Status |
|-------|--------|
| `/schools/map` | Polished (Prodigy) |
| `/schools/business` | Redirect → map hub zoom |
| `/schools/profile` | Polished |
| `/schools/pick-company` | Functional — catalog wider than playable companies |

### Business Island routes

| Route | File | Status |
|-------|------|--------|
| `/schools/business/[questSlug]` | Re-exports `src/app/business/[questSlug]/page.tsx` | **Primary Schools path** |
| `/business` | `BusinessPageClient.tsx` | Canonical hub (desktop sidebar app) |
| `/business/[questSlug]` | `BusinessQuestClient.tsx` → `QuestDetailScreen` / `BusinessIslandQuestReading` | Full quest experience |

### Quiz screens

Quizzes are **not separate routes** — they render inside:

- `BusinessIslandQuestReading.tsx` (pillar quests + section quizzes)
- `QuestDetailScreen.tsx` (generic quest page)
- `BusinessChecklistSectionQuizFlow.tsx` (5-question section checkpoints)

Runner: `QuestQuizPanel.tsx` phases: `locked → ready → playing → summary`.

### Profile

| Route | Status |
|-------|--------|
| `/schools/profile` | **Polished** — `InvestorProfileDashboard` variant `schools` |
| `/profile` | Same dashboard, default chrome |
| `/profile/achievements` | **Stub** — "opening soon" |
| `/profile/sector-strength` | **Stub** |
| `/profile/industry-strength` | **Stub** |

### Map routes (two different maps)

| Route | Map tech | Status |
|-------|----------|--------|
| `/schools/map` | **Prodigy SVG** (`SchoolsProdigyMapScreen`) | **Live Schools map** |
| `/map` | Raster `desktop-map.png` (`QuestMapScene`) | Main app map — separate from Schools demo |
| `/schools/preview/map-*` | Style experiments (Roblox, Duolingo, Khan, …) | **Experimental only** |

### Other islands (context only — **not priority**)

| Route | Status |
|-------|--------|
| `/schools/forces`, `/financials`, `/management` | Mirror main pillar pages; comment says "for now" |
| `/forces`, `/financials`, `/management` | Functional hubs with painted `.webp` scenery; **less Schools-specific polish** |

### Admin / ops (out of demo scope)

`/admin/quests`, `/admin/game-health`, `/admin/quest-generation`, `/dashboard/*` — internal tools.

### Mobile preview

`/mobile-preview`, `/bank/mobile-preview` — embed previews for partner demos.

---

## 8. Assets

**Central registry:** `src/lib/screenAssetUrls.ts` (hub images, cache-bust `paintRev` query params).

### Logos & brand

| Asset | Path | Used in |
|-------|------|---------|
| Main logo | `public/logos/investor-quest-logo.png` | App shell, profile, preload in `layout.tsx` |
| Schools opening logo | `public/logos/schools-opening-logo.png`, `new-school-logo.png` | Schools intro screens |
| Company marks | `public/logos/companies/{aapl,msft,tsla,nvda,nke,spot}.svg` | Pickers, hub, profile |
| Extra company SVGs | `dkng`, `pltr`, `dis`, etc. | Pick-company UI only — **not full game data** |

### Map art

| Asset | Path | Used in |
|-------|------|---------|
| Main app map | `public/logos/desktop-map.png` | `/map` (`QuestMapScene`) |
| Schools raster (legacy) | `public/logos/new-map.png` | `SchoolsQuestMapScreen` — **preview/legacy** |
| **Prodigy map** | *No raster — SVG in code* | `/schools/map` live |

### Island / hub scenery (AI-painted `.webp` — **flagged**)

| Asset | Path | Island |
|-------|------|--------|
| Business hub | `public/screens/biz-quest.webp` | `/business`, hub scenes |
| Financials | `public/screens/financial-quest.webp` | `/financials` |
| Forces | `public/screens/forces-quest.webp` | `/forces` |
| Management | `public/screens/management-quest.webp` | `/management` |
| Quest template backdrop | `public/screens/business-quest-template.webp` | Quest reading frame |

Referenced via `BUSINESS_HUB_IMG_SRC` etc. in `screenAssetUrls.ts`.

### Schools onboarding / identity (AI-painted — **flagged**)

| Asset | Path |
|-------|------|
| Armor picker BG | `public/logos/choose-your-investor-armor.png` |
| Onboarding screens | `public/logos/screen2-onboarding.png` … `screen5-onboarding.png`, `schools-sounds-like-you.png` |
| Identity photo | `public/images/schools/choose-identity.jpg` |
| Avatar portraits | `public/images/schools/avatars/*.png` (10 characters) |
| Mission brief art | `public/logos/schools-mission-brief.png`, `10k-mission-brief.png` |

Avatar metadata: `src/lib/schools/avatars.ts`.

### Profile visuals

Profile page is **coded UI** (`InvestorProfileDashboard.tsx`) — gradients, glass cards, live data. No single hero screenshot drives the page. Optional imagery: `public/images/schools/investing-mastery-hero.png` (may appear in ladder/marketing contexts).

### Schools PWA

| Asset | Path |
|-------|------|
| Manifest | `public/schools/demo/manifest.webmanifest` |
| Apple touch icon | `public/schools/demo/apple-touch-icon.png` |
| Service worker | `public/sw-schools-demo.js` (versioned via `SCHOOLS_DEMO_SW_VERSION`) |

### Sounds

`public/sounds/schools-typewriter-key*.wav` — mission brief typing FX.

### Referencing assets in code

- Prefer constants in `src/lib/screenAssetUrls.ts` for hub/map images
- Schools map config: `src/lib/schools/schoolsMapConfig.ts` (`SCHOOLS_MAP_IMAGE_SRC` for raster preview map)
- Next.js `Image` local patterns allow `/screens/**` and `/logos/**` (`next.config.ts`)

---

## 9. Current product state

### Works well (polish these further, don't rewrite)

| Area | Notes |
|------|-------|
| **Schools demo tour** | Scripted flow from invitation → onboarding → map brief → Business zoom |
| **Prodigy map** | SVG overworld, mission envelope, Business island entry animation |
| **Business Island hub** | Quest markers, principles panel, investor checklist, journey progress |
| **Quest reading** | `BusinessIslandQuestReading` — cards, evidence flow, quality rating, section quizzes |
| **Quiz variety** | 5 distinct layouts per section quiz via `dynamicQuizEngine` + `QuizQuestionView` |
| **Quiz UX** | Lock-in CTA, per-correct confetti, explanation callouts, Schools micro-XP |
| **Profile dashboard** | Live XP, level, company mastery, checklist rollup, quiz results — **coded components** |
| **XP/progression** | Reducer-backed; toasts and completion FX fire on quest pass |
| **Investor checklist** | Evidence cards, strong/weak ratings, section quiz gates, storage persistence |

### Still rough / inconsistent

| Area | Notes |
|------|-------|
| **Mobile vs desktop** | Business quest reading and quiz panels have mission-surface styles but spacing breaks on small phones need audit |
| **Onboarding length** | Many steps/screens before map — presenter flow is long; transitions could be tighter |
| **Map brief replay** | Session flags (`schoolsMapMissionBriefState.ts`) can confuse testers after refresh — reset button helps |
| **Pick-company catalog** | Shows companies without game data — misleading if user expects full quests |
| **globals.css size** | ~28k lines mixing Schools, Business, admin, legacy — hard to navigate |
| **ui/components explosion** | Many effect components imported selectively; dead weight in bundle needs audit |
| **Other three islands** | Painted hub + template quests; no Schools-specific checklist/investor framework |
| **Profile sub-pages** | Achievements / sector strength are stubs |
| **Explore lanes** | `/explore/ai-frontier`, `market-giants` marked not ready |

### Quiz formatting (recent work)

- Section quizzes transform all-MC source into 5 formats: MC, T/F, fill-blank, odd-one-out, order/scenario
- Layout profiles enforced in dev (`quizLayoutProfiles.ts`)
- **Needs verification:** All 200+ seeds across sections pass layout uniqueness after future content edits

---

## 10. Known issues / limitations / fragile parts

### Hard-coded / session fragile

- `SCHOOLS_DEMO_PRODUCTION_ORIGIN` — hard-coded Vercel URL
- Demo story step ↔ URL sync in `SchoolsDemoStoryOrchestrator.tsx` — refresh mid-flow can desync until flags reconcile
- `schoolsBusinessIslandZoomEnter.ts` — session flags for zoom/hub entered; easy to get stuck in hub phase without reset
- `BusinessIslandQuestReading.tsx` is **~1800 lines** — central god-component for quest flow
- Chunk load recovery via full page reload (`ClientAppRoot.tsx`) — masks deploy cache issues

### Duplication

- Three route trees: `/schools/*`, `/schools/demo/*`, `/schools/preview/*` (+ canonical `/business`, `/demo`)
- Map implementations: Prodigy SVG vs raster `SchoolsQuestMapScreen` vs main `QuestMapScene`
- XP constants split between `xpEconomy.ts` (engine) and `schoolsQuestRewardFlow.ts` (Schools UI)
- Dual persistence: engine state + `businessInvestorFrameworkStorage` — profile must read both

### Placeholder / incomplete

- Quest templates with `plainEnglishAnswer: null` — AI pipeline fill
- `schoolsPickCompanyCatalog.ts` companies without `COMPANIES` entries
- Profile achievements/sector routes — stubs
- Root `tmp-zone-*.jpg` — dev calibration artifacts (should not ship)
- Filename typos in assets: `choose-your-avitar-bg.png`, `eports.png` — suggests WIP

### Visually inconsistent

- Schools **mission cream/gold** surface (`PillarQuestTheme.cardChrome === "mission"`) vs dark sci-fi default island theme
- Business hub mixes **coded SVG scene** + **painted webp** background depending on layout branch
- Large generated `ui/*` components vs bespoke `iq-*` CSS — two design dialects

### Likely to break if touched carelessly

- `dynamicQuizEngine.ts` + `quizLayoutProfiles.ts` — dev throws on duplicate layouts
- `persistence.ts` migrations — `STATE_VERSION` bumps must stay backward compatible
- `schoolsDemoStoryMode.ts` route mapping — breaking pathname breaks presenter tour
- Hydration: no `Math.random()` on first paint rule (see `.cursor/rules/investor-quest-experience.mdc`) — quiz shuffles happen in click handlers / effects only

### Confusing for new developers

- `/schools/business` redirects to map — hub is **on the map**, not a separate island page
- `QuestDetailScreen` vs `BusinessIslandQuestReading` — Schools business uses the latter inside quest client
- "Investor Quality Check" vs "Investor Checklist" vs "Master Investing Principles" — three parallel progression UX layers on same quests

---

## 11. Recommended polish tasks

### Must polish first

- [ ] **Business Island hub UI** — marker clarity, checklist panel density, mobile tap targets (`SchoolsBusinessHubIslandLayout.tsx`, `BusinessIslandQuestMarkers.tsx`)
- [ ] **Quest card layout** — reading flow in `BusinessIslandQuestReading.tsx` + `BusinessQuestTemplateFrame.tsx`; reduce scroll fatigue on mobile
- [ ] **Quiz format variety** — verify all section quizzes show 5 distinct layouts; polish mission-surface styles in `QuizQuestionView.tsx` + `globals.css` (`iq-quiz-*`)
- [ ] **Profile page** — dashboard is coded; replace any remaining static marketing images; tighten Schools variant spacing (`InvestorProfileDashboard.tsx`, `SchoolsProfileHub.tsx`)
- [ ] **XP updates after quiz** — confirm micro-XP + quest XP + section quiz XP all surface in profile immediately (`useInvestorProfileSnapshot`, reducer events, toast timing)
- [ ] **Map flow / mission brief** — envelope sequence clarity, replay rules after reset, Business zoom guide label (`SchoolsMapPageClient.tsx`, `MissionEnvelopeBriefSequence.tsx`)
- [ ] **Desktop + mobile responsiveness** — audit `BusinessIslandQuestReading`, `QuestQuizPanel`, map HUD, profile grid at 320px–1440px
- [ ] **Onboarding / intro** — shorten or skip paths for returning users; smoother transitions between story steps
- [ ] **Reset/demo reliability** — `SchoolsDemoHubResetButton` + `resetSchoolsDemoProgress.ts` should always yield predictable fresh tour
- [ ] **globals.css hygiene** — group Schools/Business quiz styles; document key `iq-*` classes used in demo

### Nice to have later

- [ ] **Forces / Risks Island** — Schools-specific polish, checklist framework parity with Business
- [ ] **Financials Island** — same
- [ ] **Management Island** — same
- [ ] **Advanced investing checklist** — extend framework beyond Business sections
- [ ] **More companies** — wire pick-catalog entries to `COMPANIES` + content overrides
- [ ] **Backend / admin** — Supabase auth, remote progression store, quest generation at scale
- [ ] **Preview map lab** — promote one alternate map style or delete unused preview routes
- [ ] **Bundle cleanup** — tree-shake unused `src/components/ui/*` effects
- [ ] **Capacitor** — TestFlight / Play Store packaging for Schools PWA wrapper

---

## 12. Developer notes

### Conventions worth following

- **Game mutations** only through `useGame().actions` — never mutate `GameState` in components
- **Schools presenter URLs** use `/schools/demo/*` — `schoolsDemoHref.ts` resolves learner vs demo paths
- **Port 3003 only** for dev — see `.cursor/rules/dev-server-port.mdc`
- **Pointer events** on decorative map/FX layers must be `none` — interactive nodes above (see experience rules)
- **Commits** — user prefers explicit ask before git commit; deploy is via `main` push

### Testing the core loop quickly

1. `npm run dev`
2. Sidebar → **Schools Live Demo**
3. Complete onboarding → map brief → tap Business island
4. Open `what-they-do` quest → read cards → take quiz → quality check
5. Open checklist section quiz (after evidence) — confirm 5 different quiz layouts
6. Visit `/schools/profile` — confirm XP/checklist updated
7. Use hub reset button if state feels stuck

### Typecheck before PR

```bash
npx tsc --noEmit
npm run lint
```

### Needs verification

- Full `.env.local` variable list for your machine (file is gitignored)
- Which Supabase migrations are applied in production Vercel env
- Exact Vercel project dashboard URL / team access for new developer
- Whether `OPENAI_API_KEY` is set in production (only needed for live quest generation, not static demo)
- Performance budget on low-end mobile for `globals.css` size and Framer Motion on map zoom

### Related docs in repo

| Doc | Topic |
|-----|-------|
| `README.md` | Local dev quick start + live URLs |
| `src/ARCHITECTURE.md` | Engine layer design |
| `docs/CAPACITOR.md` | Mobile wrapper + production URL |
| `.cursor/rules/investor-quest-experience.mdc` | Product feel, animation, interaction rules |
| `.cursor/rules/dev-server-port.mdc` | Port 3003, game health, fast quest dev |

---

*Generated for developer handoff — focus: Schools demo + Business Island. Last aligned to `main` branch post quiz-layout variety + investor checklist work.*

**PDF export:** Run `npm run generate:handoff-pdf` to regenerate `HANDOFF.pdf` from this file (cover page, table of contents, syntax-highlighted code, page numbers).
