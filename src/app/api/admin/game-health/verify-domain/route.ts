import { NextResponse } from "next/server";

import { runCommunicationQualityAudit } from "@/lib/communicationQuality";
import { buildCardRepairChange } from "@/lib/gameHealth/cardRepairChange.server";
import { domainScoreFromCommunicationReport } from "@/lib/gameHealth/recoveryIntelligence/domainScores";
import type { CardRepairFixMethod } from "@/lib/gameHealth/missionControlRepairSync";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const VALID_DOMAINS = new Set<HealthDomainId>([
  "learning_quality",
  "communication_quality"
]);

type CardBody = {
  ticker?: string;
  pillarId?: string;
  questSlug?: string;
  cardId?: string;
  beforeFlaggedText?: string;
  fixMethod?: CardRepairFixMethod;
  beforeScore?: number | null;
  beforeWarnings?: Array<{
    code: string;
    categoryId?: string;
    message?: string;
    severity?: string;
  }>;
};

export async function POST(request: Request) {
  let body: { domainId?: string; card?: CardBody } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const domainId = body.domainId as HealthDomainId | undefined;
  if (!domainId || !VALID_DOMAINS.has(domainId)) {
    return NextResponse.json(
      { error: "domainId must be learning_quality or communication_quality." },
      { status: 400 }
    );
  }

  try {
    const report = await runCommunicationQualityAudit();
    const score = domainScoreFromCommunicationReport(report, domainId);
    const cardStillFlagged =
      domainId === "learning_quality"
        ? report.cardsNeedingRegeneration.filter((t) =>
            t.findings.some((f) =>
              [
                "jargon_detection",
                "beginner_friendliness",
                "question_alignment",
                "cognitive_load",
                "conversational_tone"
              ].includes(f.categoryId ?? "")
            )
          ).length
        : report.cardsNeedingRegeneration.length;

    let cardChange = null;
    const card = body.card;
    if (
      card?.ticker &&
      card.pillarId &&
      card.questSlug &&
      card.cardId &&
      card.beforeFlaggedText
    ) {
      cardChange = await buildCardRepairChange({
        ticker: card.ticker,
        pillarId: card.pillarId,
        questSlug: card.questSlug,
        cardId: card.cardId,
        beforeFlaggedText: card.beforeFlaggedText,
        fixMethod: card.fixMethod ?? "verify_only",
        beforeScore: card.beforeScore ?? null,
        beforeWarnings: card.beforeWarnings?.map((w) => ({
          code: w.code,
          categoryId: w.categoryId as import("@/lib/communicationQuality/types").CommunicationCategoryId,
          message: w.message ?? w.code,
          severity: w.severity === "critical" ? "critical" : "warning"
        }))
      });
    }

    return NextResponse.json(
      {
        ok: true,
        domainId,
        score,
        cardsStillFlagged: cardStillFlagged,
        communicationOverall: report.overallHealthPercent,
        communicationQuality: report,
        cardChange
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Verification failed."
      },
      { status: 500 }
    );
  }
}
