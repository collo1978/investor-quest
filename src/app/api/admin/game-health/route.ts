import { NextResponse } from "next/server";

import { runGameHealthCheck } from "@/lib/gameHealth/runGameHealthCheck";
import {
  fetchGameHealthHistory,
  fetchGameHealthSettings,
  fetchLatestGameHealthCheck,
  fetchOpenIssues,
  updateGameHealthSettings
} from "@/lib/gameHealth/storage";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        error:
          "Supabase is not configured. Apply game_health migration and set .env.local."
      },
      { status: 503 }
    );
  }

  const [latest, history, openIssues, settings] = await Promise.all([
    fetchLatestGameHealthCheck(),
    fetchGameHealthHistory(20),
    fetchOpenIssues(30),
    fetchGameHealthSettings()
  ]);

  return NextResponse.json(
    {
      configured: true,
      latest,
      history,
      openIssues,
      settings
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  let body: { action?: string; sendAlerts?: boolean; settings?: Record<string, unknown> } =
    {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  if (body.action === "update_settings" && body.settings) {
    const s = body.settings;
    const settings = await updateGameHealthSettings({
      alertEmail:
        typeof s.alertEmail === "string" ? s.alertEmail : undefined,
      alertBelowScore:
        typeof s.alertBelowScore === "number" ? s.alertBelowScore : undefined,
      alertOnCritical:
        typeof s.alertOnCritical === "boolean" ? s.alertOnCritical : undefined,
      alertOnSlowLoading:
        typeof s.alertOnSlowLoading === "boolean"
          ? s.alertOnSlowLoading
          : undefined,
      checkIntervalMinutes:
        typeof s.checkIntervalMinutes === "number"
          ? s.checkIntervalMinutes
          : undefined
    });
    return NextResponse.json({ settings });
  }

  const check = await runGameHealthCheck({
    sendAlerts: body.sendAlerts !== false
  });

  return NextResponse.json({ check }, { headers: { "Cache-Control": "no-store" } });
}
