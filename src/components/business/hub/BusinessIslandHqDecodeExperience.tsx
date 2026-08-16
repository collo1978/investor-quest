"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { BusinessIslandMissionFlow } from "@/components/business/hub/BusinessIslandMissionFlow";
import type { InvestorNotebookQuestionId } from "@/lib/business/businessIslandInvestorNotebook";
import type { BusinessIslandStoryLocationDef } from "@/lib/business/businessIslandStoryLocations";

const HQ_MISSION_BRIEF_SRC = "/images/business-island/hq-mission-brief.png";

type HqPhase = "brief" | "mission";

type Props = {
  location: BusinessIslandStoryLocationDef;
  companyName: string;
  /** Checklist deep-link — begin with the matching district question. */
  startIndex?: number;
  onMissionMastered: (questionId: InvestorNotebookQuestionId) => void;
  onLeave: () => void;
};

/**
 * Shared Business Island case-file experience — brief → for each district question:
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
  const [phase, setPhase] = useState<HqPhase>("brief");
  const [sessionKey, setSessionKey] = useState(0);

  return (
    <motion.div
      className={[
        "iq-hq-mission",
        phase === "mission" ? "iq-hq-mission--active" : "iq-hq-mission--brief"
      ].join(" ")}
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

      <AnimatePresence mode="wait">
        {phase === "brief" ? (
          <motion.section
            key="brief"
            className="iq-hq-mission__screen iq-hq-mission__screen--brief"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="iq-hq-mission-brief">
              <Image
                src={HQ_MISSION_BRIEF_SRC}
                alt={`Your ${location.placeName} mission case file, access NVIDIA's official 10-K Business section evidence`}
                width={1536}
                height={1024}
                className="iq-hq-mission-brief__image"
                priority
                unoptimized
              />
            </div>

            <button
              type="button"
              className="iq-hq-mission__primary iq-hq-mission-brief__cta"
              onClick={() => {
                setSessionKey((n) => n + 1);
                setPhase("mission");
              }}
            >
              ▶ Access Evidence File
            </button>
          </motion.section>
        ) : (
          <motion.section
            key={`mission-${sessionKey}`}
            className="iq-hq-mission__flow"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <BusinessIslandMissionFlow
              questionIds={location.notebookQuestionIds}
              locationId={location.id}
              companyName={companyName}
              startIndex={startIndex}
              onQuestionMastered={onMissionMastered}
              onComplete={onLeave}
              completeLabel="Return to the island →"
            />
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
