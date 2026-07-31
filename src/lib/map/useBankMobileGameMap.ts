"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";
import type { PillarId } from "@/data/pillars";

/** Bank/broker iframe preview on `/demo/map` — mobile game map layout. */
export function useBankMobileGameMap(): boolean {
  const pathname = usePathname();
  const isPreviewEmbed = useMobilePreviewEmbed();
  const [compactStandardMap, setCompactStandardMap] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const sync = () => setCompactStandardMap(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    (isPreviewEmbed && pathname.startsWith("/demo/map")) ||
    (pathname === "/map" && compactStandardMap)
  );
}

export { isQuestMapBusinessOnlyPlayable as isBankMobileMapPillarPlayable } from "@/lib/map/questMapProgression";
