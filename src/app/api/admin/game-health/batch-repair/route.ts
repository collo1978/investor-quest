import { NextResponse } from "next/server";

import { regenerateQuestContent } from "@/lib/admin/regenerateCompanyQuests";
import { runCommunicationQualityAudit } from "@/lib/communicationQuality";
import { domainScoreFromCommunicationReport } from "@/lib/gameHealth/recoveryIntelligence/domainScores";
import type { CommunicationRegenerationTarget } from "@/lib/communicationQuality/types";
import type { PillarId } from "@/data/pillars";
import type { RepairQueueAction } from "@/lib/operations/repairQueue";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const LEARNING_CATS = new Set([
  "jargon_detection",
  "beginner_friendliness",
  "cognitive_load",
  "conversational_tone",
  "question_alignment"
]);

type CardRef = {
  ticker: string;
  pillarId: string;
  questSlug: string;
  cardId: string;
};

function groupCards(cards: CardRef[]): Map<string, CardRef[]> {
  const byQuest = new Map<string, CardRef[]>();
  for (const c of cards) {
    const key = `${c.ticker}:${c.pillarId}:${c.questSlug}`;
    const list = byQuest.get(key) ?? [];
    list.push(c);
    byQuest.set(key, list);
  }
  return byQuest;
}

function targetToCardRef(t: CommunicationRegenerationTarget): CardRef {
  return {
    ticker: t.ticker,
    pillarId: t.pillarId,
    questSlug: t.questSlug,
    cardId: t.cardId
  };
}

function filterPlaceholderTargets(
  report: Awaited<ReturnType<typeof runCommunicationQualityAudit>>
) {
  const cards: CardRef[] = [];
  const seen = new Set<string>();

  for (const audit of report.weakContent) {
    if (
      !audit.placeholder ||
      !audit.ticker ||
      !audit.pillarId ||
      !audit.questSlug ||
      !audit.cardId
    ) {
      continue;
    }
    const key = `${audit.ticker}:${audit.pillarId}:${audit.questSlug}:${audit.cardId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cards.push({
      ticker: audit.ticker,
      pillarId: String(audit.pillarId),
      questSlug: audit.questSlug,
      cardId: audit.cardId
    });
  }

  for (const t of report.cardsNeedingRegeneration) {
    if (!t.findings.some((f) => f.code === "template_fallback")) continue;
    const key = `${t.ticker}:${t.pillarId}:${t.questSlug}:${t.cardId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cards.push(targetToCardRef(t));
  }

  return cards;
}

function filterTechnicalTargets(
  report: Awaited<ReturnType<typeof runCommunicationQualityAudit>>
) {
  const cards: CardRef[] = [];
  const seen = new Set<string>();

  for (const t of report.cardsNeedingRegeneration) {
    const technical = t.findings.some(
      (f) => f.categoryId != null && LEARNING_CATS.has(f.categoryId)
    );
    if (!technical) continue;
    const key = `${t.ticker}:${t.pillarId}:${t.questSlug}:${t.cardId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cards.push(targetToCardRef(t));
  }

  return cards;
}

async function regenerateCardBatch(cards: CardRef[], extract = false) {
  let generated = 0;
  let errors = 0;
  const grouped = groupCards(cards);

  for (const [, questCards] of grouped) {
    const first = questCards[0];
    try {
      const result = await regenerateQuestContent({
        ticker: first.ticker,
        pillarId: first.pillarId as PillarId,
        questSlug: first.questSlug,
        cardIds: questCards.map((c) => c.cardId),
        runExtractIfMissing: extract,
        generationOptions: { forceRegenerate: true, fastMode: true }
      });
      generated += result.totalGenerated;
      errors += result.totalErrors;
    } catch {
      errors += questCards.length;
    }
  }

  return { generated, errors, cardCount: cards.length };
}

export async function POST(request: Request) {
  let body: {
    action?: RepairQueueAction;
    scope?: { ticker?: string; pillarId?: string };
  } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const action = body.action;
  if (!action) {
    return NextResponse.json({ error: "action is required." }, { status: 400 });
  }

  try {
    if (action === "verify_domains") {
      const report = await runCommunicationQualityAudit();
      return NextResponse.json({
        ok: true,
        action,
        communicationQuality: report,
        learningScore: domainScoreFromCommunicationReport(report, "learning_quality"),
        communicationScore: domainScoreFromCommunicationReport(report, "communication_quality")
      });
    }

    if (action === "demo_refresh") {
      return NextResponse.json({
        ok: true,
        action,
        message: "Use Demo content refresh in Advanced — runs SEC extract + regen per quest."
      });
    }

    const report = await runCommunicationQualityAudit();
    let cards =
      action === "regenerate_placeholders"
        ? filterPlaceholderTargets(report)
        : filterTechnicalTargets(report);

    if (body.scope?.ticker) {
      cards = cards.filter(
        (c) =>
          c.ticker.toUpperCase() === body.scope!.ticker!.toUpperCase() &&
          (!body.scope?.pillarId || c.pillarId === body.scope.pillarId)
      );
    }

    if (cards.length === 0) {
      return NextResponse.json({
        ok: true,
        action,
        generated: 0,
        message: "No matching cards in the latest audit.",
        communicationQuality: report
      });
    }

    const batch = await regenerateCardBatch(
      cards,
      action === "regenerate_placeholders"
    );

    const afterReport = await runCommunicationQualityAudit();

    return NextResponse.json({
      ok: true,
      action,
      ...batch,
      communicationQuality: afterReport,
      learningScore: domainScoreFromCommunicationReport(afterReport, "learning_quality"),
      communicationScore: domainScoreFromCommunicationReport(
        afterReport,
        "communication_quality"
      )
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Batch repair failed."
      },
      { status: 500 }
    );
  }
}
