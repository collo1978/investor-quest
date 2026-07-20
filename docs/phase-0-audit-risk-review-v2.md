# Investor Quest — Phase 0 Audit & Risk Review (v2 — Merged Codebase)

Re-audit of the original Phase 0 Audit & Risk Review against the current state of
`main` after PR #2 (`liam-biz-redesign` → `main`, merge commit `530f9694`,
merged 2026-07-20). Read-only audit — no code changed in producing this document.
Same scope as Phase 0: Schools + Business Island demo slice (entry `/schools/demo`),
laptop/desktop-first priority.

This supersedes both the original Phase 0 report and the interim
[`phase-0.5-audit-reverification.md`](./phase-0.5-audit-reverification.md) (written
against the pre-merge branch tip, one commit before this report's baseline). All 42
original findings were re-checked directly against current file contents
(file:line evidence), not against either prior document's claims about itself.

> ## Status update — security fixes shipped in code (2026-07-21)
>
> Everything below this line was written before the fixes landed and is kept as
> the historical record of what was found. Since then, **9 of the 10 security
> items called out in this document have been fixed in code** across 6 commits
> on `main` (not yet deployed — see blocker below):
>
> | Commit | Fixes |
> |---|---|
> | `99505a1` | S2, S4, C7 (admin/preview gating), plus the S1 prerequisite — all 18 repositories moved to the service-role client |
> | `ecbeecf` | S5 — cron now fails closed if its secret is unset |
> | `87dd09b` | S9 — Demo Controls off by default in production |
> | `5ccb40b` | S6 — dropped the unverifiable client-supplied `userId` |
> | `3d231a0` | S7 — generic client-facing error messages, full detail logged server-side |
> | `9f01097` | S3 — `*/generate` and `/api/sec/*` scoped to the demo ticker + per-IP rate-limited |
>
> **S1 is code-complete but deliberately not fully closed yet** — the RLS-tightening
> migration (`supabase/migrations/20260715120000_tighten_anon_rls.sql`) is still
> unapplied to the live database on purpose: applying it before `SUPABASE_SERVICE_ROLE_KEY`
> exists in production would break every read/write these repositories now perform.
> **Deploy blocker:** these commits must not reach `main`'s remote / trigger a Vercel
> deploy until `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_CONSOLE_PASSWORD`, and
> `ADMIN_SESSION_SECRET` are set in Vercel. Full sequence in
> [`security-fix-checklist.md`](./security-fix-checklist.md).
>
> This also resolves the NEW-1 finding below (the "deploy-time landmine") for the
> parts that are now actually committed — NEW-1's core warning (don't apply the
> migration alone) still stands as the operative instruction for the deploy step.
> `S8` (informational, no action needed) is the only item in this document's
> Security section with nothing to fix.

## Executive Summary

The merge landed cleanly from a routing/duplication standpoint — no new merge
conflicts, no stale route trees, `main` had not moved since the branch's base commit
so this is effectively the branch's own content now living on `main`. But **the
codebase's actual risk posture is now measurably worse in more places than it is
better**, and the one credible security remediation effort that was underway is
sitting in a state that is more dangerous than either "fixed" or "unfixed":

- **One issue is genuinely resolved: R1** (the 1024–1205px checklist-rail overlap).
  The Business Island CSS was rebuilt around real grid tracks; the `position: fixed`
  mechanism the bug depended on no longer exists anywhere in the panel's CSS.
- **One issue is genuinely resolved: IC1** (the NVIDIA `what-they-do` card-3
  evidence gap). Commit `326197e`, now on `main`, added the missing `"card-3":
  ["business-understanding"]` map entry directly — a real, targeted fix, not a
  side effect.
- **New Critical, not on the original list: a half-finished security fix is a
  deploy-time landmine.** Untracked working-tree files
  (`docs/security-fix-s1-open-rls.md`, `docs/security-fix-s2-admin-auth.md`,
  `src/lib/admin/adminSession.ts`, `src/lib/supabase/serviceClient.ts`,
  `src/app/admin-login/`, `src/app/api/admin/{login,logout}/`,
  `supabase/migrations/20260715120000_tighten_anon_rls.sql`) plus **one unapplied
  git stash** (`stash@{0}`, containing the `middleware.ts` wiring for both the
  admin gate and the `/schools/preview` production block) describe and partially
  implement fixes for S1, S2, and S4 — but **none of it is committed, and none of
  it is active on disk right now**:
  - The RLS-tightening migration is real SQL sitting in an untracked file, unapplied
    to any database.
  - The service-role client it depends on (`createSupabaseServiceRoleClient`) has
    **zero call sites anywhere in `src/`** — every repository still reads/writes
    through the anon-key client. **If this migration is ever applied to a live
    database before the repositories are rewired, RLS will default-deny every
    server-side read/write to the newly-locked tables — the app breaks outright,
    it doesn't just stay insecure.**
  - The admin-auth library code (`adminSession.ts`) is sound — HMAC-signed,
    timing-safe, expiring tokens — but the actual gate (`isAdminGatedPath()` +
    cookie check) that would wire it into `middleware.ts` exists only inside the
    unapplied stash. **`main`'s actual `src/middleware.ts` has no `/admin` or
    `/schools/preview` handling at all.** `/admin` is exactly as open today as at
    Phase 0.
  - Two of the three fix-documentation files (`security-fix-s1-open-rls.md`,
    describing 18 "changed" repository files) **assert changes that do not exist
    in the working tree** — `git status` shows none of those 18 files as modified.
    Anyone who reads only the docs would reasonably believe S1/S2/S4 are closed.
    They are not.
