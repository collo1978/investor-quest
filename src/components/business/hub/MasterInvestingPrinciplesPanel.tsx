"use client";

import { BusinessChecklistPanel } from "@/components/business/hub/BusinessChecklistPanel";
import type { CompanyId } from "@/data/companies";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";

type Props = {
  companyId: CompanyId;
  variant?: "schools" | "dark";
  presentation?: "default" | "journey" | "island" | "island-kiosk" | "ladder";
  cards?: readonly BusinessHubQuestCard[];
};

/** @deprecated Use BusinessChecklistPanel — kept for existing imports. */
export function MasterInvestingPrinciplesPanel(props: Props) {
  return <BusinessChecklistPanel {...props} />;
}
