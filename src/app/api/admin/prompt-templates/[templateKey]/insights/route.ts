import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPromptVersionInsights } from "@/lib/supabase/promptTemplates/evaluations";
import { getPromptTemplateDetail } from "@/lib/supabase/promptTemplates/storage";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ templateKey: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const { templateKey: rawKey } = await params;
  const templateKey = decodeURIComponent(rawKey);

  try {
    const detail = await getPromptTemplateDetail(templateKey);
    if (!detail) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    const insights = await getPromptVersionInsights(detail.id);
    const recommended = insights.filter(
      (i) => i.isRecommended || i.autoBest
    );

    return NextResponse.json({
      templateKey,
      templateId: detail.id,
      insights,
      recommended
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load insights.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
