import { isDemoStoryModeActive } from "@/lib/demo/demoStoryMode";

export const DEMO_ROUTE_PREFIX = "/demo";

export function isDemoPath(pathname: string): boolean {
  return pathname === DEMO_ROUTE_PREFIX || pathname.startsWith(`${DEMO_ROUTE_PREFIX}/`);
}

/** Prefix learner routes when the scripted /demo tour is active. */
export function toDemoHref(path: string): string {
  if (!path.startsWith("/")) return path;
  if (!isDemoStoryModeActive()) return path;
  if (isDemoPath(path)) return path;
  if (path.startsWith("/admin") || path.startsWith("/api")) return path;
  return `${DEMO_ROUTE_PREFIX}${path}`;
}

/** Strip /demo prefix for step detection. */
export function stripDemoPrefix(pathname: string): string {
  if (!isDemoPath(pathname)) return pathname;
  const rest = pathname.slice(DEMO_ROUTE_PREFIX.length);
  return rest.length ? rest : "/";
}
