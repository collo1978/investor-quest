import { companyByTicker } from "@/data/companies";
import { generateBusinessQuestAnswers } from "@/lib/ai/generateBusinessQuestAnswers";
import { resolveQuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import {
  fetchGameHealthIssue,
  fetchGameHealthSettings,
  resolveGameHealthIssue,
  updateGameHealthSettings
} from "@/lib/gameHealth/storage";
import type { FixActionId } from "@/lib/gameHealth/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type FixActionResult = {
  ok: boolean;
  message: string;
  laymanMessage: string;
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
