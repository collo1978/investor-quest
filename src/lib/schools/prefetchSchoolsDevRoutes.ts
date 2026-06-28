import { SCHOOLS_MAP_IMAGE_SRC } from "@/lib/schools/schoolsMapConfig";
import { SCHOOLS_PROFILE_IMAGE_SRC } from "@/lib/schools/schoolsProfileConfig";
import { BUSINESS_HUB_IMG_SRC } from "@/lib/screenAssetUrls";
import { preloadImage } from "@/lib/preloadImage";

/** Dev sidebar Schools links — keep in sync with AppShell `schoolsNav`. */
export const SCHOOLS_DEV_NAV_ROUTES = [
  "/schools/demo",
  "/schools/logo-intro",
  "/schools/mission-brief-invitation",
  "/schools/mission-brief-cards",
  "/schools/logo-reveal",
  "/schools/screen5-onboarding",
  "/schools/preview/mission-brief-opening",
  "/schools/preview/mission-brief-invitation",
  "/schools/preview/mission-brief",
  "/schools/preview/mission-brief-terminal",
  "/schools/preview/jarvis-ai-briefing",
  "/schools/preview/mission-card-reveal",
  "/schools/preview/red-alert-system",
  "/schools/preview/hacker-style",
  "/schools/preview/final-mission-brief",
  "/schools/preview/mission-brief-cards",
  "/schools/preview/logo-reveal",
  "/schools/preview/tech-sector",
  "/schools/preview/map-duolingo",
  "/schools/preview/map-cartoon",
  "/schools/preview/map-prodigy",
  "/schools/preview/map-dragonbox",
  "/schools/preview/map-roblox",
  "/schools/preview/map-khan",
  "/schools/preview/map-legends",
  "/schools/map",
  "/schools/business",
  "/schools/forces",
  "/schools/financials",
  "/schools/management",
  "/schools/profile"
] as const;

const SCHOOLS_DEV_IMAGE_ASSETS = [
  SCHOOLS_MAP_IMAGE_SRC,
  BUSINESS_HUB_IMG_SRC,
  "/logos/companies/nvda.svg"
] as const;

let routesPrefetched = false;
let imagesWarmed = false;

/** Warm Schools dev routes + hero art once per session (dev sidebar). */
export function prefetchSchoolsDevNav(
  prefetch: (href: string) => void
): void {
  if (!routesPrefetched) {
    routesPrefetched = true;
    for (const href of SCHOOLS_DEV_NAV_ROUTES) {
      try {
        prefetch(href);
      } catch {
        /* ignore */
      }
    }
  }

  if (imagesWarmed) return;
  imagesWarmed = true;

  for (const src of SCHOOLS_DEV_IMAGE_ASSETS) {
    preloadImage(src);
  }
}

/** Hover prefetch for a single Schools route + its likely hero art. */
export function prefetchSchoolsDevRoute(
  prefetch: (href: string) => void,
  href: string
): void {
  try {
    prefetch(href);
  } catch {
    /* ignore */
  }

  if (href.includes("/map") || href.includes("mission-brief")) {
    preloadImage(SCHOOLS_MAP_IMAGE_SRC);
  }
  if (href.includes("/business")) {
    preloadImage(BUSINESS_HUB_IMG_SRC);
  }
  if (href.includes("/profile")) {
    preloadImage(SCHOOLS_PROFILE_IMAGE_SRC);
  }
  if (href.includes("logo-reveal") || href.includes("logo-intro")) {
    preloadImage("/logos/current-schools-logo.png");
  }
}
