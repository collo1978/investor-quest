import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";
import { preloadImage } from "@/lib/preloadImage";
import { BUSINESS_HUB_IMG_SRC } from "@/lib/screenAssetUrls";

const LOGO_SRC = "/logos/investor-quest-logo.png";

let started = false;

/**
 * One-shot warm-up for first-run funnel + first business quest open.
 * Safe to call repeatedly; work runs once per tab session.
 */
export function prefetchStartupAssets(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  preloadImage(LOGO_SRC);
  preloadImage(BUSINESS_HUB_IMG_SRC);
  preloadQuestDetailChunks();
}

export function prefetchStartupRoutes(prefetch: (href: string) => void): void {
  prefetch("/welcome");
  prefetch("/onboarding");
  prefetch("/map");
  prefetch("/business");
  prefetch("/business/what-they-do");
}
