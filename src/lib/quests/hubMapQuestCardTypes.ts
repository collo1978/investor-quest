import type { HubQuestVisualState } from "@/lib/quests/resolveHubVisualState";

/** Shared hub map card shape for all island quest maps. */
export type HubMapQuestCardData = {
  orderNumber: number;
  slug: string;
  questId: string;
  title: string;
  subtitle: string;
  /** Optional category/icon glyph (Forces hub). */
  icon?: string;
  cardCount: number;
  progressPct: number;
  route: string;
  locked: boolean;
  visualState: HubQuestVisualState;
  isPrimaryActive: boolean;
  completed: boolean;
  read: boolean;
  unlockSource?: { slug: string; title: string } | null;
  /** Prior quest completion time — scopes mystery title reveal to this unlock. */
  unlockEpoch?: number | null;
};
