import { PILLAR_ORDER } from "@/data/pillars";
import type { GameState } from "@/engine/progression/state";
import { getActiveDemoProfileLabel } from "@/lib/demo/demoSessionReset";

export type DemoProgressSummary = {
  profileLabel: string | null;
  companyId: string;
  xp: number;
  level: number;
  onboardingComplete: boolean;
  openingScreenSeen: boolean;
  welcomeScreenSeen: boolean;
  introMapBriefSeen: boolean;
  introBusinessBriefSeen: boolean;
  completedQuestCount: number;
  readSlugCount: number;
  unlockedPillars: string[];
  lockedPillars: string[];
  badgeIds: string[];
};

export function summarizeDemoProgress(state: GameState): DemoProgressSummary {
  const prog = state.companies[state.activeCompanyId];
  const pillars = prog?.pillars;
  const unlockedPillars: string[] = [];
  const lockedPillars: string[] = [];

  if (pillars) {
    for (const pid of PILLAR_ORDER) {
      if (pillars[pid]?.unlocked) unlockedPillars.push(pid);
      else lockedPillars.push(pid);
    }
  }

  let completedQuestCount = 0;
  let readSlugCount = 0;
  if (pillars) {
    for (const pid of PILLAR_ORDER) {
      completedQuestCount += pillars[pid]?.completedQuestSlugs.length ?? 0;
      readSlugCount += pillars[pid]?.readQuestSlugs.length ?? 0;
    }
  }

  return {
    profileLabel: getActiveDemoProfileLabel(),
    companyId: state.activeCompanyId,
    xp: prog?.xp ?? 0,
    level: prog?.level ?? 1,
    onboardingComplete: state.onboarding.completedAt != null,
    openingScreenSeen: state.onboarding.openingScreenSeenAt != null,
    welcomeScreenSeen: state.onboarding.welcomeScreenSeenAt != null,
    introMapBriefSeen: prog?.questMapBriefDismissedAt != null,
    introBusinessBriefSeen: prog?.businessIslandBriefDismissedAt != null,
    completedQuestCount,
    readSlugCount,
    unlockedPillars,
    lockedPillars,
    badgeIds: Object.keys(prog?.badges ?? {})
  };
}
