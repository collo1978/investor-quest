/**
 * Controlled MVP demo — NVIDIA only, four core islands.
 * Business → Financials → Forces → Management (curated demo content).
 */
import type { CompanyId } from "@/data/companies";
import { companyById } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { PILLAR_META } from "@/data/pillars";
import { findQuestDefinition } from "@/data/quests/library";
import { isForcesHubSlug } from "@/lib/sec/forcesTopicSectionMap";
import {
  isPlayableForcesTopicTemplate,
  resolveForcesQuestSlug
} from "@/lib/forces/forcesQuestRoutes";

/** Set false only for full-game dev sessions. */
export const CONTROLLED_DEMO_MODE =
  process.env.NEXT_PUBLIC_CONTROLLED_DEMO !== "false";

/** Single-company investor demo. */
export const CONTROLLED_DEMO_COMPANY_ID = "nvda" as const satisfies CompanyId;

export const CONTROLLED_DEMO_COMPANY_IDS = [
  CONTROLLED_DEMO_COMPANY_ID
] as const;

export type ControlledDemoCompanyId =
  (typeof CONTROLLED_DEMO_COMPANY_IDS)[number];

/** Islands in presenter order. */
export const CONTROLLED_DEMO_PILLAR_ORDER = [
  "business",
  "financials",
  "forces",
  "management"
] as const satisfies readonly PillarId[];

export const CONTROLLED_DEMO_COMING_SOON_PILLARS: readonly PillarId[] = [];

/** Only hub/topic slugs exposed in the demo funnel. */
export const CONTROLLED_DEMO_QUEST_SLUGS: Readonly<
  Record<(typeof CONTROLLED_DEMO_PILLAR_ORDER)[number], readonly string[]>
> = {
  business: [
    "what-they-do",
    "why-buying",
    "everyday-life",
    "how-it-works",
    "why-they-stay",
    "competition",
    "who-competes"
  ],
  financials: ["growth"],
  forces: ["forces-hub-positive-inside", "positive-inside-supply-chain"],
  management: ["mgmt-1"]
};

export const CONTROLLED_DEMO_FORCES_CATEGORY = "positive-inside" as const;

/** Canonical first quest per island for smoke tests / deep links. */
export const CONTROLLED_DEMO_ENTRY_QUEST: Record<
  (typeof CONTROLLED_DEMO_PILLAR_ORDER)[number],
  string
> = {
  business: "what-they-do",
  financials: "growth",
  forces: "positive-inside-supply-chain",
  management: "mgmt-1"
};

const BLOCKED_PATH_PREFIXES = [
  "/explore",
  "/conviction",
  "/map/final-challenge",
  "/home"
] as const;

export function getControlledDemoDefaultCompanyId(): CompanyId {
  return CONTROLLED_DEMO_MODE ? CONTROLLED_DEMO_COMPANY_ID : "aapl";
}

export function isControlledDemoCompanyId(
  id: string
): id is ControlledDemoCompanyId {
  return id === CONTROLLED_DEMO_COMPANY_ID;
}

export function getControlledDemoCompanies() {
  return [companyById(CONTROLLED_DEMO_COMPANY_ID)];
}

export function isControlledDemoPillar(
  pillarId: PillarId
): pillarId is (typeof CONTROLLED_DEMO_PILLAR_ORDER)[number] {
  return (CONTROLLED_DEMO_PILLAR_ORDER as readonly string[]).includes(pillarId);
}

export function isPillarComingSoonInControlledDemo(
  _companyId: CompanyId,
  pillarId: PillarId
): boolean {
  return CONTROLLED_DEMO_COMING_SOON_PILLARS.includes(pillarId);
}

export function isControlledDemoQuestAllowed(
  pillarId: PillarId,
  slug: string
): boolean {
  if (!CONTROLLED_DEMO_MODE) return true;
  if (!isControlledDemoPillar(pillarId)) return false;
  const resolved = pillarId === "forces" ? resolveForcesQuestSlug(slug) : slug;
  if (pillarId === "forces" && isForcesHubSlug(resolved)) return true;
  if (
    pillarId === "forces" &&
    !isPlayableForcesTopicTemplate(resolved) &&
    !isForcesHubSlug(resolved)
  ) {
    return false;
  }
  return (
    findQuestDefinition(CONTROLLED_DEMO_COMPANY_ID, pillarId, slug) != null
  );
}

