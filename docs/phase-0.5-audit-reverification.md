# Investor Quest — Phase 0.5 Audit & Risk Review (Re-Verification)

Prepared as a full re-verification of the Phase 0 Audit & Risk Review against the current
state of the repository. Read-only — no code changed as part of producing this document.
Scope: same as Phase 0 (Schools + Business Island demo slice, entry `/schools/demo`,
laptop/desktop-first), re-checked after two things landed on top of the Phase 0 baseline:

1. **The `liam-biz-redesign` branch** — a ~92-file, +26,981/-8,396-line rework of Business
   Island (HQ decode + evidence-file mission flow), currently checked out. `main` has not
   moved since this branch's base commit, so there is no merge-base drift.
2. **An uncommitted, partial security fix** for S1/S2/S4 — sitting as untracked working-tree
   files (`docs/security-fix-s1-open-rls.md`, `docs/security-fix-s2-admin-auth.md`,
   `src/lib/admin/adminSession.ts`, `src/lib/supabase/serviceClient.ts`,
   `src/app/admin-login/`, `src/app/api/admin/{login,logout}/`,
   `supabase/migrations/20260715120000_tighten_anon_rls.sql`), **plus a git stash
   (`stash@{0}`) containing the `middleware.ts` wiring that would actually activate the
   admin gate — not committed anywhere, and the stash is not applied.**

All 42 original findings were re-checked against current file contents (file:line evidence),
not against the fix documentation's claims about itself.

## Executive Summary

**One item is confirmed resolved** (R1 — the checklist-rail overlap), apparently as a side
effect of the Business Island CSS being rebuilt as a real grid rather than a targeted fix.
**Nothing else closed.** Of the remaining 41: most are unchanged, several are measurably
**worse** than at Phase 0, and two crossed a line from "risk" to "confirmed active defect":

- **New Critical: the in-progress S1 fix is a deploy-time landmine.** The untracked RLS
  migration correctly locks down all 26 previously-open tables — but the server-side
  repository code that's supposed to use the new service-role client
  (`src/lib/supabase/serviceClient.ts`) has **zero call sites anywhere in `src/`**. Every
  repository still reads/writes through the anon-key client. If this migration is applied to
  a live database before the repositories are switched over, RLS will deny every server-side
  read/write to those tables — the app breaks, not just stays insecure.
- **S2/S4 fixes exist but are inert.** The admin-auth library code is sound (HMAC-signed,
  timing-safe, expiring tokens), but the `middleware.ts` changes that actually wire the gate
  in are sitting in an unapplied git stash. Right now, on disk, `/admin/**` and
  `/api/admin/**` have exactly the same zero authentication as at Phase 0.
- **IC1 (checklist evidence mapping) went from "fragile" to "actively wrong."** The NVIDIA
  `what-they-do` quest now has 3 content cards but the hand-maintained checklist map only
  covers 2 — card-3 silently produces zero evidence today, on the live content, not a
  hypothetical.
- **P1 (hardcoded presenter identity) got more entrenched, not less.** The `"pioneer"`
  hardcode was copied into a second screen (`SchoolsMissionBriefInvitationScreen.tsx`)
  during the redesign, rather than being fixed. There are now two bypass sites instead of one.
- **B2 and B5 (URL string-matching, untyped global events) both grew substantially** in
  surface area — `schoolsRewardFlow` now branches 20 places (up from ~1 cited originally);
  the two global CustomEvents now have 5 and 9 listener sites respectively, still plain
  `Event` objects with no typed payload or coordinator.
- **`globals.css` grew, not shrank** — 22,444 → 31,383 lines, `!important` count 282 → 309,
  and the two duplicate selectors flagged at Phase 0 are still duplicated. This directly
  contradicts the R4 recommendation to schedule a de-duplication pass before more feature
  work landed on top.
- **R2 (visual-language clash) relocated rather than resolved.** The redesign's new
  dark/green "NVIDIA" theme for the Master Principles Ladder sheet renders the *same* old
  cream-colored panel component nested inside its own dark chrome (`variant="schools"` still
  maps to the cream class) — the two languages now collide inside one component's DOM tree
  instead of merely sitting beside each other in the same layout.

