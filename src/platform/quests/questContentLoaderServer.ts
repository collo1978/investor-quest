import { loadQuestTemplatesFromSupabase } from "@/lib/supabase/quests/questContentRepository";

/** Server only — load directly from Supabase with demo fallback. */
export async function loadQuestContentCatalogWithFallback(partnerId?: string) {
  try {
    const templates = await loadQuestTemplatesFromSupabase({ partnerId });
    if (templates.length) {
      return { templates, source: "supabase" as const };
    }
  } catch {
    // demo fallback
  }
  return { templates: [], source: "demo" as const };
}
