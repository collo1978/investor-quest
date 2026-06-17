import {
  INVESTOR_MASTERY_HERO_SRC,
  SCHOOLS_OPENING_SCREEN2_HERO_SRC
} from "@/components/opening/InvestorMasteryHeroScreen";
import { BANK_FUTURE_OF_INVESTING_HERO_SRC } from "@/components/bank/BankBrokerFutureOfInvestingScreen";
import { BANK_MOBILE_MAP_PATH } from "@/lib/bank/bankMobileMapConfig";
import { BANK_10K_MISSION_BRIEF_IMG_SRC } from "@/components/bank/BankBroker10kMissionBriefScreen";
import { BANK_FINAL_ONBOARDING_IMG_SRC } from "@/components/bank/BankBrokerFinalOnboardingScreen";
import { BANK_ONBOARDING_SCREEN4_IMG_SRC } from "@/components/bank/BankBrokerOnboardingScreen4";
import { BANK_UNDERSTAND_STOCKS_HERO_SRC } from "@/components/bank/BankBrokerUnderstandStocksScreen";
import {
  BANK_BROKER_FUTURE_OF_INVESTING_ROUTE,
  BANK_BROKER_COMPANY_REVEAL_ROUTE,
  BANK_BROKER_MISSION_BRIEF_ROUTE,
  BANK_BROKER_PICK_INTERESTS_ROUTE,
  BANK_BROKER_PREVIEW_ROUTES,
  BANK_BROKER_SCREEN4_ONBOARDING_ROUTE,
  BANK_BROKER_SCREEN5_ONBOARDING_ROUTE,
  BANK_BROKER_UNDERSTAND_STOCKS_ROUTE,
  SCHOOLS_PORTAL_INTRO_PREVIEW_ROUTE
} from "@/lib/bank/bankBrokerPreviewRoutes";
import { withMobilePreviewQuery } from "@/lib/bank/mobilePreviewEmbed";
import { warmBankPickInterestsCatalog } from "@/lib/bank/warmBankPickInterestsCatalog";
import { preloadImage } from "@/lib/preloadImage";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";
import {
  BUSINESS_HUB_IMG_SRC,
  DESKTOP_MAP_PATH
} from "@/lib/screenAssetUrls";

const OPENING_LOGO_SRC = "/logos/investor-quest-logo.png";

let warmed = false;

function safeDynamicImport<T>(loader: () => Promise<T>): void {
  // Prefetch is an optimization only — never crash the preview shell.
  void loader().catch(() => {});
}

function scheduleIdle(fn: () => void, timeoutMs = 2000): void {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(fn, { timeout: timeoutMs });
  } else {
    window.setTimeout(fn, 120);
  }
}

function injectDocumentPrefetch(href: string): void {
  const previewHref = withMobilePreviewQuery(href);
  if (
    document.querySelector(`link[data-iq-preview-prefetch="${previewHref}"]`)
  ) {
    return;
  }
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "document";
  link.href = previewHref;
  link.setAttribute("data-iq-preview-prefetch", previewHref);
  document.head.appendChild(link);
}

/** Warm Next.js route compilation + HTML cache in dev. */
function warmRouteDocument(href: string): void {
  const previewHref = withMobilePreviewQuery(href);
  injectDocumentPrefetch(href);
  void fetch(previewHref, {
    method: "GET",
    credentials: "same-origin",
    cache: "force-cache"
  }).catch(() => {});
}

/** Preload heavy client chunks shared by preview screens. */
export function preloadBankBrokerPreviewChunks(): void {
  preloadQuestDetailChunks();
  safeDynamicImport(() => import("@/app/map/MapPageClient"));
  safeDynamicImport(() => import("@/app/business/BusinessPageClient"));
  safeDynamicImport(() => import("@/components/GameOpeningScreen"));
  safeDynamicImport(() => import("@/components/map/QuestMapScene"));
}

/** Preload hero/map/business imagery used on mobile demo screens. */
export function preloadBankBrokerPreviewImages(): void {
  preloadImage(OPENING_LOGO_SRC);
  preloadImage(INVESTOR_MASTERY_HERO_SRC);
  preloadImage(DESKTOP_MAP_PATH);
  preloadImage(BANK_MOBILE_MAP_PATH);
  preloadImage(BUSINESS_HUB_IMG_SRC);
}

