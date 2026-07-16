type Props = {
  className?: string;
};

/** Consistent badge whenever content comes directly from a company's annual report. */
export function Official10KBadge({ className = "" }: Props) {
  return (
    <span
      className={["iq-official-10k-badge", className].filter(Boolean).join(" ")}
    >
      📄 OFFICIAL 10-K
    </span>
  );
}