- **P1 (hardcoded presenter identity) got more entrenched.** The `"pioneer"`
  hardcode that existed at Phase 0 (`SchoolsLogoRevealScreen.tsx`) was copied
  verbatim into a second screen added during the redesign
  (`SchoolsMissionBriefInvitationScreen.tsx`). A fix now has to touch two call
  sites instead of one, and the bypass pattern is now precedented in the codebase.
- **B2, B3, and B5 all grew substantially**, in the same direction Phase 0 already
  flagged as risky: `schoolsRewardFlow`-style URL-string branching is now at **23
  sites** in `BusinessIslandQuestReading.tsx` (from ~1 originally cited); the file's
  effect count is now **19 `useEffect` hooks** (was ~8); the two untyped global
  `CustomEvent`s now fan out to **6** and **10** listener files respectively (was
  "3+" each).
- **`globals.css` grew again, not shrank** — 22,444 → 32,049 lines, `!important`
  count 282 → 309, and both duplicate selectors flagged at Phase 0
  (`.iq-mbo-wax-seal`, `.iq-prodigy-map__progress-fill`) are still duplicated. This
  is the second consecutive audit cycle where the R4 recommendation (schedule a
  de-duplication pass before more feature work lands) was not acted on.
- **R2 (visual-language clash) relocated again, and is now arguably worse.** The
  redesign's new dark-charcoal/NVIDIA-green "Master Principles Ladder" sheet
  wraps the *same* cream-colored `BusinessChecklistPanel` (`variant="schools"`
  still resolves to the cream CSS class) inside its own dark chrome — nesting the
  two visual languages inside one component's DOM tree, a tighter juxtaposition
  than the "adjacent in the same layout" finding at Phase 0.
- **Everything else — S3, S5–S9, C1–C7, IC2–IC6, P2–P7, B1, B4, B6, R3, R5, R6 —
  is unchanged**, confirmed against current file:line evidence, not carried over
  from either prior document uninspected.

**Net assessment:** the redesign branch shipped real, valuable Business Island
content (Key Terms Check, Bonus Investigations, evidence-file mission flow) and
incidentally fixed two issues (R1, IC1). It did not touch — and in several
dimensions worsened — the exact structural risks Phase 0 flagged as the most
expensive to leave unaddressed (B2/B3/B5 coupling, R4 stylesheet debt, R2 visual
identity). And a parallel, well-intentioned security effort is currently in the
single worst state it could be in: convincing-looking documentation claiming fixes
that aren't live, plus a real fix for the database lockdown that would take the app
down if applied on its own schedule.

---

## Prioritized Issue List — Status Delta (v2)

