import { toDemoHref } from "@/lib/demo/demoHref";

import {
  BANK_BROKER_COMPANY_REVEAL_ROUTE,
  BANK_BROKER_PICK_INTERESTS_ROUTE,
  BANK_BROKER_SCREEN4_ONBOARDING_ROUTE,
  BANK_BROKER_SCREEN5_ONBOARDING_ROUTE
} from "@/lib/bank/bankBrokerPreviewRoutes";
import { withMobilePreviewQuery } from "@/lib/bank/mobilePreviewEmbed";

/** Scripted bank/broker onboarding order (mobile preview + demo routes). */
export const BANK_BROKER_ONBOARDING_FLOW = [
  BANK_BROKER_SCREEN4_ONBOARDING_ROUTE,
  BANK_BROKER_SCREEN5_ONBOARDING_ROUTE,
  BANK_BROKER_PICK_INTERESTS_ROUTE,
  BANK_BROKER_COMPANY_REVEAL_ROUTE
] as const;

export type BankBrokerOnboardingFlowRoute =
  (typeof BANK_BROKER_ONBOARDING_FLOW)[number];

const FLOW_INDEX = new Map<string, number>(
  BANK_BROKER_ONBOARDING_FLOW.map((href, index) => [href, index])
);

export function isBankBrokerOnboardingFlowRoute(
  pathname: string
): pathname is BankBrokerOnboardingFlowRoute {
  return FLOW_INDEX.has(pathname);
}

export function previousBankOnboardingRoute(
  pathname: string
): BankBrokerOnboardingFlowRoute | null {
  const index = FLOW_INDEX.get(pathname);
  if (index == null || index <= 0) return null;
  return BANK_BROKER_ONBOARDING_FLOW[index - 1]!;
}

export function nextBankOnboardingRoute(
  pathname: string
): BankBrokerOnboardingFlowRoute | null {
  const index = FLOW_INDEX.get(pathname);
  if (index == null || index >= BANK_BROKER_ONBOARDING_FLOW.length - 1) {
    return null;
  }
  return BANK_BROKER_ONBOARDING_FLOW[index + 1]!;
}

/** Navigate within the bank onboarding funnel (preview iframe or demo story). */
export function hrefForBankOnboardingStep(
  route: BankBrokerOnboardingFlowRoute,
  isPreviewEmbed: boolean
): string {
  return isPreviewEmbed ? withMobilePreviewQuery(route) : toDemoHref(route.replace(/^\/demo/, "") || route);
}
