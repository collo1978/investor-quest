# Investor Quest — Capacitor mobile wrapper

The iOS and Android apps are **native shells** around the existing Next.js web app. No React Native rewrite. The public Vercel site is unchanged.

**Default entry URL:** `https://investor-quest.vercel.app/schools/demo`

---

## Architecture

| Layer | Role |
|--------|------|
| **Next.js (Vercel / `npm run dev`)** | Full app — API routes, SSR, Schools demo |
| **Capacitor WebView** | Fullscreen app chrome, status bar, splash |
| **`capacitor.config.ts`** | App id, name, `server.url` for the WebView |

Production builds load the live Vercel URL. Local development can point the WebView at your machine (`localhost` or LAN IP).

---

## Prerequisites

### All platforms

- Node 20+
- This repo cloned and `npm install` completed

### iOS (Mac only)

- Xcode 15+ (from Mac App Store)
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods (if prompted by Xcode): `sudo gem install cocoapods`

### Android

- [Android Studio](https://developer.android.com/studio) (latest stable)
- Android SDK + emulator image (API 34+ recommended)
- `ANDROID_HOME` set (Android Studio usually configures this)

---

## Production-style app (Vercel URL)

Uses `https://investor-quest.vercel.app/schools/demo` — no local server required.

```bash
npm run cap:sync
```

### iOS Simulator (Mac)

```bash
npm run cap:open:ios
```

In Xcode:

1. Select an iPhone simulator (e.g. iPhone 16).
2. Press **Run** (▶).

Or from CLI:

```bash
npm run cap:run:ios
```

### Android Emulator

```bash
npm run cap:open:android
```

In Android Studio:

1. Start an AVD (Virtual Device).
2. Press **Run** (▶).

Or:

```bash
npm run cap:run:android
```

---

## Local dev (live reload against `npm run dev`)

The Next.js dev server must be running:

```bash
npm run dev
```

Port **3003** only.

### iOS Simulator → Mac localhost

```bash
npm run cap:sync:local
npm run cap:open:ios
```

`cap:sync:local` sets `CAPACITOR_SERVER_URL=http://localhost:3003/schools/demo`.

### Android Emulator → host machine

The emulator cannot use `localhost` for your PC. Use the special alias **`10.0.2.2`**:

```bash
npm run cap:sync:android-local
npm run cap:open:android
```

### Physical phone on Wi‑Fi

Find your PC’s LAN IP (`ipconfig` on Windows, `ifconfig` on Mac), then:

```bash
# Windows PowerShell example (replace with your IP)
$env:CAPACITOR_SERVER_URL="http://192.168.1.42:3003/schools/demo"
npm run cap:sync
npm run cap:open:ios
```

Phone and PC must be on the **same Wi‑Fi**. Dev server binds `0.0.0.0` via `npm run dev`.

---

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run cap:sync` | Sync web assets + config (production Vercel URL) |
| `npm run cap:sync:local` | Sync with `http://localhost:3003/schools/demo` |
| `npm run cap:sync:android-local` | Sync with `http://10.0.2.2:3003/schools/demo` |
| `npm run cap:open:ios` | Open Xcode |
| `npm run cap:open:android` | Open Android Studio |
| `npm run cap:run:ios` | Build & run on iOS simulator/device |
| `npm run cap:run:android` | Build & run on Android emulator/device |

After changing `CAPACITOR_SERVER_URL`, always run **`npm run cap:sync`** before reopening the native IDE.

---

## App identity

| Field | Value |
|--------|--------|
| **App name** | Investor Quest |
| **App ID** | `com.investorquest.app` |
| **Start URL** | `/schools/demo` (via `server.url` in `capacitor.config.ts`) |
| **Theme / splash** | `#05010f` (dark) |

---

## Fullscreen & status bar

- Capacitor WebView has **no browser URL bar**.
- Schools demo layout uses `100dvh`, safe areas, and PWA-style fullscreen CSS.
- On native launch, `@capacitor/status-bar` sets **dark** style and `#05010f` background (`src/lib/capacitor/nativeShell.ts`).

---

## Web demo unchanged

- [https://investor-quest.vercel.app/schools/demo](https://investor-quest.vercel.app/schools/demo) works as before in Safari/Chrome.
- Capacitor only adds `ios/` and `android/` wrapper projects; no change to Vercel deploy unless you choose to ship store builds.

---

## Troubleshooting

| Issue | Fix |
|--------|-----|
| White / blank screen | Run `npm run cap:sync` again; confirm Vercel URL loads in device browser |
| Android cannot reach dev server | Use `cap:sync:android-local` (`10.0.2.2`, not `localhost`) |
| iOS ATS / HTTP blocked | Use `cap:sync:local` (cleartext enabled for `http://` URLs in config) |
| Plugin errors after install | `npm run cap:sync` |
| Xcode signing | Select your Team under **Signing & Capabilities** for device builds |

---

## Project layout

```
capacitor.config.ts      # Capacitor config (server URL, plugins)
capacitor/www/           # Minimal fallback shell copied into native projects
ios/                     # Xcode project
android/                 # Android Studio / Gradle project
src/lib/capacitor/       # Status bar + splash hooks (native only)
```
