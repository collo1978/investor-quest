import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAnalyticsPartnerId, getAnalyticsUserId } from "@/lib/analytics/identity";

const SESSION_KEY = "iq-analytics-session-id";
const SESSION_IDLE_MS = 30 * 60 * 1000;

let lastPulseAt = 0;

function readSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeSessionId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, id);
  } catch {
    /* ignore */
  }
}

/**
 * Opens or resumes a learning session row in `user_sessions`.
 * TODO: Attach school cohort id / broker branch id in metadata when auth ships.
 */
export async function pulseAnalyticsSession(patch?: {
  companyTicker?: string;
  pillar?: string;
}): Promise<void> {
  if (typeof window === "undefined" || !isSupabaseConfigured()) return;

  const now = Date.now();
  if (now - lastPulseAt < 4000) return;
  lastPulseAt = now;

  const userId = getAnalyticsUserId();
  const partnerId = getAnalyticsPartnerId();
  let sessionId = readSessionId();

  const supabase = createSupabaseBrowserClient();

  if (!sessionId) {
    const { data, error } = await supabase
      .from("user_sessions")
      .insert({
        user_id: userId,
        partner_id: partnerId,
        session_start: new Date().toISOString(),
        companies_viewed: patch?.companyTicker ? [patch.companyTicker] : [],
        pillars_viewed: patch?.pillar ? [patch.pillar] : [],
        total_events: 0
      })
      .select("id")
      .single();

    if (error || !data?.id) return;
    sessionId = data.id as string;
    writeSessionId(sessionId);
    return;
  }

  const { data: existing } = await supabase
    .from("user_sessions")
    .select("session_start, companies_viewed, pillars_viewed, total_events")
    .eq("id", sessionId)
    .maybeSingle();

  if (!existing) {
    writeSessionId("");
    return;
  }

  const started = new Date(existing.session_start as string).getTime();
  if (now - started > SESSION_IDLE_MS) {
    await supabase
      .from("user_sessions")
      .update({
        session_end: new Date().toISOString(),
        duration_seconds: Math.round((now - started) / 1000)
      })
      .eq("id", sessionId);
    writeSessionId("");
    await pulseAnalyticsSession(patch);
    return;
  }

  const companies = new Set([
    ...((existing.companies_viewed as string[]) ?? []),
    ...(patch?.companyTicker ? [patch.companyTicker] : [])
  ]);
  const pillars = new Set([
    ...((existing.pillars_viewed as string[]) ?? []),
    ...(patch?.pillar ? [patch.pillar] : [])
  ]);

  await supabase
    .from("user_sessions")
    .update({
      companies_viewed: [...companies],
      pillars_viewed: [...pillars],
      total_events: (existing.total_events as number) + 1
    })
    .eq("id", sessionId);
}
