"use client";

type Props = {
  /** Section locks are larger than principle locks. */
  size?: "section" | "principle";
  className?: string;
};

/** Gold progression lock — sections and locked principles. */
export function InvestorChecklistLockBadge({
  size = "section",
  className = ""
}: Props) {
  return (
    <span
      className={[
        "iq-investor-checklist-lock-badge",
        size === "section"
          ? "iq-investor-checklist-lock-badge--section"
          : "iq-investor-checklist-lock-badge--principle",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Locked"
    >
      <span className="iq-investor-checklist-lock-badge__icon" aria-hidden>
        🔒
      </span>
    </span>
  );
}
