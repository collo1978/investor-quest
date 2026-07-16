type Props = {
  locked?: boolean;
};

/** Subtle label above principle rows within each checklist section. */
export function BusinessChecklistSectionPrinciplesHeading({ locked = false }: Props) {
  return (
    <p
      className={[
        "iq-business-framework__section-principles-heading",
        locked ? "iq-business-framework__section-principles-heading--locked" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      Investment Principles
    </p>
  );
}
