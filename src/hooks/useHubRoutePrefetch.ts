"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";

/** Warm quest routes + detail chunks while a hub is visible. */
export function useHubRoutePrefetch(
  cards: ReadonlyArray<{ route?: string | null }>
) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const prefetchedRef = useRef<string>("");

  useEffect(() => {
    if (cards.length === 0) return;
    preloadQuestDetailChunks();
    const key = cards.map((c) => c.route ?? "").join("|");
    if (prefetchedRef.current === key) return;
    prefetchedRef.current = key;
    for (const card of cards) {
      const route = card.route?.trim();
      if (!route) continue;
      try {
        routerRef.current.prefetch(route);
      } catch {
        /* ignore */
      }
    }
  }, [cards]);
}
