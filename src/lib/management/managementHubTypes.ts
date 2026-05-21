/** Reserved progression chrome — wire when engine exposes these fields. */
export type ManagementHubCardChrome = {
  xpPct?: number;
  completionRingPct?: number;
  streakCount?: number;
  badgeId?: string | null;
};

import type { HubQuestVisualState } from "@/lib/quests/resolveHubVisualState";

export type ManagementHubQuestCard = {
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
  chrome?: ManagementHubCardChrome;
};
