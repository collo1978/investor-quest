import { NextResponse } from "next/server";

import type { CompanyId } from "@/data/companies";
import { COMPANIES } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { isOpenAiConfigured, OpenAiConfigError } from "@/lib/ai/env";
import { apiErrorResponse } from "@/lib/api/errorResponse";
import { comparePromptVersions } from "@/lib/ai/comparePromptVersions";
import type { PromptDraftOverrides } from "@/lib/ai/resolveActivePrompts";
import { OpenAiRequestError } from "@/lib/ai/openaiClient";
import { pillarHasQuestPipeline } from "@/lib/quests/pillarQuestPipelineConfig";
import { getPromptTemplateDetail } from "@/lib/supabase/promptTemplates/storage";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

type CompareSide = {
  label?: string;
  versionId?: string | null;
  draft?: PromptDraftOverrides;
};

type Body = {
  templateKey?: string;
  pillarId?: PillarId;
  ticker?: string;
  companyId?: CompanyId;
  questSlug?: string;
  cardId?: string;
  sideA?: CompareSide;
  sideB?: CompareSide;
  saveEvaluations?: boolean;
};

export async function POST(request: Request) {
  if (!isOpenAiConfigured()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const templateKey = body.templateKey?.trim();
  if (!templateKey) {
    return NextResponse.json({ error: "templateKey is required." }, { status: 400 });
  }

  const detail = await getPromptTemplateDetail(templateKey);
  if (!detail) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  const pillarId = body.pillarId ?? detail.pillarId;
  if (!pillarId || !pillarHasQuestPipeline(pillarId)) {
    return NextResponse.json({ error: "Invalid pillarId." }, { status: 400 });
  }

  const ticker = body.ticker?.trim().toUpperCase();
  const questSlug = body.questSlug?.trim();
  const cardId = body.cardId?.trim();
  if (!ticker || !questSlug || !cardId) {
    return NextResponse.json(
      { error: "ticker, questSlug, and cardId are required." },
      { status: 400 }
    );
  }

  const company =
    COMPANIES.find(
      (c) =>
        c.ticker.toUpperCase() === ticker ||
        (body.companyId && c.id === body.companyId)
    ) ?? COMPANIES[0];

  try {
    const result = await comparePromptVersions({
      pillarId,
      ticker,
      companyId: company.id,
      questSlug,
      cardId,
      templateId: detail.id,
      sideA: {
        label: body.sideA?.label?.trim() || "Side A",
        versionId: body.sideA?.versionId,
        draft: body.sideA?.draft
      },
      sideB: {
        label: body.sideB?.label?.trim() || "Side B",
        versionId: body.sideB?.versionId,
        draft: body.sideB?.draft
      },
      saveEvaluations: body.saveEvaluations !== false
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (err) {
    if (err instanceof OpenAiConfigError) {
      return apiErrorResponse(
        "admin/prompt-templates/compare",
        err,
        503,
        "AI generation is not configured."
      );
    }
    if (err instanceof OpenAiRequestError) {
      return apiErrorResponse(
        "admin/prompt-templates/compare",
        err,
        err.status >= 400 && err.status < 600 ? err.status : 502,
        "AI generation request failed."
      );
    }
    return apiErrorResponse(
      "admin/prompt-templates/compare",
      err,
      500,
      "Compare failed."
    );
  }
}
