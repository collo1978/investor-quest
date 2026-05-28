/**
 * Demo Story Mode — scripted product tour, independent of localStorage funnel flags.
 * Module snapshot is readable from GameProvider without React (persistence gates).
 */

export const DEMO_STORY_SESSION_KEY = "iq-demo-story-active";

export const DEMO_STORY_STEPS = [
  "logo",
  "welcome",
  "onboarding",
  "map-brief",
  "map",
  "business-island",
  "business-quest"
] as const;

export type DemoStoryStep = (typeof DEMO_STORY_STEPS)[number];

export type DemoStorySnapshot = {
  active: boolean;
  step: DemoStoryStep;
  /** When true, routes use `/demo/...` prefix (production presenter URL). */
  productionRoutes: boolean;
};

type Listener = () => void;

let snapshot: DemoStorySnapshot = {
  active: false,
  step: "logo",
  productionRoutes: false
};
const listeners = new Set<Listener>();

export function getDemoStorySnapshot(): DemoStorySnapshot {
  return snapshot;
}

export function subscribeDemoStory(listener: Listener): () => void {
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
      sessionStorage.setItem(DEMO_STORY_SESSION_KEY, "1");
    } else {
      sessionStorage.removeItem(DEMO_STORY_SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function isDemoStoryModeActive(): boolean {
  return snapshot.active;
}

export function isDemoStoryProductionRoutes(): boolean {
  return snapshot.active && snapshot.productionRoutes;
}

export function getDemoStoryStep(): DemoStoryStep {
  return snapshot.step;
}

export function activateDemoStory(options?: { productionRoutes?: boolean }): void {
  snapshot = {
    active: true,
    step: "logo",
    productionRoutes: options?.productionRoutes === true
  };
  writeSessionFlag(true);
  emit();
}

export function deactivateDemoStory(): void {
  snapshot = { active: false, step: "logo", productionRoutes: false };
  writeSessionFlag(false);
  emit();
}

export function setDemoStoryStep(step: DemoStoryStep): void {
  if (!snapshot.active) return;
  snapshot = { ...snapshot, step };
  emit();
}

export function advanceDemoStoryStep(next: DemoStoryStep): void {
  if (!snapshot.active) return;
  const currentIdx = DEMO_STORY_STEPS.indexOf(snapshot.step);
  const nextIdx = DEMO_STORY_STEPS.indexOf(next);
  if (nextIdx < currentIdx) return;
  setDemoStoryStep(next);
}

function basePathForStep(step: DemoStoryStep): string {
  switch (step) {
    case "logo":
      return "/opening";
    case "welcome":
      return "/welcome";
    case "onboarding":
      return "/onboarding";
    case "map-brief":
    case "map":
      return "/map";
    case "business-island":
      return "/business";
    case "business-quest":
      return "/business/what-they-do";
    default:
      return "/opening";
  }
}

/** Canonical route for each story beat (map-brief uses /map + overlay). */
export function getRouteForDemoStoryStep(step: DemoStoryStep): string {
  const base = basePathForStep(step);
  if (snapshot.productionRoutes) {
    return `/demo${base}`;
  }
  return base;
}

/** Routes to warm when the story starts (app paths, prefix applied in launch). */
export const DEMO_STORY_PREFETCH_ROUTES = [
  "/opening",
  "/welcome",
  "/onboarding",
  "/map",
  "/business",
  "/business/what-they-do"
] as const;

export function ensureProductionDemoFromPath(pathname: string): void {
  const step = demoStoryStepFromPathname(pathname) ?? "logo";
  snapshot = {
    active: true,
    step,
    productionRoutes: true
  };
  writeSessionFlag(true);
  emit();
}

export function demoStoryStepFromPathname(pathname: string): DemoStoryStep | null {
  const path = pathname.startsWith("/demo")
    ? pathname.slice(5) || "/"
    : pathname;

  if (path === "/opening") return "logo";
  if (path === "/welcome") return "welcome";
  if (path.startsWith("/onboarding")) return "onboarding";
  if (path === "/map") return "map";
  if (path === "/business") return "business-island";
  if (path.startsWith("/business/")) return "business-quest";
  return null;
}
