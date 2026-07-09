"use client";

import type { ForcesInvestorChecklistSnapshot } from "@/lib/forces/forcesInvestorFramework";

type Props = {
  snapshot: ForcesInvestorChecklistSnapshot;
  variant?: "full" | "compact";
  className?: string;
};

/** Game-style milestone bar — one segmented track per risk checklist section. */
export function ForcesChecklistJourneyProgress({
  snapshot,
  variant = "full",
  className = ""
}: Props) {
  const { journey } = snapshot;

  return (
    <div
      className={["iq-business-journey-progress", className].filter(Boolean).join(" ")}
      aria-label={`Risk Island investor journey, ${journey.pct} percent complete`}
    >
      {variant === "full" ? (
        <p className="iq-business-journey-progress__label">Investor Journey</p>
      ) : (
        <p className="iq-business-journey-progress__label iq-business-journey-progress__label--compact">
          Risk Island
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
                : snapshot.activeSection && index === journey.filledSegments
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