**Positive findings:** the redesign's new components correctly use the schools-aware href
helper (`resolveSchoolsLearnerHref`) everywhere checked — no new instances of the C2/C3
hardcoded-back-link pattern were introduced. `who-competes` (IC2) is now at least explicitly
excluded from the hub-card map with a unit test documenting it, rather than silently falling
through unacknowledged. Line numbers throughout this document are current as of this
re-verification — the originals are stale by 8,000+ lines in `globals.css` alone.

---

## Prioritized Issue List — Status Delta

| # | Title | Area | Severity | Status |
|---|---|---|---|---|
| S1 | Open RLS — anon key read/write | Security | Critical | **Partially resolved — new deploy-time risk** |
| S2 | /admin, /api/admin no auth | Security | Critical | **Still present — fix built, not wired in** |
| P1 | Presenter demo hardcodes identity | Content | Critical | **Still present — worsened (2nd hardcode site)** |
| S3 | Unauthenticated AI-generation endpoints | Security | High | Still present |
| S4 | /schools/preview exposes design gallery | Security | High | **Still present — fix built, not wired in** |
| R1 | Checklist rail overlaps quest content | Mobile | High | **Resolved** |
| R2 | Two visual languages collide | Consistency | High | **Partially resolved — relocated, more visible** |
| B1 | QuestReading.tsx secretly powers 4 islands | Stability | High | Still present (confirmed architecture) |
| B2 | Reward/nav logic branches on URL string | Stability | High | **Worsened (20 branch sites, was ~1)** |
| B3 | 13 state / 8 effects, 5 persistence layers | Stability | High | **Worsened (19 effects, was ~8)** |
| B4 | Dev reset button orphans Checklist state | Stability | High | Still present |
| C1 | Schools Financials/Forces/Mgmt exit URL space | Consistency | High | Still present |
| P2 | No name-capture step | Content | High | Still present |
| P3 | Onboarding choices never surfaced on profile | Content | High | Still present |
| P4 | No reset/replay for onboarding & identity | Content | High | Still present |
| IC1 | Evidence→checklist mapping unvalidated | Checklist | High | **Worsened — now a live data-loss bug** |
| IC2 | Two parallel checklist/rating systems | Checklist | High | Still present (fork now documented) |
| S5 | Game-health cron fails open | Security | Medium | Still present |
| S6 | /api/onboarding/interests trusts client userId | Security | Medium | Still present |
| S7 | API error handlers leak raw error text | Security | Medium/Low | Still present |
| R3 | Schools decks: 100dvh + overflow:hidden | Mobile | Medium | Still present |
| R4 | globals.css itself is a regression multiplier | Mobile | Medium | **Worsened (31,383 lines, 309 !important)** |
| R5 | Production safe-area CSS inert | Mobile | Low/Medium | Still present |
| B5 | Cross-component sync via global window events | Stability | Medium | **Worsened (5 + 9 listener sites)** |
| C2 | Management back-link hardcoded to /map | Consistency | Medium | Still present |
| C3 | ForcesQuestMap back-button hardcoded /map | Consistency | Medium | Still present |
| C4 | Orphaned "Company Mastery" checklist panel | Consistency | Medium | Still present |
| IC3 | Demo reset clears 1 of 17 principles | Checklist | Medium | Still present |
| IC4 | Checklist storage has no versioning/backup | Checklist | Medium | Still present |
| P5 | "Stocks experience" answers never used | Content | Medium | Still present |
| P6 | Orphaned parallel avatar system (10 characters) | Content | Medium | Still present |
| S8 | Demo state fully client-trusted (by design) | Security | Low | Unchanged, informational |
| S9 | Demo Controls default-enabled outside funnel | Security | Low | Still present |
| R6 | Production Map uses raw 100vh/100vw | Mobile | Low | Still present |
| R7 | Prototype "preview" map variants inflate CSS | Consistency | Low | Still present (1 of 7 now partly production-used) |
| B6 | Unmark-as-read doesn't retract ratings | Stability | Low | Still present (expected) |
| IC5 | No multi-tab staleness protection | Checklist | Low | Still present |
| IC6 | Rating-submitted flag in sessionStorage | Checklist | Low | Still present |
| C5 | /schools/onboarding orphaned redirect shim | Consistency | Low | Still present |
| C6 | Unreferenced alias routes | Consistency | Low | Still present |
| C7 | Hidden ?dev=1 debug panel on /business | Content | Low | **Still present — stash fix wouldn't cover it** |
| P7 | "Goal" field vestigial | Content | Low | Still present |

