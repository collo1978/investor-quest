import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { savePromptTemplateVersion } from "@/lib/supabase/promptTemplates/storage";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ templateKey: string }> };

export async function POST(request: Request, { params }: Params) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const { templateKey: rawKey } = await params;
  const templateKey = decodeURIComponent(rawKey);

  let body: {
    body?: string;
    model?: string;
    temperature?: number;
    changeNote?: string;
    tags?: string[];
    teachingNotes?: string;
    isRecommended?: boolean;
    createdBy?: string;
    publish?: boolean;
  } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.body?.trim()) {
    return NextResponse.json({ error: "body is required." }, { status: 400 });
  }

  try {
    const template = await savePromptTemplateVersion(templateKey, {
      body: body.body,
      model: body.model,
      temperature: body.temperature,
      changeNote: body.changeNote,
      tags: body.tags,
      teachingNotes: body.teachingNotes,
      isRecommended: body.isRecommended,
      createdBy: body.createdBy,
      publish: body.publish !== false
    });
    return NextResponse.json({ template });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
