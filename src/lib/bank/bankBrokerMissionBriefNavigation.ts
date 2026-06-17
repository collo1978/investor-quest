import { toDemoHref } from "@/lib/demo/demoHref";
import { BANK_BROKER_MISSION_BRIEF_ROUTE } from "@/lib/bank/bankBrokerPreviewRoutes";
import { withMobilePreviewQuery } from "@/lib/bank/mobilePreviewEmbed";

export function hrefForBankMissionBrief(isPreviewEmbed: boolean): string {
  return isPreviewEmbed
    ? withMobilePreviewQuery(BANK_BROKER_MISSION_BRIEF_ROUTE)
    : toDemoHref(BANK_BROKER_MISSION_BRIEF_ROUTE);
}

export function hrefForBankMapAfterMissionBrief(isPreviewEmbed: boolean): string {
  return isPreviewEmbed
    ? withMobilePreviewQuery("/demo/map")
    : toDemoHref("/map");
}
