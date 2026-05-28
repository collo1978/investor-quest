import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

import { platformReportFromCheckRecord } from "@/lib/gameHealth/buildPlatformReport";
import {
  enrichIssueDraft,
  readResolutionIntelligence
} from "@/lib/gameHealth/resolutionIntelligence/enrichIssue";
import { RESOLUTION_METADATA_KEY } from "@/lib/gameHealth/resolutionIntelligence/types";
import type {
  GameHealthCheckRecord,
  GameHealthIssueRecord,
  GameHealthSettings,
  HealthCheckItem,
  PlatformHealthReport
} from "@/lib/gameHealth/types";

type CheckRow = {
  id: string;
  score: number;
  status_label: string;
  passed_checks: HealthCheckItem[];
  warnings: HealthCheckItem[];
  failed_checks: HealthCheckItem[];
  suggested_fixes: string[];
  slowest_route: string | null;
  duration_ms: number | null;
  created_at: string;
  platform_report?: PlatformHealthReport | null;
};

type IssueRow = {
  id: string;
  check_id: string | null;
  issue_key: string;
  severity: string;
  title: string;
  problem_plain: string;
  what_users_see: string;
  suggested_fix: string;
  fix_action: string | null;
  company_ticker: string | null;
  company_name: string | null;
  pillar_id: string | null;
  quest_slug: string | null;
  card_id: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

function mapIssue(row: IssueRow): GameHealthIssueRecord {
  return {
    id: row.id,
    checkId: row.check_id,
    issueKey: row.issue_key,
    severity: row.severity as GameHealthIssueRecord["severity"],
    title: row.title,
    problemPlain: row.problem_plain,
    whatUsersSee: row.what_users_see,
    suggestedFix: row.suggested_fix,
    fixAction: row.fix_action,
    companyTicker: row.company_ticker,
    companyName: row.company_name,
    pillarId: row.pillar_id,
    questSlug: row.quest_slug,
    cardId: row.card_id,
    status: row.status as GameHealthIssueRecord["status"],
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapCheck(row: CheckRow, issues?: GameHealthIssueRecord[]): GameHealthCheckRecord {
  const passedChecks = row.passed_checks ?? [];
  const warnings = row.warnings ?? [];
  const failedChecks = row.failed_checks ?? [];
  const platformReport = platformReportFromCheckRecord({
    passedChecks,
    warnings,
    failedChecks,
    platformReport: row.platform_report ?? null,
    score: row.score
  });

  return {
    id: row.id,
    score: row.score,
    statusLabel: platformReport.demoReadiness.status,
    passedChecks,
    warnings,
    failedChecks,
    suggestedFixes: row.suggested_fixes ?? [],
    slowestRoute: row.slowest_route,
    durationMs: row.duration_ms,
    createdAt: row.created_at,
    issues,
    platformReport
  };
}

export async function fetchGameHealthSettings(): Promise<GameHealthSettings> {
  const defaults: GameHealthSettings = {
    alertEmail: process.env.GAME_HEALTH_ALERT_EMAIL?.trim() || null,
    alertBelowScore: 80,
    alertOnCritical: true,
    alertOnSlowLoading: true,
    checkIntervalMinutes: 15,
    demoEmergencyFastMode: process.env.QUEST_FAST_DEV === "true",
    demoEmergencySkipJargon: false,
    lastAlertScore: null,
    lastAlertAt: null
  };

  if (!isSupabaseConfigured()) return defaults;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("game_health_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) return defaults;

  return {
    alertEmail: data.alert_email?.trim() || defaults.alertEmail,
    alertBelowScore: data.alert_below_score ?? 80,
    alertOnCritical: data.alert_on_critical ?? true,
    alertOnSlowLoading: data.alert_on_slow_loading ?? true,
    checkIntervalMinutes: data.check_interval_minutes ?? 15,
    demoEmergencyFastMode: data.demo_emergency_fast_mode ?? false,
    demoEmergencySkipJargon: data.demo_emergency_skip_jargon ?? false,
    lastAlertScore: data.last_alert_score,
    lastAlertAt: data.last_alert_at
  };
}

export async function updateGameHealthSettings(
  patch: Partial<GameHealthSettings>
): Promise<GameHealthSettings> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = await createSupabaseServerClient();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.alertEmail !== undefined) row.alert_email = patch.alertEmail || null;
  if (patch.alertBelowScore !== undefined) row.alert_below_score = patch.alertBelowScore;
  if (patch.alertOnCritical !== undefined) row.alert_on_critical = patch.alertOnCritical;
  if (patch.alertOnSlowLoading !== undefined) {
    row.alert_on_slow_loading = patch.alertOnSlowLoading;
  }
  if (patch.checkIntervalMinutes !== undefined) {
    row.check_interval_minutes = patch.checkIntervalMinutes;
  }
  if (patch.demoEmergencyFastMode !== undefined) {
    row.demo_emergency_fast_mode = patch.demoEmergencyFastMode;
  }
  if (patch.demoEmergencySkipJargon !== undefined) {
    row.demo_emergency_skip_jargon = patch.demoEmergencySkipJargon;
  }

  const { error } = await supabase
    .from("game_health_settings")
    .update(row)
    .eq("id", "default");

  if (error) throw new Error(error.message);
  return fetchGameHealthSettings();
}

export async function insertGameHealthCheck(input: {
  score: number;
  statusLabel: string;
  passedChecks: HealthCheckItem[];
  warnings: HealthCheckItem[];
  failedChecks: HealthCheckItem[];
  suggestedFixes: string[];
  slowestRoute: string | null;
  durationMs: number;
  issues: Omit<GameHealthIssueRecord, "id" | "checkId" | "createdAt" | "updatedAt" | "status">[];
  platformReport?: PlatformHealthReport;
}): Promise<GameHealthCheckRecord> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = await createSupabaseServerClient();

  const insertPayload: Record<string, unknown> = {
    score: input.score,
    status_label: input.statusLabel,
    passed_checks: input.passedChecks,
    warnings: input.warnings,
    failed_checks: input.failedChecks,
    suggested_fixes: input.suggestedFixes,
    slowest_route: input.slowestRoute,
    duration_ms: input.durationMs
  };

  if (input.platformReport) {
    insertPayload.platform_report = input.platformReport;
  }

  const { data: checkRow, error: checkErr } = await supabase
    .from("game_health_checks")
    .insert(insertPayload)
    .select()
    .single();

  if (checkErr?.message?.includes("platform_report")) {
    const { data: fallbackRow, error: fallbackErr } = await supabase
      .from("game_health_checks")
      .insert({
        score: input.score,
        status_label: input.statusLabel,
        passed_checks: input.passedChecks,
        warnings: input.warnings,
        failed_checks: input.failedChecks,
        suggested_fixes: input.suggestedFixes,
        slowest_route: input.slowestRoute,
        duration_ms: input.durationMs
      })
      .select()
      .single();

    if (fallbackErr || !fallbackRow) {
      throw new Error(fallbackErr?.message ?? "Failed to save health check.");
    }

    const checkId = (fallbackRow as CheckRow).id;
    const issueRecords = await syncIssuesForCheck(checkId, input.issues);
    const mapped = mapCheck(fallbackRow as CheckRow, issueRecords);
    await pruneGameHealthChecks(20);
    return { ...mapped, platformReport: input.platformReport ?? mapped.platformReport };
  }

  if (checkErr || !checkRow) {
    throw new Error(checkErr?.message ?? "Failed to save health check.");
  }

  const checkId = (checkRow as CheckRow).id;
  const issueRecords = await syncIssuesForCheck(checkId, input.issues);

  await pruneGameHealthChecks(20);

  return mapCheck(checkRow as CheckRow, issueRecords);
}

async function syncIssuesForCheck(
  checkId: string,
  drafts: Omit<
    GameHealthIssueRecord,
    "id" | "checkId" | "createdAt" | "updatedAt" | "status"
  >[]
): Promise<GameHealthIssueRecord[]> {
  const supabase = await createSupabaseServerClient();
  const activeKeys = new Set(drafts.map((d) => d.issueKey));

  const { data: openRows } = await supabase
    .from("game_health_issues")
    .select("*")
    .eq("status", "open");

  const openIssues = ((openRows ?? []) as IssueRow[]).map(mapIssue);

  for (const open of openIssues) {
    if (!activeKeys.has(open.issueKey)) {
      const resolution = readResolutionIntelligence(open.metadata);
      const canAutoClose =
        !resolution ||
        resolution.verification?.passed === true ||
        resolution.resolutionStatus === "resolved" ||
        resolution.resolutionStatus === "manually_reviewed" ||
        resolution.resolutionStatus === "auto_fixed";

      if (canAutoClose) {
        await supabase
          .from("game_health_issues")
          .update({
            status: "resolved",
            resolved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
              ...open.metadata,
              [RESOLUTION_METADATA_KEY]: resolution
                ? {
                    ...resolution,
                    resolutionStatus: "resolved",
                    resolutionHistory: [
                      ...resolution.resolutionHistory,
                      {
                        status: "resolved",
                        at: new Date().toISOString(),
                        note: "Condition no longer detected on latest audit"
                      }
                    ]
                  }
                : open.metadata[RESOLUTION_METADATA_KEY]
            }
          })
          .eq("id", open.id);
      }
    }
  }

  const results: GameHealthIssueRecord[] = [];

  for (const draft of drafts) {
    const existing = openIssues.find((o) => o.issueKey === draft.issueKey);
    const enrichedDraft = enrichIssueDraft(draft, existing ?? null);
    const rowPayload = {
      check_id: checkId,
      issue_key: enrichedDraft.issueKey,
      severity: enrichedDraft.severity,
      title: enrichedDraft.title,
      problem_plain: enrichedDraft.problemPlain,
      what_users_see: enrichedDraft.whatUsersSee,
      suggested_fix: enrichedDraft.suggestedFix,
      fix_action: enrichedDraft.fixAction,
      company_ticker: enrichedDraft.companyTicker,
      company_name: enrichedDraft.companyName,
      pillar_id: enrichedDraft.pillarId,
      quest_slug: enrichedDraft.questSlug,
      card_id: enrichedDraft.cardId,
      status: "open",
      metadata: enrichedDraft.metadata,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      const { data, error } = await supabase
        .from("game_health_issues")
        .update(rowPayload)
        .eq("id", existing.id)
        .select()
        .maybeSingle();

      if (!error && data) results.push(mapIssue(data as IssueRow));
      else results.push(existing);
    } else {
      const { data, error } = await supabase
        .from("game_health_issues")
        .insert(rowPayload)
        .select()
        .maybeSingle();

      if (!error && data) results.push(mapIssue(data as IssueRow));
    }
  }

  return results;
}

