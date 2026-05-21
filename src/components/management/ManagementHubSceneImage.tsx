"use client";

import { IslandHubSceneImage } from "@/components/hub/IslandHubSceneImage";
import { MANAGEMENT_HUB_PLACEHOLDER_BG } from "@/components/hub/hubScenePlaceholders";
import { MANAGEMENT_HUB_IMG_SRC } from "@/lib/screenAssetUrls";

export function ManagementHubSceneImage() {
  return (
    <IslandHubSceneImage
      src={MANAGEMENT_HUB_IMG_SRC}
      placeholderBg={MANAGEMENT_HUB_PLACEHOLDER_BG}
    />
  );
}
