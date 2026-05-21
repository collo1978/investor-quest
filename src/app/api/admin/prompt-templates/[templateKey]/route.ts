import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
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
    return NextResponse.json({ template: detail });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load template.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
