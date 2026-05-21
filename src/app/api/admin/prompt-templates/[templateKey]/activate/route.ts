import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { activatePromptTemplateVersion } from "@/lib/supabase/promptTemplates/storage";

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

  let body: { versionId?: string } = {};
  try {
    body = (await request.json()) as { versionId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const versionId = body.versionId?.trim();
  if (!versionId) {
    return NextResponse.json({ error: "versionId is required." }, { status: 400 });
  }

  try {
    const template = await activatePromptTemplateVersion(templateKey, versionId);
    return NextResponse.json({ template });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Activate failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
