import { toDemoHref } from "@/lib/demo/demoHref";
import {
  isSchoolsDemoStoryModeActive,
  isSchoolsDemoStoryProductionRoutes
} from "@/lib/schools/schoolsDemoStoryMode";

export const SCHOOLS_DEMO_ROUTE_PREFIX = "/schools/demo";

export function isSchoolsDemoPath(pathname: string): boolean {
  return (
    pathname === SCHOOLS_DEMO_ROUTE_PREFIX ||
    pathname.startsWith(`${SCHOOLS_DEMO_ROUTE_PREFIX}/`)
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
 * Resolve a Schools learner path (`/schools/...`) for the current demo mode.
 * @param schoolsPath e.g. `/schools/avatar` or `avatar` (normalized to `/schools/avatar`)
 */
export function resolveSchoolsLearnerHref(
  schoolsPath: string,
  pathname?: string
): string {
  const normalized = schoolsPath.startsWith("/schools")
    ? schoolsPath
    : `/schools/${schoolsPath.replace(/^\//, "")}`;

  if (
    isSchoolsDemoStoryProductionRoutes() ||
    (pathname != null && isSchoolsDemoPath(pathname))
  ) {
    return normalized.replace("/schools", SCHOOLS_DEMO_ROUTE_PREFIX);
  }
  return normalized;
}

/** Prefix Schools routes when the scripted Schools tour is active. */
export function toSchoolsDemoHref(path: string): string {
  if (!path.startsWith("/")) return path;
  if (!isSchoolsDemoStoryModeActive()) return path;
  if (isSchoolsDemoPath(path)) return path;
  if (path.startsWith("/admin") || path.startsWith("/api")) return path;
  if (!path.startsWith("/schools")) return path;
  return path.replace("/schools", SCHOOLS_DEMO_ROUTE_PREFIX);
}

/**
 * Map / island links — keeps Schools demo on `/schools/demo/*` and bank demo on `/demo/*`.
 */
export function resolveMapIslandHref(route: string, pathname?: string): string {
  const onSchoolsSurface =
    isSchoolsDemoStoryProductionRoutes() ||
    (pathname != null &&
      (isSchoolsDemoPath(pathname) || pathname.startsWith("/schools")));

  if (onSchoolsSurface) {
    const schoolsRoute = route.startsWith("/schools")
      ? route
      : `/schools${route}`;
    return resolveSchoolsLearnerHref(schoolsRoute, pathname);
  }

  return toDemoHref(route);
}
