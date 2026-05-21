import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAnalyticsPartnerId, getAnalyticsUserId } from "@/lib/analytics/identity";
import { pulseAnalyticsSession } from "@/lib/analytics/sessionTracker";
import type { TrackUserEventInput } from "@/lib/analytics/types";

/**
 * Fire-and-forget insert into `user_activity_events`.
 * Never throws — quest UX must not break if analytics fails.
 *
 * TODO: Route through server ingest with signed partner keys for production.
 * TODO: Attach school_id, cohort_id, broker_branch_id in metadata.
 */
export function trackUserEvent(input: TrackUserEventInput): void {
  if (typeof window === "undefined") return;

  const row = {
    user_id: input.userId ?? getAnalyticsUserId(),
    partner_id: input.partnerId ?? getAnalyticsPartnerId(),
    company_ticker: input.companyTicker ?? null,
    company_name: input.companyName ?? null,
    pillar: input.pillar ?? null,
    quest_id: input.questId ?? null,
    card_id: input.cardId ?? null,
    event_type: input.eventType,
    xp_amount: input.xpAmount ?? 0,
    badge_name: input.badgeName ?? null,
    conviction_status: input.convictionStatus ?? null,
    metadata: {
      tier: "basic",
      ...input.metadata
    }
  };

  void pulseAnalyticsSession({
    companyTicker: row.company_ticker ?? undefined,
    pillar: row.pillar ?? undefined
  });

  if (!isSupabaseConfigured()) {
    bufferLocalEvent(row);
    return;
  }

  void (async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("user_activity_events").insert(row);
      if (error) bufferLocalEvent(row);
    } catch {
      bufferLocalEvent(row);
    }
  })();
}

const LOCAL_BUFFER_KEY = "iq-analytics-event-buffer";
const BUFFER_MAX = 40;

function bufferLocalEvent(row: Record<string, unknown>): void {
  try {
    const raw = localStorage.getItem(LOCAL_BUFFER_KEY);
    const arr = raw ? (JSON.parse(raw) as Record<string, unknown>[]) : [];
    arr.unshift({ ...row, created_at: new Date().toISOString() });
    localStorage.setItem(
      LOCAL_BUFFER_KEY,
      JSON.stringify(arr.slice(0, BUFFER_MAX))
    );
  } catch {
    /* ignore */
  }
}

/** Parse composite slug `parent#card-1` into quest + card ids. */
export function splitQuestCardSlug(slug: string): {
  questId: string;
  cardId: string | null;
} {
  const hash = slug.indexOf("#");
  if (hash < 0) return { questId: slug, cardId: null };
  return { questId: slug.slice(0, hash), cardId: slug.slice(hash + 1) };
}
