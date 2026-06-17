import { toDemoHref } from "@/lib/demo/demoHref";
import {
  isSchoolsDemoStoryModeActive,
  isSchoolsDemoStoryProductionRoutes
} from "@/lib/schools/schoolsDemoStoryMode";

export const SCHOOLS_DEMO_ROUTE_PREFIX = "/schools/demo";
export const SCHOOLS_PREVIEW_ROUTE_PREFIX = "/schools/preview";

export function isSchoolsDemoPath(pathname: string): boolean {
  return (
    pathname === SCHOOLS_DEMO_ROUTE_PREFIX ||
    pathname.startsWith(`${SCHOOLS_DEMO_ROUTE_PREFIX}/`)
  );
}

export function isSchoolsPreviewPath(pathname: string): boolean {
  return (
    pathname === SCHOOLS_PREVIEW_ROUTE_PREFIX ||
    pathname.startsWith(`${SCHOOLS_PREVIEW_ROUTE_PREFIX}/`)
  );
}

/** Strip `/schools/demo` prefix; yields canonical `/schools/...` paths. */
export function stripSchoolsDemoPrefix(pathname: string): string {
  if (!isSchoolsDemoPath(pathname)) return pathname;
  if (pathname === SCHOOLS_DEMO_ROUTE_PREFIX) return "/schools/opening";
  const rest = pathname.slice(SCHOOLS_DEMO_ROUTE_PREFIX.length);
  return `/schools${rest.length ? rest : "/opening"}`;
}

/**
 * Resolve a Schools learner path (`/schools/...`) for the current URL.
 * Demo prefix applies only when already on `/schools/demo/*` — never from session flags alone.
 * @param schoolsPath e.g. `/schools/avatar` or `avatar` (normalized to `/schools/avatar`)
 */
export function resolveSchoolsLearnerHref(
  schoolsPath: string,
  pathname?: string
): string {
  const normalized = schoolsPath.startsWith("/schools")
    ? schoolsPath
    : `/schools/${schoolsPath.replace(/^\//, "")}`;

  if (pathname != null && isSchoolsDemoPath(pathname)) {
    return normalized.replace("/schools", SCHOOLS_DEMO_ROUTE_PREFIX);
  }
  if (pathname != null && isSchoolsPreviewPath(pathname)) {
    return normalized.replace("/schools", SCHOOLS_PREVIEW_ROUTE_PREFIX);
  }
  return normalized;
}

/** Prefix Schools routes only when tour is active and URL is already under `/schools/demo`. */
export function toSchoolsDemoHref(path: string, pathname?: string): string {
  if (!path.startsWith("/")) return path;
  if (!isSchoolsDemoStoryModeActive()) return path;
  if (isSchoolsDemoPath(path)) return path;
  if (path.startsWith("/admin") || path.startsWith("/api")) return path;
  if (!path.startsWith("/schools")) return path;
  if (pathname != null && !isSchoolsDemoPath(pathname)) return path;
  if (pathname == null && !isSchoolsDemoStoryProductionRoutes()) return path;
  return path.replace("/schools", SCHOOLS_DEMO_ROUTE_PREFIX);
}

/**
 * Map / island links — keeps Schools demo on `/schools/demo/*` and bank demo on `/demo/*`.
 */
export function resolveMapIslandHref(route: string, pathname?: string): string {
  if (pathname != null) {
    if (isSchoolsDemoPath(pathname)) {
      const schoolsRoute = route.startsWith("/schools")
        ? route
        : `/schools${route}`;
      return resolveSchoolsLearnerHref(schoolsRoute, pathname);
    }
    if (pathname.startsWith("/schools")) {
      const schoolsRoute = route.startsWith("/schools")
        ? route
        : `/schools${route}`;
      return schoolsRoute;
    }
  }

  return toDemoHref(route);
}

/** Quest map — `/schools/demo/map` only when already on a demo URL, else `/map`. */
export function resolveSchoolsDemoMapHref(pathname?: string): string {
  if (pathname != null && isSchoolsDemoPath(pathname)) {
    return resolveSchoolsLearnerHref("/schools/map", pathname);
  }
  return "/map";
}

/** True when the player is in the Schools funnel (not bank `/demo`). */
export function isSchoolsLearnerPath(pathname: string): boolean {
  const learnerPath = isSchoolsDemoPath(pathname)
    ? stripSchoolsDemoPrefix(pathname)
    : pathname;
  return (
    learnerPath.startsWith("/schools") &&
    !learnerPath.startsWith("/schools/preview")
  );
}

/** Business hub quest cards — `/business/slug` → `/schools/business/slug` in Schools. */
export function resolveSchoolsHubQuestHref(
  hubRoute: string,
  pathname: string
): string | null {
  if (!isSchoolsLearnerPath(pathname)) return null;
  if (!hubRoute.startsWith("/business")) return null;
  const schoolsRoute = hubRoute.replace(/^\/business/, "/schools/business");
  return resolveSchoolsLearnerHref(schoolsRoute, pathname);
}

/** Back link target when a Schools business quest is locked or complete. */
export function resolveSchoolsBusinessHubHref(pathname: string): string | null {
  if (!isSchoolsLearnerPath(pathname)) return null;
  return resolveSchoolsLearnerHref("/schools/business", pathname);
}

export function isSchoolsBusinessQuestPath(pathname: string): boolean {
  const learnerPath = isSchoolsBusinessLearnerPath(pathname);
  return learnerPath.startsWith("/schools/business");
}

/** Canonical `/schools/...` path for the active URL (strips demo/preview prefix). */
export function isSchoolsBusinessLearnerPath(pathname: string): string {
  if (isSchoolsDemoPath(pathname)) return stripSchoolsDemoPrefix(pathname);
  if (isSchoolsPreviewPath(pathname)) {
    return pathname.replace(SCHOOLS_PREVIEW_ROUTE_PREFIX, "/schools");
  }
  return pathname;
}

/** True on a specific business quest screen (`/schools/business/{slug}`), not the hub. */
export function isSchoolsBusinessQuestDetailPath(pathname: string): boolean {
  const learnerPath = isSchoolsBusinessLearnerPath(pathname);
  return (
    learnerPath.startsWith("/schools/business/") &&
    learnerPath !== "/schools/business"
  );
}

/** Profile — schools funnel returns `/schools/profile` (demo prefix when on `/schools/demo/*`). */
export function resolveSchoolsDemoProfileHref(pathname?: string): string {
  if (pathname != null && isSchoolsLearnerPath(pathname)) {
    return resolveSchoolsLearnerHref("/schools/profile", pathname);
  }
  return "/profile";
}
