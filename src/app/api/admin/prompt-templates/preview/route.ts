import { NextResponse } from "next/server";

import type { CompanyId } from "@/data/companies";
import { COMPANIES } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { isOpenAiConfigured, OpenAiConfigError } from "@/lib/ai/env";
import { apiErrorResponse } from "@/lib/api/errorResponse";
import { runEvaluatedPreview } from "@/lib/ai/promptPreviewEvaluation";
import type { PromptDraftOverrides } from "@/lib/ai/resolveActivePrompts";
import { OpenAiRequestError } from "@/lib/ai/openaiClient";
import { pillarHasQuestPipeline } from "@/lib/quests/pillarQuestPipelineConfig";
import { getPromptTemplateDetail } from "@/lib/supabase/promptTemplates/storage";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const PILLARS: PillarId[] = ["business", "financials", "management", "forces"];

type Body = {
  pillarId?: PillarId;
  ticker?: string;
  companyId?: CompanyId;
  questSlug?: string;
  cardId?: string;
  draft?: PromptDraftOverrides;
  templateKey?: string;
  versionId?: string | null;
  saveEvaluation?: boolean;
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
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const pillarId = body.pillarId;
  if (!pillarId || !PILLARS.includes(pillarId) || !pillarHasQuestPipeline(pillarId)) {
    return NextResponse.json({ error: "Invalid pillarId." }, { status: 400 });
  }

  const ticker = body.ticker?.trim().toUpperCase();
  if (!ticker) {
    return NextResponse.json({ error: "ticker is required." }, { status: 400 });
  }

  const questSlug = body.questSlug?.trim();
  const cardId = body.cardId?.trim();
  if (!questSlug || !cardId) {
    return NextResponse.json(
      { error: "questSlug and cardId are required." },
      { status: 400 }
    );
  }

  const company =
    COMPANIES.find(
      (c) =>
        c.ticker.toUpperCase() === ticker ||
        (body.companyId && c.id === body.companyId)
    ) ?? COMPANIES[0];

  let templateId: string | undefined;
  if (body.templateKey) {
    const detail = await getPromptTemplateDetail(body.templateKey);
    templateId = detail?.id;
  }

  try {
    const result = await runEvaluatedPreview({
      pillarId,
      ticker,
      companyId: company.id,
      questSlug,
      cardId,
      draft: body.draft,
      templateId,
      versionId: body.versionId,
      saveEvaluation: body.saveEvaluation !== false && Boolean(templateId)
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (err) {
    if (err instanceof OpenAiConfigError) {
      return apiErrorResponse(
        "admin/prompt-templates/preview",
        err,
        503,
        "AI generation is not configured."
      );
    }
    if (err instanceof OpenAiRequestError) {
      return apiErrorResponse(
        "admin/prompt-templates/preview",
        err,
        err.status >= 400 && err.status < 600 ? err.status : 502,
        "AI generation request failed."
      );
    }
    return apiErrorResponse(
      "admin/prompt-templates/preview",
      err,
      500,
      "Preview generation failed."
    );
  }
}
