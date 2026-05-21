"use client";

import { IslandHubSceneImage } from "@/components/hub/IslandHubSceneImage";
import { FINANCIALS_HUB_PLACEHOLDER_BG } from "@/components/hub/hubScenePlaceholders";
import { FINANCIAL_HUB_IMG_SRC } from "@/lib/screenAssetUrls";

export function FinancialsHubSceneImage() {
  return (
    <IslandHubSceneImage
      src={FINANCIAL_HUB_IMG_SRC}
      placeholderBg={FINANCIALS_HUB_PLACEHOLDER_BG}
    />
  );
}
