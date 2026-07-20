import { COMPANIES, companyByTicker } from "@/data/companies";
import { searchCompanies } from "@/lib/gameHealth/companySearch";
import { listStoredSectionsForTicker } from "@/lib/supabase/sec/filingStorage";
import {
  fetchGameHealthSettings,
  insertGameHealthCheck,
  markAlertSent
} from "@/lib/gameHealth/storage";
import { sendGameHealthAlertEmail } from "@/lib/gameHealth/sendHealthAlert";
import { buildPlatformHealthReport } from "@/lib/gameHealth/buildPlatformReport";
import { enrichHealthCheck, item } from "@/lib/gameHealth/enrichCheck";
import {
  communicationChecksFromReport,
  communicationIssueDraftsFromReport,
  runCommunicationQualityAudit
} from "@/lib/communicationQuality";
import { shouldSuppressLegacyCommCheck } from "@/lib/communicationQuality/actionableDisplay";
import { stampIssueDomainScores } from "@/lib/operations/stampIssueDomains";
import type {
  GameHealthCheckRecord,
  GameHealthIssueRecord,
  HealthCheckItem
} from "@/lib/gameHealth/types";
import { isOpenAiConfigured } from "@/lib/ai/env";
import { isSecApiConfigured } from "@/lib/sec/env";
import { passesQuestJargonGate } from "@/lib/quests/questJargonGate";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/serviceClient";
import { fetchQuestCardAnswersForSlug } from "@/lib/supabase/questCardAnswers/storage";
import { runQuestFlowHealthChecks } from "@/lib/gameHealth/questFlowChecks";
import {
  behavioralIssueDraftsFromScores,
  enrichIssueDraft,
  gamificationIssueDraftsFromBehavioral
} from "@/lib/gameHealth/resolutionIntelligence";

const DEMO_TICKERS = ["NVDA", "AAPL"] as const;
const PROBE_TICKER = "NVDA";
const PROBE_QUEST = "what-they-do";
const PROBE_CARD = "card-1";

function getBaseUrl(): string {
  return (
    process.env.GAME_HEALTH_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3003"
  ).replace(/\/$/, "");
}

async function timedFetch(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; ms: number; status: number; body?: unknown }> {
  const start = Date.now();
  try {
    const res = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(25_000)
    });
    const ms = Date.now() - start;
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    return { ok: res.ok, ms, status: res.status, body };
  } catch {
    return { ok: false, ms: Date.now() - start, status: 0 };
  }
}

function buildIssuesFromChecks(
  checks: HealthCheckItem[],
  checkId: string | null,
  communicationReport?: import("@/lib/communicationQuality/types").CommunicationQualityReport | null
): Omit<
  GameHealthIssueRecord,
  "id" | "checkId" | "createdAt" | "updatedAt" | "status"
>[] {
  const issues: Omit<
    GameHealthIssueRecord,
    "id" | "checkId" | "createdAt" | "updatedAt" | "status"
  >[] = [];

  for (const c of checks) {
    if (c.status === "pass") continue;
    if (c.outcomeKind && c.outcomeKind !== "actual_problem") continue;
    /** Per-card comm:* issues carry actionable detail; skip vague category-only rows. */
    if (c.id.startsWith("communication_")) continue;
    if (
      communicationReport &&
      communicationReport.cardsNeedingRegeneration.length > 0 &&
      (c.id === "jargon_gate" || c.id === "human_first_demo")
    ) {
      continue;
    }

    const severity = c.status === "fail" ? c.severity : "warning";
    let fixAction: string | null = "mark_resolved";
    let companyTicker: string | null = null;
    let companyName: string | null = null;
    let pillarId: string | null = null;
    let questSlug: string | null = null;
    let cardId: string | null = null;

    if (c.id.includes("quest_answer") || c.id.includes("empty_answer")) {
      fixAction = "retry_generation";
      companyTicker = PROBE_TICKER;
      companyName = companyByTicker(PROBE_TICKER)?.name ?? PROBE_TICKER;
      pillarId = "business";
      questSlug = PROBE_QUEST;
      cardId = PROBE_CARD;
    }
    if (c.id === "slow_map" || c.id === "slow_snapshot") {
      fixAction = "enable_fast_mode";
    }
    if (c.id === "jargon_gate") {
      fixAction = "disable_heavy_checks";
    }
    if (c.id === "quest_flow_demo") {
      fixAction = "recheck_quest_flow";
    }

    issues.push(
      enrichIssueDraft({
        issueKey: c.id,
        severity: c.severity === "critical" ? "critical" : severity,
        title: c.laymanSummary ?? c.name,
        problemPlain: c.laymanSummary ?? c.message,
        whatUsersSee:
          c.id === "quest_flow_demo"
            ? "Players may get stuck before the quiz."
            : c.status === "fail"
              ? "Players may see a blank screen, empty card, or stuck loading message."
              : "Players may notice slowness or incomplete text.",
        suggestedFix: c.suggestedFix,
        fixAction,
        companyTicker,
        companyName,
        pillarId,
        questSlug,
        cardId,
        metadata: {
          checkItemId: c.id,
          technical: c.message,
          domainId: c.domainId,
          subsectionId: c.subsectionId,
          checkType: c.checkType,
          checkOutcomeKind: c.outcomeKind
        }
      })
    );
  }

  return issues;
}

