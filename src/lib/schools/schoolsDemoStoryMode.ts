/**
 * Schools scripted tour — independent from bank/broker {@link ../demo/demoStoryMode}.
 */

export const SCHOOLS_DEMO_STORY_SESSION_KEY = "iq-schools-demo-story-active";

/** Set only by {@link markSchoolsDemoLaunched} — sidebar “Schools Live Demo” entry. */
export const SCHOOLS_DEMO_STORY_LAUNCHED_KEY = "iq-schools-demo-story-launched";

export const SCHOOLS_DEMO_STORY_STEPS = [
  "logo",
  "avatar",
  "onboarding",
  "map-brief",
  "map",
  "business-island",
  "business-quest",
  "conviction",
  "profile",
  "xp-ladder",
  "final-challenge",
  "map-return"
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

function writeLaunchedFlag(launched: boolean): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (launched) {
      sessionStorage.setItem(SCHOOLS_DEMO_STORY_LAUNCHED_KEY, "1");
    } else {
      sessionStorage.removeItem(SCHOOLS_DEMO_STORY_LAUNCHED_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** True after explicit `/schools/demo` launch (sidebar Schools Live Demo). */
export function wasSchoolsDemoLaunchedInSession(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(SCHOOLS_DEMO_STORY_LAUNCHED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Call from {@link launchSchoolsProductionDemo} only. */
export function markSchoolsDemoLaunched(): void {
  writeLaunchedFlag(true);
}

export function isSchoolsDemoStoryModeActive(): boolean {
  return snapshot.active;
}

/**
 * Restore presenter demo after refresh — only under `/schools/demo/*`.
 * Canonical `/schools/*` dev links must not resurrect a prior demo session.
 */
export function hydrateSchoolsDemoStoryFromSession(pathname: string): void {
  if (typeof window === "undefined") return;
  if (snapshot.active) return;
  if (!pathname.startsWith("/schools/demo")) return;
  if (!wasSchoolsDemoLaunchedInSession()) return;
  try {
    if (sessionStorage.getItem(SCHOOLS_DEMO_STORY_SESSION_KEY) !== "1") return;
  } catch {
    return;
  }
  ensureProductionSchoolsDemoFromPath(pathname);
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
  writeLaunchedFlag(false);
  emit();
}

export function setSchoolsDemoStoryStep(step: SchoolsDemoStoryStep): void {
  if (!snapshot.active) return;
  snapshot = { ...snapshot, step };
  emit();
}

export function advanceSchoolsDemoStoryStep(next: SchoolsDemoStoryStep): void {
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
      return "/schools/screen5-onboarding";
    case "map-brief":
    case "map":
      return "/schools/map";
    case "business-island":
      return "/schools/business";
    case "business-quest":
      return "/schools/business/what-they-do";
    case "conviction":
      return "/schools/business";
    case "profile":
      return "/schools/profile";
    case "xp-ladder":
      return "/schools/xp-ladder";
    case "final-challenge":
      return "/schools/final-challenge";
    case "map-return":
      return "/schools/map";
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
  "/schools/screen5-onboarding",
  "/schools/pick-interests",
  "/schools/company-reveal",
  "/schools/map",
  "/schools/business",
  "/schools/business/what-they-do",
  "/schools/profile",
  "/schools/xp-ladder",
  "/schools/final-challenge"
] as const;

function stepIndex(step: SchoolsDemoStoryStep): number {
  return SCHOOLS_DEMO_STORY_STEPS.indexOf(step);
}

/**
 * Deep-link bootstrap — never downgrade story step from pathname alone.
 * `map-brief` and `map` share `/schools/map`; preserve `map-brief` until dismissed.
 */
export function ensureProductionSchoolsDemoFromPath(pathname: string): void {
  if (!pathname.startsWith("/schools/demo")) return;
  if (!wasSchoolsDemoLaunchedInSession()) return;

  const inferred = schoolsDemoStepFromPathname(pathname) ?? "logo";
  let step = inferred;

  if (snapshot.active) {
    const currentIdx = stepIndex(snapshot.step);
    const inferredIdx = stepIndex(inferred);

    if (snapshot.step === "map-brief" && inferred === "map") {
      step = "map-brief";
    } else if (currentIdx > inferredIdx) {
      step = snapshot.step;
    }
  }

  const next: SchoolsDemoStorySnapshot = {
    active: true,
    step,
    productionRoutes: true
  };
  if (
    snapshot.active === next.active &&
    snapshot.step === next.step &&
    snapshot.productionRoutes === next.productionRoutes
  ) {
    return;
  }

  snapshot = next;
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
  if (
    path === "/schools/onboarding" ||
    path === "/schools/screen5-onboarding" ||
    path === "/schools/pick-interests" ||
    path === "/schools/company-reveal"
  ) {
    return "onboarding";
  }
  if (path === "/schools/map") return "map";
  if (path === "/schools/business") return "business-island";
  if (path.startsWith("/schools/business/")) return "business-quest";
  if (path === "/schools/profile") return "profile";
  if (path === "/schools/xp-ladder") return "xp-ladder";
  if (path === "/schools/final-challenge") return "final-challenge";
  return null;
}
