# Security Fix Checklist — S1/S2/S3/S4/S5/S6/S7/S9

Tracks the security-remediation checklist end to end: merge → re-audit → updated
issue list/phased plan → ship the admin/preview gating first → remaining fixes
in order. This supersedes
[`security-fix-s1-open-rls.md`](./security-fix-s1-open-rls.md) and
[`security-fix-s2-admin-auth.md`](./security-fix-s2-admin-auth.md) as the
source of truth for what's actually landed — both of those documents described
work correctly, but at the time they were written the described changes existed
only as untracked files and an unapplied `git stash`, not as code actually on
`main` (see [`phase-0-audit-risk-review-v2.md`](./phase-0-audit-risk-review-v2.md)'s
NEW-1 finding for the full account of that gap). Everything below is checked
against `git log` / `git status` directly, not against this document's own
claims about itself.

## Checklist status

- [x] **Merge into main** — PR #2 (`liam-biz-redesign` → `main`), merge commit
      `530f9694`, merged 2026-07-20.
- [x] **Re-audit the merged codebase** —
      [`phase-0-audit-risk-review-v2.md`](./phase-0-audit-risk-review-v2.md),
      all 42 original findings re-checked against current file contents.
- [x] **Update the issue list and phased plan** — done in the same document,
      reconciled against the client's actual Developer Project Brief (phase
      numbers, day ranges, scope boundaries corrected to match the brief's own
      text).
- [x] **Ship the `/admin`, `/api/admin`, and `/schools/preview` gating first** —
      commit `99505a1`, plus the S1 prerequisite (service-role client
      rewiring) bundled into the same commit since it was already sitting
      together in the stash this was recovered from.
- [x] **Continue with the remaining security fixes in the correct order** —
      S5, S9, S6, S7, S3 landed across 5 follow-up commits (below). S1 itself
      is intentionally left as "code done, migration not yet applied" — see
      the deploy sequence.
- [ ] **Deploy** — commits exist on local `main`, not yet pushed to
      `origin/main` / deployed to Vercel. Blocked on the env vars below.
- [ ] **Apply the RLS migration** — only after the deploy above is confirmed
      working in production.

## What shipped, commit by commit

| Commit | Issue(s) | What changed |
|---|---|---|
| `99505a1` | S2, S4, C7, S1 (prep) | `middleware.ts` now gates `/admin/**` + `/api/admin/**` behind a signed admin-session cookie, and 404s `/schools/preview/**` in production. `business/page.tsx`'s `?dev=1` panel now also requires `NODE_ENV !== "production"`. All 18 server-side repository files moved from the anon-keyed client to `createSupabaseServiceRoleClient()`. |
| `ecbeecf` | S5 | Game-health cron endpoint now returns 503 if `GAME_HEALTH_CRON_SECRET` is unset, instead of skipping auth entirely. |
| `87dd09b` | S9 | Demo Controls panel now defaults **off** in production unless `NEXT_PUBLIC_DEMO_CONTROLS=true` is explicitly set — previously fell back to `CONTROLLED_DEMO_MODE`, which defaults to `true`. |
| `5ccb40b` | S6 | `/api/onboarding/interests` no longer accepts a client-supplied `userId` — confirmed no live caller ever sent one; only the anonymous `guestId` path (a local pairing key, not an identity claim) remains. |
| `3d231a0` | S7 | Added `src/lib/api/errorResponse.ts` — logs the full error server-side, returns a generic client-safe message. Applied to the admin quest-content, quest-generation regenerate, and prompt-template routes. |
| `9f01097` | S3, S7 (overlap) | `*/generate` (business/financials/forces/management) and `/api/sec/*` now reject any ticker other than the demo company's own while `CONTROLLED_DEMO_MODE` is on (the default), and apply a best-effort per-IP rate limit (10 req/min). Same commit finishes the S7 error-message fix for these routes since the edits landed in the same catch blocks. |

`npx tsc --noEmit` and `npm run build` both pass clean as of the last commit.

## What's verified vs. not yet

**Verified (local, pre-deploy):**
- Full production build succeeds with all six commits applied.
- Direct source read confirms `src/middleware.ts` on `main` now contains the
  admin/preview gate (no longer the pre-fix 39-line version).
- Direct grep confirms zero remaining `createSupabaseServerClient` (anon-key)
  call sites across the 18 rewired repository files.

**Not yet verified (needs a real deploy):**
- `/admin` actually redirecting to `/admin-login` in production.
- Login succeeding with `ADMIN_CONSOLE_PASSWORD` and failing with a wrong one.
- Quest content / onboarding / SEC filing screens still loading normally
  (proves the service-role rewiring didn't break anything).
- `/schools/preview/hacker-style` (and siblings) 404ing in production.
- The ticker-scoping and rate-limit on `*/generate` rejecting a non-demo
  ticker and a rapid burst of requests respectively.

The "before" screenshots captured ahead of this fix (`/admin` wide open,
`/api/admin/quest-content` returning real data with no auth,
`/schools/preview/hacker-style` publicly reachable) are the baseline to
compare against once the "after" versions are captured post-deploy.

## Deploy sequence — order matters

Doing this out of order causes either an outage (service-role key) or a
confusing lockout (admin secrets). Correct order:

1. **Set three env vars in Vercel** (Project → Settings → Environment
   Variables), all server-only — never `NEXT_PUBLIC_`-prefixed:
   - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase → Settings → API →
     `service_role` secret key. **Required before step 2** — every rewired
     repository throws immediately if this is missing, which would break
     quest content, onboarding, analytics, and SEC filing loading the moment
     this code deploys.
   - `ADMIN_CONSOLE_PASSWORD` — the password used at `/admin-login`. Fails
     closed if unset (nobody can log in, including you) rather than failing
     open, so it's safe to deploy without it — but you'll want it set to
     actually use `/admin`.
   - `ADMIN_SESSION_SECRET` — any long random string, signs the session
     cookie. Same fail-closed behavior as above if unset.
2. **Push these 6 commits to `origin/main`** (auto-deploys to Vercel).
3. **Confirm in production:**
   - `/admin` redirects to `/admin-login`; wrong password rejected; correct
     password lands back on the console.
   - `/schools/demo`, `/business`, `/schools/business` and a few quest-reading
     screens still load real content (proves the service-role rewiring
     didn't break the app).
   - `/schools/preview/hacker-style` returns 404.
4. **Only after 3 is confirmed**, apply
   `supabase/migrations/20260715120000_tighten_anon_rls.sql` against the live
   Supabase project (SQL editor, or `supabase db push`). Running it before
   step 2/3 would cut off the *old*, still-live code from the database.
5. Re-run the "before" screenshots as "after" screenshots against production
   for the record.

## Known limitations (carried over, not addressed by this pass)

- `ADMIN_CONSOLE_PASSWORD` is one shared password, not per-account auth — same
  stopgap scope as originally documented in `security-fix-s2-admin-auth.md`.
- The S3 rate limiter is in-memory and per-instance — a best-effort deterrent
  against casual scripted abuse, not a distributed guarantee. Matches the
  brief's own framing ("harden the obvious exposed areas, not a full
  penetration test").
- P1 (hardcoded presenter identity, both sites), NEW-2 (CRLF line-ending
  drift), and everything else in the "Immediate — ahead of Phase 1" bucket
  besides the security items above is still open — tracked in
  [`phase-0-audit-risk-review-v2.md`](./phase-0-audit-risk-review-v2.md).
