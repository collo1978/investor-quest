import { NextResponse } from "next/server";

import { loadPartnerCatalogWithFallback } from "@/lib/supabase/partners/fetchPartners";

export const dynamic = "force-dynamic";

/** Partner + licence catalog (Supabase when available, else demo fallback). */
export async function GET() {
  const catalog = await loadPartnerCatalogWithFallback();
  return NextResponse.json(catalog, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }
  });
}
