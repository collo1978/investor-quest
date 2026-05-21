/**
 * UI Layer — reusable primitives.
 *
 * Pure presentation components. They consume canonical data shapes
 * (e.g. `QuestDefinition` from the data layer) but never mutate state.
 */

export { ProgressBar, type ProgressBarProps } from "@/ui/components/ProgressBar";
export { XpBadge, type XpBadgeProps } from "@/ui/components/XpBadge";
export { QuestCard, type QuestCardProps } from "@/ui/components/QuestCard";
export { Modal, type ModalProps } from "@/ui/components/Modal";

export { LevelUpFx, type LevelUpFxProps } from "@/ui/effects/LevelUpFx";
export { UnlockFx, type UnlockFxProps } from "@/ui/effects/UnlockFx";
export {
  QuestCompletionFx,
  type QuestCompletionFxProps
} from "@/ui/effects/QuestCompletionFx";
export {
  ConfettiBurst,
  type ConfettiBurstProps
} from "@/ui/effects/ConfettiBurst";

export {
  useImageFrame,
  hotspotStyle,
  type NormRect
} from "@/ui/hooks/useImageHotspots";
