import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updatePromptVersionMeta } from "@/lib/supabase/promptTemplates/evaluations";
import { getPromptTemplateDetail } from "@/lib/supabase/promptTemplates/storage";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ templateKey: string; versionId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const { templateKey: rawKey, versionId } = await params;
  const templateKey = decodeURIComponent(rawKey);

  let body: {
    tags?: string[];
    teachingNotes?: string;
    isRecommended?: boolean;
    changeNote?: string;
  } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    const detail = await getPromptTemplateDetail(templateKey);
    if (!detail) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    await updatePromptVersionMeta(detail.id, versionId, {
      tags: Array.isArray(body.tags)
        ? body.tags.filter((t) => typeof t === "string" && t.trim())
        : undefined,
      teachingNotes: body.teachingNotes,
      isRecommended: body.isRecommended,
      changeNote: body.changeNote
    });

    const refreshed = await getPromptTemplateDetail(templateKey);
    return NextResponse.json({ template: refreshed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
