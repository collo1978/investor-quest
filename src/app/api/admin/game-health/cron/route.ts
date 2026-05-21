import { NextResponse } from "next/server";

import { runGameHealthCheck } from "@/lib/gameHealth/runGameHealthCheck";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/admin/game-health/cron
 * Scheduled health check (call every 15 min from cron or dashboard timer).
 * Optional header: x-game-health-secret matches GAME_HEALTH_CRON_SECRET
 */
export async function POST(request: Request) {
  const secret = process.env.GAME_HEALTH_CRON_SECRET?.trim();
  if (secret) {
    const header = request.headers.get("x-game-health-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const check = await runGameHealthCheck({ sendAlerts: true });
  return NextResponse.json({ ok: true, check });
}
