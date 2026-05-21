import type { HubQuestVisualState } from "@/lib/quests/resolveHubVisualState";

/** Reserved progression chrome — wire when engine exposes these fields. */
export type BusinessHubCardChrome = {
  xpPct?: number;
  completionRingPct?: number;
  streakCount?: number;
  badgeId?: string | null;
};

export type BusinessHubQuestCard = {
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
  /** locked | active (in progress) | completed (100%). */
  visualState: HubQuestVisualState;
  /** Brightest “do this next” card on the island. */
  isPrimaryActive: boolean;
  isActive: boolean;
  completed: boolean;
  read: boolean;
  /** Prior hub slot that must reach 100% to unlock this card (chain). */
  unlockSource?: { slug: string; title: string } | null;
  /** Future: XP ring, streak badge, achievement — not rendered until populated. */
  chrome?: BusinessHubCardChrome;
};
