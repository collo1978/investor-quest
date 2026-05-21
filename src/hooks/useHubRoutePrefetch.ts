"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Warm quest routes while a hub is visible (matches Business hub behavior). */
export function useHubRoutePrefetch(
  cards: ReadonlyArray<{ route?: string | null }>
) {
  const router = useRouter();

  useEffect(() => {
    for (const card of cards) {
      const route = card.route?.trim();
      if (route) router.prefetch(route);
    }
  }, [router, cards]);
}
