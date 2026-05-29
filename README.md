# Investor Quest

Gamified stock research platform (Next.js).

## Local development

**To work locally, run `npm run dev` and keep the terminal open.**

### Cursor agent: fewer “Run” clicks for safe searches

Copy [`.cursor/permissions.json`](.cursor/permissions.json) to **`%USERPROFILE%\.cursor\permissions.json`** (Windows) so read-only commands (`git status`, `rg`, `Get-ChildItem`, `npx tsc`, etc.) auto-run. Destructive commands (`npm run dev`, `git push`, `rm`, …) still require approval.

In Cursor: **Settings → Agent → Auto-run** must be **Auto-Run in Sandbox** (allowlist mode). **Ask Every Time** ignores the allowlist and prompts on every command.

The app is served at **http://localhost:3003** (port 3003 only — do not change without updating bookmarks).

### Start the dev server

**Option A — terminal (recommended)**

```bash
npm run dev
```

Leave that terminal running while you edit. Save files and the browser updates automatically (Next.js Fast Refresh). Press **Ctrl+C** in the terminal to stop the server.

**Option B — Cursor / VS Code task**

Press **Ctrl+Shift+B** (default build task: **Investor Quest: dev server**). The server runs in a dedicated terminal panel until you stop it (**Ctrl+C** or kill the terminal).

### Useful commands

| Command | Purpose |
|--------|---------|
| `npm run dev` | Dev server on http://localhost:3003 |
| `npm run dev:kill-port` | Free port 3003 if something is stuck |
| `npm run dev:fresh` | Clear `.next` cache, then start dev |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

### Mobile app (Capacitor — iOS / Android)

Native wrappers around the **same** Next.js app (Schools demo entry). Vercel web demo is unchanged.

See **[docs/CAPACITOR.md](docs/CAPACITOR.md)** for setup, simulators, and local dev against `npm run dev`.

```bash
npm run cap:sync          # production → Vercel /schools/demo
npm run cap:open:ios      # Xcode (Mac)
npm run cap:open:android  # Android Studio
```

### Port busy (Windows)

```powershell
npm run dev:kill-port
```

Or manually:

```powershell
netstat -ano | findstr :3003
taskkill /PID <pid> /F
```
