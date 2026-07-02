import { isSchoolsDemoPath, isSchoolsPreviewPath } from "@/lib/schools/schoolsDemoHref";
import {
  SCHOOLS_DEMO_STORY_STEPS,
  isSchoolsDemoMapBriefPending,
  schoolsDemoStepFromPathname,
  type SchoolsDemoStoryStep
} from "@/lib/schools/schoolsDemoStoryMode";

/** Matches AppShell desktop sidebar width (`md:pl-[280px]`). */
export const SCHOOLS_DEV_SIDEBAR_WIDTH_PX = 280;

/** In-demo hamburger — mirrors core learner jumps (map, islands, profile). */
export const SCHOOLS_DEMO_MENU_ITEMS = [
  { label: "Quest Map", path: "/schools/map" },
  { label: "Business Island", path: "/schools/business" },
  { label: "Profile", path: "/schools/profile" },
  { label: "Pick a Company", path: "/schools/pick-company" }
] as const;

function stepIndex(step: SchoolsDemoStoryStep): number {
  return SCHOOLS_DEMO_STORY_STEPS.indexOf(step);
}

/** Map envelope brief finished — session flag or demo story past `map-brief`. */
export function isSchoolsMapMissionBriefComplete(
  activeStoryStep?: SchoolsDemoStoryStep | null,
  mapMissionBriefDismissed?: boolean
): boolean {
  if (isSchoolsDemoMapBriefPending()) return false;
  if (activeStoryStep && stepIndex(activeStoryStep) < stepIndex("map")) {
    return false;
  }
  if (mapMissionBriefDismissed === true) return true;
  if (!activeStoryStep) return false;
  return stepIndex(activeStoryStep) >= stepIndex("map");
}

function schoolsLearnerPath(pathname: string): string {
  if (isSchoolsDemoPath(pathname)) {
    return pathname.replace("/schools/demo", "/schools");
  }
  if (isSchoolsPreviewPath(pathname)) {
    return pathname.replace("/schools/preview", "/schools");
  }
  return pathname;
}

/** Map + all preview map variants (`/schools/map-prodigy`, etc.) share nav rules. */
function normalizeSchoolsNavLearnerPath(pathname: string): string {
  const learner = schoolsLearnerPath(pathname);
  if (learner === "/schools/map" || learner.startsWith("/schools/map-")) {
    return "/schools/map";
  }
  return learner;
}

/** Routes that always expose the in-demo hamburger (map onward). */
export const SCHOOLS_DEMO_MENU_HUB_PATHS = new Set([
  "/schools/map",
  "/schools/profile",
  "/schools/xp-ladder",
  "/schools/final-challenge",
  "/schools/armor-guide",
  "/schools/pick-company"
]);

const NAV_MENU_LEARNER_PATHS = SCHOOLS_DEMO_MENU_HUB_PATHS;

function isNavMenuLearnerHub(path: string): boolean {
  if (NAV_MENU_LEARNER_PATHS.has(path)) return true;
  return path.startsWith("/schools/business/");
}

function resolveNavMenuStoryStep(
  pathname: string,
  activeStoryStep?: SchoolsDemoStoryStep | null
): SchoolsDemoStoryStep | null {
  const inferred = schoolsDemoStepFromPathname(pathname);
  if (!activeStoryStep) return inferred;
  if (!inferred) return activeStoryStep;
  return stepIndex(inferred) > stepIndex(activeStoryStep) ? inferred : activeStoryStep;
}

/** Hamburger menu — visible from the map onward (after onboarding + mission brief). */
export function isSchoolsDemoNavMenuVisible(step: SchoolsDemoStoryStep): boolean {
  return stepIndex(step) >= stepIndex("map");
}

/** True on `/schools/*` and `/schools/demo/*` once the player reaches the map. */
export function shouldShowSchoolsNavMenu(
  pathname: string,
  activeStoryStep?: SchoolsDemoStoryStep | null,
  options?: { mapMissionBriefDismissed?: boolean }
): boolean {
  const learner = normalizeSchoolsNavLearnerPath(pathname);
  const preview = isSchoolsPreviewPath(pathname);

  /** Map — preview maps always show menu; live map waits for envelope brief. */
  if (learner === "/schools/map") {
    if (preview) return true;
    return isSchoolsMapMissionBriefComplete(
      activeStoryStep,
      options?.mapMissionBriefDismissed
    );
  }

  if (isNavMenuLearnerHub(learner)) return true;

  const step = resolveNavMenuStoryStep(pathname, activeStoryStep);
  if (!step) return false;
  return isSchoolsDemoNavMenuVisible(step);
}

/**
 * Localhost canonical routes use the dev sidebar on desktop — offset the menu into
 * the content column so it is not hidden under the fixed aside.
 */
/** Presenter demo + fullscreen map — hamburger anchors viewport top-left (no dev sidebar). */
export function shouldPinSchoolsNavMenuTopLeft(pathname: string): boolean {
  if (isSchoolsPreviewPath(pathname)) return true;
  if (isSchoolsDemoPath(pathname)) return true;
  return normalizeSchoolsNavLearnerPath(pathname) === "/schools/map";
}

export function shouldOffsetSchoolsNavMenuForDevSidebar(pathname: string): boolean {
  if (shouldPinSchoolsNavMenuTopLeft(pathname)) return false;
  if (!shouldShowSchoolsNavMenu(pathname)) return false;

  const learner = schoolsLearnerPath(pathname);
  const immersive =
    learner === "/schools" ||
    learner === "/schools/logo-intro" ||
    learner === "/schools/mission-brief-invitation" ||
    learner === "/schools/mission-brief-cards" ||
    learner === "/schools/logo-reveal" ||
    learner === "/schools/opening" ||
    learner === "/schools/avatar" ||
    learner === "/schools/screen5-onboarding" ||
    learner === "/schools/pick-interests" ||
    learner === "/schools/pick-company" ||
    learner === "/schools/company-reveal" ||
    learner === "/schools/profile" ||
    learner === "/schools/armor-guide";

  return !immersive;
}
