import { PILLAR_ORDER, type PillarId } from "@/data/pillars";
import {
  CONTROLLED_DEMO_COMPANY_ID,
  CONTROLLED_DEMO_MODE
} from "@/lib/demo/controlledDemo";
import type { BadgeId } from "@/engine/progression/badges";
import {
  emptyPillarStates,
  emptySchoolsLearnerProfile,
  initialCompanyProgress,
  initialState,
  type CompanyProgress,
  type GameState,
  type PillarState
} from "@/engine/progression/state";
import { questCardCompositeSlug } from "@/lib/quests/questCardReadProgress";
import { XP_SECTION_QUIZ } from "@/engine/progression/xpEconomy";
import { computeLevel } from "@/engine/progression/xp";

export const DEMO_PROFILE_NEW_USER = "demo-new-user" as const;
export const DEMO_PROFILE_INVESTOR = "demo-preview-user" as const;

export type DemoProfileId =
  | typeof DEMO_PROFILE_NEW_USER
  | typeof DEMO_PROFILE_INVESTOR;

export type DemoProfileMeta = {
  id: DemoProfileId;
  label: string;
  description: string;
  /** Route after apply — full page navigation. */
  startRoute: string;
};

export const DEMO_PROFILE_META: Record<DemoProfileId, DemoProfileMeta> = {
  [DEMO_PROFILE_NEW_USER]: {
    id: DEMO_PROFILE_NEW_USER,
    label: "New user",
    description:
      "Demo Story Mode — scripted tour: logo intro → mission brief → logo reveal → onboarding → map brief → business quest.",
    startRoute: "/opening"
  },
  [DEMO_PROFILE_INVESTOR]: {
    id: DEMO_PROFILE_INVESTOR,
    label: "Investor preview",
    description:
      "Polished mid-trail — one section done, XP + badges, next quest ready.",
    startRoute: "/business"
  }
};

function pillarMapOnlyBusinessUnlocked(): Record<PillarId, PillarState> {
  const base = emptyPillarStates();
  const now = Date.now();
  for (const pid of PILLAR_ORDER) {
    const unlocked = pid === "business";
    base[pid] = {
      ...base[pid],
      unlocked,
      unlockedAt: unlocked ? now : null
    };
  }
  return base;
}

function pillarMapBusinessAndFinancialsUnlocked(): Record<PillarId, PillarState> {
  const base = emptyPillarStates();
  const now = Date.now();
  for (const pid of PILLAR_ORDER) {
    const unlocked = pid === "business" || pid === "financials";
    base[pid] = {
      ...base[pid],
      unlocked,
      unlockedAt: unlocked ? now : null
    };
  }
  return base;
}

function applyReadsAndCompletion(
  prog: CompanyProgress,
  pillarId: PillarId,
  slug: string,
  cardIds: string[],
  opts: { complete?: boolean }
): CompanyProgress {
  const now = Date.now();
  const pillar = prog.pillars[pillarId];
  const readSet = new Set(pillar.readQuestSlugs);
  const readAt = { ...pillar.readAt };

  for (const cardId of cardIds) {
    const composite = questCardCompositeSlug(slug, cardId);
    readSet.add(composite);
    readAt[composite] = now;
  }
  readSet.add(slug);
  readAt[slug] = now;

  let completedQuestSlugs = pillar.completedQuestSlugs;
  let completedAt = pillar.completedAt;
  if (opts.complete && !completedQuestSlugs.includes(slug)) {
    completedQuestSlugs = [...completedQuestSlugs, slug];
    completedAt = { ...completedAt, [slug]: now };
  }

  return {
    ...prog,
    pillars: {
      ...prog.pillars,
      [pillarId]: {
        ...pillar,
        readQuestSlugs: [...readSet],
        readAt,
        completedQuestSlugs,
        completedAt
      }
    }
  };
}

function buildFreshCompanyProgress(): CompanyProgress {
  return {
    ...initialCompanyProgress(),
    pillars: pillarMapOnlyBusinessUnlocked(),
    activePillarId: "business",
    activeQuestSlug: null,
    questMapBriefDismissedAt: null,
    businessIslandBriefDismissedAt: null,
    progressRevision: 1
  };
}

/** Fresh Business Island save — 0/7 complete, quest 1 unlocked, slots 2–7 locked. */
export function buildFreshSchoolsBusinessDemoProgress(): CompanyProgress {
  const now = Date.now();
  return {
    ...buildFreshCompanyProgress(),
    progressRevision: now,
    lastActivityAt: now
  };
}

function buildInvestorCompanyProgress(): CompanyProgress {
  const now = Date.now();
  const xp = XP_SECTION_QUIZ + 70;
  let prog: CompanyProgress = {
    ...initialCompanyProgress(),
    xp,
    level: computeLevel(xp),
    pillars: pillarMapBusinessAndFinancialsUnlocked(),
    badges: {
      "first-quest": { awardedAt: now },
      "quiz-pass": { awardedAt: now }
    } as CompanyProgress["badges"],
    activePillarId: "business",
    activeQuestSlug: "why-buying",
    questMapBriefDismissedAt: now,
    businessIslandBriefDismissedAt: now,
    progressRevision: 2
  };

  prog = applyReadsAndCompletion(prog, "business", "what-they-do", [
    "card-1",
    "card-2"
  ], { complete: true });

  prog = applyReadsAndCompletion(prog, "business", "why-buying", ["card-1", "card-2"], {
    complete: false
  });

  return prog;
}

/** Brand-new local demo save (does not touch remote accounts). */
export function buildNewUserDemoState(): GameState {
  if (!CONTROLLED_DEMO_MODE) {
    const base = initialState();
    return {
      ...base,
      onboarding: {
        step: 0,
        completedAt: null,
        openingScreenSeenAt: null,
        welcomeScreenSeenAt: null
      },
      companies: {
        [base.activeCompanyId]: buildFreshCompanyProgress()
      }
    };
  }

  const companyId = CONTROLLED_DEMO_COMPANY_ID;
  return {
    version: initialState().version,
    playerName: null,
    goal: null,
    activeCompanyId: companyId,
    companies: {
      [companyId]: buildFreshCompanyProgress()
    },
    unlockedCompanyIds: [companyId],
    onboarding: {
      step: 0,
      completedAt: null,
      openingScreenSeenAt: null,
      welcomeScreenSeenAt: null
    },
    lastActivityAt: null,
    schoolsProfile: emptySchoolsLearnerProfile()
  };
}

/** Polished mid-progress state for investor walkthroughs. */
export function buildInvestorDemoState(): GameState {
  const companyId = CONTROLLED_DEMO_MODE
    ? CONTROLLED_DEMO_COMPANY_ID
    : initialState().activeCompanyId;
  const now = Date.now();

  return {
    version: initialState().version,
    playerName: "Demo Investor",
    goal: "Understand NVIDIA like a real investor",
    activeCompanyId: companyId,
    companies: {
      [companyId]: buildInvestorCompanyProgress()
    },
    unlockedCompanyIds: [companyId],
    onboarding: {
      step: 3,
      completedAt: now - 60_000,
      openingScreenSeenAt: now - 60_000,
      welcomeScreenSeenAt: now - 60_000
    },
    lastActivityAt: now,
    schoolsProfile: emptySchoolsLearnerProfile()
  };
}

export function buildDemoGameState(profileId: DemoProfileId): GameState {
  return profileId === DEMO_PROFILE_NEW_USER
    ? buildNewUserDemoState()
    : buildInvestorDemoState();
}

export function getDemoProfileMeta(profileId: DemoProfileId): DemoProfileMeta {
  return DEMO_PROFILE_META[profileId];
}
