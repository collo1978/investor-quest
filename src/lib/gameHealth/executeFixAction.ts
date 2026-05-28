import type { BusinessAiQuestSlug } from "@/app/business/businessQuestSlugs";
import { companyByTicker } from "@/data/companies";
import { canonicalBusinessQuestSlug } from "@/lib/business/businessSlugMigration";
import { isBusinessAiQuestSlug } from "@/app/business/businessQuestSlugs";
import { generateBusinessQuestAnswers } from "@/lib/ai/generateBusinessQuestAnswers";
import { resolveQuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import {
  fetchGameHealthIssue,
  fetchGameHealthSettings,
  resolveGameHealthIssue,
  updateGameHealthIssueMetadata,
  updateGameHealthSettings
} from "@/lib/gameHealth/storage";
import { runGameHealthCheck } from "@/lib/gameHealth/runGameHealthCheck";
import {
  appendResolutionHistory,
  readResolutionIntelligence
} from "@/lib/gameHealth/resolutionIntelligence/enrichIssue";
import {
  buildVerificationSnapshot,
  verifyIssueResolution
} from "@/lib/gameHealth/resolutionIntelligence/verifyIssue.server";
import { RESOLUTION_METADATA_KEY } from "@/lib/gameHealth/resolutionIntelligence/types";
import type { ResolutionStatus } from "@/lib/gameHealth/resolutionIntelligence/types";
import type {
  FixActionClientRepair,
  FixActionId
} from "@/lib/gameHealth/types";
import type { PillarId } from "@/data/pillars";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type FixActionResult = {
  ok: boolean;
  message: string;
  laymanMessage: string;
  /** Run in the mobile-fix browser after a successful server response. */
  clientRepair?: FixActionClientRepair;
  verification?: {
    passed: boolean;
    summary: string;
    beforeScore?: number | null;
    afterScore?: number | null;
  };
};

export async function executeFixAction(
  issueId: string,
  action: FixActionId
): Promise<FixActionResult> {
  const issue = await fetchGameHealthIssue(issueId);
  if (!issue) {
    return {
      ok: false,
      message: "Issue not found.",
      laymanMessage: "This fix link may be outdated. Open the health dashboard."
    };
  }

  switch (action) {
    case "mark_resolved":
      await recordResolutionStatus(
        issue,
        "manually_reviewed",
        "Marked as handled by operator",
        "mark_resolved"
      );
      await resolveGameHealthIssue(issueId);
      return {
        ok: true,
        message: "Issue marked resolved.",
        laymanMessage: "Marked as reviewed. Run Verify or another health check to confirm."
      };

    case "enable_fast_mode":
      await updateGameHealthSettings({ demoEmergencyFastMode: true });
      return {
        ok: true,
        message: "Fast mode enabled for demo emergency.",
        laymanMessage:
          "AI generation will run faster with fewer rewrite passes until you turn this off."
      };

    case "disable_heavy_checks":
      await updateGameHealthSettings({
        demoEmergencySkipJargon: true,
        demoEmergencyFastMode: true
      });
      return {
        ok: true,
        message: "Heavy jargon rewrites disabled for demo emergency.",
        laymanMessage:
          "Answers will save faster. Turn this off after your demo for best quality."
      };

    case "use_cached_answer":
      await resolveGameHealthIssue(issueId);
      return {
        ok: true,
        message: "Using last saved answer (no regeneration).",
        laymanMessage:
          "Players will keep seeing the last saved answer. Refresh the quest page."
      };

    case "clear_and_regenerate":
      return clearAndRegenerate(issue);

    case "retry_generation":
      return retryGeneration(issue);

    case "repair_quest_progress":
      return questProgressFix(issue, "repair");

    case "reset_quest_progress":
      return questProgressFix(issue, "reset");

    case "unlock_quest_quiz":
      return questProgressFix(issue, "unlock_quiz");

    case "recheck_quest_flow":
      return recheckQuestFlow(issue);

    case "verify_resolution":
      return verifyResolution(issue);

    default:
      return {
        ok: false,
        message: `Unknown action: ${action}`,
        laymanMessage: "That fix button is not recognized."
      };
  }
}

async function retryGeneration(
  issue: NonNullable<Awaited<ReturnType<typeof fetchGameHealthIssue>>>
): Promise<FixActionResult> {
  const ticker = issue.companyTicker ?? "NVDA";
  const company = companyByTicker(ticker);
  if (!company) {
    return {
      ok: false,
      message: `Unknown ticker ${ticker}`,
      laymanMessage: "Company not found in the game directory."
    };
  }

  const settings = await fetchGameHealthSettings();
  const genOpts = resolveQuestGenerationOptions({
    fastMode: settings.demoEmergencyFastMode,
    acceptJargonOnFail: settings.demoEmergencySkipJargon,
    maxJargonRewrites: settings.demoEmergencySkipJargon ? 0 : 1,
    forceRegenerate: true
  });

  try {
    const result = await generateBusinessQuestAnswers({
      ticker: company.ticker,
      companyId: company.id,
      questSlug: (() => {
        const raw = issue.questSlug?.trim();
        if (!raw) return "what-they-do" satisfies BusinessAiQuestSlug;
        const canonical = canonicalBusinessQuestSlug(raw);
        return isBusinessAiQuestSlug(canonical)
          ? canonical
          : ("what-they-do" satisfies BusinessAiQuestSlug);
      })(),
      cardIds: issue.cardId ? [issue.cardId] : ["card-1"],
      runExtractIfMissing: false,
      generationOptions: genOpts
    });

    if (result.generated > 0) {
      await recordResolutionStatus(
        issue,
        "regenerated",
        `Generated ${result.generated} card(s) — run Verify to confirm audit pass.`,
        "retry_generation"
      );
      return {
        ok: true,
        message: `Generated ${result.generated} card(s).`,
        laymanMessage: `${company.name}'s explanation was rewritten. Tap Verify fix to confirm the audit passes.`
      };
    }

    const err = result.errors[0]?.message ?? "Generation returned no cards.";
    return {
      ok: false,
      message: err,
      laymanMessage: `${company.name}'s explanation is still not ready. Try Clear & regenerate, or check the dev server.`
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return {
      ok: false,
      message,
      laymanMessage: `${company.name}'s explanation is taking longer than normal. Try again in a minute.`
    };
  }
}

async function clearAndRegenerate(
  issue: NonNullable<Awaited<ReturnType<typeof fetchGameHealthIssue>>>
): Promise<FixActionResult> {
  const ticker = (issue.companyTicker ?? "NVDA").trim().toUpperCase();
  const pillarId = issue.pillarId ?? "business";
  const questSlug = issue.questSlug
    ? canonicalBusinessQuestSlug(issue.questSlug)
    : "what-they-do";
  const cardId = issue.cardId ?? "card-1";

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase
      .from("company_quest_card_answers")
      .delete()
      .eq("ticker", ticker)
      .eq("pillar_id", pillarId)
      .eq("quest_slug", questSlug)
      .eq("card_id", cardId);
  }

  return retryGeneration(issue);
}

function questProgressFix(
  issue: NonNullable<Awaited<ReturnType<typeof fetchGameHealthIssue>>>,
  mode: "repair" | "reset" | "unlock_quiz"
): FixActionResult {
  const ticker = issue.companyTicker ?? "NVDA";
  const company = companyByTicker(ticker);
  if (!company) {
    return {
      ok: false,
      message: `Unknown ticker ${ticker}`,
      laymanMessage: "Company not found in the game directory."
    };
  }

  const pillarId = (issue.pillarId ?? "business") as PillarId;
  const questSlug = issue.questSlug
    ? canonicalBusinessQuestSlug(issue.questSlug)
    : "what-they-do";
  const meta = issue.metadata ?? {};
  const problems = Array.isArray(meta.problems) ? (meta.problems as string[]) : [];
  const cardIds =
    Array.isArray(meta.cardIds) && (meta.cardIds as string[]).length > 0
      ? (meta.cardIds as string[])
      : ["card-1", "card-2", "card-3"];

  if (
    meta.category === "quest_flow" &&
    (problems.includes("missing_quiz_config") ||
      problems.includes("completion_requires_quiz"))
  ) {
    return {
      ok: true,
      message: "Quest content must be fixed in app deploy — client repair cannot add quiz config.",
      laymanMessage:
        "This needs a new app version with quiz questions on the quest. Deploy latest main, then tap Recheck quest flow.",
      clientRepair: undefined
    };
  }

  const clientRepair: FixActionClientRepair = {
    kind: "quest_progress",
    mode,
    companyId: company.id,
    pillarId,
    questSlug,
    cardIds
  };

  return {
    ok: true,
    message: `Prepared ${mode} for ${ticker} ${questSlug} on this device.`,
    laymanMessage:
      mode === "reset"
        ? "Quest read progress on this device will be cleared. Refresh the quest page."
        : "Quest read progress on this device will be repaired so the quiz can unlock. Refresh the quest page.",
    clientRepair
  };
}

async function recheckQuestFlow(
  issue: NonNullable<Awaited<ReturnType<typeof fetchGameHealthIssue>>>
): Promise<FixActionResult> {
  try {
    const check = await runGameHealthCheck({ sendAlerts: false });
    const key = issue.issueKey;
    const stillOpen = (check.issues ?? []).some(
      (i) => i.issueKey === key && i.status === "open"
    );
    if (!stillOpen) {
      await recordResolutionStatus(
        issue,
        "auto_fixed",
        "Quest flow recheck passed",
        "recheck_quest_flow"
      );
      await resolveGameHealthIssue(issue.id);
    }
    return {
      ok: true,
      message: `Health check complete. Score ${check.score}.`,
      laymanMessage: stillOpen
        ? "Rechecked — issue may still appear until content is fixed. See Mission Control."
        : "Rechecked — this quest flow looks healthy now."
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Recheck failed.";
    return {
      ok: false,
      message,
      laymanMessage: "Could not rerun the health check. Try from Mission Control."
    };
  }
}

async function recordResolutionStatus(
  issue: NonNullable<Awaited<ReturnType<typeof fetchGameHealthIssue>>>,
  status: ResolutionStatus,
  note: string,
  action?: string
): Promise<void> {
  const existing = readResolutionIntelligence(issue.metadata);
  if (!existing) return;

  const next = appendResolutionHistory(existing, {
    status,
    at: new Date().toISOString(),
    note,
    action
  });

  await updateGameHealthIssueMetadata(issue.id, {
    [RESOLUTION_METADATA_KEY]: next
  });
}

async function verifyResolution(
  issue: NonNullable<Awaited<ReturnType<typeof fetchGameHealthIssue>>>
): Promise<FixActionResult> {
  const prior = readResolutionIntelligence(issue.metadata);
  const detectionBefore =
    typeof issue.metadata?.detectionDomainScore === "number"
      ? issue.metadata.detectionDomainScore
      : null;
  const result = await verifyIssueResolution(issue.id);
  const resultWithBefore: typeof result & { beforeScore?: number | null } = {
    ...result,
    beforeScore: result.beforeScore ?? detectionBefore
  };
  const verification = buildVerificationSnapshot(
    resultWithBefore,
    prior?.verification ??
      (detectionBefore != null
        ? {
            verifiedAt: new Date().toISOString(),
            beforeScore: detectionBefore,
            afterScore: null,
            beforeStatus: "warn",
            afterStatus: null,
            passed: false,
            summary: "Awaiting verification"
          }
        : null)
  );

  const nextStatus: ResolutionStatus = result.passed
    ? "resolved"
    : "needs_human_review";

  if (prior) {
    const next = {
      ...appendResolutionHistory(prior, {
        status: nextStatus,
        at: new Date().toISOString(),
        note: result.summary,
        action: "verify_resolution"
      }),
      verification
    };
    await updateGameHealthIssueMetadata(issue.id, {
      [RESOLUTION_METADATA_KEY]: next
    });
  }

  if (result.passed) {
    await resolveGameHealthIssue(issue.id);
  }

  return {
    ok: result.passed,
    message: result.summary,
    laymanMessage: result.passed
      ? "Verified — this issue looks fixed. Run a full health check to refresh scores."
      : `Verification incomplete: ${result.summary}`,
    verification: {
      passed: result.passed,
      summary: result.summary,
      beforeScore: verification.beforeScore,
      afterScore: verification.afterScore
    }
  };
}

/** Merge DB emergency flags into generation options for API routes. */
export async function getEmergencyGenerationOptions(): Promise<
  ReturnType<typeof resolveQuestGenerationOptions>
> {
  const settings = await fetchGameHealthSettings();
  return resolveQuestGenerationOptions({
    fastMode:
      settings.demoEmergencyFastMode || process.env.QUEST_FAST_DEV === "true",
    acceptJargonOnFail: settings.demoEmergencySkipJargon,
    maxJargonRewrites: settings.demoEmergencySkipJargon ? 0 : undefined
  });
}
