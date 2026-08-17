"use client";

import { motion, useReducedMotion } from "framer-motion";

import { BusinessIslandMissionFlow } from "@/components/business/hub/BusinessIslandMissionFlow";
import type { InvestorNotebookQuestionId } from "@/lib/business/businessIslandInvestorNotebook";
import type { BusinessIslandStoryLocationDef } from "@/lib/business/businessIslandStoryLocations";

type Props = {
  location: BusinessIslandStoryLocationDef;
  companyName: string;
  /** Checklist deep-link — begin with the matching district question. */
  startIndex?: number;
  onMissionMastered: (questionId: InvestorNotebookQuestionId) => void;
  onLeave: () => void;
};

/**
 * Shared Business Island case-file experience — for each district question:
 * (Evidence → Decode → Answer → Checklist tick) → return to island.
 *
 * Headquarters established the visual language for this flow. Every NVIDIA
 * district now uses this same shell so the island feels like one connected
 * investigation rather than a collection of different modal layouts.
 */
export function BusinessIslandHqDecodeExperience({
  location,
  companyName,
  startIndex = 0,
  onMissionMastered,
  onLeave
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="iq-hq-mission iq-hq-mission--active"
      role="dialog"
      aria-modal="true"
      aria-label={`${location.placeName} mission`}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className="iq-hq-mission__exit"
        aria-label="Return to Business Island"
        onClick={onLeave}
      >
        ←
      </button>

      <motion.section
        className="iq-hq-mission__flow"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <BusinessIslandMissionFlow
          questionIds={location.notebookQuestionIds}
          companyName={companyName}
          startIndex={startIndex}
          onQuestionMastered={onMissionMastered}
          onComplete={onLeave}
          completeLabel="Return to the island →"
        />
      </motion.section>
    </motion.div>
  );
}
