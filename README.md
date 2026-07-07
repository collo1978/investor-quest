# Investor Quest

Gamified stock research platform (Next.js).

## Live production (Vercel)

| URL | Use |
|-----|-----|
| [https://investor-quest.vercel.app/schools/demo](https://investor-quest.vercel.app/schools/demo) | **Schools presenter demo** — share this link for live sessions |
| [https://investor-quest.vercel.app/schools/business](https://investor-quest.vercel.app/schools/business) | Business island hub |
| [https://investor-quest.vercel.app/map](https://investor-quest.vercel.app/map) | Main quest map |

Deploys automatically from `main` on GitHub (`collo1978/investor-quest`). After pushing, allow 1–3 minutes for Vercel to finish building.

## Starting Investor Quest Locally

After a reboot (or any time the browser shows **ERR_CONNECTION_REFUSED**), the dev server is simply **not running**. Nothing listens on port 3003 until you start it again.

### One command (daily workflow)

Open the project in Cursor, open a terminal (**Ctrl+`**), and run:

```bash
npm run dev
```

(`npm run start:local` is the same command — use whichever you remember.)

1. Wait until the terminal shows **`✓ Ready`** (usually 5–15 seconds).
2. Open **http://localhost:3003/schools/demo** in your browser.
3. **Leave that terminal open** while you work. Press **Ctrl+C** to stop the server.

That is the full startup — no other services are required for local Schools demo work.

### Alternative: keyboard shortcut

Press **Ctrl+Shift+B** — runs the default build task **Investor Quest: dev server** in a dedicated terminal. Wait for **`✓ Ready`**, then open the Schools demo URL above.

### Why `localhost:3003` fails after a reboot

| Situation | What it means |
|-----------|----------------|
| **ERR_CONNECTION_REFUSED** | No dev server process is running (normal after restart/shutdown). Run `npm run dev`. |
| Page loads but looks broken / stale | Hard refresh: **Ctrl+Shift+R**, or run `npm run dev:fresh` once. |
| `npm run dev` says port busy | Run `npm run dev:kill-port`, then `npm run dev` again. (`npm run dev` already tries to free the port automatically.) |

The dev server does **not** auto-start with Windows or Cursor — you start it once per session.

### npm scripts (what exists)

| Command | Purpose |
|--------|---------|
| **`npm run dev`** | **Daily use** — dev server on http://localhost:3003 (frees port 3003 if stuck) |
| `npm run start:local` | Same as `npm run dev` |
| `npm run dev:kill-port` | Manually free port 3003 |
| `npm run dev:fresh` | Delete `.next` cache, then start dev (use after weird build errors) |
| `npm run build` | Production build (not for daily local browsing) |
| `npm run start` | Production server after `build` (not for daily dev) |
| `npm run lint` | ESLint |

**Does not exist:** `npm run schools` — use `npm run dev` and open `/schools/demo`.

### Canonical local URLs

| URL | Use |
|-----|-----|
| http://localhost:3003/schools/demo | Schools live demo (presenter entry) |
| http://localhost:3003/schools/business | Business island (dev, with sidebar) |
| http://localhost:3003/map | Main quest map |

Port **3003** only — bookmarks and Capacitor local sync assume this port.

### Cursor agent: fewer “Run” clicks for safe searches

Copy [`.cursor/permissions.json`](.cursor/permissions.json) to **`%USERPROFILE%\.cursor\permissions.json`** (Windows) so read-only commands (`git status`, `rg`, `Get-ChildItem`, `npx tsc`, etc.) auto-run. Destructive commands (`npm run dev`, `git push`, `rm`, …) still require approval.

In Cursor: **Settings → Agent → Auto-run** must be **Auto-Run in Sandbox** (allowlist mode). **Ask Every Time** ignores the allowlist and prompts on every command.

### Mobile app (Capacitor — iOS / Android)

Native wrappers around the **same** Next.js app (Schools demo entry). Vercel web demo is unchanged.

See **[docs/CAPACITOR.md](docs/CAPACITOR.md)** for setup, simulators, and local dev against `npm run dev`.

```bash
npm run cap:sync          # production → Vercel /schools/demo
npm run cap:open:ios      # Xcode (Mac)
npm run cap:open:android  # Android Studio
```

### Port busy (Windows)

Usually fixed automatically when you run `npm run dev`. If not:

```powershell
npm run dev:kill-port
npm run dev
```

Or manually: `netstat -ano | findstr :3003` then `taskkill /PID <pid> /F`.
