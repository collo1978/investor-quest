import { isSchoolsDemoPath, isSchoolsPreviewPath } from "@/lib/schools/schoolsDemoHref";

function resolvePathname(pathname?: string | null): string {
  if (pathname != null && pathname.length > 0) return pathname;
  if (typeof window === "undefined") return "";
  return window.location.pathname;
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

const LIGHTWEIGHT_LEARNER_PATHS = new Set([
  "/schools/profile",
  "/schools/armor-guide"
]);

/** Any `/schools/*` funnel screen — skip unrelated platform prefetch/background work. */
export function isSchoolsFunnelPath(pathname?: string | null): boolean {
  const path = resolvePathname(pathname);
  return path === "/schools" || path.startsWith("/schools/");
}

/** Static poster screens — artwork only, no quest catalog / prewarm / game shell. */
export function isSchoolsStaticPosterPath(pathname?: string | null): boolean {
  const path = schoolsLearnerPath(resolvePathname(pathname));
  return LIGHTWEIGHT_LEARNER_PATHS.has(path);
}

/**
 * Skip the heavy game + analytics provider tree (poster screens only).
 * Demo `/schools/demo/*` and XP ladder keep GameProvider.
 */
export function isSchoolsLightweightClientPath(pathname?: string | null): boolean {
  return isSchoolsStaticPosterPath(pathname);
}

/**
 * Presenter path `/schools/demo/*` — skip background platform work that does not affect
 * curated NVIDIA demo content (Supabase, SEC/AI pipeline, admin telemetry).
 * Covers canonical `/schools/*`, presenter `/schools/demo/*`, and preview routes.
 *
 * Route files under `/schools/demo/*` are auto-mirrored from `/schools/*` on dev start
 * (`scripts/sync-schools-demo-routes.mjs`).
 */
export function isSchoolsDemoProtectedPath(pathname?: string | null): boolean {
  return isSchoolsFunnelPath(pathname);
}

/** When false, client-side background systems should no-op (demo path only). */
export function shouldRunSchoolsDemoBackgroundSystems(
  pathname?: string | null
): boolean {
  return !isSchoolsDemoProtectedPath(pathname);
}
