import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { syncPromptTemplatesFromCodeDefaults } from "@/lib/supabase/promptTemplates/storage";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  try {
    const summary = await syncPromptTemplatesFromCodeDefaults();
    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
