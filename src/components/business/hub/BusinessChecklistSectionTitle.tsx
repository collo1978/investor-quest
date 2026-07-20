import { BusinessChecklistSectionTitleHint } from "@/components/business/hub/BusinessChecklistSectionTitleHint";
import type { BusinessChecklistSectionView } from "@/lib/business/businessInvestorFramework";

type Props = {
  section: BusinessChecklistSectionView;
  showChevron?: boolean;
  expanded?: boolean;
};

/** Emoji + section label + key-question info icon. */
export function BusinessChecklistSectionTitle({
  section,
  showChevron = false,
  expanded = false
}: Props) {
  return (
    <>
      <span className="iq-business-framework__section-emoji" aria-hidden>
        {section.emoji}
      </span>
      <span className="iq-business-framework__section-label-wrap">
        <span className="iq-business-framework__section-label">{section.label}</span>
        <BusinessChecklistSectionTitleHint
          sectionLabel={section.label}
          keyQuestion={section.keyQuestion}
        />
      </span>
      {showChevron ? (
        <span className="iq-business-framework__section-chevron" aria-hidden>
          {expanded ? "▾" : "▸"}
        </span>
      ) : null}
    </>
  );
}
