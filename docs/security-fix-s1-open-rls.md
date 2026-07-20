# Security Fix — S1: Open database RLS (Critical)

## The issue

Every Supabase table's Row Level Security policy granted the anonymous key
full read/write access (`using (true)` / `with check (true)`). The anon key
is not a secret — it's shipped to every browser that loads the app
(`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Anyone could
open devtools, copy those two values, and hit the Supabase REST API directly
with `curl` — completely bypassing the Next.js app, middleware, and every
route guard.

Root cause: the app's own server-side code was *also* using the anon key
(via `createSupabaseServerClient()`), so the database policies had to stay
wide open, or the app's own features would have broken.

## The fix

1. **19 server-side data-access files** now use a service-role client
   (`createSupabaseServiceRoleClient()` in
   [`src/lib/supabase/serviceClient.ts`](../src/lib/supabase/serviceClient.ts)),
   which bypasses RLS entirely and is never exposed to the browser.
2. **A new migration**
   ([`supabase/migrations/20260715120000_tighten_anon_rls.sql`](../supabase/migrations/20260715120000_tighten_anon_rls.sql))
   removes all anon/authenticated policies from every table except the two
   written directly from the browser (`user_activity_events`,
   `user_sessions` — low-sensitivity analytics, unchanged behavior).

After this ships, the public anon key can no longer read or write anything
except inserting an analytics event or updating its own session row.

## Files changed (what to push)

Code (18 files, mechanical swap of client used — no logic changes):
```
src/lib/gameHealth/demoRefreshIssues.ts
src/lib/gameHealth/executeFixAction.ts
src/lib/gameHealth/runGameHealthCheck.ts
src/lib/gameHealth/storage.ts
src/lib/sec/questSectionResolver.ts
src/lib/supabase/analytics/analyticsRepository.ts
src/lib/supabase/analytics/growthRepository.ts
src/lib/supabase/analytics/partnerSettingsRepository.ts
src/lib/supabase/geographicRevenue.ts
src/lib/supabase/onboarding/onboardingRepository.ts
src/lib/supabase/partners/fetchPartners.ts
src/lib/supabase/partners/updatePartnerBrandingServer.ts
src/lib/supabase/promptTemplates/evaluations.ts
src/lib/supabase/promptTemplates/storage.ts
src/lib/supabase/questCardAnswers/storage.ts
src/lib/supabase/quests/questContentRepository.ts
src/lib/supabase/sec/aiJobs.ts
src/lib/supabase/sec/filingStorage.ts
```

New files (already in the repo, previously untracked):
```
src/lib/supabase/serviceClient.ts
src/lib/supabase/serviceEnv.ts
supabase/migrations/20260715120000_tighten_anon_rls.sql
```

Not touched: `src/app/api/supabase/health/route.ts` (it deliberately tests
anon-key connectivity itself, not a table).

Verified: `npx tsc --noEmit` and `npm run build` both pass clean with these
changes.

## Deploy sequence — order matters

Doing this out of order causes real downtime. Correct order:

1. **Set `SUPABASE_SERVICE_ROLE_KEY`** in production env vars (Supabase →
   Settings → API → "service_role" secret key). Server-only — never prefix
   with `NEXT_PUBLIC_`.
2. **Deploy this code.** Safe at this point regardless of the database
   policy state, since the app no longer depends on the anon key for these
   tables.
3. **Confirm the app still works** (quest content, onboarding, admin panels,
   SEC filings, etc.).
4. **Run the migration** against the live Supabase project (`supabase db
   push`, or paste the SQL file into the Supabase SQL editor). Only safe
   after step 2/3 — running it first would cut off the *old*, still-live
   code from the database.

## How to screenshot proof

### Proof the issue existed (capture this *before* running the migration in step 4)

From any terminal (not the browser — this is the point: no login needed),
using the two public values from the deployed site's page source or
devtools → Network tab:

```bash
curl "https://<your-project-ref>.supabase.co/rest/v1/quest_content_cards?select=*&limit=3" \
  -H "apikey: <the NEXT_PUBLIC_SUPABASE_ANON_KEY value>" \
  -H "Authorization: Bearer <the same anon key>"
```

Before the fix: returns real rows — screenshot this response. It proves an
anonymous visitor can read (and, with a POST/PATCH/DELETE instead of GET,
write) application data with no login at all.

### Proof the fix works (capture this *after* the migration is applied)

Run the exact same command again:

```bash
curl "https://<your-project-ref>.supabase.co/rest/v1/quest_content_cards?select=*&limit=3" \
  -H "apikey: <the same anon key>" \
  -H "Authorization: Bearer <the same anon key>"
```

After the fix: returns `[]` (empty array) or a permission-denied error —
screenshot this alongside the "before" screenshot. Also confirm the app
itself (`/business`, `/schools/demo`, `/admin/quest-generation`, etc.) still
works normally in a real browser, proving the lockdown didn't break the
product, only the direct-database-access hole.
