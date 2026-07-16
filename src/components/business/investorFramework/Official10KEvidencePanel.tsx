import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Premium document panel for verbatim company filing extracts. */
export function Official10KEvidencePanel({ children, className = "" }: Props) {
  return (
    <figure
      className={["iq-official-10k-evidence", className].filter(Boolean).join(" ")}
    >
      <blockquote className="iq-official-10k-evidence__quote">{children}</blockquote>
    </figure>
  );
}
