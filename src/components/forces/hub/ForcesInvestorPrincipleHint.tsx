"use client";

import { BusinessChecklistInfoHint } from "@/components/business/hub/BusinessChecklistInfoHint";
import { resolveForcesInvestorPrinciple } from "@/lib/forces/forcesInvestorFramework";
import type { ForcesInvestorPrincipleId } from "@/lib/forces/forcesInvestorFramework";

type Props = {
  principleId: ForcesInvestorPrincipleId;
  className?: string;
};

/** ⓘ beside a risk investing principle — coaching tooltip on hover/tap. */
export function ForcesInvestorPrincipleHint({ principleId, className }: Props) {
  const principle = resolveForcesInvestorPrinciple(principleId);

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