| # | Title | Area | Severity | Status |
|---|---|---|---|---|
| **NEW-1** | S1/S2/S4 fix work is uncommitted, partially wired, and deploy-order-hazardous | Security | **Critical (new)** | **Fixed in code** (`99505a1`) — not yet deployed |
| S1 | Open RLS — anon key read/write | Security | Critical | **Code-complete, migration intentionally unapplied** — see deploy blocker |
| S2 | /admin, /api/admin no auth | Security | Critical | **Fixed** (`99505a1`) — not yet deployed |
| P1 | Presenter demo hardcodes identity | Content | Critical | **Worsened — 2nd hardcode site added** |
| S3 | Unauthenticated AI-generation endpoints | Security | High | **Fixed** (`9f01097`) — ticker-scoped + rate-limited, not yet deployed |
| S4 | /schools/preview exposes design gallery | Security | High | **Fixed** (`99505a1`) — not yet deployed |
| R1 | Checklist rail overlaps quest content | Mobile | High | **Resolved** |
| R2 | Two visual languages collide | Consistency | High | **Worsened — clash now nested, not just adjacent** |
| B1 | QuestReading.tsx secretly powers 4 islands | Stability | High | Unchanged, still present |
| B2 | Reward/nav logic branches on URL string | Stability | High | **Worsened — 23 branch sites (was ~1)** |
| B3 | 13 state / 8 effects, 5 persistence layers | Stability | High | **Worsened — 19 effects (was ~8)** |
| B4 | Dev reset button orphans Checklist state | Stability | High | Unchanged, still present |
| C1 | Schools Financials/Forces/Mgmt exit URL space | Consistency | High | Unchanged, still present |
| P2 | No name-capture step | Content | High | Unchanged, still present |
| P3 | Onboarding choices never surfaced on profile | Content | High | Unchanged, still present |
| P4 | No reset/replay for onboarding & identity | Content | High | Unchanged, still present |
| IC1 | Evidence→checklist mapping unvalidated | Checklist | High | **Resolved (NVIDIA card-3 fixed directly)** — mapping is still unvalidated as a class of bug, see below |
| IC2 | Two parallel checklist/rating systems | Checklist | High | Unchanged — fork now has a documenting unit test |
| S5 | Game-health cron fails open | Security | Medium | **Fixed** (`ecbeecf`) — not yet deployed |
| S6 | /api/onboarding/interests trusts client userId | Security | Medium | **Fixed** (`5ccb40b`) — not yet deployed |
| S7 | API error handlers leak raw error text | Security | Medium/Low | **Fixed** (`3d231a0`) — not yet deployed |
| R3 | Schools decks: 100dvh + overflow:hidden | Mobile | Medium | Unchanged, still present |
| R4 | globals.css itself is a regression multiplier | Mobile | Medium | **Worsened again — 32,049 lines, 309 !important** |
| R5 | Production safe-area CSS inert | Mobile | Low/Medium | Unchanged, still present |
| B5 | Cross-component sync via global window events | Stability | Medium | **Worsened — 6 + 10 listener sites** |
| C2 | Management back-link hardcoded to /map | Consistency | Medium | Unchanged, still present |
| C3 | ForcesQuestMap back-button hardcoded /map | Consistency | Medium | Unchanged, still present |
| C4 | Orphaned "Company Mastery" checklist panel | Consistency | Medium | Unchanged, still present |
| IC3 | Demo reset clears 1 of 17 principles | Checklist | Medium | Unchanged, still present |
| IC4 | Checklist storage has no versioning/backup | Checklist | Medium | Unchanged, still present |
| P5 | "Stocks experience" answers never used | Content | Medium | Unchanged, still present |
| P6 | Orphaned parallel avatar system (10 characters) | Content | Medium | Unchanged, still present |
| S8 | Demo state fully client-trusted (by design) | Security | Low | Unchanged, informational — no action needed |
| S9 | Demo Controls default-enabled outside funnel | Security | Low | **Fixed** (`87dd09b`) — not yet deployed |
| R6 | Production Map uses raw 100vh/100vw | Mobile | Low | Unchanged, still present |
| R7 | Prototype "preview" map variants inflate CSS | Consistency | Low | Unchanged — one variant (Prodigy) now partly production-used |
| B6 | Unmark-as-read doesn't retract ratings | Stability | Low | Unchanged, still present (expected) |
| IC5 | No multi-tab staleness protection | Checklist | Low | Unchanged, still present |
| IC6 | Rating-submitted flag in sessionStorage | Checklist | Low | Unchanged, still present |
| C5 | /schools/onboarding orphaned redirect shim | Consistency | Low | Unchanged, still present |
| C6 | Unreferenced alias routes | Consistency | Low | Unchanged, still present |
| C7 | Hidden ?dev=1 debug panel on /business | Content | Low | **Fixed** (`99505a1`) — not yet deployed |
| P7 | "Goal" field vestigial | Content | Low | Unchanged, still present |
| **NEW-2** | 23 `schools/demo/**/page.tsx` files show as modified due to CRLF/LF line-ending drift, not content changes | Consistency | Low (new) | New finding |

---

## A. Security

### NEW-1 — The in-progress S1/S2/S4 fix is currently in its most dangerous possible state
**Severity — Critical (new) · Effort — S to reconcile**

What/where: A full, plausible-looking remediation effort exists as **uncommitted,
untracked working-tree files** plus **one unapplied git stash**
(`stash@{0}: "WIP on main: 0aef79a..."`), sitting on top of the just-merged `main`:

```
docs/security-fix-s1-open-rls.md        (untracked)
docs/security-fix-s2-admin-auth.md      (untracked)
src/lib/admin/adminSession.ts           (untracked)
src/lib/supabase/serviceClient.ts       (untracked)
src/lib/supabase/serviceEnv.ts          (untracked)
src/app/admin-login/                    (untracked)
src/app/api/admin/login/                (untracked)
src/app/api/admin/logout/               (untracked)
supabase/migrations/20260715120000_tighten_anon_rls.sql   (untracked)
stash@{0} → src/middleware.ts wiring (isAdminGatedPath, isSchoolsPreviewPath gate)
```

None of this is wrong on its own merits — the SQL is a correct, narrowly-scoped
RLS tightening; `adminSession.ts` is genuinely solid crypto; the stashed
`middleware.ts` diff correctly gates both `/admin/**` and
`/schools/preview/**` in production. The danger is entirely in the *sequencing
and durability* of what's here:

