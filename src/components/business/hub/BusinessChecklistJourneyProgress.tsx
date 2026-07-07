"use client";

import type { BusinessInvestorChecklistSnapshot } from "@/lib/business/businessInvestorFramework";

type Props = {
  snapshot: BusinessInvestorChecklistSnapshot;
  /** Full panel shows "Investor Journey" label; compact island sign omits it. */
  variant?: "full" | "compact";
  className?: string;
};

/** Game-style milestone bar — one segmented track per checklist section. */
export function BusinessChecklistJourneyProgress({
  snapshot,
  variant = "full",
  className = ""
}: Props) {
  const { journey } = snapshot;

  return (
    <div
      className={["iq-business-journey-progress", className].filter(Boolean).join(" ")}
      aria-label={`Business Island investor journey, ${journey.pct} percent complete`}
    >
      {variant === "full" ? (
        <p className="iq-business-journey-progress__label">Investor Journey</p>
      ) : (
        <p className="iq-business-journey-progress__label iq-business-journey-progress__label--compact">
          Business Island
        </p>
      )}
      <div className="iq-business-journey-progress__track" aria-hidden>
        {Array.from({ length: journey.totalSegments }, (_, index) => (
          <span
            key={index}
            className={[
              "iq-business-journey-progress__segment",
              index < journey.filledSegments
                ? "iq-business-journey-progress__segment--filled"
                : snapshot.activeSection &&
                    index === journey.filledSegments
                  ? "iq-business-journey-progress__segment--current"
                  : ""
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
