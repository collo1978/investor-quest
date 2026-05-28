import { NextResponse } from "next/server";

import { companyByTicker } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { findQuestDefinition } from "@/data/quests/library";
import {
  CONTROLLED_DEMO_COMPANY_ID,
  CONTROLLED_DEMO_MODE
} from "@/lib/demo/controlledDemo";
import {
  appendDemoLearningDesignToUserPrompt,
  demoQuestGenerationPromptBlock
} from "@/lib/demo/nvidiaDemoLearningDesign";
import { getCuratedCardContent } from "@/lib/quests/questCardContentSource";
import { validateNvidiaDemoContentRulesCoverage } from "@/data/contentRules/validateNvidiaDemoRulesCoverage";
import { validateTickerParam } from "@/lib/sec/validateTicker";

export const dynamic = "force-dynamic";

const PILLARS: readonly PillarId[] = [
  "business",
  "financials",
  "forces",
  "management"
];

/** Demo smoke cards — one per island for tone checks. */
const DEMO_PREVIEW_CARDS: ReadonlyArray<{
  pillarId: PillarId;
  questSlug: string;
  cardId: string;
}> = [
  { pillarId: "business", questSlug: "what-they-do", cardId: "card-2" },
  { pillarId: "financials", questSlug: "growth", cardId: "card-1" },
  {
    pillarId: "forces",
    questSlug: "positive-inside-supply-chain",
    cardId: "main"
  },
  { pillarId: "management", questSlug: "mgmt-1", cardId: "card-1" }
];

/**
 * GET /api/admin/quest-generation/learning-design-preview?ticker=NVDA
 * GET ...&pillar=business&slug=snapshot&cardId=card-2
 *
 * Returns curated "before" copy + learning-design block injected into generation.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const validated = validateTickerParam(searchParams.get("ticker") ?? "NVDA");
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const company = companyByTicker(validated.ticker);
  if (!company) {
    return NextResponse.json(
      { error: `Unknown ticker: ${validated.ticker}` },
      { status: 400 }
    );
  }

  if (!CONTROLLED_DEMO_MODE || company.id !== CONTROLLED_DEMO_COMPANY_ID) {
    return NextResponse.json(
      {
        error:
          "Learning-design preview is for the NVIDIA controlled demo (NVDA) only."
      },
      { status: 400 }
    );
  }

  const pillarParam = searchParams.get("pillar") as PillarId | null;
  const slugParam = searchParams.get("slug")?.trim();
  const cardIdParam = searchParams.get("cardId")?.trim();

  const targets =
    pillarParam && slugParam && cardIdParam
      ? [{ pillarId: pillarParam, questSlug: slugParam, cardId: cardIdParam }]
      : DEMO_PREVIEW_CARDS;

  if (process.env.NODE_ENV !== "production") {
    validateNvidiaDemoContentRulesCoverage();
  }

  const cards = targets.map((t) => {
    if (!PILLARS.includes(t.pillarId)) {
      return { ...t, error: `Invalid pillar: ${t.pillarId}` };
    }

    const quest = findQuestDefinition(company.id, t.pillarId, t.questSlug);
    if (!quest) {
      return { ...t, error: "Quest not found." };
    }

    const card =
      quest.cards?.find((c) => c.id === t.cardId) ??
      (t.cardId === "main"
        ? {
            id: "main",
            investorQuestion: quest.investorQuestion,
            plainEnglishAnswer: quest.plainEnglishAnswer
          }
        : null);

    if (!card) {
      return { ...t, error: `Card ${t.cardId} not found.` };
    }

    const investorQuestion = card.investorQuestion ?? quest.investorQuestion;
    const learningDesignBlock = demoQuestGenerationPromptBlock(
      t.pillarId,
      t.questSlug,
      investorQuestion
    );
    const curated = getCuratedCardContent(
      company.id,
      t.pillarId,
      t.questSlug,
      t.cardId
    );

    return {
      pillarId: t.pillarId,
      questSlug: t.questSlug,
      cardId: t.cardId,
      questTitle: quest.title,
      investorQuestion,
      before: {
        source: "curated_override",
        plainEnglishAnswer: curated?.plainEnglishAnswer ?? null
      },
      learningDesignBlock,
      injectedRequirements: learningDesignBlock
        ? appendDemoLearningDesignToUserPrompt(
            "[SEC excerpts + card context would appear above this block in generation]",
            t.pillarId,
            t.questSlug,
            investorQuestion
          )
        : null,
      regenerateHint: {
        method: "POST",
        path: "/api/admin/quest-generation/regenerate",
        body: {
          ticker: validated.ticker,
          pillarId: t.pillarId,
          questSlug: t.questSlug,
          cardIds: [t.cardId],
          force: true,
          fast: true
        }
      }
    };
  });

  return NextResponse.json(
    {
      ticker: validated.ticker,
      companyId: company.id,
      controlledDemo: true,
      cards
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
