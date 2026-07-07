"use client";

import { BusinessInvestorPrincipleHint } from "@/components/business/hub/BusinessInvestorPrincipleHint";
import type { InvestorPrincipleId } from "@/lib/business/businessInvestorFramework";

type Props = {
  principleId: InvestorPrincipleId;
  className?: string;
};

/** @deprecated Use BusinessInvestorPrincipleHint — section-level hints removed. */
export function BusinessChecklistSectionHint({ principleId, className }: Props) {
  return <BusinessInvestorPrincipleHint principleId={principleId} className={className} />;
}