/** Route-targeted asset warm-up before switching preview screens. */
export function preloadBankBrokerPreviewRouteAssets(href: string): void {
  preloadBankBrokerPreviewImages();

  if (href === "/demo/opening") {
    preloadImage(OPENING_LOGO_SRC);
    preloadImage(INVESTOR_MASTERY_HERO_SRC);
    safeDynamicImport(() => import("@/components/GameOpeningScreen"));
    return;
  }

  if (href === "/demo/map") {
    preloadImage(DESKTOP_MAP_PATH);
    preloadImage(BANK_MOBILE_MAP_PATH);
    safeDynamicImport(() => import("@/app/map/MapPageClient"));
    safeDynamicImport(() => import("@/components/map/QuestMapScene"));
    return;
  }

  if (href === "/demo/business") {
    preloadImage(BUSINESS_HUB_IMG_SRC);
    safeDynamicImport(() => import("@/app/business/BusinessPageClient"));
    return;
  }

  if (href.startsWith("/demo/business/")) {
    preloadQuestDetailChunks();
    safeDynamicImport(() => import("@/components/QuestDetailScreen"));
    safeDynamicImport(() => import("@/components/BusinessIslandQuestReading"));
    return;
  }

  if (href === BANK_BROKER_FUTURE_OF_INVESTING_ROUTE) {
    preloadImage(BANK_FUTURE_OF_INVESTING_HERO_SRC);
    safeDynamicImport(() =>
      import("@/components/bank/BankBrokerFutureOfInvestingScreen")
    );
    return;
  }

  if (href === BANK_BROKER_UNDERSTAND_STOCKS_ROUTE) {
    preloadImage(BANK_UNDERSTAND_STOCKS_HERO_SRC);
    safeDynamicImport(() =>
      import("@/components/bank/BankBrokerUnderstandStocksScreen")
    );
    return;
  }

  if (href === BANK_BROKER_SCREEN4_ONBOARDING_ROUTE) {
    preloadImage(BANK_ONBOARDING_SCREEN4_IMG_SRC);
    safeDynamicImport(() =>
      import("@/components/bank/BankBrokerOnboardingScreen4")
    );
    return;
  }

  if (href === BANK_BROKER_PICK_INTERESTS_ROUTE) {
    preloadImage(BANK_FINAL_ONBOARDING_IMG_SRC);
    preloadImage(BANK_10K_MISSION_BRIEF_IMG_SRC);
    safeDynamicImport(() => import("@/components/bank/BankBrokerPickInterestsScreen"));
    safeDynamicImport(() => import("@/components/bank/BankBrokerCompanyRevealScreen"));
    safeDynamicImport(() => import("@/components/bank/BankBrokerQuestMatchReveal"));
    return;
  }

  if (href === "/demo/onboarding") {
    preloadImage(BANK_FINAL_ONBOARDING_IMG_SRC);
    safeDynamicImport(() => import("@/app/onboarding/page"));
    safeDynamicImport(() => import("@/components/bank/BankBrokerQuestMatchReveal"));
    return;
  }

  if (href === BANK_BROKER_SCREEN5_ONBOARDING_ROUTE) {
    warmBankPickInterestsCatalog();
    safeDynamicImport(() => import("@/components/bank/BankBrokerScreen5Onboarding"));
    safeDynamicImport(() => import("@/components/bank/BankBrokerPickInterestsScreen"));
    return;
  }

  if (href === BANK_BROKER_COMPANY_REVEAL_ROUTE) {
    preloadImage(BANK_FINAL_ONBOARDING_IMG_SRC);
    preloadImage(BANK_10K_MISSION_BRIEF_IMG_SRC);
    safeDynamicImport(() => import("@/components/bank/BankBrokerCompanyRevealScreen"));
    safeDynamicImport(() => import("@/components/bank/BankBrokerQuestMatchReveal"));
    safeDynamicImport(() => import("@/app/onboarding/QuestMatchReveal"));
    return;
  }

  if (href === BANK_BROKER_MISSION_BRIEF_ROUTE) {
    preloadImage(BANK_10K_MISSION_BRIEF_IMG_SRC);
    preloadImage(BANK_MOBILE_MAP_PATH);
    safeDynamicImport(() => import("@/components/bank/BankBroker10kMissionBriefScreen"));
    return;
  }
}

/**
 * One-shot warm-up for the Bank/Broker mobile preview shell.
 * Safe to call repeatedly — work runs once per tab session.
 */
export function prefetchBankBrokerMobilePreview(
  prefetch?: (href: string) => void
): void {
  if (warmed || typeof window === "undefined") return;
  warmed = true;

  preloadBankBrokerPreviewImages();
  preloadBankBrokerPreviewChunks();

  BANK_BROKER_PREVIEW_ROUTES.forEach((item, index) => {
    try {
      prefetch?.(withMobilePreviewQuery(item.href));
    } catch {
      /* ignore */
    }

    window.setTimeout(() => warmRouteDocument(item.href), index * 120);
  });
}

/** Hover/focus boost for a single preview screen. */
export function prefetchBankBrokerPreviewRoute(
  href: string,
  prefetch?: (route: string) => void
): void {
  preloadBankBrokerPreviewRouteAssets(href);
  try {
    prefetch?.(withMobilePreviewQuery(href));
  } catch {
    /* ignore */
  }
  warmRouteDocument(href);
}

/** Stagger remaining routes after the active screen is shown. */
export function prefetchBankBrokerPreviewRoutesIdle(
  prefetch?: (href: string) => void,
  skipHref?: string
): void {
  scheduleIdle(() => {
    for (const item of BANK_BROKER_PREVIEW_ROUTES) {
      if (item.href === skipHref) continue;
      try {
        prefetch?.(withMobilePreviewQuery(item.href));
      } catch {
        /* ignore */
      }
      warmRouteDocument(item.href);
    }
  });
}
