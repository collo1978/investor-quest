/**
 * Themed island scene registry — picks the right scene for a pillar id.
 *
 * Each scene renders structure + lighting + FX layers for its pillar.
 * The shared SceneShell renders the halo, water reflection, cliff, and plateau
 * around the scene.
 */

import type { PillarId } from "@/data/pillars";
import type { IslandPalette } from "@/components/map/islandTokens";
import { BusinessScene } from "./BusinessScene";
import { ForcesScene } from "./ForcesScene";
import { FinancialsScene } from "./FinancialsScene";
import { ManagementScene } from "./ManagementScene";

export type ThemedSceneProps = {
  palette: IslandPalette;
  motionOn: boolean;
  orderIndex: number;
};

export const THEMED_SCENES: Record<
  PillarId,
  (props: ThemedSceneProps) => React.ReactElement
> = {
  business: BusinessScene,
  forces: ForcesScene,
  financials: FinancialsScene,
  management: ManagementScene
};

export { SceneShell } from "./SceneShell";
export { BusinessScene, ForcesScene, FinancialsScene, ManagementScene };
