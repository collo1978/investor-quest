import { Official10KBadge } from "@/components/business/investorFramework/Official10KBadge";

type Props = {
  sourceLabel: string;
  className?: string;
};

/** Badge + filing source line — frames content as primary company evidence. */
export function Official10KEvidenceHeader({ sourceLabel, className = "" }: Props) {
  return (
    <header
      className={["iq-official-10k-header", className].filter(Boolean).join(" ")}
    >
      <Official10KBadge />
      <p className="iq-official-10k-header__source">{sourceLabel}</p>
    </header>
  );
}