---

## A. Security

### S1 — Open RLS: PARTIALLY RESOLVED, new deploy-time risk introduced
`supabase/migrations/20260715120000_tighten_anon_rls.sql` (untracked) drops every
permissive anon/authenticated policy across all 26 previously-open tables and replaces them
with narrow, correctly-scoped policies — the SQL itself is sound. But the migration's own
comment asserts "server-side repositories now use the service-role client
(`src/lib/supabase/serviceClient.ts`)" — that is **false on disk right now**:
`createSupabaseServiceRoleClient` has zero call sites in `src/`. Every repository
(`src/lib/gameHealth/*.ts`, SEC, quest-content, etc.) still calls
`createSupabaseServerClient()` (`src/lib/supabase/server.ts:8`), which is anon-keyed. Applying
this migration to production before rewiring those repositories means every server-side
read/write to the now-locked tables starts failing outright (RLS default-deny with no
matching policy). **Do not apply the migration until the repository layer is switched over
in the same deploy.**

### S2 — /admin, /api/admin no auth: STILL PRESENT, fix built but not wired in
Current `src/middleware.ts` (39 lines, on disk) has no `/admin` or `/api/admin` handling at
all. The library code is genuinely solid: `src/lib/admin/adminSession.ts` issues HMAC-SHA256
signed tokens with a 12-hour expiry and timing-safe comparison; `src/app/api/admin/login` and
`/logout` routes exist and use it correctly. But the actual gate — `isAdminGatedPath()` +
cookie check in `middleware.ts` — exists only inside `git stash@{0}`, unapplied. Of 35 files
under `src/app/api/admin/**`, only `login`/`logout` reference the new auth module; the other
33 have no inline check and depend entirely on the (currently absent) middleware gate.
**Anyone navigating to `/admin` today gets the full console, exactly as at Phase 0.**

### S3 — Unauthenticated AI-generation endpoints: STILL PRESENT
`business/generate`, `sec/extract`, `admin/quest-generation/regenerate`,
`admin/demo-content-refresh` all confirmed still open, no auth/rate-limit. Note: even if the
stash were applied, it only gates `/api/admin/**` — `business/generate` and `sec/extract`
sit outside that prefix and would remain unauthenticated regardless.

### S4 — /schools/preview/[screen] exposed publicly: STILL PRESENT, fix built but not wired in
`src/app/schools/preview/[screen]/page.tsx` still has no gate. The stash adds a
production-only 404 using the (already-existing, tracked) `isSchoolsPreviewPath` helper —
same unapplied-stash situation as S2.

### S5 — Game-health cron fails open: STILL PRESENT
`src/app/api/admin/game-health/cron/route.ts:15-20` — the `if (secret)` guard still skips
auth entirely when the env var is unset.

### S6 — Client-supplied userId trusted: STILL PRESENT
`src/app/api/onboarding/interests/route.ts` still takes `userId`/`guestId` from the request
body with no session check.

### S7 — Raw error text forwarded to client: STILL PRESENT
Confirmed unchanged in `business/generate`, `sec/company`, and `admin/quest-content` routes.

### S8 — Client-trusted demo state: unchanged, informational, no action needed.

### S9 — Demo Controls default-enabled: STILL PRESENT, unchanged.

**New findings not in the original 42:**
- `serviceClient.ts` / `serviceEnv.ts` are well-built (`import "server-only"`, no
  `NEXT_PUBLIC_` prefix, no client-side importers found) — no leak risk, they're simply
  unused, which is the S1 landmine above.
- Three of the fix documents (S1, S2, S4) describe a fixed state that does not match the
  working tree — the S1 migration assumes rewiring that hasn't happened, and S2/S4 assume a
  stash that isn't applied. Anyone reading only the fix docs would believe these are closed.

---

## B. Mobile / Responsiveness

