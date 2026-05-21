import {
  hydrateQuestContentCatalog,
  type QuestContentCatalogSource
} from "@/platform/quests/questContentRegistry";

export type QuestContentHydrationResult = {
  source: QuestContentCatalogSource;
  count: number;
};

/** Client: fetch quest catalog from API and hydrate in-memory registry. */
export async function fetchAndHydrateQuestContentCatalog(
  partnerId?: string
): Promise<QuestContentHydrationResult> {
  try {
    const qs = partnerId
      ? `?partner=${encodeURIComponent(partnerId)}`
      : "";
    const res = await fetch(`/api/quest-content/catalog${qs}`, {
      cache: "no-store"
    });
    if (!res.ok) throw new Error(`Catalog fetch failed (${res.status})`);

    const body = (await res.json()) as {
      templates?: unknown;
      source?: QuestContentCatalogSource;
    };

    if (Array.isArray(body.templates) && body.templates.length > 0) {
      hydrateQuestContentCatalog(
        body.templates as import("@/data/quests/types").QuestTemplate[],
        body.source ?? "supabase",
        partnerId ?? null
      );
      return {
        source: body.source ?? "supabase",
        count: body.templates.length
      };
    }
  } catch {
    // fall through to demo
  }

  hydrateQuestContentCatalog([], "demo", partnerId ?? null);
  return { source: "demo", count: 0 };
}
