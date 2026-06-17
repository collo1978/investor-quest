/** Live Schools mobile opening — portal hero + CTAs (`screen-2.png`). */
export const SCHOOLS_PORTAL_INTRO_PREVIEW_ROUTE =
  "/schools/demo/opening?screen=2";

/** Bank/Broker Screen 2 — Future of Investing hero + dual CTAs. */
export const BANK_BROKER_FUTURE_OF_INVESTING_ROUTE =
  "/demo/future-of-investing";

/** Bank/Broker Screen 3 — Understand Stocks hero + Continue CTA. */
export const BANK_BROKER_UNDERSTAND_STOCKS_ROUTE =
  "/demo/understand-stocks";

/** Bank/Broker Screen 4 — “2 quick questions” intro (`screen4-onboarding.png`). */
export const BANK_BROKER_SCREEN4_ONBOARDING_ROUTE = "/demo/screen4-onboarding";

/** @deprecated Use {@link BANK_BROKER_SCREEN4_ONBOARDING_ROUTE}. */
export const BANK_BROKER_ONBOARDING_SCREEN4_ROUTE =
  BANK_BROKER_SCREEN4_ONBOARDING_ROUTE;

/** Bank/Broker Screen 5 — coded two-column onboarding multi-select. */
export const BANK_BROKER_SCREEN5_ONBOARDING_ROUTE = "/demo/screen5-onboarding";

/** Bank/Broker — pick 2 interests (coded). */
export const BANK_BROKER_PICK_INTERESTS_ROUTE = "/demo/pick-interests";

/** Bank/Broker — game-show reveal + final art (flow-only; not in sidebar). */
export const BANK_BROKER_COMPANY_REVEAL_ROUTE = "/demo/company-reveal";

/** Bank/Broker — 10-K mission brief image beat (flow-only; not in sidebar). */
export const BANK_BROKER_MISSION_BRIEF_ROUTE = "/demo/mission-brief";

/** @deprecated Use {@link BANK_BROKER_SCREEN5_ONBOARDING_ROUTE}. */
export const BANK_BROKER_ONBOARDING_SCREEN5_ROUTE =
  BANK_BROKER_SCREEN5_ONBOARDING_ROUTE;

/** @deprecated Use {@link SCHOOLS_PORTAL_INTRO_PREVIEW_ROUTE}. */
export const SCHOOLS_SCREEN_2_PREVIEW_ROUTE = SCHOOLS_PORTAL_INTRO_PREVIEW_ROUTE;

export const BANK_BROKER_PREVIEW_ROUTES = [
  { label: "Opening Logo", href: "/demo/opening" },
  {
    label: "Screen 2 — Future of Investing",
    href: BANK_BROKER_FUTURE_OF_INVESTING_ROUTE
  },
  {
    label: "Screen 3 — Understand Stocks",
    href: BANK_BROKER_UNDERSTAND_STOCKS_ROUTE
  },
  {
    label: "Screen 4 - Onboarding",
    href: BANK_BROKER_SCREEN4_ONBOARDING_ROUTE
  },
  {
    label: "Which sounds more like you?",
    href: BANK_BROKER_SCREEN5_ONBOARDING_ROUTE
  },
  { label: "Pick 2 interests", href: BANK_BROKER_PICK_INTERESTS_ROUTE },
  { label: "10K Mission Brief", href: BANK_BROKER_MISSION_BRIEF_ROUTE },
  { label: "Map", href: "/demo/map" },
  { label: "Business Island", href: "/demo/business" },
  { label: "Business Quest", href: "/demo/business/what-they-do" }
] as const;

export type BankBrokerPreviewRoute =
  (typeof BANK_BROKER_PREVIEW_ROUTES)[number]["href"];

export const BANK_BROKER_PREVIEW_DEFAULT_ROUTE = "/demo/opening";

export function parsePreviewRouteHref(href: string): {
  pathname: string;
  searchParams: URLSearchParams;
} {
  const qIdx = href.indexOf("?");
  if (qIdx === -1) {
    return { pathname: href, searchParams: new URLSearchParams() };
  }
  return {
    pathname: href.slice(0, qIdx),
    searchParams: new URLSearchParams(href.slice(qIdx + 1))
  };
}

export function previewRoutePathname(href: string): string {
  return parsePreviewRouteHref(href).pathname;
}

export function previewRoutesMatch(
  loadedPathname: string,
  loadedSearch: string,
  expectedHref: string
): boolean {
  const expected = parsePreviewRouteHref(expectedHref);
  const loaded = new URLSearchParams(
    loadedSearch.startsWith("?") ? loadedSearch.slice(1) : loadedSearch
  );

  if (loadedPathname !== expected.pathname) return false;

  for (const [key, value] of expected.searchParams.entries()) {
    if (loaded.get(key) !== value) return false;
  }

  return true;
}

export function routeFromBankBrokerPreviewQuery(
  raw: string | null
): BankBrokerPreviewRoute {
  if (!raw || raw === "/demo") return BANK_BROKER_PREVIEW_DEFAULT_ROUTE;
  const match = BANK_BROKER_PREVIEW_ROUTES.find((item) => item.href === raw);
  return match?.href ?? BANK_BROKER_PREVIEW_DEFAULT_ROUTE;
}

export function labelForBankBrokerPreviewRoute(href: string): string {
  return (
    BANK_BROKER_PREVIEW_ROUTES.find((item) => item.href === href)?.label ??
    "Screen"
  );
}

export function isBankBrokerPreviewRoute(
  path: string,
  search = ""
): path is BankBrokerPreviewRoute {
  return BANK_BROKER_PREVIEW_ROUTES.some((item) =>
    previewRoutesMatch(path, search, item.href)
  );
}

export function findBankBrokerPreviewRoute(
  path: string,
  search = ""
): BankBrokerPreviewRoute | null {
  const match = BANK_BROKER_PREVIEW_ROUTES.find((item) =>
    previewRoutesMatch(path, search, item.href)
  );
  return match?.href ?? null;
}
