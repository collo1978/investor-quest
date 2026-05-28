import { NextResponse } from "next/server";

import { buildCardRepairChange } from "@/lib/gameHealth/cardRepairChange.server";
import type { CardRepairFixMethod } from "@/lib/gameHealth/missionControlRepairSync";
import type { CommunicationCategoryId } from "@/lib/communicationQuality/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: {
    ticker?: string;
    pillarId?: string;
    questSlug?: string;
    cardId?: string;
    beforeFlaggedText?: string;
    fixMethod?: CardRepairFixMethod;
    beforeWarnings?: Array<{
      code: string;
      categoryId?: string;
      message?: string;
      severity?: string;
    }>;
  } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { ticker, pillarId, questSlug, cardId, beforeFlaggedText } = body;
  if (!ticker || !pillarId || !questSlug || !cardId || !beforeFlaggedText) {
    return NextResponse.json(
      { error: "ticker, pillarId, questSlug, cardId, and beforeFlaggedText are required." },
      { status: 400 }
    );
  }

  try {
    const change = await buildCardRepairChange({
      ticker,
      pillarId,
      questSlug,
      cardId,
      beforeFlaggedText,
      fixMethod: body.fixMethod ?? "verify_only",
      beforeWarnings: body.beforeWarnings?.map((w) => ({
        code: w.code,
        categoryId: w.categoryId as CommunicationCategoryId,
        message: w.message ?? w.code,
        severity: w.severity === "critical" ? "critical" : "warning"
      }))
    });

    if (!change) {
      return NextResponse.json(
        { ok: false, error: "Could not load card copy for comparison." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, cardChange: change });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Preview failed."
      },
      { status: 500 }
    );
  }
}
