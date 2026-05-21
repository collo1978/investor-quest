import { NextResponse } from "next/server";

import { loadQuestContentCatalogWithFallback } from "@/platform/quests/questContentLoaderServer";

export const dynamic = "force-dynamic";

/** Public read — active quest templates for game (Supabase or empty → client demo fallback). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get("partner") ?? undefined;

  const catalog = await loadQuestContentCatalogWithFallback(partnerId);

  return NextResponse.json(
    {
      source: catalog.source,
      templates: catalog.templates
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