1. **`security-fix-s1-open-rls.md` claims 18 repository files were switched to
   the service-role client.** `git status` shows zero of those 18 files as
   modified, and a direct grep confirms `createSupabaseServiceRoleClient` has
   **no call sites anywhere in `src/`** outside its own definition. The doc
   describes work that was never actually done to the code.
2. **If the untracked migration is applied to a live Supabase project as-is**,
   every one of the 26 newly-locked tables starts default-denying the anon-keyed
   reads/writes that every current repository (`gameHealth/*.ts`,
   `supabase/analytics/*.ts`, `supabase/quests/questContentRepository.ts`, etc.)
   still performs. This is not a security improvement in that scenario — it is
   an outage.
3. **S2/S4's actual enforcement code exists only in a git stash that has never
   been applied.** `main`'s live `src/middleware.ts` is 39 lines with no
   `/admin` or `/schools/preview` handling whatsoever — confirmed by direct
   read. A stash can be dropped, garbage-collected, or lost on a machine
   reset; nothing about the current setup guarantees this fix ever ships.
4. Taken together: **today, right now, `/admin` has zero authentication and the
   database is exactly as open as at Phase 0** — but anyone reading
   `docs/security-fix-s1-open-rls.md` or `-s2-admin-auth.md` without checking
   `git status` and `git stash list` would reasonably conclude otherwise.

Reco Fix: Before anything else in this list — (a) `git stash show -p stash@{0}`,
reconcile it against current `main` (it predates the merge by one commit, should
apply cleanly), and commit the `middleware.ts` gate; (b) rewire the 18
repositories onto `serviceClient.ts` in the *same* commit/deploy as (a); (c) apply
the RLS migration only after (b) is confirmed live; (d) delete or correct the two
fix docs so they describe what's actually true on disk once (a)–(c) land.

### S1 — Open RLS: still fully open in practice
Migration file is sound but unapplied; service-role client has zero call sites.
See NEW-1 above for full detail. Effective current state: identical to Phase 0 —
the anon key still has practical read/write to all 26 previously-open tables
because no policy has actually changed in the live database, and even if it had,
the app itself doesn't yet have a working path around it.

### S2 — /admin, /api/admin no auth: still present
`src/middleware.ts` (current `main`, read directly) has no `/admin` or
`/api/admin` handling. Gate code exists only in the unapplied stash. Unchanged
from Phase 0 in actual, deployed behavior.

### S3 — Unauthenticated AI-generation endpoints: unchanged, still present
`src/app/api/business/generate/route.ts` confirmed to have no auth/session/
rate-limit check of any kind. Same for `financials`, `forces`, `management`
`/generate`, and `/api/sec/extract`.

### S4 — /schools/preview/[screen] exposed publicly: still present
Same unapplied-stash situation as S2 — the production-gate logic
(`isSchoolsPreviewPath` check in middleware) exists only in `stash@{0}`.

### S5 — Game-health cron fails open: unchanged, still present
`src/app/api/admin/game-health/cron/route.ts` — `if (secret)` guard still skips
auth entirely when `GAME_HEALTH_CRON_SECRET` is unset.

### S6 — Client-supplied userId trusted: unchanged, still present
`src/app/api/onboarding/interests/route.ts` still reads `userId` from the request
body with no session check.

### S7 — Raw error text forwarded to client: unchanged, still present.

### S8 — Client-trusted demo state: unchanged, informational, no action needed.

### S9 — Demo Controls default-enabled: unchanged, still present.

---

## B. Mobile / Responsiveness

### R1 — Checklist rail overlap: **RESOLVED**
Confirmed directly: `.iq-quest-checklist-layout__panel` (globals.css, current)
has no `position: fixed` anywhere in its rule set — it's `max-height` +
`overflow-y: auto` with `position: relative` at the mobile breakpoint. The live
layout (`BusinessQuestChecklistLayout.tsx`) now uses real CSS grid tracks for
both its section-mission and base variants. The mechanism the original 53px
overlap depended on no longer exists in the stylesheet. Recommend one live
1024px viewport spot-check as final confirmation before formally closing.

### R2 — Visual-language clash: worsened, now nested rather than adjacent
Cream/gold hex values (`#fffbeb`, `#fde68a`, `#fef3c7`) still appear 46+ times in
`globals.css`; the quiz-choice and quest-complete-card cream components are
unchanged. The redesign's new dark/NVIDIA-green evidence-file theme
(`src/app/evidence-file.css`, using `#76b900`/`#1a1a1a`) is a *third* visual
language, distinct from both the app-wide dark-navy default and the cream
quiz/reward surfaces — and the new "Master Principles Ladder" sheet nests the
old cream `BusinessChecklistPanel` (`variant="schools"`) directly inside its own
dark chrome rather than replacing it. Rescope this from "two languages collide"
to "three languages now coexist, with one clash nested inside a single
component's DOM tree" — the fix is more involved than at Phase 0, not less.

