import { NextResponse } from "next/server";

import { companyByTicker } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { findQuestDefinition } from "@/data/quests/library";
import { resolveQuestCardDisplayContent } from "@/lib/quests/questCardContentSource";
import { fetchQuestCardAnswersForSlug } from "@/lib/supabase/questCardAnswers/storage";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { validateTickerParam } from "@/lib/sec/validateTicker";

export const dynamic = "force-dynamic";

const PILLARS: readonly PillarId[] = [
  "business",
  "financials",
  "management",
  "forces"
];

/**
 * GET /api/admin/quest-generation/card-source?ticker=AAPL&pillar=business&slug=snapshot&cardId=card-1
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const validated = validateTickerParam(searchParams.get("ticker"));
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const company = companyByTicker(validated.ticker);
  if (!company) {
    return NextResponse.json(
      { error: `Ticker ${validated.ticker} is not in the company directory.` },
      { status: 400 }
    );
  }

  const pillarId = searchParams.get("pillar") as PillarId | null;
  const questSlug = searchParams.get("slug")?.trim();
  const cardId = searchParams.get("cardId")?.trim() ?? "card-1";

  if (!pillarId || !PILLARS.includes(pillarId)) {
    return NextResponse.json(
      { error: "Query param pillar is required (business | financials | management | forces)." },
      { status: 400 }
    );
  }
  if (!questSlug) {
    return NextResponse.json(
      { error: "Query param slug is required (e.g. snapshot)." },
      { status: 400 }
    );
  }

  const quest = findQuestDefinition(company.id, pillarId, questSlug);
  if (!quest) {
    return NextResponse.json({ error: "Quest not found." }, { status: 404 });
  }

  const card =
    quest.cards?.find((c) => c.id === cardId) ??
    (cardId === "main"
      ? {
          id: "main",
          investorQuestion: quest.investorQuestion,
          plainEnglishAnswer: quest.plainEnglishAnswer,
          whyItMatters: quest.whyItMatters,
          investorInsight: quest.investorInsight
        }
      : null);

  if (!card) {
    return NextResponse.json(
      { error: `Card ${cardId} not found on quest.` },
      { status: 404 }
    );
  }

  let generatedCard = null;
  if (isSupabaseConfigured()) {
    const rows = await fetchQuestCardAnswersForSlug({
      ticker: validated.ticker,
      pillarId,
      questSlug
    });
    generatedCard = rows[cardId] ?? null;
  }

  const resolved = resolveQuestCardDisplayContent({
    companyId: company.id,
    pillarId,
    questSlug,
    cardId,
    instantiatedCard: card,
    generatedCard
  });

  return NextResponse.json({
    ticker: validated.ticker,
    companyId: company.id,
    companyName: company.name,
    pillarId,
    questSlug,
    cardId,
    investorQuestion: card.investorQuestion,
    priority: [
      "1. curated_override — src/data/quests/content/{company}.ts",
      "2. database_generated — Supabase company_quest_card_answers",
      "3. template_fallback — null until generated",
      "4. generating — pipeline in flight (UI only)"
    ],
    display: resolved,
    playerSees: resolved.source,
    playerAnswerPreview: resolved.plainEnglishAnswer
      ? preview(resolved.plainEnglishAnswer, 400)
      : null
  });
}

function preview(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}
