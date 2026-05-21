import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { resetPromptTemplateToCodeDefault } from "@/lib/supabase/promptTemplates/storage";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ templateKey: string }> };

export async function POST(_request: Request, { params }: Params) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const { templateKey: rawKey } = await params;
  const templateKey = decodeURIComponent(rawKey);

  try {
    const result = await resetPromptTemplateToCodeDefault(templateKey);
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reset failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