### R3 — Deck screens 100dvh + overflow:hidden: unchanged, still present.

### R4 — globals.css regression-risk multiplier: worsened again
32,049 lines (was 22,444 at Phase 0, 31,383 one cycle ago). `!important` count
309 (was 282). Both previously-flagged duplicate selectors remain duplicated:
`.iq-mbo-wax-seal` (still defined twice), `.iq-prodigy-map__progress-fill`
(still defined twice, at different line numbers than before due to the file's
continued growth). This is the second consecutive feature cycle where ~700–9,000
more lines landed on top of this file with no de-duplication pass in between.

### R5 — Safe-area viewport-fit inert outside /schools/demo: unchanged, still present.

### R6 — Raw 100vh/100vw in production map stage: unchanged, still present.

### R7 — Prototype preview map clones inflate stylesheet: unchanged, with one
nuance carried forward — the Prodigy map variant has partially graduated into
production use (Business Hub island layout), so "delete all 7" is no longer a
clean recommendation; the other 6 (Duolingo, cartoon, DragonBox, Roblox, Khan,
Legends) remain pure dead weight.

---

## C. Visual Consistency / Routing

All seven items confirmed unchanged against current file:line evidence — none of
the files involved were touched by the merged branch:

- **C1** — `buildFinancialsHubCards.ts`, `forcesHubCategories.ts`,
  `buildManagementHubCards.ts` still hardcode root paths, no
  `resolveSchoolsLearnerHref` usage. Still present.
- **C2** — `ManagementPageClient.tsx` still `backHref="/map"`. Still present.
- **C3** — `ForcesQuestMap.tsx` back-button still hardcoded. Still present.
- **C4** — `SchoolsCompanyMasteryPanel.tsx` still built, still unimported anywhere.
  Still present.
- **C5** — `/schools/onboarding` orphaned redirect shim. Still present.
- **C6** — Unreferenced `onboarding-screen-4/5` aliases. Still present.
- **C7** — Hidden `?dev=1` panel on `/business` still gated only by the query
  param, no `NODE_ENV` check. Still present — and note the stashed middleware
  fix for S2/S4 has no logic touching `/business` or the `dev` param, so
  applying that stash would not incidentally close this one.

**Positive, confirmed again:** the merged Business Island redesign code
(`src/components/business/**`) still contains zero new instances of the
C2/C3 hardcoded-back-link pattern — new components route through
`resolveSchoolsLearnerHref` correctly.

### NEW-2 — 23 `schools/demo/**/page.tsx` files show as modified, but the diffs are empty
**Severity — Low (new) · Effort — S**

What/where: `git status` lists 23 files under `src/app/schools/demo/**/page.tsx`
as modified (`M`). `git diff` on each (with `core.autocrlf` normalized) shows
**zero content changes** — the only difference is CRLF vs LF line endings. This
isn't a functional bug, but it's real diff noise: any reviewer looking at
`git status` on this branch sees 23 "changed" files that changed nothing, and a
future accidental commit of the CRLF versions would introduce spurious
whole-file diffs on top of real changes in the same files going forward.

Reco Fix: Add or fix `.gitattributes` to force `text=auto eol=lf` for `*.tsx`
(or whatever the repo's established line-ending convention is), then
run `git add --renormalize .` once to settle it — a one-time cleanup, not a
recurring task.

---

## D. Stability — Business Island

### B1 — QuestReading.tsx secretly powers 4 islands: unchanged, still present
`pillarQuestTheme.ts` still lists all four pillars against this one file; file
grew to 2,070 lines (unchanged from one cycle ago — the merged commit touched
other Business Island files, not this one directly).

### B2 — Reward/nav logic branches on URL string: worsened again
`schoolsRewardFlow`-derived branching is now at **23 sites** in
`BusinessIslandQuestReading.tsx` (grew from the ~1 site originally cited, and
from 20 one cycle ago). Still pure prefix-string matching
(`isSchoolsBusinessQuestPath`), still no explicit mode resolved once at the
route level.

### B3 — State/effects reconciling persistence layers: worsened on the effects axis
Current file: **19 `useEffect` hooks** (confirmed via direct count, matching the
prior cycle's finding — unchanged since then, still roughly 2.4x the ~8 cited at
Phase 0).

### B4 — Dev reset button orphans Checklist state: unchanged, still present
`BusinessIslandDevReset.tsx` confirmed (full file read) to call only
`actions.clearPillarProgress("business")` — no checklist/evidence-storage
clearing. Still three non-identical reset paths across the app.

### B5 — Untyped global CustomEvents, no coordinator: worsened again
`BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT` now referenced in **6 files**;
`SCHOOLS_DEMO_RESET_EVENT` now in **10 files** (grew from 5/9 one cycle ago, and
from "3+ each" at Phase 0). Still plain `new Event(...)`, no typed payload, no
central coordinator.

### B6 — Unmark-as-read doesn't retract ratings: unchanged (expected, low
severity, no action needed beyond documenting for QA).