export function getControlledDemoIslandNav() {
  return PILLAR_META.filter((p) => isControlledDemoPillar(p.id)).map((p) => ({
    href: p.route,
    label: p.title,
    pillarId: p.id
  }));
}

export function getControlledDemoPrimaryNav() {
  return [
    // Local preview/testing links — keep production presenter flow at `/demo`.
    ...(process.env.NODE_ENV !== "production"
      ? ([
          { href: "/bank/mobile-preview", label: "Mobile Preview" },
          { href: "/demo", label: "Demo start" },
          { href: "/opening", label: "Opening Logo" },
          { href: "/welcome", label: "Welcome Intro" }
        ] as const)
      : []),
    { href: "/onboarding", label: "Onboarding" },
    { href: "/map", label: "Map" },
    { href: "/profile", label: "Profile" }
  ] as const;
}

export function getControlledDemoMobileTabNav() {
  return [
    { href: "/map", label: "Map" },
    { href: "/profile", label: "Profile" }
  ] as const;
}

function controlledDemoQuestRedirect(pathname: string): string | null {
  const business = pathname.match(/^\/business\/([^/]+)$/);
  if (
    business &&
    !isControlledDemoQuestAllowed("business", business[1]!)
  ) {
    return `/business/${CONTROLLED_DEMO_ENTRY_QUEST.business}`;
  }

  const financials = pathname.match(/^\/financials\/([^/]+)$/);
  if (
    financials &&
    !isControlledDemoQuestAllowed("financials", financials[1]!)
  ) {
    return `/financials/${CONTROLLED_DEMO_ENTRY_QUEST.financials}`;
  }

  const forcesQuest = pathname.match(/^\/forces\/([^/]+)$/);
  if (forcesQuest && forcesQuest[1] !== "category") {
    const slug = resolveForcesQuestSlug(forcesQuest[1]);
    if (isForcesHubSlug(slug)) {
      const category = slug.replace(/^forces-hub-/, "");
      if (category) return `/forces/category/${category}`;
    }
    if (!isControlledDemoQuestAllowed("forces", slug)) {
      return `/forces/${CONTROLLED_DEMO_ENTRY_QUEST.forces}`;
    }
  }

  const management = pathname.match(/^\/management\/([^/]+)$/);
  if (
    management &&
    !isControlledDemoQuestAllowed("management", management[1]!)
  ) {
    return `/management/${CONTROLLED_DEMO_ENTRY_QUEST.management}`;
  }

  return null;
}

function controlledDemoLegacyQuestRedirect(
  pathname: string,
  search: string
): string | null {
  if (pathname !== "/quest") return null;

  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const pillar = params.get("pillar");
  const quest = params.get("quest")?.trim() ?? "";

  if (pillar === "management" && quest) {
    const target = isControlledDemoQuestAllowed("management", quest)
      ? quest
      : CONTROLLED_DEMO_ENTRY_QUEST.management;
    return `/management/${target}`;
  }

  return "/map";
}

/** Player routes outside the demo funnel → redirect target. */
export function getControlledDemoRedirect(
  pathname: string,
  search = ""
): string | null {
  if (!CONTROLLED_DEMO_MODE) return null;
  if (pathname === "/schools" || pathname.startsWith("/schools/")) return null;
  if (pathname === "/demo" || pathname.startsWith("/demo/")) return null;
  if (
    pathname === "/mobile-preview" ||
    pathname.startsWith("/bank/mobile-preview")
  ) {
    return null;
  }
  if (pathname === "/" || pathname === "/home") return "/map";

  const legacyQuest = controlledDemoLegacyQuestRedirect(pathname, search);
  if (legacyQuest) return legacyQuest;

  const questRedirect = controlledDemoQuestRedirect(pathname);
  if (questRedirect) return questRedirect;

  for (const prefix of BLOCKED_PATH_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return "/map";
    }
  }
  return null;
}

export function isControlledDemoRouteAllowed(pathname: string): boolean {
  if (!CONTROLLED_DEMO_MODE) return true;
  return getControlledDemoRedirect(pathname) === null;
}

/** Skip pre-quiz mastery interstitial — faster presenter path. */
export function useControlledDemoFastQuizHandoff(): boolean {
  return CONTROLLED_DEMO_MODE;
}
