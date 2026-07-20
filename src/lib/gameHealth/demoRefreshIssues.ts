import {
  fetchLatestGameHealthCheck,
  fetchOpenIssues
} from "@/lib/gameHealth/storage";
import type { DemoRefreshJob } from "@/lib/demoContentRefresh/config";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/serviceClient";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function issueKeyForJob(job: DemoRefreshJob): string {
  return `demo_refresh:${job.ticker}:${job.pillarId}:${job.questSlug}`;
}

function issueKeyForCard(
  job: DemoRefreshJob,
  cardId: string
): string {
  return `${issueKeyForJob(job)}:${cardId}`;
}

export async function upsertDemoRefreshIssue(params: {
  job: DemoRefreshJob;
  cardId?: string;
  title: string;
  problemPlain: string;
  technical: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const latest = await fetchLatestGameHealthCheck();
  const checkId = latest?.id ?? null;
  const issueKey = params.cardId
    ? issueKeyForCard(params.job, params.cardId)
    : issueKeyForJob(params.job);

  const supabase = createSupabaseServiceRoleClient();
  const open = await fetchOpenIssues(200);
  const existing = open.find((o) => o.issueKey === issueKey);

  const rowPayload = {
    check_id: checkId,
    issue_key: issueKey,
    severity: "critical" as const,
    title: params.title,
    problem_plain: params.problemPlain,
    what_users_see: "Demo quest copy may sound too technical or corporate for players.",
    suggested_fix: "Tap Refresh demo content in Mission Control, or retry this quest.",
    fix_action: "retry_generation",
    company_ticker: params.job.ticker,
    company_name: params.job.companyName,
    pillar_id: params.job.pillarId,
    quest_slug: params.job.questSlug,
    card_id: params.cardId ?? null,
    status: "open",
    metadata: { technical: params.technical, source: "demo_content_refresh" },
    updated_at: new Date().toISOString()
  };

  if (existing) {
    await supabase
      .from("game_health_issues")
      .update(rowPayload)
      .eq("id", existing.id);
  } else {
    await supabase.from("game_health_issues").insert(rowPayload);
  }
}

export async function resolveDemoRefreshIssuesForJob(
  job: DemoRefreshJob
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const prefix = `demo_refresh:${job.ticker}:${job.pillarId}:${job.questSlug}`;
  const open = await fetchOpenIssues(200);
  const supabase = createSupabaseServiceRoleClient();

  for (const issue of open) {
    if (issue.issueKey.startsWith(prefix)) {
      await supabase
        .from("game_health_issues")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", issue.id);
    }
  }
}
