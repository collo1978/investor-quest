"use client";

import { IslandHubSceneImage } from "@/components/hub/IslandHubSceneImage";
import { BUSINESS_HUB_PLACEHOLDER_BG } from "@/components/hub/hubScenePlaceholders";
import { BUSINESS_HUB_IMG_SRC } from "@/lib/screenAssetUrls";

export function BusinessHubSceneImage() {
  return (
    <IslandHubSceneImage
      src={BUSINESS_HUB_IMG_SRC}
      placeholderBg={BUSINESS_HUB_PLACEHOLDER_BG}
    />
  );
}
