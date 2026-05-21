"use client";

import { IslandHubSceneImage } from "@/components/hub/IslandHubSceneImage";
import { FORCES_HUB_PLACEHOLDER_BG } from "@/components/hub/hubScenePlaceholders";
import { FORCES_HUB_IMG_SRC } from "@/lib/screenAssetUrls";

export function ForcesHubSceneImage() {
  return (
    <IslandHubSceneImage
      src={FORCES_HUB_IMG_SRC}
      placeholderBg={FORCES_HUB_PLACEHOLDER_BG}
      objectPosition="top"
    />
  );
}