---

## E. Investor Checklist — Preserve & Harden

### IC1 — Evidence-to-checklist mapping: **RESOLVED (this specific instance)**
`investorQualityChecklist.ts` now maps `"what-they-do".card-3 →
["business-understanding"]` (added in the merged commit, verified via `git
show` diff — a single, deliberate, targeted line addition, not a side effect).
The NVIDIA quest's evidence gap is closed. **The underlying class of risk is
unchanged**: this is still a hand-maintained string table with no build-time
validation against real card counts, so the same failure mode can recur silently
the next time a card is added/removed/renumbered on any quest. Recommend still
adding the CI health-check assertion originally proposed — this fix closed one
instance of the bug, not the mechanism that produces it.

### IC2 — Two parallel checklist/rating systems: unchanged, fork better-documented
`who-competes` still falls through to the legacy quiz+rating system; still
explicitly excluded from the hub-card map with a comment and a passing unit test
(`buildBusinessHubCards.test.ts`) — same state as one cycle ago, not touched by
the merged commit.

### IC3 — Demo reset clears 1 of 17 principles: unchanged, still present
`resetSchoolsDemoProgress.ts` still hardcodes clearing only `"business-purpose"`.
Principle count confirmed at **17** (`InvestorPrincipleId` union type, direct
read) — unchanged from one cycle ago.

### IC4 — No schema versioning/migration/backup: unchanged, still present.

### IC5 — No multi-tab staleness protection: unchanged, still present.

### IC6 — Rating-submitted flag in sessionStorage: unchanged, still present.

---

## F. Content / Unfinished — Profile Creation Flow

