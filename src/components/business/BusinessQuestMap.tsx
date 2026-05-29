"use client";

import { BusinessHubEmptyState } from "@/components/business/hub/BusinessHubEmptyState";
import { BusinessQuestHubMobilePicker } from "@/components/business/hub/BusinessQuestHubMobilePicker";
import { BusinessQuestHubTabletPicker } from "@/components/business/hub/BusinessQuestHubTabletPicker";
import { BusinessQuestMapDesktop } from "@/components/business/hub/BusinessQuestMapDesktop";
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
 * Business island quest picker — CSS breakpoints gate layouts so mobile
 * never falls through to the desktop orbit scene (PWA / coarse pointer safe).
 */
export function BusinessQuestMap(props: Props) {
  if (props.cards.length === 0) {
    return <BusinessHubEmptyState />;
  }

  return (
    <div className="relative h-full min-h-0 w-full" data-business-quest-hub>
      <div className="h-full min-h-0 w-full md:hidden">
        <BusinessQuestHubMobilePicker {...props} />
      </div>
      <div className="hidden h-full min-h-0 w-full md:flex lg:hidden">
        <BusinessQuestHubTabletPicker
          cards={props.cards}
          company={props.company}
          hubProgressPct={props.hubProgressPct}
          partnerId={props.partnerId}
          userId={props.userId}
        />
      </div>
      <div className="hidden w-full lg:block">
        <BusinessQuestMapDesktop {...props} />
      </div>
    </div>
  );
}
