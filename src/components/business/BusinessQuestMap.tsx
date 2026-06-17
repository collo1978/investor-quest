"use client";

import { BusinessHubEmptyState } from "@/components/business/hub/BusinessHubEmptyState";
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
  missionBriefOpen?: boolean;
};

/** Business island — wide scene on desktop; CSS portrait stage on phones. */
export function BusinessQuestMap(props: Props) {
  if (props.cards.length === 0) {
    return <BusinessHubEmptyState />;
  }

  return <BusinessQuestMapDesktop {...props} />;
}