### R1 — Checklist rail overlap: RESOLVED
`.iq-quest-checklist-layout__panel` (globals.css:24331) still exists as a CSS rule but is
dead — no `.tsx` file renders that class anymore. The live layout, `BusinessQuestChecklistLayout.tsx`,
now branches into two real grid layouts (`--section-mission` variant at globals.css:23933,
or the base variant's `@media (min-width:1024px)` grid at :24069-24111), both using
`position: sticky` sidebars sized as actual grid tracks — not `position: fixed` overlays.
Neither path can reproduce the original 53px overlap. Recommend a live-viewport spot-check
at 1024px as final confirmation, but the CSS mechanism the bug depended on is gone.

### R2 — Visual-language clash: PARTIALLY RESOLVED — relocated, arguably worse
Cream/gold hexes (`#fffbeb`, `#fde68a`, etc.) still appear 67 times in `globals.css`. Quiz
choices (globals.css:1494) and the quest-complete card (globals.css:4270, gradient band
:3826-3836) are still cream. The old standalone cream ladder panel
(`.iq-master-principles-panel--schools`, globals.css:3801) still exists. The redesign's new
dark-charcoal/green sheet (`MasterInvestingPrinciplesLadderSheet.tsx`) was meant to replace
it, but that component renders `<BusinessChecklistPanel variant="schools" .../>` — and
`variant="schools"` still maps to the same cream CSS class, only overridden for
flex/height/overflow, not color. **The cream panel is now nested directly inside the dark/green
sheet's chrome** — the clash moved from "adjacent in the same layout" to "nested inside the
same component," which is a tighter, more visible juxtaposition, not a fix.

### R3 — Deck screens 100dvh + overflow:hidden, no scroll fallback: STILL PRESENT
Confirmed unchanged at `.iq-schools-business-hub-main` (globals.css:4787),
`.iq-schools-profile-hub-main` (:4907), `.iq-schools-choose-identity` (:6804), and the
armor-guide/company-mastery/final-challenge decks (:6326-6362) — all still `overflow:hidden`
with no scrolling child.

### R4 — globals.css regression-risk multiplier: WORSENED
31,383 lines (was 22,444), `!important` count now **309** (was 282). Both previously-flagged
duplicate selectors are still duplicated: `.iq-mbo-wax-seal` (globals.css:8286 and :8468),
`.iq-prodigy-map__progress-fill` (:17601 and :18768). The R4 recommendation to schedule a
de-duplication pass before further feature work landed was not followed — nearly 9,000 more
lines landed on top instead.

### R5 — Safe-area viewport-fit inert outside /schools/demo: STILL PRESENT
Root `src/app/layout.tsx` viewport export (lines 26-30) still has no `viewportFit`. Only
`src/app/schools/demo/layout.tsx:53` sets it.

### R6 — Raw 100vh/100vw in production map stage: STILL PRESENT
`.schools-preview-map-stage-height` (globals.css:161-167) unchanged, still `vh`/`vw`.

### R7 — Prototype preview map clones inflate stylesheet: STILL PRESENT, one nuance
All 7 variants (Duolingo, cartoon, Prodigy, DragonBox, Roblox, Khan, Legends) still exist,
spanning roughly 4,000+ lines. Six are still comparison-only. The **Prodigy variant has
partially graduated into production** — the new `SchoolsBusinessHubIslandLayout.tsx` and
`SchoolsBusinessHubCodedScene.tsx` now consume `.iq-prodigy-map__*` classes for the real
Business Hub — so that one clone is no longer purely throwaway, complicating a clean deletion
of "all 7" as originally recommended.

---

## C. Visual Consistency

### C1 — Schools Financials/Forces/Management exit /schools/ URL space: STILL PRESENT
`buildFinancialsHubCards.ts:41`, `forcesHubCategories.ts:44`, `buildManagementHubCards.ts:39`
all still hardcode root paths; none call `resolveSchoolsLearnerHref`. No nested
`/schools/financials/[section]` etc. route trees exist. Business Island remains the
exception — correctly schools-aware via `resolveSchoolsLearnerHref` throughout, including in
the new redesign code.

### C2 — Management "Coming Soon" hardcoded back-link: STILL PRESENT
`ManagementPageClient.tsx:53` — `backHref="/map"`, unchanged.

### C3 — ForcesQuestMap back-button hardcoded: STILL PRESENT
`ForcesQuestMap.tsx:135` — unchanged.

### C4 — Orphaned "Company Mastery" checklist panel: STILL PRESENT
`SchoolsCompanyMasteryPanel.tsx` still exists, still unimported anywhere.

### C5 — /schools/onboarding orphaned shim: STILL PRESENT, unchanged.

### C6 — Unreferenced onboarding-screen-4/5 aliases: STILL PRESENT, unchanged.

### C7 — Hidden ?dev=1 panel on /business: STILL PRESENT — stash wouldn't fix this either
`src/app/business/page.tsx:13,16` still gates the dev panel purely on `?dev=1`, no
`NODE_ENV` check. Confirmed the unapplied security-fix stash only touches `/admin*` and
`/schools/preview/**` in middleware — it has no logic referencing `/business` or the `dev`
param, so even popping the stash would leave this open.

**New finding (positive):** searched the entire new Business Island redesign codebase
(`src/components/business/**`) for the C2/C3 hardcoded-link pattern — no matches. New
components (e.g. `BusinessQuestMapDesktop.tsx:66`) correctly route through
`resolveSchoolsLearnerHref`. The redesign did not introduce new instances of this bug class.

---

## D. Stability — Business Island

### B1 — QuestReading.tsx secretly powers 4 islands: STILL PRESENT (confirmed architecture)
`pillarQuestTheme.ts:127-132` still lists `["business","forces","financials","management"]`;
`QuestDetailScreen.tsx:760-766` still renders `BusinessIslandQuestReading` for all of them.
The file grew from 1,803 → 2,070 lines during a "Business Island" redesign that, by name,
implies it shouldn't have touched the other three islands' shared engine — but did.

### B2 — Reward/nav logic branches on URL string: WORSENED
`schoolsRewardFlow` now gates **20 distinct sites** in the file (lines 816, 828, 934, 950,
988, 997, 1343, 1346, 1545, 1550, 1707, 1736, 1766, 1769, 1808, 1813, 1814, 1818, 1829, 1849,
1852, 1859, 1878) — nav targets, chapter-nav visibility, quiz-pass handlers, XP/finale CTA
suppression, CSS class selection. The underlying helper (`isSchoolsBusinessQuestPath`,
`schoolsDemoHref.ts:124`) is still pure prefix-string matching. No explicit mode was
introduced despite the surface area roughly doubling.

### B3 — 13 state vars / 8 effects: WORSENED on the effects axis
Current file: **11 `useState`, 19 `useEffect`** — state count roughly flat, effect count more
than doubled. The +267 lines added by this branch went disproportionately into more
interdependent synchronization logic.

### B4 — Dev reset orphans Checklist state: STILL PRESENT
`BusinessIslandDevReset.tsx:48` still only calls `clearPillarProgress("business")`.
`resetSchoolsDemoProgress.ts:92-99` separately clears 8 different checklist/evidence/story
functions. Still three non-identical reset paths.

### B5 — Untyped global CustomEvents, no coordinator: WORSENED
`BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT` now has **5 listener sites**;
`SCHOOLS_DEMO_RESET_EVENT` now has **9**. Both still plain `new Event(...)`, not even a typed
`CustomEvent`. Listener fan-out grew well past the "3+ files" originally cited, and no
central coordinator was introduced despite the growth.

### B6 — Unmark-as-read doesn't retract ratings: STILL PRESENT (expected, low severity, unchanged).

---

## E. Investor Checklist — Preserve & Harden

### IC1 — Evidence-to-checklist mapping unvalidated: WORSENED — now a live bug
`investorQualityChecklist.ts:116-160` is unchanged in structure (still a hand-maintained
string table, no validation anywhere in the codebase). But content drifted under it: NVIDIA's
`what-they-do` quest (`src/data/quests/content/nvidia.ts:37-73`) now has **3** cards, while
the map (`investorQualityChecklist.ts:120-123`) only covers card-1 and card-2. **Card-3
currently produces zero checklist evidence when read — this is happening today, not a
hypothetical risk.** All other quests spot-checked have matching card counts.

### IC2 — Two parallel checklist systems: STILL PRESENT, fork now partially documented
`who-competes` still falls through to the legacy quiz+rating system — it's absent from
`BUSINESS_INVESTOR_CHECKLIST_SECTIONS` (`businessInvestorFramework.ts:73-118`). New: it's now
explicitly excluded from the hub-card map with a comment ("who-competes stays off the island
map") and a unit test asserting this (`buildBusinessHubCards.test.ts:46`) — so the fork is at
least intentional and documented for the hub-card path now, though it's still inconsistently
referenced elsewhere (`investorQualityChecklist.ts:153-159`, `masterInvestingPrinciples.ts:45`).

### IC3 — Demo reset clears 1 of N principles: STILL PRESENT
`resetSchoolsDemoProgress.ts:97` still hardcodes clearing a single principle
(`"business-purpose"`). The principle count is now **17** (`businessInvestorFramework.ts:30-47`),
so 16 principles' evidence-phase state is left stale on reset.

### IC4 — No schema versioning/migration/backup: STILL PRESENT, unchanged.

### IC5 — No multi-tab staleness protection: STILL PRESENT, unchanged.

### IC6 — Rating-submitted flag in sessionStorage: STILL PRESENT, unchanged, still affects
`who-competes` specifically per IC2.

---

## F. Content / Unfinished — Profile Creation Flow

### P1 — Presenter demo hardcodes identity: STILL PRESENT, worsened
`SchoolsLogoRevealScreen.tsx:657-661` still hardcodes `"pioneer"`. **New:** an identical
hardcode now also exists in `SchoolsMissionBriefInvitationScreen.tsx:317-321`, added during
this branch. `SCHOOLS_DEMO_STORY_STEPS` still has no avatar/identity step. The real 4-armor
picker is reachable only via a route explicitly commented as a legacy path the funnel skips.
The bypass pattern was copied to a second entry point rather than fixed at the one that
existed at Phase 0 — a fix now needs to touch two sites instead of one.

### P2 — No name-capture step: STILL PRESENT, unchanged. No text input exists anywhere in
Schools onboarding components.

### P3 — Onboarding choices never surfaced on profile dashboard: STILL PRESENT, unchanged.
`resolveInvestorProfileSnapshot.ts` and `investorProfileTypes.ts` still have zero
armor/interest/stocksExperience fields.

### P4 — No reset/replay for onboarding & identity: STILL PRESENT, unchanged.
`buildSchoolsDemoPresenterResetState()` still hardcodes onboarding as pre-completed and
routes to `/schools/map`, never clearing identity/avatar/interests/stocks storage.

### P5 — "Stocks experience" answers unused downstream: STILL PRESENT, unchanged. Single
read site is the same screen that wrote it.

### P6 — Orphaned parallel avatar system: STILL PRESENT, unchanged. `avatars.ts` and its
UI components are still fully built and still unreachable from any live demo route — only
reachable via the same legacy `/schools/welcome` path noted in P1.

### P7 — "Goal" field vestigial: STILL PRESENT, unchanged. Both hardcode sites (P1) also
set `goal: state.goal ?? "Build investing mastery"` as a fallback; no picker UI anywhere.

---

## Top Recommendation

The redesign branch did not touch security, onboarding, or the checklist plumbing at all —
those areas are exactly where Phase 0 left them, with two exceptions that got worse on their
own (IC1's live data gap, P1's duplicated bypass). The one thing that materially changed for
the better (R1) appears to be an incidental side effect of a CSS rewrite, not a targeted fix.

**Before merging `liam-biz-redesign` or shipping any of it:**

1. **Do not apply the S1 RLS migration on its own.** It must land in the same deploy as
   rewiring the repository layer onto `serviceClient.ts` — applied alone, it breaks the app
   rather than securing it.
2. **Pop and reconcile the security-fix stash.** S2 and S4's library code is solid but inert
   without it; right now `/admin` is exactly as open as it was at Phase 0 despite the
   supporting files existing on disk.
3. **Fix IC1's NVIDIA card-3 gap directly** — it's a live, present-tense bug, not a
   preserve-and-harden item anymore.
4. **Re-scope R2** as three visual languages to reconcile, not two — the new dark/green
   ladder sheet didn't replace the cream panel, it wrapped it.
5. **R4 (globals.css size) needs to be addressed before, not after, the next feature branch**
   — it grew by ~9,000 lines while unaddressed once already.
