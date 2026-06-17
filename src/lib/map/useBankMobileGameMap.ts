"use client";

import { usePathname } from "next/navigation";

import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";
import type { PillarId } from "@/data/pillars";

/** Bank/broker iframe preview on `/demo/map` — mobile game map layout. */
export function useBankMobileGameMap(): boolean {
  const pathname = usePathname();
  const isPreviewEmbed = useMobilePreviewEmbed();
  return isPreviewEmbed && pathname.startsWith("/demo/map");
}

export { isQuestMapBusinessOnlyPlayable as isBankMobileMapPillarPlayable } from "@/lib/map/questMapProgression";
