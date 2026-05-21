import { NextResponse } from "next/server";

import { companyByTicker } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { getCardSpecsForPillar } from "@/lib/admin/pillarGeneration";
import {
  resolveFreshPlayerQuestSlugs,
  resolveUnlockedQuestSlugs
} from "@/lib/admin/resolveUnlockedQuestSlugs";
import { pillarHasQuestPipeline } from "@/lib/quests/pillarQuestPipelineConfig";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/quest-generation/preview-slugs?ticker=AAPL&pillarId=business&mode=unlocked
 * Preview which quest slugs would be included in a batch run.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker")?.trim().toUpperCase();
  const pillarId = searchParams.get("pillarId") as PillarId | null;
  const mode = searchParams.get("mode") ?? "all";

  if (!ticker) {
    return NextResponse.json({ error: "ticker is required." }, { status: 400 });
  }

  const company = companyByTicker(ticker);
  if (!company) {
    return NextResponse.json({ error: `Unknown ticker: ${ticker}` }, { status: 400 });
  }

  const pillars: PillarId[] = pillarId
    ? pillarHasQuestPipeline(pillarId)
      ? [pillarId]
      : []
    : (["business", "financials", "management", "forces"] as PillarId[]);

  const byPillar = pillars.map((pid) => {
    const allSpecs = getCardSpecsForPillar(pid);
    const allSlugs = [...new Set(allSpecs.map((s) => s.questSlug))];

    let selected: Set<string>;
    if (mode === "fresh") {
      selected = resolveFreshPlayerQuestSlugs(company.id, pid);
    } else if (mode === "unlocked") {
      selected = resolveUnlockedQuestSlugs(company.id, pid);
    } else {
      selected = new Set(allSlugs);
    }

    const selectedSpecs = allSpecs.filter((s) => selected.has(s.questSlug));

    return {
      pillarId: pid,
      allQuestSlugs: allSlugs,
      selectedQuestSlugs: allSlugs.filter((s) => selected.has(s)),
      cardCount: selectedSpecs.length,
      cards: selectedSpecs.map((s) => ({
        questSlug: s.questSlug,
        cardId: s.cardId,
        promptFocus: s.promptFocus
      }))
    };
  });

  return NextResponse.json({
    ticker,
    companyId: company.id,
    mode,
    pillars: byPillar
  });
}