export async function runGameHealthCheck(options?: {
  sendAlerts?: boolean;
}): Promise<GameHealthCheckRecord> {
  const started = Date.now();
  const checks: HealthCheckItem[] = [];
  const routeTimings: Array<{ route: string; ms: number }> = [];

  // Supabase configured
  checks.push(
    item(
      "supabase_config",
      "Database connection",
      isSupabaseConfigured() ? "pass" : "fail",
      isSupabaseConfigured()
        ? "Supabase environment variables are set."
        : "Supabase is not configured in .env.local.",
      12,
      {
        layman: isSupabaseConfigured()
          ? undefined
          : "Saved progress and quest answers cannot load."
      }
    )
  );

  if (isSupabaseConfigured()) {
    const health = await timedFetch("/api/supabase/health");
    routeTimings.push({ route: "/api/supabase/health", ms: health.ms });
    checks.push(
      item(
        "supabase_live",
        "Database responds",
        health.ok ? "pass" : "fail",
        health.ok
          ? "Supabase API health check passed."
          : `Supabase health check failed (${health.status}).`,
        12,
        {
          layman: health.ok
            ? undefined
            : "The game cannot reach its database right now.",
          durationMs: health.ms
        }
      )
    );

    try {
      const supabase = createSupabaseServiceRoleClient();
      const t0 = Date.now();
      const { error } = await supabase
        .from("company_quest_card_answers")
        .select("id")
        .limit(1);
      const ms = Date.now() - t0;
      checks.push(
        item(
          "supabase_read",
          "Quest answers readable",
          error ? "fail" : "pass",
          error ? error.message : "Read test on quest answers succeeded.",
          10,
          {
            layman: error
              ? "Saved quest answers may not show up for players."
              : undefined,
            durationMs: ms
          }
        )
      );

      const writeStart = Date.now();
      const { error: writeError } = await supabase
        .from("game_health_settings")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", "default");
      checks.push(
        item(
          "supabase_write",
          "Database saves work",
          writeError ? "fail" : "pass",
          writeError
            ? writeError.message
            : "Write test on health settings succeeded.",
          8,
          {
            layman: writeError
              ? "Progress and quest saves may not stick for players."
              : undefined,
            durationMs: Date.now() - writeStart
          }
        )
      );
    } catch (err) {
      checks.push(
        item(
          "supabase_read",
          "Quest answers readable",
          "fail",
          err instanceof Error ? err.message : "Read failed.",
          10,
          { layman: "Saved quest answers may not show up for players." }
        )
      );
    }
  }

  // OpenAI / SEC
  checks.push(
    item(
      "openai_config",
      "AI answer generation",
      isOpenAiConfigured() ? "pass" : "fail",
      isOpenAiConfigured()
        ? "OpenAI API key is configured."
        : "OPENAI_API_KEY is missing.",
      10,
      {
        layman: isOpenAiConfigured()
          ? undefined
          : "New AI quest answers cannot be created."
      }
    )
  );

  checks.push(
    item(
      "sec_config",
      "SEC filing pull",
      isSecApiConfigured() ? "pass" : "warn",
      isSecApiConfigured()
        ? "SEC API key is configured."
        : "SEC_API_KEY is missing — extract-only quests may fail.",
      6,
      {
        layman: isSecApiConfigured()
          ? undefined
          : "Some companies may not get fresh filing data."
      }
    )
  );

  if (isSupabaseConfigured()) {
    const filings = await listStoredSectionsForTicker(PROBE_TICKER);
    const sectionCount = filings.reduce((n, f) => n + f.sections.length, 0);
    checks.push(
      item(
        "sec_extract_data",
        "SEC filing data stored",
        sectionCount > 0 ? "pass" : isSecApiConfigured() ? "warn" : "warn",
        sectionCount > 0
          ? `${sectionCount} filing section(s) stored for ${PROBE_TICKER}.`
          : `No stored 10-K sections for ${PROBE_TICKER}. Run SEC extract before generating.`,
        6,
        {
          layman:
            sectionCount === 0
              ? "AI may not have filing text to build answers from."
              : undefined
        }
      )
    );
  }

  if (isOpenAiConfigured()) {
    const aiStart = Date.now();
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        signal: AbortSignal.timeout(8_000),
        cache: "no-store"
      });
      checks.push(
        item(
          "openai_live",
          "AI service responds",
          res.ok ? "pass" : "fail",
          res.ok
            ? `OpenAI API reachable (${Date.now() - aiStart}ms).`
            : `OpenAI API error ${res.status}.`,
          8,
          {
            layman: res.ok
              ? undefined
              : "New quest answers may fail to generate right now.",
            durationMs: Date.now() - aiStart
          }
        )
      );
    } catch (err) {
      checks.push(
        item(
          "openai_live",
          "AI service responds",
          "fail",
          err instanceof Error ? err.message : "OpenAI unreachable.",
          8,
          { layman: "New quest answers may fail to generate right now." }
        )
      );
    }
  }

  // Page / API speed
  const mapProbe = await timedFetch("/map");
  routeTimings.push({ route: "/map", ms: mapProbe.ms });
  const mapSlow = mapProbe.ms > 5000;
  const mapWarn = mapProbe.ms > 2800;
  checks.push(
    item(
      "slow_map",
      "Quest map loads quickly",
      !mapProbe.ok ? "fail" : mapSlow ? "fail" : mapWarn ? "warn" : "pass",
      mapProbe.ok
        ? `Map route responded in ${mapProbe.ms}ms.`
        : "Map route did not respond.",
      8,
      {
        layman: mapSlow
          ? "The quest map may feel slow or stuck when players open it."
          : undefined,
        durationMs: mapProbe.ms
      }
    )
  );

  const catalog = await timedFetch("/api/quest-content/catalog?partner=demo-riverside-academy");
  routeTimings.push({ route: "/api/quest-content/catalog", ms: catalog.ms });
  checks.push(
    item(
      "quest_catalog",
      "Quest content catalog",
      catalog.ok ? "pass" : "fail",
      catalog.ok ? "Quest catalog API OK." : "Quest catalog API failed.",
      6,
      {
        layman: catalog.ok
          ? undefined
          : "Admin and player quest lists may be empty or broken."
      }
    )
  );

  // Company logos (static)
  const logo = await timedFetch("/logos/companies/nvda.svg");
  checks.push(
    item(
      "company_logos",
      "Company logos load",
      logo.ok ? "pass" : "warn",
      logo.ok ? "Sample company logo reachable." : "Logo file check failed.",
      4,
      { layman: logo.ok ? undefined : "Company icons may be missing on the map." }
    )
  );

  // Business snapshot API + answers
  const snapApi = await timedFetch(
    `/api/companies/${PROBE_TICKER}/business-quest-answers/${PROBE_QUEST}`
  );
  routeTimings.push({
    route: `/api/companies/${PROBE_TICKER}/business-quest-answers/${PROBE_QUEST}`,
    ms: snapApi.ms
  });

  const snapSlow = snapApi.ms > 8000;
  checks.push(
    item(
      "slow_snapshot",
      "Quest card loads quickly",
      !snapApi.ok ? "fail" : snapSlow ? "warn" : "pass",
      snapApi.ok
        ? `Snapshot answers API ${snapApi.ms}ms.`
        : `Snapshot answers API failed (${snapApi.status}).`,
      10,
      {
        layman: !snapApi.ok
          ? `${companyByTicker(PROBE_TICKER)?.name ?? PROBE_TICKER} Business Snapshot failed to load.`
          : snapSlow
            ? "Quest cards may show a long 'Drafting your answer' wait."
            : undefined,
        durationMs: snapApi.ms
      }
    )
  );

  let emptyCards = 0;
  let jargonFails = 0;
  const answerChecks: string[] = [];

  for (const ticker of DEMO_TICKERS) {
    const cards = await fetchQuestCardAnswersForSlug({
      ticker,
      pillarId: "business",
      questSlug: PROBE_QUEST
    });
    const card = cards[PROBE_CARD];
    if (!card?.plainEnglishAnswer?.trim()) {
      emptyCards++;
      answerChecks.push(`${ticker} snapshot card-1 empty`);
    } else if (!passesQuestJargonGate(card.plainEnglishAnswer, card.investorInsight)) {
      jargonFails++;
      answerChecks.push(`${ticker} answer too technical`);
    }
  }

  checks.push(
    item(
      "quest_answer_nvda",
      "NVIDIA snapshot has an answer",
      emptyCards === 0 ? "pass" : "fail",
      emptyCards === 0
        ? "Demo snapshot cards have saved answers."
        : answerChecks.join("; ") || "Missing answers.",
      14,
      {
        layman:
          emptyCards > 0
            ? `${companyByTicker(PROBE_TICKER)?.name ?? PROBE_TICKER} quest may show an empty answer card.`
            : undefined
      }
    )
  );

  checks.push(
    item(
      "empty_answer_cards",
      "No empty answer cards (demo)",
      emptyCards === 0 ? "pass" : "fail",
      emptyCards === 0 ? "No empty demo cards." : `${emptyCards} empty card(s).`,
      10,
      {
        layman:
          emptyCards > 0
            ? "Players may see an empty answer card on Business quests."
            : undefined
      }
    )
  );

  checks.push(
    item(
      "jargon_gate",
      "Answers use plain language",
      jargonFails === 0 ? "pass" : "warn",
      jargonFails === 0
        ? "Jargon gate passed on demo answers."
        : `${jargonFails} answer(s) sound too technical.`,
      6,
      {
        layman:
          jargonFails > 0
            ? "Some answers may sound like a tech article instead of everyday language."
            : undefined
      }
    )
  );

  // Prompt templates
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServiceRoleClient();
      const { data, error } = await supabase
        .from("prompt_templates")
        .select("template_key")
        .eq("pillar_id", "business")
        .limit(1);
      checks.push(
        item(
          "prompts_synced",
          "Admin prompts available",
          error || !data?.length ? "warn" : "pass",
          error
            ? error.message
            : data?.length
              ? "Prompt templates found in database."
              : "No business prompt templates in DB — sync from code.",
          6,
          {
            layman:
              !data?.length && !error
                ? "AI answers may use outdated prompt text until you sync Prompt Studio."
                : undefined
          }
        )
      );
    } catch (err) {
      checks.push(
        item(
          "prompts_synced",
          "Admin prompts available",
          "warn",
          err instanceof Error ? err.message : "Prompt check failed.",
          6
        )
      );
    }
  }

  const nvdaHits = searchCompanies("nvidia");
  const teslaHits = searchCompanies("tesla");
  checks.push(
    item(
      "company_search",
      "Company search works",
      nvdaHits.length > 0 && teslaHits.length > 0 ? "pass" : "fail",
      nvdaHits.length && teslaHits.length
        ? `Search finds NVIDIA (${nvdaHits[0]?.ticker}) and Tesla (${teslaHits[0]?.ticker}).`
        : "Company search returned no matches for demo queries.",
      5,
      {
        layman:
          nvdaHits.length === 0 || teslaHits.length === 0
            ? "Players may not find companies when they search on the map."
            : undefined
      }
    )
  );

  checks.push(
    item(
      "company_directory",
      "Company directory loaded",
      COMPANIES.length >= 4 ? "pass" : "warn",
      `${COMPANIES.length} companies in directory.`,
      3
    )
  );

  const questPage = await timedFetch("/business/what-they-do");
  routeTimings.push({ route: "/business/what-they-do", ms: questPage.ms });
  checks.push(
    item(
      "quest_page_load",
      "Quest reading page loads",
      questPage.ok ? "pass" : "fail",
      questPage.ok
        ? `Business snapshot page ${questPage.ms}ms.`
        : "Business snapshot page did not respond.",
      6,
      {
        layman: !questPage.ok
          ? "Opening a quest card may show a blank or broken page."
          : undefined,
        durationMs: questPage.ms
      }
    )
  );

  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServiceRoleClient();
      const { count, error } = await supabase
        .from("quest_content_cards")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      checks.push(
        item(
          "xp_progress_config",
          "Quest XP rewards configured",
          error ? "warn" : (count ?? 0) > 0 ? "pass" : "warn",
          error
            ? error.message
            : `${count ?? 0} active quest cards in catalog.`,
          4,
          {
            layman:
              !error && (count ?? 0) === 0
                ? "Players may not earn XP when completing quests."
                : undefined
          }
        )
      );
    } catch (err) {
      checks.push(
        item(
          "xp_progress_config",
          "Quest XP rewards configured",
          "warn",
          err instanceof Error ? err.message : "Catalog check failed.",
          4
        )
      );
    }
  }

  const questFlow = runQuestFlowHealthChecks();
  checks.push(questFlow.summaryCheck);

  let communicationReport = null;
  try {
    communicationReport = await runCommunicationQualityAudit();
    checks.push(...communicationChecksFromReport(communicationReport));
  } catch (err) {
    checks.push(
      item(
        "communication_health_overall",
        "Communication health (overall)",
        "pending",
        err instanceof Error ? err.message : "Communication audit could not complete.",
        10,
        {
          layman:
            "Mission Control could not score quest copy for beginner-friendly tone.",
          outcomeKind: "audit_unavailable"
        }
      )
    );
  }

  const platformReport = buildPlatformHealthReport(checks, communicationReport);
  const score = platformReport.overallScore;
  const statusLabel = platformReport.demoReadiness.status;
  const passed = platformReport.legacy.passedChecks;
  const warnings = platformReport.legacy.warnings;
  const failed = platformReport.legacy.failedChecks;

  const slowest = [...routeTimings].sort((a, b) => b.ms - a.ms)[0];

  const suggestedFixes = [
    ...new Set(
      failed
        .concat(warnings)
        .filter((c) => !shouldSuppressLegacyCommCheck(c.id, communicationReport))
        .map((c) => c.suggestedFix || c.message)
        .filter(Boolean)
    )
  ].slice(0, 8);

  const behavioralDrafts = behavioralIssueDraftsFromScores();
  const gamificationDrafts = gamificationIssueDraftsFromBehavioral(behavioralDrafts);

  const issueDrafts = stampIssueDomainScores(
    [
      ...buildIssuesFromChecks(failed.concat(warnings), null, communicationReport),
      ...questFlow.issueDrafts,
      ...(communicationReport
        ? communicationIssueDraftsFromReport(communicationReport, "communication_health_overall")
        : []),
      ...behavioralDrafts,
      ...gamificationDrafts
    ],
    platformReport
  );

  const durationMs = Date.now() - started;

  let record: GameHealthCheckRecord;

  if (isSupabaseConfigured()) {
    record = await insertGameHealthCheck({
      score,
      statusLabel,
      passedChecks: passed,
      warnings,
      failedChecks: failed,
      suggestedFixes,
      slowestRoute: slowest ? `${slowest.route} (${slowest.ms}ms)` : null,
      durationMs,
      issues: issueDrafts,
      platformReport
    });
  } else {
    record = {
      id: "local",
      score,
      statusLabel,
      passedChecks: passed,
      warnings,
      failedChecks: failed,
      suggestedFixes,
      slowestRoute: slowest ? `${slowest.route} (${slowest.ms}ms)` : null,
      durationMs,
      createdAt: new Date().toISOString(),
      platformReport,
      issues: issueDrafts.map((i, idx) => ({
        ...i,
        id: `local-${idx}`,
        checkId: null,
        status: "open" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    };
  }

  if (options?.sendAlerts !== false && isSupabaseConfigured()) {
    await maybeSendAlerts(record);
  }

  return record;
}

async function maybeSendAlerts(check: GameHealthCheckRecord): Promise<void> {
  const settings = await fetchGameHealthSettings();
  if (!settings.alertEmail) return;

  const openCritical = (check.issues ?? []).some((i) => i.severity === "critical");
  const slowWarning = check.warnings.some((c) =>
    c.id.startsWith("slow_")
  );
  const belowThreshold = check.score < settings.alertBelowScore;

  const shouldSend =
    (settings.alertOnCritical && openCritical) ||
    (settings.alertOnSlowLoading && slowWarning) ||
    belowThreshold;

  if (!shouldSend) return;

  if (
    settings.lastAlertScore != null &&
    settings.lastAlertAt &&
    check.score >= settings.lastAlertScore &&
    !openCritical
  ) {
    return;
  }

  const sent = await sendGameHealthAlertEmail({
    to: settings.alertEmail,
    score: check.score,
    statusLabel: check.statusLabel,
    issues: check.issues ?? [],
    fixBaseUrl: getBaseUrl()
  });

  if (sent) await markAlertSent(check.score);
}
