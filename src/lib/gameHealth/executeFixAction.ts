import { companyByTicker } from "@/data/companies";
import { generateBusinessQuestAnswers } from "@/lib/ai/generateBusinessQuestAnswers";
import { resolveQuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import {
  fetchGameHealthIssue,
  fetchGameHealthSettings,
  resolveGameHealthIssue,
  updateGameHealthSettings
} from "@/lib/gameHealth/storage";
import { runGameHealthCheck } from "@/lib/gameHealth/runGameHealthCheck";
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
      await resolveGameHealthIssue(issueId);
      return {
        ok: true,
        message: "Issue marked resolved.",
        laymanMessage: "Marked as handled. Run another health check to confirm."
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
      questSlug: (issue.questSlug as "snapshot") ?? "snapshot",
      cardIds: issue.cardId ? [issue.cardId] : ["card-1"],
      runExtractIfMissing: false,
      generationOptions: genOpts
    });

    if (result.generated > 0) {
      await resolveGameHealthIssue(issue.id);
      return {
        ok: true,
        message: `Generated ${result.generated} card(s).`,
        laymanMessage: `${company.name}'s explanation was rewritten. Ask players to refresh the quest page.`
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
  const questSlug = issue.questSlug ?? "snapshot";
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
  const questSlug = issue.questSlug ?? "snapshot";
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
