"use client";

import { BusinessChecklistInfoHint } from "@/components/business/hub/BusinessChecklistInfoHint";
import { resolveInvestorPrinciple } from "@/lib/business/businessInvestorFramework";
import type { InvestorPrincipleId } from "@/lib/business/businessInvestorFramework";

type Props = {
  principleId: InvestorPrincipleId;
  className?: string;
};

/** ⓘ beside an investor principle — coaching tooltip on hover/tap. */
export function BusinessInvestorPrincipleHint({ principleId, className }: Props) {
  const principle = resolveInvestorPrinciple(principleId);

  return (
    <BusinessChecklistInfoHint
      label={`About ${principle.label}`}
      content={`Why it matters: ${principle.whyItMatters}`}
      className={[
        "iq-business-checklist-info-hint--principle",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
