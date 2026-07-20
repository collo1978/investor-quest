# Security Fix — S2: Admin console had zero authentication (Critical)

## The issue

`/admin/**` and `/api/admin/**` had no login check anywhere. `src/middleware.ts`
only special-cased `/schools/demo*`; everything else — including the full
partner console (branding, quest content, prompt studio, AI regeneration,
user management, licence settings) and 26 of 32 admin API routes — fell
through to a session refresh that never actually checked whether anyone was
logged in. Anyone who typed `/admin` into the address bar got the whole
console.

There is no existing user/role system anywhere in this app (no users table,
no login flow) — building real per-account auth is a bigger project than a
security patch. This fix is a **stopgap**: a single shared password and a
signed session cookie, matching the audit's own recommendation ("put /admin
behind password protection at minimum" until real auth ships). It closes the
"anyone can type the URL" hole today; it is not multi-user auth with roles.

## The fix

- **`src/lib/admin/adminSession.ts`** — verifies the shared password
  (constant-time compare) and issues/validates a signed, 12-hour-expiring
  session token (HMAC-SHA256 via Web Crypto, so it works in both the Edge
  middleware runtime and Node API routes).
- **`src/app/admin-login/page.tsx`** — a minimal password form. Deliberately
  placed *outside* `/admin` (not `/admin/login`) so it doesn't inherit the
  full admin nav shell from `src/app/admin/layout.tsx` before the visitor is
  authenticated.
- **`src/app/api/admin/login/route.ts`** — checks the password, sets the
  signed cookie (`httpOnly`, `sameSite=lax`, `secure` in production).
- **`src/app/api/admin/logout/route.ts`** — clears the cookie.
- **`src/middleware.ts`** — gates every `/admin/**` and `/api/admin/**`
  request: missing/invalid session → redirect to `/admin-login` (pages) or
  `401 JSON` (API routes). Two paths are exempted:
  - `/admin-login` and `/api/admin/login` themselves (can't gate the login
    page behind login).
  - `/api/admin/game-health/cron` — already authenticates via its own header
    secret (`GAME_HEALTH_CRON_SECRET`) and is called by an external
    cron/dashboard timer with no browser cookie.

Verified locally end-to-end (dev server, `curl`):
- `GET /admin` with no session → `307` to `/admin-login`
- `GET /api/admin/quest-content` with no session → `401`
- `POST /api/admin/login` with wrong password → `401`
- `POST /api/admin/login` with correct password → `200` + sets cookie
- `GET /admin` and `GET /api/admin/quest-content` with the cookie → pass the
  gate (200 / normal app response)

`npx tsc --noEmit` and `npm run build` both pass clean.

## Files changed (what to push)

New:
```
src/lib/admin/adminSession.ts
src/app/admin-login/page.tsx
src/app/api/admin/login/route.ts
src/app/api/admin/logout/route.ts
```

Modified:
```
src/middleware.ts
```

## Deploy steps

1. **Set two new env vars** in production (and anywhere else this deploys):
   - `ADMIN_CONSOLE_PASSWORD` — the shared password whoever needs admin
     access will type in. Pick something long and not reused elsewhere.
   - `ADMIN_SESSION_SECRET` — any long random string (e.g. 32+ random
     characters). Only used to sign the session cookie — never typed in by
     anyone, never shown in any UI.
   - Both are server-only: never prefix with `NEXT_PUBLIC_`.
2. Deploy this code.
3. Confirm: visiting `/admin` redirects to `/admin-login`; entering the
   correct password gets you into the console; wrong password is rejected.

No database migration involved in this fix — it's app-code + env vars only.

## How to screenshot proof

### Proof the issue existed (capture *before* this deploys)
1. Open a private/incognito browser window (no existing session).
2. Navigate to `https://<your-domain>/admin`.
3. Screenshot: the full admin console loads immediately — no login prompt,
   no redirect, complete access to Branding / Quest content / Prompt Studio /
   AI regeneration / Users / Licence settings.

### Proof the fix works (capture *after* this deploys)
1. Same private/incognito window, same URL: `https://<your-domain>/admin`.
2. Screenshot: now redirects to `/admin-login` with a password prompt — no
   console content visible.
3. Try an obviously wrong password — screenshot the rejection.
4. Enter the real `ADMIN_CONSOLE_PASSWORD` — screenshot landing back on the
   admin console, now authenticated.

## Known limitation (by design, flagged for later)

This is one shared password for anyone who needs admin access — not
individual accounts, not role-based permissions, and there's no audit trail
of *who* made a given admin change. If/when real multi-user auth is worth
the investment, this stopgap should be replaced, not built on top of.
