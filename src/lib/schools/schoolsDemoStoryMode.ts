/**
 * Schools scripted tour — independent from bank/broker {@link ../demo/demoStoryMode}.
 */

export const SCHOOLS_DEMO_STORY_SESSION_KEY = "iq-schools-demo-story-active";

export const SCHOOLS_DEMO_STORY_STEPS = [
  "logo",
  "avatar",
  "onboarding",
  "map-brief",
  "map",
  "business-island",
  "business-quest"
] as const;

export type SchoolsDemoStoryStep = (typeof SCHOOLS_DEMO_STORY_STEPS)[number];

export type SchoolsDemoStorySnapshot = {
  active: boolean;
  step: SchoolsDemoStoryStep;
  /** When true, routes use `/schools/demo/...` prefix (shareable presenter URL). */
  productionRoutes: boolean;
};

type Listener = () => void;

let snapshot: SchoolsDemoStorySnapshot = {
  active: false,
  step: "logo",
  productionRoutes: false
};
const listeners = new Set<Listener>();

export function getSchoolsDemoStorySnapshot(): SchoolsDemoStorySnapshot {
  return snapshot;
}

export function subscribeSchoolsDemoStory(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function writeSessionFlag(active: boolean): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (active) {
      sessionStorage.setItem(SCHOOLS_DEMO_STORY_SESSION_KEY, "1");
    } else {
      sessionStorage.removeItem(SCHOOLS_DEMO_STORY_SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function isSchoolsDemoStoryModeActive(): boolean {
  return snapshot.active;
}

/** Restore in-memory story flag after refresh / PWA relaunch (sessionStorage only). */
export function hydrateSchoolsDemoStoryFromSession(): void {
  if (typeof window === "undefined") return;
  if (snapshot.active) return;
  try {
    if (sessionStorage.getItem(SCHOOLS_DEMO_STORY_SESSION_KEY) !== "1") return;
  } catch {
    return;
  }
  snapshot = {
    active: true,
    step: "logo",
    productionRoutes: true
  };
  emit();
}

if (typeof window !== "undefined") {
  hydrateSchoolsDemoStoryFromSession();
}

export function isSchoolsDemoStoryProductionRoutes(): boolean {
  return snapshot.active && snapshot.productionRoutes;
}

export function getSchoolsDemoStoryStep(): SchoolsDemoStoryStep {
  return snapshot.step;
}

export function activateSchoolsDemoStory(options?: {
  productionRoutes?: boolean;
}): void {
  snapshot = {
    active: true,
    step: "logo",
    productionRoutes: options?.productionRoutes === true
  };
  writeSessionFlag(true);
  emit();
}

export function deactivateSchoolsDemoStory(): void {
  snapshot = { active: false, step: "logo", productionRoutes: false };
  writeSessionFlag(false);
  emit();
}

export function setSchoolsDemoStoryStep(step: SchoolsDemoStoryStep): void {
  if (!snapshot.active) return;
  snapshot = { ...snapshot, step };
  emit();
}

export function advanceSchoolsDemoStoryStep(next: SchoolsDemoStoryStep): void {
  if (!snapshot.active) {
    hydrateSchoolsDemoStoryFromSession();
  }
  if (!snapshot.active) return;
  const currentIdx = SCHOOLS_DEMO_STORY_STEPS.indexOf(snapshot.step);
  const nextIdx = SCHOOLS_DEMO_STORY_STEPS.indexOf(next);
  if (nextIdx < currentIdx) return;
  setSchoolsDemoStoryStep(next);
}

function basePathForStep(step: SchoolsDemoStoryStep): string {
  switch (step) {
    case "logo":
      return "/schools/opening";
    case "avatar":
      return "/schools/avatar";
    case "onboarding":
      return "/schools/onboarding";
    case "map-brief":
    case "map":
      return "/schools/map";
    case "business-island":
      return "/schools/business";
    case "business-quest":
      return "/schools/business/what-they-do";
    default:
      return "/schools/opening";
  }
}

/** Canonical route for each Schools story beat. */
export function getRouteForSchoolsDemoStoryStep(step: SchoolsDemoStoryStep): string {
  const base = basePathForStep(step);
  if (snapshot.productionRoutes) {
    return base.replace("/schools", "/schools/demo");
  }
  return base;
}

export const SCHOOLS_DEMO_STORY_PREFETCH_ROUTES = [
  "/schools/opening",
  "/schools/avatar",
  "/schools/onboarding",
  "/schools/map",
  "/schools/business",
  "/schools/business/what-they-do"
] as const;

export function ensureProductionSchoolsDemoFromPath(pathname: string): void {
  const step = schoolsDemoStepFromPathname(pathname) ?? "logo";
  snapshot = {
    active: true,
    step,
    productionRoutes: true
  };
  writeSessionFlag(true);
  emit();
}

export function schoolsDemoStepFromPathname(
  pathname: string
): SchoolsDemoStoryStep | null {
  const path = pathname.startsWith("/schools/demo")
    ? pathname.replace("/schools/demo", "/schools")
    : pathname;

  if (!path.startsWith("/schools")) return null;
  if (path === "/schools/opening") return "logo";
  if (path === "/schools/avatar") return "avatar";
  if (path.startsWith("/schools/onboarding")) return "onboarding";
  if (path === "/schools/map") return "map";
  if (path === "/schools/business") return "business-island";
  if (path.startsWith("/schools/business/")) return "business-quest";
  return null;
}
