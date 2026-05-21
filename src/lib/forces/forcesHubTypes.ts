import type { HubQuestVisualState } from "@/lib/quests/resolveHubVisualState";

export type ForcesHubQuestCard = {
  orderNumber: number;
  slug: string;
  questId: string;
  categoryId: string;
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
};
