"use client";

import { BusinessChecklistInfoHint } from "@/components/business/hub/BusinessChecklistInfoHint";
import { resolveForcesInvestorSection } from "@/lib/forces/forcesInvestorFramework";
import type { ForcesChecklistSectionId } from "@/lib/forces/forcesInvestorFramework";

type Props = {
  sectionId: ForcesChecklistSectionId;
  className?: string;
};

/** ? beside a risk checklist section — hover coaching question. */
export function ForcesChecklistSectionHint({ sectionId, className }: Props) {
  const section = resolveForcesInvestorSection(sectionId);

  return (
    <BusinessChecklistInfoHint
      label={`About ${section.label}`}
      content={section.sectionTooltip}
      variant="question"
      className={className}
    />
  );
}
