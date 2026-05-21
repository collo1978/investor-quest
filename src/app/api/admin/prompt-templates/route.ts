import { NextResponse } from "next/server";

import { PROMPT_TEMPLATE_VARIABLES } from "@/lib/ai/promptDefaults";
import { isOpenAiConfigured } from "@/lib/ai/env";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  ensurePromptTemplatesSeeded,
  listPromptTemplates
} from "@/lib/supabase/promptTemplates/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        templates: [],
        variables: PROMPT_TEMPLATE_VARIABLES
      },
      { status: 503 }
    );
  }

  try {
    const templates = await listPromptTemplates();
    return NextResponse.json({
      templates,
      variables: PROMPT_TEMPLATE_VARIABLES,
      openAiConfigured: isOpenAiConfigured()
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load prompt templates.";
    return NextResponse.json({ error: message, templates: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  let body: { action?: string } = {};
  try {
    body = (await request.json()) as { action?: string };
  } catch {
    body = {};
  }

  if (body.action === "seed") {
    try {
      const seeded = await ensurePromptTemplatesSeeded();
      const templates = await listPromptTemplates();
      return NextResponse.json({ seeded, templates });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Seed failed.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
