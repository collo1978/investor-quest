"use client";

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
 * Business island quest picker — device-specific layouts:
 * mobile carousel, tablet hybrid deck, desktop cinematic scene (lg+).
 */
export function BusinessQuestMap(props: Props) {
  return (
    <>
      <BusinessQuestHubMobilePicker {...props} />
      <BusinessQuestHubTabletPicker
        cards={props.cards}
        company={props.company}
        hubProgressPct={props.hubProgressPct}
        partnerId={props.partnerId}
        userId={props.userId}
      />
      <BusinessQuestMapDesktop {...props} />
    </>
  );
}