export async function pruneGameHealthChecks(keep = 20): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = await createSupabaseServerClient();
  const { data: stale } = await supabase
    .from("game_health_checks")
    .select("id")
    .order("created_at", { ascending: false })
    .range(keep, keep + 200);

  if (!stale?.length) return;

  const ids = stale.map((r) => (r as { id: string }).id);
  await supabase.from("game_health_checks").delete().in("id", ids);
}

export async function fetchLatestGameHealthCheck(): Promise<GameHealthCheckRecord | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("game_health_checks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const check = mapCheck(data as CheckRow);
  const issues = await fetchOpenIssuesForCheck(check.id);
  return { ...check, issues };
}

export async function fetchGameHealthHistory(limit = 20): Promise<GameHealthCheckRecord[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("game_health_checks")
    .select("id, score, status_label, passed_checks, warnings, failed_checks, suggested_fixes, slowest_route, duration_ms, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as CheckRow[]).map((row) => mapCheck(row));
}

export async function fetchOpenIssues(limit = 30): Promise<GameHealthIssueRecord[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("game_health_issues")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as IssueRow[]).map(mapIssue);
}

async function fetchOpenIssuesForCheck(checkId: string): Promise<GameHealthIssueRecord[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("game_health_issues")
    .select("*")
    .eq("check_id", checkId)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as IssueRow[]).map(mapIssue);
}

