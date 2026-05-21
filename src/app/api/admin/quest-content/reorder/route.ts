import { NextResponse } from "next/server";

import { reorderQuestContentCards } from "@/lib/supabase/quests/questContentRepository";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PillarId } from "@/data/pillars";

export const dynamic = "force-dynamic";

const PILLARS: PillarId[] = ["business", "forces", "financials", "management"];

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  let body: { pillarId?: string; orderedIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const pillarId = body.pillarId as PillarId;
  if (!pillarId || !PILLARS.includes(pillarId)) {
    return NextResponse.json({ error: "Invalid pillarId." }, { status: 400 });
  }

  if (!Array.isArray(body.orderedIds) || !body.orderedIds.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "orderedIds must be a string array." }, { status: 400 });
  }

  try {
    await reorderQuestContentCards(body.orderedIds, pillarId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reorder failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
