import type { HubQuestVisualState } from "@/lib/quests/resolveHubVisualState";

/** Reserved progression chrome — wire when engine exposes these fields. */
export type FinancialsHubCardChrome = {
  xpPct?: number;
  completionRingPct?: number;
  streakCount?: number;
  badgeId?: string | null;
};

export type FinancialsHubQuestCard = {
  orderNumber: number;
  slug: string;
  questId: string;
  title: string;
  subtitle: string;
  icon: string;
  cardCount: number;
  progressPct: number;
  route: string;
  locked: boolean;
  visualState: HubQuestVisualState;
  isPrimaryActive: boolean;
  isActive: boolean;
  completed: boolean;
  read: boolean;
  unlockSource?: { slug: string; title: string } | null;
  chrome?: FinancialsHubCardChrome;
};