export async function fetchGameHealthIssue(
  issueId: string
): Promise<GameHealthIssueRecord | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("game_health_issues")
    .select("*")
    .eq("id", issueId)
    .maybeSingle();

  if (error || !data) return null;
  return mapIssue(data as IssueRow);
}

export async function resolveGameHealthIssue(issueId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const issue = await fetchGameHealthIssue(issueId);
  const supabase = await createSupabaseServerClient();

  const resolution = issue ? readResolutionIntelligence(issue.metadata) : null;
  const nextResolution = resolution
    ? {
        ...resolution,
        resolutionStatus: "resolved" as const,
        resolutionHistory: [
          ...resolution.resolutionHistory,
          {
            status: "resolved" as const,
            at: new Date().toISOString(),
            note: "Marked resolved manually"
          }
        ]
      }
    : undefined;

  await supabase
    .from("game_health_issues")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(nextResolution
        ? {
            metadata: {
              ...(issue?.metadata ?? {}),
              [RESOLUTION_METADATA_KEY]: nextResolution
            }
          }
        : {})
    })
    .eq("id", issueId);
}

export async function updateGameHealthIssueMetadata(
  issueId: string,
  metadataPatch: Record<string, unknown>
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const issue = await fetchGameHealthIssue(issueId);
  if (!issue) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("game_health_issues")
    .update({
      metadata: { ...issue.metadata, ...metadataPatch },
      updated_at: new Date().toISOString()
    })
    .eq("id", issueId);
}

const GAME_HEALTH_TABLES = [
  "game_health_checks",
  "game_health_issues",
  "game_health_settings"
] as const;

/** Confirms Mission Control tables exist in the connected Supabase project. */
export async function probeGameHealthSchema(): Promise<{
  ok: boolean;
  missingTables: string[];
  settingsRowExists: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { ok: false, missingTables: [...GAME_HEALTH_TABLES], settingsRowExists: false };
  }

  const supabase = await createSupabaseServerClient();
  const missingTables: string[] = [];

  for (const table of GAME_HEALTH_TABLES) {
    const { error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      const msg = error.message.toLowerCase();
      if (
        error.code === "42P01" ||
        msg.includes("does not exist") ||
        msg.includes("could not find the table")
      ) {
        missingTables.push(table);
      }
    }
  }

  let settingsRowExists = false;
  if (!missingTables.includes("game_health_settings")) {
    const { data } = await supabase
      .from("game_health_settings")
      .select("id")
      .eq("id", "default")
      .maybeSingle();
    settingsRowExists = Boolean(data);
  }

  return {
    ok: missingTables.length === 0,
    missingTables,
    settingsRowExists
  };
}

export async function markAlertSent(score: number): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("game_health_settings")
    .update({
      last_alert_score: score,
      last_alert_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", "default");
}
