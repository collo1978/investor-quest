"use client";

import { BusinessHubEmptyState } from "@/components/business/hub/BusinessHubEmptyState";
import { BusinessQuestHubMobilePicker } from "@/components/business/hub/BusinessQuestHubMobilePicker";
import { BusinessQuestHubTabletPicker } from "@/components/business/hub/BusinessQuestHubTabletPicker";
import { BusinessQuestMapDesktop } from "@/components/business/hub/BusinessQuestMapDesktop";
import { useBusinessHubBreakpoint } from "@/lib/business/businessHubResponsive";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import type { Company } from "@/data/companies";

type Props = {
  cards: BusinessHubQuestCard[];
  company: Company;
  companyLogoUrl?: string | null;
  hubProgressPct: number;
  partnerId?: string;
  userId?: string;
};

/**
 * Business island quest picker — exactly one layout mounted (mobile / tablet / desktop).
 */
export function BusinessQuestMap(props: Props) {
  const breakpoint = useBusinessHubBreakpoint();

  if (props.cards.length === 0) {
    return <BusinessHubEmptyState />;
  }

  switch (breakpoint) {
    case "desktop":
      return <BusinessQuestMapDesktop {...props} />;
    case "tablet":
      return (
        <BusinessQuestHubTabletPicker
          cards={props.cards}
          company={props.company}
          hubProgressPct={props.hubProgressPct}
          partnerId={props.partnerId}
          userId={props.userId}
        />
      );
    default:
      return <BusinessQuestHubMobilePicker {...props} />;
  }
}
