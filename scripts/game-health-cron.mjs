#!/usr/bin/env node
/**
 * Run scheduled game health check (for Task Scheduler / cron when dashboard is closed).
 *
 * Usage:
 *   node scripts/game-health-cron.mjs
 *
 * Env:
 *   GAME_HEALTH_BASE_URL=http://localhost:3003
 *   GAME_HEALTH_CRON_SECRET=optional-shared-secret
 */

const base =
  (process.env.GAME_HEALTH_BASE_URL || "http://localhost:3003").replace(/\/$/, "");
const secret = process.env.GAME_HEALTH_CRON_SECRET?.trim();

const headers = { "Content-Type": "application/json" };
if (secret) headers["x-game-health-secret"] = secret;

const res = await fetch(`${base}/api/admin/game-health/cron`, {
  method: "POST",
  headers
});

const text = await res.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = text;
}

if (!res.ok) {
  console.error("[game-health-cron] failed", res.status, body);
  process.exit(1);
}

const score = body?.check?.score ?? "?";
console.info("[game-health-cron] ok", { score: `${score}%`, status: body?.check?.statusLabel });
process.exit(0);
