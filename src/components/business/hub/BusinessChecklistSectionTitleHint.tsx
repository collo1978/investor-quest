import { BusinessChecklistInfoHint } from "@/components/business/hub/BusinessChecklistInfoHint";

type Props = {
  sectionLabel: string;
  keyQuestion: string;
  className?: string;
};

/** Section title ⓘ — reveals the guiding key question on hover/tap. */
export function BusinessChecklistSectionTitleHint({
  sectionLabel,
  keyQuestion,
  className
}: Props) {
  return (
    <BusinessChecklistInfoHint
      label={`Key question for ${sectionLabel}`}
      content={keyQuestion}
      className={[
        "iq-business-checklist-info-hint--section",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
