"use client";

import type { InvestorPrincipleView } from "@/lib/business/businessInvestorFramework";

type Props = {
  principle: InvestorPrincipleView;
  className?: string;
};

function evidenceDotGlyph(
  rating: InvestorPrincipleView["evidenceSlotCards"][number]["rating"],
  isCurrent: boolean
): string {
  if (rating === "strong") return "🟢";
  if (rating === "weak") return "🔴";
  return isCurrent ? "🟡" : "⚪";
}

/** Per-card evidence rating — highlights the active card with a pulsing ring. */
export function InvestorPrincipleEvidenceDots({ principle, className = "" }: Props) {
  const slots = principle.evidenceSlotCards;
  if (slots.length === 0 || principle.status === "rated") return null;

  const ratedCount = slots.filter((slot) => slot.rating != null).length;
  const activeCardId = principle.activeEvidenceCardId;

  return (
    <div
      className={["iq-business-framework__evidence-dots", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="iq-business-framework__evidence-dots-label">Evidence</span>
      <span
        className="iq-business-framework__evidence-dots-row"
        aria-label={`${ratedCount} of ${slots.length} evidence rated`}
      >
        {slots.map((slot) => {
          const isCurrent = activeCardId != null && slot.cardId === activeCardId;
          return (
            <span
              key={slot.cardId}
              className={[
                "iq-business-framework__evidence-dot",
                isCurrent ? "iq-business-framework__evidence-dot--current" : "",
                slot.rating === "strong"
                  ? "iq-business-framework__evidence-dot--strong"
                  : slot.rating === "weak"
                    ? "iq-business-framework__evidence-dot--weak"
                    : ""
              ]
                .filter(Boolean)
                .join(" ")}
              data-evidence-slot={`${principle.id}#${slot.cardId}`}
              data-evidence-rating={slot.rating ?? "pending"}
              data-evidence-current={isCurrent ? "true" : undefined}
              aria-hidden
            >
              {evidenceDotGlyph(slot.rating, isCurrent)}
            </span>
          );
        })}
      </span>
    </div>
  );
}
