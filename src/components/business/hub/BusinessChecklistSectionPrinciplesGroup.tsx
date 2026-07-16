import type { ReactNode } from "react";

import { BusinessChecklistSectionPrinciplesHeading } from "@/components/business/hub/BusinessChecklistSectionPrinciplesHeading";

type Props = {
  locked?: boolean;
  children: ReactNode;
};

/** Investment Principles heading + checklist — one connected visual block. */
export function BusinessChecklistSectionPrinciplesGroup({ locked = false, children }: Props) {
  return (
    <div
      className={[
        "iq-business-framework__section-principles-group",
        locked ? "iq-business-framework__section-principles-group--locked" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <BusinessChecklistSectionPrinciplesHeading locked={locked} />
      {children}
    </div>
  );
}
