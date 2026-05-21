"use client";

import { useEffect } from "react";

import { useQuestCatalog } from "@/components/platform/QuestContentCatalogProvider";

/**
 * @deprecated Prefer `useQuestCatalog()` — catalog is hydrated once in provider.
 * Optional `partnerId` triggers a targeted refetch (admin quest editor).
 */
export function useQuestContentHydration(partnerId?: string) {
  const catalog = useQuestCatalog();

  useEffect(() => {
    if (!partnerId) return;
    void catalog.refetch(partnerId);
  }, [partnerId, catalog.refetch]);

  return catalog;
}