### P1 — Presenter demo hardcodes identity: worsened, now two sites
`SchoolsLogoRevealScreen.tsx:657-661` — original hardcode, unchanged.
**`SchoolsMissionBriefInvitationScreen.tsx:317-321`** — an identical
`getSchoolsArmorById("pioneer")` / `saveSchoolsArmor("pioneer")` hardcode,
confirmed present via direct read, added as part of the merged redesign (this
screen didn't exist at Phase 0). A fix now needs two call sites updated instead
of one, and there's now a second precedent for "just hardcode pioneer" in the
codebase that a future screen could copy again.

### P2 — No name-capture step: unchanged, still present.

### P3 — Onboarding choices never surfaced on profile dashboard: unchanged,
still present. Note: `resolveInvestorProfileSnapshot.ts` changed by a few lines
in the merged branch, but the change is unrelated to armor/interests/
stocks-experience surfacing — still no such fields in the snapshot type.

### P4 — No reset/replay for onboarding & identity: unchanged, still present.

### P5 — "Stocks experience" answers never used downstream: unchanged, still present.

### P6 — Orphaned parallel avatar system: unchanged, still present, still fully
unreachable from any live demo route.

### P7 — "Goal" field vestigial: unchanged, still present. Both P1 hardcode
sites (now two of them) independently set the same fallback goal string.

---

## Top Recommendation & Updated Phased Plan

Cross-checked directly against the client's own **Developer Project Brief v2**
(1StepAhead, dated 2026-07-08): Phase 0 Audit & Risk Review (Days 1–4), Phase 1
Profile Creation Flow (Days 5–9), Phase 2 Responsiveness + Visual Consistency
(Days 10–16), Phase 3 Business Island + Demo-Flow Hardening (Days 17–23), Phase
4 Security Hardening · Cleanup · Testing (Days 24–28). The plan below keeps the
brief's own phase numbers and scope boundaries — nothing here invents a new
phase; it corrects two placements this document previously got wrong against
the brief's actual text (R4 and the routing-consistency items), and calls out
one thing the brief's calendar makes visible that a pure issue-list can't.

### Schedule reality-check

Measured against the brief's own calendar (engagement start 2026-07-08): the
**Phase 0 window (Days 1–4, ~Jul 8–12) never fully closed** — this document's
own lineage (Phase 0 → Phase 0.5 → this v2) is the evidence; S1/S2/S4 are still
open. The **Phase 1 window (Days 5–9, ~Jul 13–17) has now fully elapsed without
P1–P4 closing** — and P1 specifically got *worse* inside that exact window: the
second hardcoded-identity site (`SchoolsMissionBriefInvitationScreen.tsx`) was
added on 2026-07-17, the same day Phase 1 was due to finish. What actually
landed July 17–20 instead was Business Island feature work (HQ decode redesign,
evidence-file mission flow, Key Terms Check) that sits in Phase 3's *subject
area* but is net-new construction, not the coupling-reduction Phase 3 actually
calls for — and it's exactly what drove B2/B3/B5's growth. **This isn't only a
list of worse issues — the project is executing out of the brief's own
sequence**, with Phase-3-shaped feature work landing before Phase 0 and Phase 1
closed.

### Immediate — ahead of Phase 1

*Not one of the brief's five phases — this is the original Phase 0 report's own
recommendation ("pull the highest-severity security fixes forward... doesn't
have to block Phase 1 kickoff... shouldn't wait") applied to what's now overdue.
Everything below has a home in the brief's numbered phases (mostly Phase 4);
listed here because leaving it half-done is worse than either finishing or
reverting it.*

| Issue | Action | Status |
|---|---|---|
| **NEW-1 / S1 / S2 / S4** | Reconcile `stash@{0}` into `middleware.ts`; rewire all 18 repositories onto `serviceClient.ts`; commit both together; deploy; confirm; **only then** apply the RLS migration. Correct or delete the two fix-docs once the code matches what they claim. | **Code done** (`99505a1`). Deploy + migration steps still open — see [`security-fix-checklist.md`](./security-fix-checklist.md). |
| **S3, S5, S6, S7, S9** | Pulled forward alongside the above since they were cheap and in the same review pass. | **Code done** (`9f01097`, `ecbeecf`, `5ccb40b`, `3d231a0`, `87dd09b`). Awaiting the same deploy. |
| **P1** | Fix both hardcode sites in the same change — `SchoolsLogoRevealScreen.tsx` and `SchoolsMissionBriefInvitationScreen.tsx` — the brief's own Phase 1 window has already elapsed on this item. | Not started. |
| **NEW-2** | Add/fix `.gitattributes` (`text=auto eol=lf` for `*.tsx`), `git add --renormalize .` once. Trivial, removes ongoing diff noise. | Not started. |
| **C7** | Gate `?dev=1` behind `NODE_ENV !== "production"` — the brief's Phase 4 bullet "hide debug controls... from the demo path" covers this by default; cheap enough (S-effort) to close now instead. | **Code done** (`99505a1`). |

### Phase 1 — Profile Creation Flow (Days 5–9, brief's window has elapsed)

*Scope matches the brief exactly: "capture the demo profile fields (name,
avatar, learner type, interests, onboarding choices)," persist through existing
client-side state, connect to the Schools profile dashboard, add reset/replay.
P1 moves to the "ahead of Phase 1" bucket above since it's the most overdue
single item in this group.*

| Issue | Note |
|---|---|
| P2 | No name-capture step — still needs a real text-entry field ("name" is explicitly one of the brief's listed demo profile fields). |
| P3 | Onboarding choices (identity/interests/stocks-experience) still never surfaced on the profile dashboard — the brief's "connect profile creation into the Schools profile dashboard" bullet. |
| P4 | Still no full reset/replay path back to a blank profile-creation state — the brief's explicit "add reset/replay behavior" bullet. |
| P5 | "Stocks experience" answers still write-only, never consumed — decide wire-in vs. cut as part of this phase's field capture; if deferred, it becomes a Phase 4 stub-completion item. |
| P6 | Resolve the orphaned avatar-system-vs-armor question **early in this phase** — "avatar" is explicitly one of the brief's listed profile fields, and the choice determines which identity UI the rest of Phase 1 builds on. |
| P7 | "Goal" field vestigial — decide add-a-picker vs. remove; same fallback-to-Phase-4 logic as P5 if deferred. |

### Phase 2 — Responsiveness + Visual Consistency (Days 10–16)

*Scope matches the brief's two named sub-tracks — responsiveness first
(laptop/desktop, per the brief's stated priority), then visual consistency.
**Correction from this document's own earlier draft:** the brief scopes CSS
cleanup ("break down large globals.css sections... group Schools/Business
selectors... remove conflicting rules") explicitly under **Phase 4**, not here
— R4 moves there below, with a recommendation to accelerate it given two
consecutive cycles of unaddressed growth.*

| Issue | Note |
|---|---|
| ~~R1~~ | **Removed — resolved.** Spot-check at a live 1024px viewport as final confirmation only. |
| R3, R5, R6, R7 | Responsiveness sub-track — unchanged scope from the original plan. |
| R2 | Visual-consistency sub-track — rescope as **three** visual languages to reconcile (dark navy default, cream/gold quiz-reward, dark/NVIDIA-green evidence-file), not two — the ladder sheet nested the cream panel rather than replacing it, so the fix now touches more surface than at Phase 0. |

### Phase 3 — Business Island + Demo-Flow Hardening (Days 17–23)

*Scope matches the brief's explicit bullets almost line-for-line: refactor the
riskiest parts of `BusinessIslandQuestReading.tsx` (B1), reduce coupling
between reading/quiz/checklist/completion/Schools-routing (B1, B2, IC2), tighten
progression state (B3, B4), review fragile localStorage/demo-story assumptions
(B3, B5, IC4, IC5), and fix refresh/back-nav/reset/replay edge cases while
keeping `/schools/demo` and canonical `/schools` routes consistent — that last
clause is **C1** by name. **Correction from this document's own earlier draft:**
C1–C3 (routing/back-link consistency) move here from Phase 2, matching the
brief's own words instead of a generic area-based read. The Investor Checklist
wasn't a named line item in the brief (it surfaced during the Phase 0 audit
itself), but it's structurally part of Business Island, so its hardening
(IC1–IC6) belongs in this phase, same as the original audit concluded.*

| Issue | Note |
|---|---|
| B1 | Rename `BusinessIslandQuestReading.tsx` to scope-honest naming; still secretly powers 4 islands. |
| B2 | **Higher urgency** — 23 URL-string branch sites now (was ~1), grew even in a cycle that didn't touch this file's primary purpose. Resolve mode-as-explicit-prop before a 4th/5th site appears. |
| B3 | 19 effects now (was ~8) — add the integration tests originally proposed (slug change mid-flow, evidence-gate open→navigate-away→back, demo-reset mid-quest) before attempting any reduction refactor. |
| B4 | Cheap (S-effort) — fix opportunistically, doesn't need to wait for the rest of this phase. |
| B5 | **Higher urgency** — 6 + 10 untyped listener sites now (was "3+" each). Consolidate behind one typed pub/sub module before a third global event is added. |
| B6 | Document as expected behavior for QA — no code change. |
| C1 | Exit-URL-space bug — this is the brief's own "keep routes consistent" bullet by name. |
| C2, C3 | Hardcoded back-link bugs — same routing-consistency cluster as C1. |
| IC1 (residual) | The specific NVIDIA bug is fixed; still add the CI assertion that every checklist-mapped quest's card IDs match the map, so the next content edit can't reintroduce this silently. |
| IC2 | Add the health check asserting every quest slug has an explicit, intentional checklist mapping (or documented exemption). |
| IC3, IC4, IC5, IC6 | Unchanged scope — hardening work, no behavior change, as originally scoped. |

### Phase 4 — Security Hardening · Cleanup · Testing (Days 24–28)

*The brief scopes three sub-tracks here, not just security: (1) security/
public-demo hardening including admin/debug-route review and API input
validation, (2) content/stub completion — "replace or hide placeholder
content... finish 'coming soon' leakage," and (3) CSS cleanup + testing. S1/S2/
S4 are pulled ahead per the "Immediate" bucket above; what's left is real
closure work plus a verification checkpoint, the stub-content cleanup the brief
explicitly asks for, and R4 (moved here from this document's earlier,
incorrect Phase 2 placement).*

**Security / public-demo hardening**

| Issue | Note |
|---|---|
| Verify | Confirm S1/S2/S4 fixes are live in **production** (not just committed) before considering the "ahead of Phase 1" work closed. **Still open** — commits exist locally on `main`, not yet pushed/deployed. |
| S3 | **Done** (`9f01097`) — ticker allowlist + per-IP rate limiting on `*/generate` and `/api/sec/*`, instead of a new API-key system (no auth system exists to issue keys against). |
| S5 | **Done** (`ecbeecf`) — fails closed on missing `GAME_HEALTH_CRON_SECRET`. |
| S6 | **Done** (`5ccb40b`) — dropped the client-supplied `userId` path entirely; only the anonymous `guestId` path remains, which was the only one any live caller used. |
| S7 | **Done** (`3d231a0`) — generic client-facing error messages, full detail logged server-side. |
| S8 | No action — informational, by design. |
| S9 | **Done** (`87dd09b`) — code now defaults Demo Controls off in production; `NEXT_PUBLIC_DEMO_CONTROLS=true` opts back in explicitly. |

**Content / stub completion**

| Issue | Note |
|---|---|
| C4 | Orphaned "Company Mastery" checklist panel — confirm intent, delete if superseded. |
| C5, C6 | Orphaned redirect shim / unreferenced alias routes — delete or explicitly document as intentional back-compat. |
| P5, P6, P7 | If not resolved during Phase 1, this is the fallback: wire-in-or-cut for stocks-experience and goal field; delete the losing avatar system once Phase 1's identity decision is made. |

**CSS cleanup + testing**

| Issue | Note |
|---|---|
| R4 | **Its brief-scoped home, but recommend accelerating.** Two consecutive audit cycles recommended a de-duplication/split pass; two consecutive cycles instead added ~700–9,000 more lines each time — doing this before Phase 2's R2 re-skin work is cheaper than doing it after a third cycle of growth, even though the brief places it in Phase 4. |
| — | Unit testing + final QA pass, per the brief. |

### Net effect versus the brief

Same five phases, same day ranges, same scope boundaries — this re-audit
corrects two misplacements (R4 belongs in Phase 4's CSS-cleanup track, not
Phase 2; C1–C3 belong in Phase 3's routes-consistency work, not a generic
"consistency" bucket), removes two closed items (R1, IC1's bug instance), and
surfaces that the brief's own Phase 0 and Phase 1 windows have elapsed without
closing while Phase-3-shaped feature work landed instead — which is itself the
strongest argument for treating the "ahead of Phase 1" bucket as truly
immediate rather than another phase to schedule around.
